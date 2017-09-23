import * as stream from 'stream'
import * as uuid   from 'uuid'
import * as utils from './utils'

export class Transport {}
Transport.CONNECTING = 0
Transport.OPEN       = 1
Transport.CLOSING    = 2
Transport.CLOSED     = 3

const closeFrame = (status, reason) => {
  return 'c' + JSON.stringify([status, reason])
}

export class SockJSConnection extends stream.Stream {
  constructor (_session) {
    super()
    this._session = _session
    this.id = uuid.v4()
    this.headers = {}
    this.prefix = this._session.prefix
  }

  toString () {
    return '<SockJSConnection ' + this.id + '>'
  }

  write (string) {
    return this._session.send('' + string)
  }

  end (string) {
    if (string) {
      this.write(string)
    }
    this.close()
    return null
  }

  close (code, reason) {
    this._session.close(code, reason)
  }

  destroy () {
    this.end()
    this.removeAllListeners()
  }

  destroySoon () {
    this.destroy()
  }
}

// utils.objectExtend(SockJSConnection.prototype, stream.Stream.prototype)
SockJSConnection.prototype.__defineGetter__('readable', function(){this._session.readyState === Transport.OPEN})
SockJSConnection.prototype.__defineGetter__('writable', function(){this._session.readyState === Transport.OPEN})
SockJSConnection.prototype.__defineGetter__('readyState', function(){this._session.readyState})

let MAP = {}

export class Session {
  constructor (session_id, server) {
    this.session_id = session_id
    this.heartbeat_delay = server.options.heartbeat_delay
    this.disconnect_delay = server.options.disconnect_delay
    this.prefix = server.options.prefix
    this.send_buffer = []
    this.is_closing = false
    this.readyState = Transport.CONNECTING
    if (this.session_id) {
      MAP[this.session_id] = this
    }
    this.timeout_cb = () => this.didTimeout()
    this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay)
    this.connection = new SockJSConnection(this)
    this.emit_open = () => {
      this.emit_open = null
      console.log('emit open')
      server.emit('connection', this.connection)
    }
  }

  register (req, recv) {
    if (this.recv) {
      recv.doSendFrame(closeFrame(2010, 'Another connection still open'))
      recv.didClose()
      return
    }

    if (this.to_tref) {
      clearTimeout(this.to_tref)
      this.to_tref = null
    }

    if (this.readyState === Transport.CLOSING) {
      this.flushToRecv(recv)
      recv.doSendFrame(this.close_frame)
      recv.didClose()
      this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay)
      return
    }
  
    this.recv = recv
    this.recv.session = this

    // Save parameters from request

    this.decorateConnection(req)

    if (this.readyState === Transport.CONNECTING) {
      this.recv.doSendFrame('o')
      this.readyState = Transport.OPEN
      // emit the open event, but not right now
      process.nextTick(this.emit_open)
    }

    if (!this.recv) {
      return
    }
    this.tryFlush()
    return
  }

  decorateConnection (req) {
    let socket = this.recv.connection
    let remoteAddress, remotePort, address
    if (!socket) {
      socket = this.recv.response.connection
    }

    try {
      remoteAddress = socket.remoteAddress
      remotePort    = socket.remotePort
      address       = socket.address
    } catch (x) { x }

    if (remoteAddress) {
      this.connection.remoteAddress = remoteAddress
      this.connection.remotePort = remotePort
      this.connection.address = address
    }

    this.connection.url = req.url
    this.connection.pathname = req.pathname
    this.protocol = this.recv.protocol
    
    let headers = {}
    let keys = ['referer', 'x-client-ip', 'x-forwarded-for', 
      'x-cluster-client-ip', 'via', 'x-real-ip',
      'x-forwarded-proto', 'x-ssl',
      'host', 'user-agent', 'accept-language'
    ]
    keys.forEach((k) => {
      if (req.headers[k]) {
        headers[k] = req.headers[k]
      }
    })

    this.connection.headers = headers
  }

  unregister () {
    let delay = this.recv.delay_disconnec
    this.recv.session = null
    this.recv = null
    if (this.to_tref) {
      clearTimeout(this.to_tref)
    }

    if (delay) {
      this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay)
    } else {
      this.timeout_cb()
    }
  }

  flushToRecv (recv) {
    if (this.send_buffer.length > 0) {
      let sb
      [sb, this.send_buffer] = [this.send_buffer, []]
      recv.doSendBulk(sb)
      return true
    }
    return false
  }

  tryFlush () {
    if (!this.flushToRecv(this.recv) || !this.to_tref) {
      if (this.to_tref) {
        clearTimeout(this.to_tref)
      }
      let x = () => {
        if (this.recv) {
          this.to_tref = setTimeout(x, this.heartbeat_delay)
          this.recv.heartbeat()
        }
      }
      this.to_tref = setTimeout(x, this.heartbeat_delay)
    }
    return
  }

  didTimeout () {
    if (this.to_tref) {
      clearTimeout(this.to_tref)
      this.to_tref = null
    }
    if (this.readyState !== Transport.CONNECTING && this.readyState !== Transport.OPEN &&
      this.readyState !== Transport.CLOSING) {
        throw Error('INVALID_STATE_ERR')
    }
    if (this.recv) {
      throw Error('RECV_STILL_THERE')
    }

    this.readyState = Transport.CLOSED

    // Node streaming API is broken. Reader defines 'close' and 'end'
    // but Writer defines only 'close'. 'End' isn't optional though.
    //  http://nodejs.org/docs/v0.5.8/api/streams.html#event_close_
    this.connection.emit('end')
    this.connection.emit('close')
    this.connection = null
    if(this.session_id) {
      delete MAP[this.session_id]
      this.session_id = null
    }
  }

  didMessage (payload) {
    if (this.readyState === Transport.OPEN) {
      this.connection.emit('data', payload)
    }
  }

  send (payload) {
    if (this.readyState !== Transport.OPEN) {
      return false
    }
    this.send_buffer.push('' + payload)

    if (this.recv) {
      this.tryFlush()
    }
    return true
  }

  close (status = 1000, reason = 'Normal Closure') {
    if (this.readyState !== Transport.OPEN) {
      return false
    }

    this.readyState = Transport.CLOSING
    this.close_frame = closeFrame(status, reason)

    if (this.recv) {
      this.recv.doSendFrame(this.close_frame)
      if (this.recv) {
        this.recv.didClose()
      }
      if (this.recv) {
        this.unregister()
      }
    }
    return true
  }
}

Session.bySessionId = function (session_id) {
  if (!session_id) {
    return null
  }
  return MAP[session_id] || null
}

const _register = function (req, server, session_id, receiver) {
  let session = Session.bySessionId(session_id)
  if (!session) {
    session = new Session(session_id, server)
  }
  session.register(req, receiver)
  return session
}

export function register (req, server, receiver) {
  return _register(req, server, req.session, receiver)
}

export function registerNoSession (req, server, receiver) {
  return _register(req, server, undefined, receiver)
}

export class GenericReceiver {
  constructor (thingy) {
    this.thingy = thingy
    this.setUp(this.thingy)
  }

  setUp () {
    this.thingy_end_cb = () => this.didAbort()
    this.thingy.addListener('close', this.thingy_end_cb)
    this.thingy.addListener('end', this.thingy_end_cb)
  }

  tearDown () {
    this.thingy.removeListener('close', this.thingy_end_cb)
    this.thingy.removeListener('end', this.thingy_end_cb)
    this.thingy_end_cb = null
  }

  didAbort () {
    this.delay_disconnect = false
    this.didClose()
  }

  didClose () {
    if (this.thingy) {
      this.tearDown(this.thingy)
      this.thingy = null
    }
    if (this.session) {
      this.session.unregister()
    }
  }

  doSendBulk (messages) {
    let q_msgs = messages.map((msg) => utils.quote(msg))
    this.doSendFrame('a' + '[' + q_msgs.join(',') + ']')
  }

  heartbeat () {
    this.doSendFrame('h')
  }
}

// Write stuff to response, using chunked encoding if possible.

export class ResponseReceiver extends GenericReceiver {
  constructor (request, response, options) {
    super(request.connection)
    this.max_response_size = undefined
    this.delay_disconnect = true
    this.request = request
    this.response = response
    this.options = options

    this.curr_response_size = 0
    try {
      this.request.connection.setKeepAlive(true, 5000)
    }catch (x) { x }

    if (this.max_response_size === undefined) {
      this.max_response_size = this.options.response_limit
    } 
  }

  doSendFrame (payload) {
    this.curr_response_size += payload.length
    let r = false
    try {
      this.response.write(payload)
      r = true
    } catch (x) { x }
    if (this.max_response_size && this.curr_response_size > this.max_response_size) {
      this.didClose()
    }
    return r
  }

  didClose () {
    super.didClose()
    try {
      this.response.end()
    } catch (x) {x}
    this.response = null
  }
}

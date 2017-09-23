import * as utils from './utils'
import * as transport from './transport'

class XhrStreamingReceiver extends transport.ResponseReceiver {
  doSendFrame(payload) {
    return super.doSendFrame(payload + '\n')
  }
}
XhrStreamingReceiver.prototype.protocol = 'xhr-streaming'

class XhrPollingReceiver extends XhrStreamingReceiver {}

XhrPollingReceiver.prototype.protocol = 'xhr-polling'
XhrPollingReceiver.prototype.max_response_size = 1

export const app = {
  xhr_options(req, res) {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
    res.setHeader('Access-Control-Max-Age', res.cache_for)
    return ''
  },
  xhr_send(req, res, data) {
    if (!data) {
      throw {
        status: 500,
        message: 'Payload expected.'
      }
    }
    let d
    try {
      d = JSON.parse(data)
    } catch (x) {
      throw {
        status: 500,
        message: 'Broken JSON encoding.'
      }
    }

    if (!d || d.__proto__.constructor !== Array) {
      throw {
        status: 500,
        message: 'Payload expected.'
      }
    }
    let jsonp = transport.Session.bySessionId(req.session)
    if (!jsonp) {
      throw {
        status: 404
      }
    }
    d.forEach((msg) => jsonp.didMessage(msg))

    // FF assumes that the response is XML.
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
    res.writeHead(204)
    res.end()
    return true
  },
  xhr_cors(req, res, content) {
    let origin
    if (!req.headers['origin']) {
      origin = '*'
    } else {
      origin = req.headers['origin']
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    let header = req.headers['access-control-request-headers']
    if (header) {
      res.setHeader('Access-Control-Allow-Headers', header)
    }
    return content
  },
  xhr_poll(req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
    res.writeHead(200)

    transport.register(req, this, new XhrPollingReceiver(req, res, this.options))
    return true
  },
  xhr_streaming(req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
    res.writeHead(200)

    // IE requires 2KB prefix:
    //  http://blogs.msdn.com/b/ieinternals/archive/2010/04/06/comet-streaming-in-internet-explorer-with-xmlhttprequest-and-xdomainrequest.aspx
    res.write(Array(2049).join('h') + '\n')

    transport.register(req, this, new XhrStreamingReceiver(req, res, this.options))
    return true
  }

}

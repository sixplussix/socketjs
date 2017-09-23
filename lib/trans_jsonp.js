import * as transport from './transport'

class JsonpReceiver extends transport.ResponseReceiver {
  constructor (req, res, options, callback) {
    super(req, res, options)
    this.callback = callback
  }

  doSendFrame (payload) {
     // Yes, JSONed twice, there isn't a a better way, we must pass
     // a string back, and the script, will be evaled() by the
     // browser.
     // prepend comment to avoid SWF exploit #163
     super.doSendFrame("/**/" + this.callback + "(" + JSON.stringify(payload) + ");\r\n")
  }
}

export const app = {
  jsonp (req, res, _, next_filter) {
    if (! ('c' in req.query || 'callback' in req.query)) {
      throw {
        status: 500,
        message: '"callback" parameter required'
      }
    }

    let callback
    if ('c' in req.query) {
      callback = req.query['c']
    } else {
      callback = req.query['callback']
    }

    if(/[^a-zA-Z0-9-_.]/.test(callback) || callback.length > 32) {
      throw {
        status: 500,
        message: 'invalid "callback" parameter'
      }
    }

        // protect against SWF JSONP exploit 
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
    res.writeHead(200)

    transport.register(req, this, new JsonpReceiver(req, res, this.options, callback))
    return true
  },
  jsonp_send (req, res, query) {
    if(!query){
      throw {
        status: 500,
        message: 'Payload expected.'
       }
    }
    let d
    if(typeof query === 'string'){
            try{
                d = JSON.parse(query)
            }catch(x){
                throw {
                    status: 500,
                    message: 'Broken JSON encoding.'
                }
            }
    } else {
      d = query.d
    }
    if(typeof d === 'string' && d){
      try {
        d = JSON.parse(d)
      } catch (x) {
        throw {
          status: 500,
          message: 'Broken JSON encoding.'
        }
      }
    }
    if (!d || d.__proto__.constructor !== Array) {
      throw {
        status: 500,
        message: 'Payload expected'
      }
    }
    let jsonp = transport.Session.bySessionId(req.session)
    if (jsonp === null) {
      throw {status: 404}
    }

    d.forEach((msg) => {
      jsonp.didMessage(msg)
    })

    res.setHeader('Content-Length', '2')
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
    res.writeHead(200)
    res.end('ok')
    return true

  }
}

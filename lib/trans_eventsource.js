import * as utils from './utils'
import * as transport from './transport'

class EventSourceReceiver extends transport.ResponseReceiver {
  doSendFrame (payload) {
    let data = [
      'data:',
       utils.escape_selected(payload, '\r\n\x00'),
       '\r\n\r\n'
    ]
    super.doSendFrame(data.join(''))
  }
}
EventSourceReceiver.prototype.protocol = 'eventsource'

export const app = {
  eventsource (req, res) {
    let origin
    if (!req.headers['origin'] || req.headers['origin'] === 'null') {
      origin = '*'
    } else {
      origin = req.headers['origin']
      res.setHeader('Access-Control-Allow-Credentials', true)
    }
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    let header = req.headers['access-control-request-headers']
    if (header) {
      res.setHeader('Access-Control-Allow-Headers', header)
    }

    res.writeHead(200)
    res.write('\r\n')
    transport.register(req, this, new EventSourceReceiver(req, res, this.options))
    return true
  }
}

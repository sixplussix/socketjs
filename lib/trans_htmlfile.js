
import * as utils from './utils'
import * as transport from './transport'

let iframe_template = `
<!doctype html>
<html><head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head><body><h2>Don't panic!</h2>
  <script>
    document.domain = document.domain;
    var c = parent.{{ callback }};
    c.start();
    function p(d) {c.message(d);};
    window.onload = function() {c.stop();};
  </script>
  `
iframe_template += Array(1024 - iframe_template.length + 14).join(' ')
iframe_template += '\r\n\r\n'

class HtmlFileReceiver extends transport.ResponseReceiver {
  doSendFrame (payload) {
    super.doSendFrame( '<script>\np(' + JSON.stringify(payload) + ');\n</script>\r\n' )
  }
}

HtmlFileReceiver.prototype.protocol = 'htmlfile'

export const app = {
  htmlfile (req, res) {
    if (!('c' in req.query || 'callback' in req.query)) {
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

    if (/[^a-zA-Z0-9-_.]/.test(callback)) {
      throw {
        status: 500,
        message: 'invalid "callback" parameter'
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.writeHead(200)
    res.write(iframe_template.replace(/{{ callback }}/g, callback));

    transport.register(req, this, new HtmlFileReceiver(req, res, this.options))
    return true
  }
}

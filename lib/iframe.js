import * as utils from './utils'
const iframe_template = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <script src="{{ sockjs_url }}"></script>
  <script>
    document.domain = document.domain;
    SockJS.bootstrap_iframe();
  </script>
</head>
<body>
  <h2>Don't panic!</h2>
  <p>This is a SockJS hidden iframe. It's used for cross domain magic.</p>
</body>
</html>
`
export const app = {
  iframe (req, res) {
    let context = {
      '{{ sockjs_url }}' : this.options.sockjs_url
    }

    let content = iframe_template

    for (let k in context) {
      content = content.replace(k, context[k])
    }

    let quoted_md5 = '"' + utils.md5_hex(content) + '"'
    if ('if-none-match' in req.headers && req.headers['if-none-match'] === quoted_md5) {
      res.statusCode = 304
      return ''
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.setHeader('ETag', quoted_md5)
    return content
  }
}

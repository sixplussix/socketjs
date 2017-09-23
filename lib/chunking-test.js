import * as utils from './utils'

export const app = {
  chunking_test (req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
    res.writeHead(200)
    let write = (payload) => {
      try {
        res.write(payload + '\n')
      } catch (x) {
        return
      }
    }

    utils.timeout_chain([
      [0, () => write('h')],
      [1, () => write(Array(2049).join(' ') + 'h')],
      [5, () => write('h')],
      [25, () => write('h')],
      [625, () => write('h')],
      [3125, () => {write('h'); res.end()}]
    ])
    return true;
  },

  info (req, res, _) {
    let info = {
      websocket: this.options.websocket,
      origins: ['*:*'],
      cookie_needed: !! this.options.jsessionid,
      entropy: utils.random32()
    }

    if (typeof this.options.base_url === 'function') {
      info.base_url = this.options.base_url()
    } else if (this.options.base_url) {
      info.base_url = this.options.base_url
    }

    res.setHeader('Content-Type', 'application/json; charset=UTF-8')
    res.writeHead(200)
    res.end(JSON.stringify(info))
  },

  info_options (req, res) {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Max-Age', res.cache_for)
    return ''
  }
}

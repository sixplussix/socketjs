import * as url from 'url'
import * as querystring from 'querystring'
import * as fs from 'fs'
import * as http from 'http'

import * as utils from './utils'

function execute_request (app, funs, req, res, data) {
  try {
    while (funs.length > 0) {
      let fun = funs.shift()
      req.last_fun = fun
      data = app[fun](req, res, data, req.next_filter)
    }
  } catch (x) {
    if (typeof x === 'object' && 'status' in x) {
      if (x.status === 0) {
        return
      } else if ('handle_' + x.status in app) {
        app['handle_' + x.status](req, res, x)
      } else {
        app['handle_error'] (req, res, x)
      }
    } else {
      app['handle_error'](req, res, x)
    }
    app['log_request'][req, res, true]
  }
}

function fake_response (req, res) {
  let headers = {'Connection': 'close'}
  res.writeHead = function (status, user_headers = {}) {
    let r = []
    r.push('HTTP/' + req.httpVersion + ' ' + status + ' ' + http.STATUS_CODES[status])
    utils.objectExtend(headers, user_headers)
    Object.keys(headers).forEach((k) => {
      r.push(k + ': ' + headers[k])
    })
    // add tow blank
    r = r.concat(['', ''])
    
    try {
      res.write(r.join('\r\n'))
    } catch (_) {}
    try {
      res.end()
    } catch (_) {}
  }
  res.setHeader = (k, v) => headers[k] = v
}

export function generateHandler (app, dispatcher) {
  return (req, res, head) => {
    if (typeof res.writeHead  === 'undefined') {
      fake_response(req, res)
    }
    utils.objectExtend(req, url.parse(req.url, true))
    req.start_date = new Date()

    let found = false
    let allowed_methods = []

    for(var _i =0, _len = dispatcher.length; _i < _len; _i ++){
      let row = dispatcher[_i]
      let [method, path, funs] = row
      if (path.constructor !== Array) {
        path = [path]
      }

      let m = req.pathname.match(path[0])
      if (!m) {
        continue
      }
      if (!req.method.match(new RegExp(method))) {
        allowed_methods.push(method)
        continue
      }
      path.forEach((pt, i) => req[pt] = m[i])

      funs = funs.slice(0)
      funs.push('log_request')
      req.next_filter = (data) => {
        execute_request(app, funs, req, res, data)
      }
      req.next_filter(head)
      found = true
      break
    }

    if (!found) {
      if (allowed_methods.length !== 0) {
        app['handle_405'](req, res, allowed_methods)
      } else {
        app['handle_404'](req, res)
      }
      app['log_request'](req, res, true)
    }
    return
  }
}

export class GenericApp {
  handle_404 (req, res, x) {
    if (res.finished) {
      return x
    }
    res.writeHead(404, {})
    res.end()
    return true
  }

  handle_405 (req, res, methods) {
    res.writeHead(405, {Allow: methods.join(', ')})
    res.end()
    return true
  }

  handle_error (req, res, x) {
    if (res.finished) {
      return x
    } 
    if (typeof x === 'object' && 'status' in x) {
      res.writeHead(x.status, {})
      res.end(x.message || '')
    } else {
      try {
        res.writeHead(500, {})
        res.end('500 - Internal Server Error')
      } catch (x) {}
      this.log('error', 'Exception on "'+ req.method + ' ' + req.href + '" in filter "' + req.last_fun + '":\n' + (x.stack || x))
    }
  }

  log_request (req, res, data) {
    let td = (new Date()) - req.start_date
    this.log('info', req.method + ' ' + req.url + ' ' + td + 'ms ' + (res.finished ? res.statusCode : '(unfinished)'))
  }

  log (severity, line) {
    console.log(line)
  }

  expose_html (req, res, content) {
    if (res.finished) {
      return content
    }
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    }
    return this.expose(req, res, content)
  }

  expose_json (req, res, content) {
    if (res.finished) {
      return content
    }
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json')
    }
    return this.expose(req, res, JSON.stringify(content))
  }

  expose (req, res, content) {
    if (res.finished) {
      return content
    }
    if (content && !res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'text/plain')
    }
    if (content) {
      res.setHeader('Content-Length', content.length)
    }

    res.writeHead(res.statusCode)
    res.end(content, 'utf8')
    return true
  }
  serve_file (req, res, filename, next_filter) {
    let o = (error, content) => {
      if (error) {
        res.writeHead(500)
        res.end("can't red file")
      } else {
        res.setHeader('Content-length', content.length)
        res.writeHead(res.statusCode, res.headers)
        res.end(content, 'utf8')
      }
      next_filter(true)
    }

    fs.readFile(filename, o)
    throw {status: 0}
  }

  cache_for (req, res, content) {
    res.cahce_for = res.cache_for || 365 * 24 * 60 * 60
    res.setHeader('Cache-Control', 'public, max-age=' + res.cache_for)
    let exp = new Date()
    exp.setTime(exp.getTime() + res.cache_for * 1000)
    res.setHeader('Expires', exp.toUTCString())
    return content;
  }

  h_no_cache (req, res, content) {
    res.setHeader('Cache-Control', 'no-store, no-cache, no-transform, must-revalidate, max-age=0')
    return content
  }

  expect_form (req, res, _data, next_fitler) {
    let data = new Buffer(0)
    let q
    req.on('data', (d) => {
      data = utils.buffer_concat(data, new Buffer(d, 'binary'))
    })
    req.on('end', () => {
      data = data.toString('utf-8')
      switch ((req.headers['content-type'] || '').split(';')[0]) {
        case 'application/x-www-form-urlencoded':
          q = querystring.parse(data)
          break
        case 'text/plain':
          q = data
          break
        default:
          this.log('error', 'Unsupport content-type ' + req.headers['content-type'])
          q = undefined
          break
      }
      next_fitler(q)
    })
    throw {status: 0}
  }

  expect_xhr (req, res, _data, next_fitler) {
    let data = new Buffer(0)
    let q
    req.on('data', (d) => {
      data = utils.buffer_concat(data, new Buffer(d, 'binary'))
    })

    req.on('end', () => {
      data = data.toString('utf-8')
      switch ((req.headers['content-type'] || '').split(';')[0]) {
        case 'text/plain':
        case 'T':
        case 'application/json':
        case 'application/xml':
        case '':
        case 'text/xml':
          q = data
          break
        default:
          this.log('error', 'Unsupport content-type ' + req.headers['content-type'])
          q = undefined
          break
      }
      next_fitler(q)
    })
    throw {status: 0}
  }
}

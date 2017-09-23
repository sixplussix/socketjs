import * as events from 'events'
import * as fs from 'fs'

import * as webjs from './webjs'
import * as utils from './utils'

import * as trans_websocket from './trans_websocket'
import * as trans_jsonp from './trans_jsonp'
import * as trans_xhr from './trans_xhr'
import * as iframe from './iframe'
import * as trans_eventsource from './trans_eventsource'
import * as trans_htmlfile from './trans_htmlfile'
import * as chunking_test from './chunking-test'

function sockjsVersion() {
  let pkg
  try {
    pkg = fs.readdirSync(__dirname + '/../package.json', 'utf-8')
  } catch (x) {
    x
  }
  if (pkg) {
    return JSON.parse(pkg).version
  } else {
    return null
  }
}

class App extends webjs.GenericApp {
  webcome_screen(req, res) {
    res.setHeader('content-type', 'text/plain; charset=UTF-8')
    res.writeHead(200)
    res.end("Welcome to SockJS!\n")
    return true
  }

  handle_404(req, res) {
    res.setHeader('content-type', 'text/plain; charset=UTF-8')
    res.writeHead(404)
    res.end('404 Error: Page not found\n')
    return true
  }

  disabled_transport(req, res, data) {
    return this.handle_404(req, res, data)
  }

  h_sid(req, res, data) {
    // Some load balancers do sticky sessions, but only if there is
    //  a JSESSIONID cookie. If this cookie isn't yet set, we shall
    //  set it to a dummy value. It doesn't really matter what, as
    //  session information is usually added by the load balancer.
    req.cookies = utils.parseCookie(req.headers.cookie)
    if (typeof this.options.jsessionid === 'function') {
      //  Users can supply a function
      this.options.jsessionid(req, res)
    } else if (this.options.jsessionid && res.setHeader) {
      // We need to set it every time, to give the loadbalancer
      // opportunity to attach its own cookies.
      let jsid = req.cookies['JSESSIONID'] || 'dummy'
      res.setHeader('Set-Cookie', 'JSESSIONID=' + jsid + '; path=/')
    }
    return data
  }
  log(severity, line) {
    this.options.log(severity, line)
  }
}

utils.objectExtend(App.prototype, iframe.app)
utils.objectExtend(App.prototype, chunking_test.app)

utils.objectExtend(App.prototype, trans_websocket.app)
utils.objectExtend(App.prototype, trans_jsonp.app)
utils.objectExtend(App.prototype, trans_xhr.app)
utils.objectExtend(App.prototype, trans_eventsource.app)
utils.objectExtend(App.prototype, trans_htmlfile.app)

function generate_dispatcher(options) {
  let p = (s) => new RegExp('^' + options.prefix + s + '[/]?$')
  let t = (s) => [p('/([^/.]+)/([^/.]+)' + s), 'server', 'session']
  let opts_filters = (options_filter = 'xhr_options') => {
    return ['h_sid', 'xhr_cors', 'cache_for', options_filter, 'expose']
  }
  let prefix_dispatcher = [
    ['GET', p(''), ['welcome_screen']],
    ['GET', p('/iframe[0-9-.a-z_]*.html'), ['iframe', 'cache_for', 'expose']],
    ['OPTIONS', p('/info'), opts_filters('info_options')],
    ['GET', p('/info'), ['xhr_cors', 'h_no_cache', 'info', 'expose']],
    ['OPTIONS', p('/chunking_test'), opts_filters()],
    ['POST', p('/chunking_test'), ['xhr_cors', 'expect_xhr', 'chunking_test']]
  ]
  let transport_dispatcher = [
    ['GET', t('/jsonp'), ['h_sid', 'h_no_cache', 'jsonp']],
    ['POST', t('/jsonp_send'), ['h_sid', 'h_no_cache', 'expect_form', 'jsonp_send']],
    ['POST', t('/xhr'), ['h_sid', 'h_no_cache', 'xhr_cors', 'xhr_poll']],
    ['OPTIONS', t('/xhr'), opts_filters()],
    ['POST', t('/xhr_send'), ['h_sid', 'h_no_cache', 'xhr_cors', 'expect_xhr', 'xhr_send']],
    ['OPTIONS', t('/xhr_send'), opts_filters()],
    ['POST', t('/xhr_streaming'), ['h_sid', 'h_no_cache', 'xhr_cors', 'xhr_streaming']],
    ['OPTIONS', t('/xhr_streaming'), opts_filters()],
    ['GET', t('/eventsource'), ['h_sid', 'h_no_cache', 'eventsource']],
    ['GET', t('/htmlfile'), ['h_sid', 'h_no_cache', 'htmlfile']],
  ]

  // TODO: remove this code on next major release
  if (options.websocket) {
    prefix_dispatcher.push(
      ['GET', p('/websocket'), ['raw_websocket']])
    transport_dispatcher.push(
      ['GET', t('/websocket'), ['sockjs_websocket']])
  } else {
    /// modify urls to return 404
    prefix_dispatcher.push(
      ['GET', p('/websocket'), ['cache_for', 'disabled_transport']])
    transport_dispatcher.push(
      ['GET', t('/websocket'), ['cache_for', 'disabled_transport']])
  }
  return prefix_dispatcher.concat(transport_dispatcher)
}

class Listener {
  constructor(options, emit) {
    this.options = options
    this.app = new App()
    this.app.options = this.options
    this.app.emit = emit
    this.app.log('debug', 'SockJS v' + sockjsVersion() + ' ' +
      'bound to ' + JSON.stringify(this.options.prefix))
    this.dispatcher = generate_dispatcher(this.options)
    this.webjs_handler = webjs.generateHandler(this.app, this.dispatcher)
    this.path_regexp = new RegExp('^' + this.options.prefix + '([/].+|[/]?)$')
  }

  handler(req, res, extra) {
    // All urls that match the prefix must be handled by us.
    if (!req.url.match(this.path_regexp)) {
      return false
    }
    this.webjs_handler(req, res, extra)
    return true
  }

  getHandler() {
    return (a, b, c) => {
      return this.handler(a, b, c)
    }
  }
}

class Server extends events.EventEmitter{
  constructor(user_options) {
    super()
    this.options = {
      prefix: '',
      response_limit: 128 * 1024,
      websocket: true,
      faye_server_options: null,
      jsessionid: false,
      heartbeat_delay: 25000,
      disconnect_delay: 5000,
      log: (severity, line) => console.log(line),
      sockjs_url: 'https://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
    }
    if (user_options) {
      utils.objectExtend(this.options, user_options)
    }
  }

  listener(handler_options) {
    let options = utils.objectExtend({}, this.options)
    if (handler_options) {
      utils.objectExtend(options, handler_options)
    }
    return new Listener(options, (event, data) => this.emit.call(this, event, data))
  }

  installHandlers(http_server, handler_options) {
    let handler = this.listener(handler_options).getHandler()
    utils.overshadowListeners(http_server, 'request', handler)
    utils.overshadowListeners(http_server, 'upgrade', handler)
    return true
  }
  middleware(handler_options) {
    let handler = this.listener(handler_options).getHandler()
    handler.upgrade = handler
    return handler
  }
}

// utils.objectExtend(Server.prototype, events.EventEmitter.prototype)

export function createServer(options) {
  return new Server(options)
}

export function listen(http_server, options) {
  let srv = createServer(options)
  if (http_server) {
    srv.installHandlers(http_server)
  }
  return srv
}

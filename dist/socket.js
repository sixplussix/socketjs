(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('events'), require('fs'), require('url'), require('querystring'), require('http'), require('crypto'), require('faye-websocket'), require('stream'), require('uuid')) :
	typeof define === 'function' && define.amd ? define(['exports', 'events', 'fs', 'url', 'querystring', 'http', 'crypto', 'faye-websocket', 'stream', 'uuid'], factory) :
	(factory((global.NodeSocket = global.NodeSocket || {}),global.events,global.fs,global.url,global.querystring,global.http,global.crypto,global.FayeWebsocket,global.stream,global.uuid));
}(this, (function (exports,events,fs,url,querystring,http,crypto,FayeWebsocket,stream,uuid) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/**
 * Adds two numbers together, returning the sum.
 */


function escape_selected(str, chars) {
  var map = {};
  chars = '%' + chars;
  for (var len = chars.length; len-- > 0;) {
    map[chars[len]] = escape(chars[len]);
  }
  var r = new RegExp('([' + chars + '])');
  var parts = str.split(r);
  for (var i = 0, _len = parts.length; i < _len; i++) {
    var v = parts[i];
    if (v.length === 1 && v in map) {
      parts[i] = map[v];
    }
  }
  return parts.join('');
}

function buffer_concat(buf_a, buf_b) {
  var dst = new Buffer(buf_a.length, buf_b.length);
  buf_a.copy(dst);
  buf_b.copy(dst, buf_a.length);
  return dst;
}

function md5_hex(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}



function timeout_chain(arr) {
  arr = arr.slice(0);
  if (!arr.length) return;

  var _arr$shift = arr.shift(),
      _arr$shift2 = slicedToArray(_arr$shift, 2),
      timeout = _arr$shift2[0],
      user_fun = _arr$shift2[1];

  var fun = function fun() {
    user_fun();
    timeout_chain(arr);
  };
  setTimeout(fun, timeout);
}

function objectExtend(dst, src) {
  Object.assign(dst, src);
  return dst;
}

// listeners() returns a reference to the internal array of EventEmitter.
// Make a copy, because we're about the replace the actual listeners.
function overshadowListeners(ee, event, handler) {
  var old_listeners = ee.listeners(event).slice(0);

  ee.removeAllListeners(event);
  var new_handler = function new_handler() {
    var _this = this,
        _arguments = arguments;

    if (!handler.apply(this, arguments)) {
      old_listeners.forEach(function (listener) {
        return listener.apply(_this, _arguments);
      });
      return false;
    }
    return true;
  };
  ee.addListener(event, new_handler);
}

var ESCAPABLE = /[\x00-\x1f\ud800-\udfff\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g;

function unroll_lookup(escapable) {
  var unrolled = {};
  var c = [];
  for (var i = 0; i < 65536; i++) {
    c.push(String.fromCharCode(i));
  }
  escapable.lastIndex = 0;
  c.join('').replace(escapable, function (a) {
    unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  });
  return unrolled;
}
var lookup = unroll_lookup(ESCAPABLE);

function quote(string) {
  var quoted = JSON.stringify(string);
  ESCAPABLE.lastIndex = 0;
  if (!ESCAPABLE.test(quoted)) {
    return quoted;
  }
  return quoted.replace(ESCAPABLE, function (a) {
    return lookup[a];
  });
}

function parseCookie(cookie_header) {
  var cookies = {};
  if (cookie_header) {
    cookie_header.split(';').forEach(function (cookie) {
      var parts = cookie.split('=');
      cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
  }
  return cookies;
}
function random32() {
  var randArr = crypto.randomBytes(4);
  return randArr[0] + randArr[1] * 256 + randArr[2] * 256 * 256 + randArr[3] * 256 * 256 * 256;
}

function execute_request(app, funs, req, res, data) {
  try {
    while (funs.length > 0) {
      var fun = funs.shift();
      req.last_fun = fun;
      data = app[fun](req, res, data, req.next_filter);
    }
  } catch (x) {
    if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && 'status' in x) {
      if (x.status === 0) {
        return;
      } else if ('handle_' + x.status in app) {
        app['handle_' + x.status](req, res, x);
      } else {
        app['handle_error'](req, res, x);
      }
    } else {
      app['handle_error'](req, res, x);
    }
    app['log_request'][(req, res, true)];
  }
}

function fake_response(req, res) {
  var headers = { 'Connection': 'close' };
  res.writeHead = function (status) {
    var user_headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var r = [];
    r.push('HTTP/' + req.httpVersion + ' ' + status + ' ' + http.STATUS_CODES[status]);
    objectExtend(headers, user_headers);
    Object.keys(headers).forEach(function (k) {
      r.push(k + ': ' + headers[k]);
    });
    // add tow blank
    r = r.concat(['', '']);

    try {
      res.write(r.join('\r\n'));
    } catch (_) {}
    try {
      res.end();
    } catch (_) {}
  };
  res.setHeader = function (k, v) {
    return headers[k] = v;
  };
}

function generateHandler(app, dispatcher) {
  return function (req, res, head) {
    if (typeof res.writeHead === 'undefined') {
      fake_response(req, res);
    }
    objectExtend(req, url.parse(req.url, true));
    req.start_date = new Date();

    var found = false;
    var allowed_methods = [];

    var _loop = function _loop() {
      var row = dispatcher[_i];

      var _row = slicedToArray(row, 3),
          method = _row[0],
          path = _row[1],
          funs = _row[2];

      if (path.constructor !== Array) {
        path = [path];
      }

      var m = req.pathname.match(path[0]);
      if (!m) {
        return 'continue';
      }
      if (!req.method.match(new RegExp(method))) {
        allowed_methods.push(method);
        return 'continue';
      }
      path.forEach(function (pt, i) {
        return req[pt] = m[i];
      });

      funs = funs.slice(0);
      funs.push('log_request');
      req.next_filter = function (data) {
        execute_request(app, funs, req, res, data);
      };
      req.next_filter(head);
      found = true;
      return 'break';
    };

    _loop2: for (var _i = 0, _len = dispatcher.length; _i < _len; _i++) {
      var _ret = _loop();

      switch (_ret) {
        case 'continue':
          continue;

        case 'break':
          break _loop2;}
    }

    if (!found) {
      if (allowed_methods.length !== 0) {
        app['handle_405'](req, res, allowed_methods);
      } else {
        app['handle_404'](req, res);
      }
      app['log_request'](req, res, true);
    }
    return;
  };
}

var GenericApp = function () {
  function GenericApp() {
    classCallCheck(this, GenericApp);
  }

  createClass(GenericApp, [{
    key: 'handle_404',
    value: function handle_404(req, res, x) {
      if (res.finished) {
        return x;
      }
      res.writeHead(404, {});
      res.end();
      return true;
    }
  }, {
    key: 'handle_405',
    value: function handle_405(req, res, methods) {
      res.writeHead(405, { Allow: methods.join(', ') });
      res.end();
      return true;
    }
  }, {
    key: 'handle_error',
    value: function handle_error(req, res, x) {
      if (res.finished) {
        return x;
      }
      if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && 'status' in x) {
        res.writeHead(x.status, {});
        res.end(x.message || '');
      } else {
        try {
          res.writeHead(500, {});
          res.end('500 - Internal Server Error');
        } catch (x) {}
        this.log('error', 'Exception on "' + req.method + ' ' + req.href + '" in filter "' + req.last_fun + '":\n' + (x.stack || x));
      }
    }
  }, {
    key: 'log_request',
    value: function log_request(req, res, data) {
      var td = new Date() - req.start_date;
      this.log('info', req.method + ' ' + req.url + ' ' + td + 'ms ' + (res.finished ? res.statusCode : '(unfinished)'));
    }
  }, {
    key: 'log',
    value: function log(severity, line) {
      console.log(line);
    }
  }, {
    key: 'expose_html',
    value: function expose_html(req, res, content) {
      if (res.finished) {
        return content;
      }
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      }
      return this.expose(req, res, content);
    }
  }, {
    key: 'expose_json',
    value: function expose_json(req, res, content) {
      if (res.finished) {
        return content;
      }
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
      }
      return this.expose(req, res, JSON.stringify(content));
    }
  }, {
    key: 'expose',
    value: function expose(req, res, content) {
      if (res.finished) {
        return content;
      }
      if (content && !res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/plain');
      }
      if (content) {
        res.setHeader('Content-Length', content.length);
      }

      res.writeHead(res.statusCode);
      res.end(content, 'utf8');
      return true;
    }
  }, {
    key: 'serve_file',
    value: function serve_file(req, res, filename, next_filter) {
      var o = function o(error, content) {
        if (error) {
          res.writeHead(500);
          res.end("can't red file");
        } else {
          res.setHeader('Content-length', content.length);
          res.writeHead(res.statusCode, res.headers);
          res.end(content, 'utf8');
        }
        next_filter(true);
      };

      fs.readFile(filename, o);
      throw { status: 0 };
    }
  }, {
    key: 'cache_for',
    value: function cache_for(req, res, content) {
      res.cahce_for = res.cache_for || 365 * 24 * 60 * 60;
      res.setHeader('Cache-Control', 'public, max-age=' + res.cache_for);
      var exp = new Date();
      exp.setTime(exp.getTime() + res.cache_for * 1000);
      res.setHeader('Expires', exp.toUTCString());
      return content;
    }
  }, {
    key: 'h_no_cache',
    value: function h_no_cache(req, res, content) {
      res.setHeader('Cache-Control', 'no-store, no-cache, no-transform, must-revalidate, max-age=0');
      return content;
    }
  }, {
    key: 'expect_form',
    value: function expect_form(req, res, _data, next_fitler) {
      var _this = this;

      var data = new Buffer(0);
      var q = void 0;
      req.on('data', function (d) {
        data = buffer_concat(data, new Buffer(d, 'binary'));
      });
      req.on('end', function () {
        data = data.toString('utf-8');
        switch ((req.headers['content-type'] || '').split(';')[0]) {
          case 'application/x-www-form-urlencoded':
            q = querystring.parse(data);
            break;
          case 'text/plain':
            q = data;
            break;
          default:
            _this.log('error', 'Unsupport content-type ' + req.headers['content-type']);
            q = undefined;
            break;
        }
        next_fitler(q);
      });
      throw { status: 0 };
    }
  }, {
    key: 'expect_xhr',
    value: function expect_xhr(req, res, _data, next_fitler) {
      var _this2 = this;

      var data = new Buffer(0);
      var q = void 0;
      req.on('data', function (d) {
        data = buffer_concat(data, new Buffer(d, 'binary'));
      });

      req.on('end', function () {
        data = data.toString('utf-8');
        switch ((req.headers['content-type'] || '').split(';')[0]) {
          case 'text/plain':
          case 'T':
          case 'application/json':
          case 'application/xml':
          case '':
          case 'text/xml':
            q = data;
            break;
          default:
            _this2.log('error', 'Unsupport content-type ' + req.headers['content-type']);
            q = undefined;
            break;
        }
        next_fitler(q);
      });
      throw { status: 0 };
    }
  }]);
  return GenericApp;
}();

var Transport$1 = function Transport() {
  classCallCheck(this, Transport);
};
Transport$1.CONNECTING = 0;
Transport$1.OPEN = 1;
Transport$1.CLOSING = 2;
Transport$1.CLOSED = 3;

var closeFrame = function closeFrame(status, reason) {
  return 'c' + JSON.stringify([status, reason]);
};

var SockJSConnection = function (_stream$Stream) {
  inherits(SockJSConnection, _stream$Stream);

  function SockJSConnection(_session) {
    classCallCheck(this, SockJSConnection);

    var _this = possibleConstructorReturn(this, (SockJSConnection.__proto__ || Object.getPrototypeOf(SockJSConnection)).call(this));

    _this._session = _session;
    _this.id = uuid.v4();
    _this.headers = {};
    _this.prefix = _this._session.prefix;
    return _this;
  }

  createClass(SockJSConnection, [{
    key: 'toString',
    value: function toString() {
      return '<SockJSConnection ' + this.id + '>';
    }
  }, {
    key: 'write',
    value: function write(string) {
      return this._session.send('' + string);
    }
  }, {
    key: 'end',
    value: function end(string) {
      if (string) {
        this.write(string);
      }
      this.close();
      return null;
    }
  }, {
    key: 'close',
    value: function close(code, reason) {
      this._session.close(code, reason);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.end();
      this.removeAllListeners();
    }
  }, {
    key: 'destroySoon',
    value: function destroySoon() {
      this.destroy();
    }
  }]);
  return SockJSConnection;
}(stream.Stream);

// utils.objectExtend(SockJSConnection.prototype, stream.Stream.prototype)
SockJSConnection.prototype.__defineGetter__('readable', function () {
  this._session.readyState === Transport$1.OPEN;
});
SockJSConnection.prototype.__defineGetter__('writable', function () {
  this._session.readyState === Transport$1.OPEN;
});
SockJSConnection.prototype.__defineGetter__('readyState', function () {
  this._session.readyState;
});

var MAP = {};

var Session = function () {
  function Session(session_id, server) {
    var _this2 = this;

    classCallCheck(this, Session);

    this.session_id = session_id;
    this.heartbeat_delay = server.options.heartbeat_delay;
    this.disconnect_delay = server.options.disconnect_delay;
    this.prefix = server.options.prefix;
    this.send_buffer = [];
    this.is_closing = false;
    this.readyState = Transport$1.CONNECTING;
    if (this.session_id) {
      MAP[this.session_id] = this;
    }
    this.timeout_cb = function () {
      return _this2.didTimeout();
    };
    this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay);
    this.connection = new SockJSConnection(this);
    this.emit_open = function () {
      _this2.emit_open = null;
      console.log('emit open');
      server.emit('connection', _this2.connection);
    };
  }

  createClass(Session, [{
    key: 'register',
    value: function register(req, recv) {
      if (this.recv) {
        recv.doSendFrame(closeFrame(2010, 'Another connection still open'));
        recv.didClose();
        return;
      }

      if (this.to_tref) {
        clearTimeout(this.to_tref);
        this.to_tref = null;
      }

      if (this.readyState === Transport$1.CLOSING) {
        this.flushToRecv(recv);
        recv.doSendFrame(this.close_frame);
        recv.didClose();
        this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay);
        return;
      }

      this.recv = recv;
      this.recv.session = this;

      // Save parameters from request

      this.decorateConnection(req);

      if (this.readyState === Transport$1.CONNECTING) {
        this.recv.doSendFrame('o');
        this.readyState = Transport$1.OPEN;
        // emit the open event, but not right now
        process.nextTick(this.emit_open);
      }

      if (!this.recv) {
        return;
      }
      this.tryFlush();
      return;
    }
  }, {
    key: 'decorateConnection',
    value: function decorateConnection(req) {
      var socket = this.recv.connection;
      var remoteAddress = void 0,
          remotePort = void 0,
          address = void 0;
      if (!socket) {
        socket = this.recv.response.connection;
      }

      try {
        remoteAddress = socket.remoteAddress;
        remotePort = socket.remotePort;
        address = socket.address;
      } catch (x) {
        x;
      }

      if (remoteAddress) {
        this.connection.remoteAddress = remoteAddress;
        this.connection.remotePort = remotePort;
        this.connection.address = address;
      }

      this.connection.url = req.url;
      this.connection.pathname = req.pathname;
      this.protocol = this.recv.protocol;

      var headers = {};
      var keys = ['referer', 'x-client-ip', 'x-forwarded-for', 'x-cluster-client-ip', 'via', 'x-real-ip', 'x-forwarded-proto', 'x-ssl', 'host', 'user-agent', 'accept-language'];
      keys.forEach(function (k) {
        if (req.headers[k]) {
          headers[k] = req.headers[k];
        }
      });

      this.connection.headers = headers;
    }
  }, {
    key: 'unregister',
    value: function unregister() {
      var delay = this.recv.delay_disconnec;
      this.recv.session = null;
      this.recv = null;
      if (this.to_tref) {
        clearTimeout(this.to_tref);
      }

      if (delay) {
        this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay);
      } else {
        this.timeout_cb();
      }
    }
  }, {
    key: 'flushToRecv',
    value: function flushToRecv(recv) {
      if (this.send_buffer.length > 0) {
        var sb = void 0;
        var _ref = [this.send_buffer, []];
        sb = _ref[0];
        this.send_buffer = _ref[1];

        recv.doSendBulk(sb);
        return true;
      }
      return false;
    }
  }, {
    key: 'tryFlush',
    value: function tryFlush() {
      var _this3 = this;

      if (!this.flushToRecv(this.recv) || !this.to_tref) {
        if (this.to_tref) {
          clearTimeout(this.to_tref);
        }
        var x = function x() {
          if (_this3.recv) {
            _this3.to_tref = setTimeout(x, _this3.heartbeat_delay);
            _this3.recv.heartbeat();
          }
        };
        this.to_tref = setTimeout(x, this.heartbeat_delay);
      }
      return;
    }
  }, {
    key: 'didTimeout',
    value: function didTimeout() {
      if (this.to_tref) {
        clearTimeout(this.to_tref);
        this.to_tref = null;
      }
      if (this.readyState !== Transport$1.CONNECTING && this.readyState !== Transport$1.OPEN && this.readyState !== Transport$1.CLOSING) {
        throw Error('INVALID_STATE_ERR');
      }
      if (this.recv) {
        throw Error('RECV_STILL_THERE');
      }

      this.readyState = Transport$1.CLOSED;

      // Node streaming API is broken. Reader defines 'close' and 'end'
      // but Writer defines only 'close'. 'End' isn't optional though.
      //  http://nodejs.org/docs/v0.5.8/api/streams.html#event_close_
      this.connection.emit('end');
      this.connection.emit('close');
      this.connection = null;
      if (this.session_id) {
        delete MAP[this.session_id];
        this.session_id = null;
      }
    }
  }, {
    key: 'didMessage',
    value: function didMessage(payload) {
      if (this.readyState === Transport$1.OPEN) {
        this.connection.emit('data', payload);
      }
    }
  }, {
    key: 'send',
    value: function send(payload) {
      if (this.readyState !== Transport$1.OPEN) {
        return false;
      }
      this.send_buffer.push('' + payload);

      if (this.recv) {
        this.tryFlush();
      }
      return true;
    }
  }, {
    key: 'close',
    value: function close() {
      var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Normal Closure';

      if (this.readyState !== Transport$1.OPEN) {
        return false;
      }

      this.readyState = Transport$1.CLOSING;
      this.close_frame = closeFrame(status, reason);

      if (this.recv) {
        this.recv.doSendFrame(this.close_frame);
        if (this.recv) {
          this.recv.didClose();
        }
        if (this.recv) {
          this.unregister();
        }
      }
      return true;
    }
  }]);
  return Session;
}();

Session.bySessionId = function (session_id) {
  if (!session_id) {
    return null;
  }
  return MAP[session_id] || null;
};

var _register = function _register(req, server, session_id, receiver) {
  var session = Session.bySessionId(session_id);
  if (!session) {
    session = new Session(session_id, server);
  }
  session.register(req, receiver);
  return session;
};

function register(req, server, receiver) {
  return _register(req, server, req.session, receiver);
}

function registerNoSession(req, server, receiver) {
  return _register(req, server, undefined, receiver);
}

var GenericReceiver = function () {
  function GenericReceiver(thingy) {
    classCallCheck(this, GenericReceiver);

    this.thingy = thingy;
    this.setUp(this.thingy);
  }

  createClass(GenericReceiver, [{
    key: 'setUp',
    value: function setUp() {
      var _this4 = this;

      this.thingy_end_cb = function () {
        return _this4.didAbort();
      };
      this.thingy.addListener('close', this.thingy_end_cb);
      this.thingy.addListener('end', this.thingy_end_cb);
    }
  }, {
    key: 'tearDown',
    value: function tearDown() {
      this.thingy.removeListener('close', this.thingy_end_cb);
      this.thingy.removeListener('end', this.thingy_end_cb);
      this.thingy_end_cb = null;
    }
  }, {
    key: 'didAbort',
    value: function didAbort() {
      this.delay_disconnect = false;
      this.didClose();
    }
  }, {
    key: 'didClose',
    value: function didClose() {
      if (this.thingy) {
        this.tearDown(this.thingy);
        this.thingy = null;
      }
      if (this.session) {
        this.session.unregister();
      }
    }
  }, {
    key: 'doSendBulk',
    value: function doSendBulk(messages) {
      var q_msgs = messages.map(function (msg) {
        return quote(msg);
      });
      this.doSendFrame('a' + '[' + q_msgs.join(',') + ']');
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat() {
      this.doSendFrame('h');
    }
  }]);
  return GenericReceiver;
}();

// Write stuff to response, using chunked encoding if possible.

var ResponseReceiver = function (_GenericReceiver) {
  inherits(ResponseReceiver, _GenericReceiver);

  function ResponseReceiver(request, response, options) {
    classCallCheck(this, ResponseReceiver);

    var _this5 = possibleConstructorReturn(this, (ResponseReceiver.__proto__ || Object.getPrototypeOf(ResponseReceiver)).call(this, request.connection));

    _this5.max_response_size = undefined;
    _this5.delay_disconnect = true;
    _this5.request = request;
    _this5.response = response;
    _this5.options = options;

    _this5.curr_response_size = 0;
    try {
      _this5.request.connection.setKeepAlive(true, 5000);
    } catch (x) {
      x;
    }

    if (_this5.max_response_size === undefined) {
      _this5.max_response_size = _this5.options.response_limit;
    }
    return _this5;
  }

  createClass(ResponseReceiver, [{
    key: 'doSendFrame',
    value: function doSendFrame(payload) {
      this.curr_response_size += payload.length;
      var r = false;
      try {
        this.response.write(payload);
        r = true;
      } catch (x) {
        x;
      }
      if (this.max_response_size && this.curr_response_size > this.max_response_size) {
        this.didClose();
      }
      return r;
    }
  }, {
    key: 'didClose',
    value: function didClose() {
      get(ResponseReceiver.prototype.__proto__ || Object.getPrototypeOf(ResponseReceiver.prototype), 'didClose', this).call(this);
      try {
        this.response.end();
      } catch (x) {
        x;
      }
      this.response = null;
    }
  }]);
  return ResponseReceiver;
}(GenericReceiver);

var app = {
  _websocket_check: function _websocket_check(req, connection, head) {
    if (!FayeWebsocket.isWebSocket(req)) {
      throw {
        status: 400,
        message: 'Not a valid websocket request'
      };
    }
  },
  sockjs_websocket: function sockjs_websocket(req, connection, head) {
    var _this = this;

    this._websocket_check(req, connection, head);
    var ws = new FayeWebsocket(req, connection, head, null, this.options.faye_server_options);

    ws.onopen = function () {
      return registerNoSession(req, _this, new WebSocketReceiver(ws, connection));
    };
    return true;
  },
  raw_websocket: function raw_websocket(req, connection, head) {
    var _this2 = this;

    this._websocket_check(req, connection, head);
    var ver = req.headers['sec-websocket-version'] || '';

    if (['8', '13'].indexOf(ver) === -1) {
      throw {
        status: 400,
        message: 'Only supported WebSocket protocol is RFC 6455.'
      };
    }
    var ws = new FayeWebsocket(req, connection, head, null, this.options.faye_server_options);
    ws.onopen = function () {
      return new RawWebsocketSessionReceiver(req, connection, _this2, ws);
    };

    return true;
  }
};

var WebSocketReceiver = function (_transport$GenericRec) {
  inherits(WebSocketReceiver, _transport$GenericRec);

  function WebSocketReceiver(ws, connection) {
    classCallCheck(this, WebSocketReceiver);

    var _this3 = possibleConstructorReturn(this, (WebSocketReceiver.__proto__ || Object.getPrototypeOf(WebSocketReceiver)).call(this, connection));

    _this3.ws = ws;
    _this3.connection = connection;
    try {
      _this3.connection.setKeepAlive(true, 5000);
      _this3.connection.setNoDelay(true);
    } catch (x) {
      x;
    }

    _this3.ws.addEventListener('close', _this3.thingy_end_cb);
    _this3.ws.addEventListener('message', function (m) {
      return _this3.didMessage(m.data);
    });
    _this3.heartbeat_cb = function () {
      return _this3.heartbeat_timeout();
    };
    return _this3;
  }

  createClass(WebSocketReceiver, [{
    key: 'tearDown',
    value: function tearDown() {
      this.ws.removeEventListener('close', this.thingy_end_cb);
      get(WebSocketReceiver.prototype.__proto__ || Object.getPrototypeOf(WebSocketReceiver.prototype), 'tearDown', this).call(this);
    }
  }, {
    key: 'didMessage',
    value: function didMessage(payload) {
      var _this4 = this;

      var message = void 0;
      if (this.ws && this.session && payload.length > 0) {
        try {
          message = JSON.parse(payload);
        } catch (x) {
          return this.didClose(3000, 'Broken framing.');
        }

        if (payload[0] === '[') {
          message.forEach(function (msg) {
            return _this4.session.didMessage(msg);
          });
        } else {
          this.session.didMessage(message);
        }
      }
    }
  }, {
    key: 'doSendFrame',
    value: function doSendFrame(payload) {
      if (this.ws) {
        try {
          this.ws.send(payload);
          return true;
        } catch (x) {
          x;
        }
      }
      return false;
    }
  }, {
    key: 'didClose',
    value: function didClose() {
      var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Normal closure';

      get(WebSocketReceiver.prototype.__proto__ || Object.getPrototypeOf(WebSocketReceiver.prototype), 'didClose', this).call(this);
      try {
        this.ws.close(status, reason, false);
      } catch (x) {
        x;
      }
      this.ws = null;
      this.connection = null;
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat() {
      var hto_ref = void 0;
      var supportsHeartbeats = this.ws.ping(null, function () {
        clearTimeout(hto_ref);
      });

      if (supportsHeartbeats) {
        hto_ref = setTimeout(this.heartbeat_cb, 10000);
      } else {
        get(WebSocketReceiver.prototype.__proto__ || Object.getPrototypeOf(WebSocketReceiver.prototype), 'heartbeat', this).call(this);
      }
    }
  }, {
    key: 'heartbeat_timeout',
    value: function heartbeat_timeout() {
      if (this.session) {
        this.session.close(3000, 'No response from heartbeat');
      }
    }
  }]);
  return WebSocketReceiver;
}(GenericReceiver);

WebSocketReceiver.prototype.protocol = 'websocket';

var Transport = Transport$1;

// Inheritance only for decorateConnection.

var RawWebsocketSessionReceiver = function () {
  function RawWebsocketSessionReceiver(req, conn, server, ws) {
    var _this5 = this;

    classCallCheck(this, RawWebsocketSessionReceiver);

    this.ws = ws;
    this.prefix = server.options.prefix;
    this.readyState = Transport.OPEN;
    this.recv = { connection: conn, protocol: "websocket-raw" };

    this.connection = new SockJSConnection(this);
    this.decorateConnection(req);
    server.emit('connection', this.connection);
    this._end_cb = function () {
      return _this5.didClose();
    };
    this.ws.addEventListener('close', this._end_cb);
    this._message_cb = function (m) {
      return _this5.didMessage(m);
    };
    this.ws.addEventListener('message', this._message_cb);
  }

  createClass(RawWebsocketSessionReceiver, [{
    key: 'didMessage',
    value: function didMessage(m) {
      if (this.readyState === Transport.OPEN) {
        this.connection.emit('data', m.data);
      }
      return;
    }
  }, {
    key: 'send',
    value: function send(payload) {
      if (this.readyState !== Transport.OPEN) {
        return false;
      }
      this.ws.send(payload);
      return true;
    }
  }, {
    key: 'close',
    value: function close() {
      var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Normal closure";

      if (this.readyState !== Transport.OPEN) {
        return false;
      }
      this.readyState = Transport.CLOSING;
      this.ws.close(status, reason, false);
      return true;
    }
  }, {
    key: 'didClose',
    value: function didClose() {
      if (!this.ws) {
        return;
      }
      this.ws.removeEventListener('message', this._message_cb);
      this.ws.removeEventListener('close', this._end_cb);
      try {
        this.ws.close(1000, "Normal closure", false);
      } catch (x) {
        x;
      }
      this.ws = null;

      this.readyState = Transport.CLOSED;
      this.connection.emit('end');
      this.connection.emit('close');
      this.connection = null;
    }
  }]);
  return RawWebsocketSessionReceiver;
}();

objectExtend(RawWebsocketSessionReceiver.prototype, Session.prototype);

var JsonpReceiver = function (_transport$ResponseRe) {
  inherits(JsonpReceiver, _transport$ResponseRe);

  function JsonpReceiver(req, res, options, callback) {
    classCallCheck(this, JsonpReceiver);

    var _this = possibleConstructorReturn(this, (JsonpReceiver.__proto__ || Object.getPrototypeOf(JsonpReceiver)).call(this, req, res, options));

    _this.callback = callback;
    return _this;
  }

  createClass(JsonpReceiver, [{
    key: "doSendFrame",
    value: function doSendFrame(payload) {
      // Yes, JSONed twice, there isn't a a better way, we must pass
      // a string back, and the script, will be evaled() by the
      // browser.
      // prepend comment to avoid SWF exploit #163
      get(JsonpReceiver.prototype.__proto__ || Object.getPrototypeOf(JsonpReceiver.prototype), "doSendFrame", this).call(this, "/**/" + this.callback + "(" + JSON.stringify(payload) + ");\r\n");
    }
  }]);
  return JsonpReceiver;
}(ResponseReceiver);

var app$1 = {
  jsonp: function jsonp(req, res, _, next_filter) {
    if (!('c' in req.query || 'callback' in req.query)) {
      throw {
        status: 500,
        message: '"callback" parameter required'
      };
    }

    var callback = void 0;
    if ('c' in req.query) {
      callback = req.query['c'];
    } else {
      callback = req.query['callback'];
    }

    if (/[^a-zA-Z0-9-_.]/.test(callback) || callback.length > 32) {
      throw {
        status: 500,
        message: 'invalid "callback" parameter'
      };
    }

    // protect against SWF JSONP exploit 
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.writeHead(200);

    register(req, this, new JsonpReceiver(req, res, this.options, callback));
    return true;
  },
  jsonp_send: function jsonp_send(req, res, query) {
    if (!query) {
      throw {
        status: 500,
        message: 'Payload expected.'
      };
    }
    var d = void 0;
    if (typeof query === 'string') {
      try {
        d = JSON.parse(query);
      } catch (x) {
        throw {
          status: 500,
          message: 'Broken JSON encoding.'
        };
      }
    } else {
      d = query.d;
    }
    if (typeof d === 'string' && d) {
      try {
        d = JSON.parse(d);
      } catch (x) {
        throw {
          status: 500,
          message: 'Broken JSON encoding.'
        };
      }
    }
    if (!d || d.__proto__.constructor !== Array) {
      throw {
        status: 500,
        message: 'Payload expected'
      };
    }
    var jsonp = Session.bySessionId(req.session);
    if (jsonp === null) {
      throw { status: 404 };
    }

    d.forEach(function (msg) {
      jsonp.didMessage(msg);
    });

    res.setHeader('Content-Length', '2');
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.writeHead(200);
    res.end('ok');
    return true;
  }
};

var XhrStreamingReceiver = function (_transport$ResponseRe) {
  inherits(XhrStreamingReceiver, _transport$ResponseRe);

  function XhrStreamingReceiver() {
    classCallCheck(this, XhrStreamingReceiver);
    return possibleConstructorReturn(this, (XhrStreamingReceiver.__proto__ || Object.getPrototypeOf(XhrStreamingReceiver)).apply(this, arguments));
  }

  createClass(XhrStreamingReceiver, [{
    key: 'doSendFrame',
    value: function doSendFrame(payload) {
      return get(XhrStreamingReceiver.prototype.__proto__ || Object.getPrototypeOf(XhrStreamingReceiver.prototype), 'doSendFrame', this).call(this, payload + '\n');
    }
  }]);
  return XhrStreamingReceiver;
}(ResponseReceiver);

XhrStreamingReceiver.prototype.protocol = 'xhr-streaming';

var XhrPollingReceiver = function (_XhrStreamingReceiver) {
  inherits(XhrPollingReceiver, _XhrStreamingReceiver);

  function XhrPollingReceiver() {
    classCallCheck(this, XhrPollingReceiver);
    return possibleConstructorReturn(this, (XhrPollingReceiver.__proto__ || Object.getPrototypeOf(XhrPollingReceiver)).apply(this, arguments));
  }

  return XhrPollingReceiver;
}(XhrStreamingReceiver);

XhrPollingReceiver.prototype.protocol = 'xhr-polling';
XhrPollingReceiver.prototype.max_response_size = 1;

var app$2 = {
  xhr_options: function xhr_options(req, res) {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Max-Age', res.cache_for);
    return '';
  },
  xhr_send: function xhr_send(req, res, data) {
    if (!data) {
      throw {
        status: 500,
        message: 'Payload expected.'
      };
    }
    var d = void 0;
    try {
      d = JSON.parse(data);
    } catch (x) {
      throw {
        status: 500,
        message: 'Broken JSON encoding.'
      };
    }

    if (!d || d.__proto__.constructor !== Array) {
      throw {
        status: 500,
        message: 'Payload expected.'
      };
    }
    var jsonp = Session.bySessionId(req.session);
    if (!jsonp) {
      throw {
        status: 404
      };
    }
    d.forEach(function (msg) {
      return jsonp.didMessage(msg);
    });

    // FF assumes that the response is XML.
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.writeHead(204);
    res.end();
    return true;
  },
  xhr_cors: function xhr_cors(req, res, content) {
    var origin = void 0;
    if (!req.headers['origin']) {
      origin = '*';
    } else {
      origin = req.headers['origin'];
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    var header = req.headers['access-control-request-headers'];
    if (header) {
      res.setHeader('Access-Control-Allow-Headers', header);
    }
    return content;
  },
  xhr_poll: function xhr_poll(req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.writeHead(200);

    register(req, this, new XhrPollingReceiver(req, res, this.options));
    return true;
  },
  xhr_streaming: function xhr_streaming(req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.writeHead(200);

    // IE requires 2KB prefix:
    //  http://blogs.msdn.com/b/ieinternals/archive/2010/04/06/comet-streaming-in-internet-explorer-with-xmlhttprequest-and-xdomainrequest.aspx
    res.write(Array(2049).join('h') + '\n');

    register(req, this, new XhrStreamingReceiver(req, res, this.options));
    return true;
  }
};

var iframe_template = '\n<!DOCTYPE html>\n<html>\n<head>\n  <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n  <script src="{{ sockjs_url }}"></script>\n  <script>\n    document.domain = document.domain;\n    SockJS.bootstrap_iframe();\n  </script>\n</head>\n<body>\n  <h2>Don\'t panic!</h2>\n  <p>This is a SockJS hidden iframe. It\'s used for cross domain magic.</p>\n</body>\n</html>\n';
var app$3 = {
  iframe: function iframe(req, res) {
    var context = {
      '{{ sockjs_url }}': this.options.sockjs_url
    };

    var content = iframe_template;

    for (var k in context) {
      content = content.replace(k, context[k]);
    }

    var quoted_md5 = '"' + md5_hex(content) + '"';
    if ('if-none-match' in req.headers && req.headers['if-none-match'] === quoted_md5) {
      res.statusCode = 304;
      return '';
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('ETag', quoted_md5);
    return content;
  }
};

var EventSourceReceiver = function (_transport$ResponseRe) {
  inherits(EventSourceReceiver, _transport$ResponseRe);

  function EventSourceReceiver() {
    classCallCheck(this, EventSourceReceiver);
    return possibleConstructorReturn(this, (EventSourceReceiver.__proto__ || Object.getPrototypeOf(EventSourceReceiver)).apply(this, arguments));
  }

  createClass(EventSourceReceiver, [{
    key: 'doSendFrame',
    value: function doSendFrame(payload) {
      var data = ['data:', escape_selected(payload, '\r\n\x00'), '\r\n\r\n'];
      get(EventSourceReceiver.prototype.__proto__ || Object.getPrototypeOf(EventSourceReceiver.prototype), 'doSendFrame', this).call(this, data.join(''));
    }
  }]);
  return EventSourceReceiver;
}(ResponseReceiver);

EventSourceReceiver.prototype.protocol = 'eventsource';

var app$4 = {
  eventsource: function eventsource(req, res) {
    var origin = void 0;
    if (!req.headers['origin'] || req.headers['origin'] === 'null') {
      origin = '*';
    } else {
      origin = req.headers['origin'];
      res.setHeader('Access-Control-Allow-Credentials', true);
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    var header = req.headers['access-control-request-headers'];
    if (header) {
      res.setHeader('Access-Control-Allow-Headers', header);
    }

    res.writeHead(200);
    res.write('\r\n');
    register(req, this, new EventSourceReceiver(req, res, this.options));
    return true;
  }
};

var iframe_template$1 = '\n<!doctype html>\n<html><head>\n  <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n</head><body><h2>Don\'t panic!</h2>\n  <script>\n    document.domain = document.domain;\n    var c = parent.{{ callback }};\n    c.start();\n    function p(d) {c.message(d);};\n    window.onload = function() {c.stop();};\n  </script>\n  ';
iframe_template$1 += Array(1024 - iframe_template$1.length + 14).join(' ');
iframe_template$1 += '\r\n\r\n';

var HtmlFileReceiver = function (_transport$ResponseRe) {
  inherits(HtmlFileReceiver, _transport$ResponseRe);

  function HtmlFileReceiver() {
    classCallCheck(this, HtmlFileReceiver);
    return possibleConstructorReturn(this, (HtmlFileReceiver.__proto__ || Object.getPrototypeOf(HtmlFileReceiver)).apply(this, arguments));
  }

  createClass(HtmlFileReceiver, [{
    key: 'doSendFrame',
    value: function doSendFrame(payload) {
      get(HtmlFileReceiver.prototype.__proto__ || Object.getPrototypeOf(HtmlFileReceiver.prototype), 'doSendFrame', this).call(this, '<script>\np(' + JSON.stringify(payload) + ');\n</script>\r\n');
    }
  }]);
  return HtmlFileReceiver;
}(ResponseReceiver);

HtmlFileReceiver.prototype.protocol = 'htmlfile';

var app$5 = {
  htmlfile: function htmlfile(req, res) {
    if (!('c' in req.query || 'callback' in req.query)) {
      throw {
        status: 500,
        message: '"callback" parameter required'
      };
    }

    var callback = void 0;
    if ('c' in req.query) {
      callback = req.query['c'];
    } else {
      callback = req.query['callback'];
    }

    if (/[^a-zA-Z0-9-_.]/.test(callback)) {
      throw {
        status: 500,
        message: 'invalid "callback" parameter'
      };
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.writeHead(200);
    res.write(iframe_template$1.replace(/{{ callback }}/g, callback));

    register(req, this, new HtmlFileReceiver(req, res, this.options));
    return true;
  }
};

var app$6 = {
  chunking_test: function chunking_test(req, res, _, next_filter) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.writeHead(200);
    var write = function write(payload) {
      try {
        res.write(payload + '\n');
      } catch (x) {
        return;
      }
    };

    timeout_chain([[0, function () {
      return write('h');
    }], [1, function () {
      return write(Array(2049).join(' ') + 'h');
    }], [5, function () {
      return write('h');
    }], [25, function () {
      return write('h');
    }], [625, function () {
      return write('h');
    }], [3125, function () {
      write('h');res.end();
    }]]);
    return true;
  },
  info: function info(req, res, _) {
    var info = {
      websocket: this.options.websocket,
      origins: ['*:*'],
      cookie_needed: !!this.options.jsessionid,
      entropy: random32()
    };

    if (typeof this.options.base_url === 'function') {
      info.base_url = this.options.base_url();
    } else if (this.options.base_url) {
      info.base_url = this.options.base_url;
    }

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.writeHead(200);
    res.end(JSON.stringify(info));
  },
  info_options: function info_options(req, res) {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Max-Age', res.cache_for);
    return '';
  }
};

function sockjsVersion() {
  var pkg = void 0;
  try {
    pkg = fs.readdirSync(__dirname + '/../package.json', 'utf-8');
  } catch (x) {
    x;
  }
  if (pkg) {
    return JSON.parse(pkg).version;
  } else {
    return null;
  }
}

var App = function (_webjs$GenericApp) {
  inherits(App, _webjs$GenericApp);

  function App() {
    classCallCheck(this, App);
    return possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  createClass(App, [{
    key: 'webcome_screen',
    value: function webcome_screen(req, res) {
      res.setHeader('content-type', 'text/plain; charset=UTF-8');
      res.writeHead(200);
      res.end("Welcome to SockJS!\n");
      return true;
    }
  }, {
    key: 'handle_404',
    value: function handle_404(req, res) {
      res.setHeader('content-type', 'text/plain; charset=UTF-8');
      res.writeHead(404);
      res.end('404 Error: Page not found\n');
      return true;
    }
  }, {
    key: 'disabled_transport',
    value: function disabled_transport(req, res, data) {
      return this.handle_404(req, res, data);
    }
  }, {
    key: 'h_sid',
    value: function h_sid(req, res, data) {
      // Some load balancers do sticky sessions, but only if there is
      //  a JSESSIONID cookie. If this cookie isn't yet set, we shall
      //  set it to a dummy value. It doesn't really matter what, as
      //  session information is usually added by the load balancer.
      req.cookies = parseCookie(req.headers.cookie);
      if (typeof this.options.jsessionid === 'function') {
        //  Users can supply a function
        this.options.jsessionid(req, res);
      } else if (this.options.jsessionid && res.setHeader) {
        // We need to set it every time, to give the loadbalancer
        // opportunity to attach its own cookies.
        var jsid = req.cookies['JSESSIONID'] || 'dummy';
        res.setHeader('Set-Cookie', 'JSESSIONID=' + jsid + '; path=/');
      }
      return data;
    }
  }, {
    key: 'log',
    value: function log(severity, line) {
      this.options.log(severity, line);
    }
  }]);
  return App;
}(GenericApp);

objectExtend(App.prototype, app$3);
objectExtend(App.prototype, app$6);

objectExtend(App.prototype, app);
objectExtend(App.prototype, app$1);
objectExtend(App.prototype, app$2);
objectExtend(App.prototype, app$4);
objectExtend(App.prototype, app$5);

function generate_dispatcher(options) {
  var p = function p(s) {
    return new RegExp('^' + options.prefix + s + '[/]?$');
  };
  var t = function t(s) {
    return [p('/([^/.]+)/([^/.]+)' + s), 'server', 'session'];
  };
  var opts_filters = function opts_filters() {
    var options_filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'xhr_options';

    return ['h_sid', 'xhr_cors', 'cache_for', options_filter, 'expose'];
  };
  var prefix_dispatcher = [['GET', p(''), ['welcome_screen']], ['GET', p('/iframe[0-9-.a-z_]*.html'), ['iframe', 'cache_for', 'expose']], ['OPTIONS', p('/info'), opts_filters('info_options')], ['GET', p('/info'), ['xhr_cors', 'h_no_cache', 'info', 'expose']], ['OPTIONS', p('/chunking_test'), opts_filters()], ['POST', p('/chunking_test'), ['xhr_cors', 'expect_xhr', 'chunking_test']]];
  var transport_dispatcher = [['GET', t('/jsonp'), ['h_sid', 'h_no_cache', 'jsonp']], ['POST', t('/jsonp_send'), ['h_sid', 'h_no_cache', 'expect_form', 'jsonp_send']], ['POST', t('/xhr'), ['h_sid', 'h_no_cache', 'xhr_cors', 'xhr_poll']], ['OPTIONS', t('/xhr'), opts_filters()], ['POST', t('/xhr_send'), ['h_sid', 'h_no_cache', 'xhr_cors', 'expect_xhr', 'xhr_send']], ['OPTIONS', t('/xhr_send'), opts_filters()], ['POST', t('/xhr_streaming'), ['h_sid', 'h_no_cache', 'xhr_cors', 'xhr_streaming']], ['OPTIONS', t('/xhr_streaming'), opts_filters()], ['GET', t('/eventsource'), ['h_sid', 'h_no_cache', 'eventsource']], ['GET', t('/htmlfile'), ['h_sid', 'h_no_cache', 'htmlfile']]];

  // TODO: remove this code on next major release
  if (options.websocket) {
    prefix_dispatcher.push(['GET', p('/websocket'), ['raw_websocket']]);
    transport_dispatcher.push(['GET', t('/websocket'), ['sockjs_websocket']]);
  } else {
    /// modify urls to return 404
    prefix_dispatcher.push(['GET', p('/websocket'), ['cache_for', 'disabled_transport']]);
    transport_dispatcher.push(['GET', t('/websocket'), ['cache_for', 'disabled_transport']]);
  }
  return prefix_dispatcher.concat(transport_dispatcher);
}

var Listener = function () {
  function Listener(options, emit) {
    classCallCheck(this, Listener);

    this.options = options;
    this.app = new App();
    this.app.options = this.options;
    this.app.emit = emit;
    this.app.log('debug', 'SockJS v' + sockjsVersion() + ' ' + 'bound to ' + JSON.stringify(this.options.prefix));
    this.dispatcher = generate_dispatcher(this.options);
    this.webjs_handler = generateHandler(this.app, this.dispatcher);
    this.path_regexp = new RegExp('^' + this.options.prefix + '([/].+|[/]?)$');
  }

  createClass(Listener, [{
    key: 'handler',
    value: function handler(req, res, extra) {
      // All urls that match the prefix must be handled by us.
      if (!req.url.match(this.path_regexp)) {
        return false;
      }
      this.webjs_handler(req, res, extra);
      return true;
    }
  }, {
    key: 'getHandler',
    value: function getHandler() {
      var _this2 = this;

      return function (a, b, c) {
        return _this2.handler(a, b, c);
      };
    }
  }]);
  return Listener;
}();

var Server = function (_events$EventEmitter) {
  inherits(Server, _events$EventEmitter);

  function Server(user_options) {
    classCallCheck(this, Server);

    var _this3 = possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

    _this3.options = {
      prefix: '',
      response_limit: 128 * 1024,
      websocket: true,
      faye_server_options: null,
      jsessionid: false,
      heartbeat_delay: 25000,
      disconnect_delay: 5000,
      log: function log(severity, line) {
        return console.log(line);
      },
      sockjs_url: 'https://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
    };
    if (user_options) {
      objectExtend(_this3.options, user_options);
    }
    return _this3;
  }

  createClass(Server, [{
    key: 'listener',
    value: function listener(handler_options) {
      var _this4 = this;

      var options = objectExtend({}, this.options);
      if (handler_options) {
        objectExtend(options, handler_options);
      }
      return new Listener(options, function (event, data) {
        return _this4.emit.call(_this4, event, data);
      });
    }
  }, {
    key: 'installHandlers',
    value: function installHandlers(http_server, handler_options) {
      var handler = this.listener(handler_options).getHandler();
      overshadowListeners(http_server, 'request', handler);
      overshadowListeners(http_server, 'upgrade', handler);
      return true;
    }
  }, {
    key: 'middleware',
    value: function middleware(handler_options) {
      var handler = this.listener(handler_options).getHandler();
      handler.upgrade = handler;
      return handler;
    }
  }]);
  return Server;
}(events.EventEmitter);

// utils.objectExtend(Server.prototype, events.EventEmitter.prototype)

function createServer(options) {
  return new Server(options);
}

function listen(http_server, options) {
  var srv = createServer(options);
  if (http_server) {
    srv.installHandlers(http_server);
  }
  return srv;
}

exports.createServer = createServer;
exports.listen = listen;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=socket.js.map

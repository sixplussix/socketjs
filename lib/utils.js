/**
 * Adds two numbers together, returning the sum.
 */
import * as crypto from 'crypto';
export function array_intersection (arr_a, arr_b) {
  let r = []
  arr_a.forEach((a) => {
    if (arr_b.indexOf(a) !== -1) {
      r.push(a)
    }
  })
  return r
}

export function escape_selected (str, chars) {
  let map = {}
  chars = '%' + chars
  for ( let len = chars.length; len -- > 0;) {
    map[chars[len]] = escape(chars[len])
  }
  let r = new RegExp('([' + chars +'])')
  let parts = str.split(r)
  for (let i = 0, len = parts.length; i < len; i ++) {
    let v = parts[i]
    if (v.length === 1 && v in map) {
      parts[i] = map[v]
    }
  }
  return parts.join('')
}

export function buffer_concat (buf_a, buf_b) {
  let dst = new Buffer(buf_a.length, buf_b.length)
  buf_a.copy(dst);
  buf_b.copy(dst, buf_a.length)
  return dst;
}

export function md5_hex (data) {
  return crypto.createHash('md5')
          .update(data)
          .digest('hex')
}

export function sha1_base64 (data) {
  return crypto.createHash('sha1')
          .update(data)
          .digest('base64')
}

export function timeout_chain (arr) {
  arr = arr.slice(0)
  if (!arr.length) return;
  let [timeout, user_fun] = arr.shift()
  let fun = () => {
    user_fun()
    timeout_chain(arr)
  }
  setTimeout(fun, timeout)
} 

export function objectExtend (dst, src) {
  Object.assign(dst, src)
  return dst;
}

// listeners() returns a reference to the internal array of EventEmitter.
// Make a copy, because we're about the replace the actual listeners.
export function overshadowListeners (ee, event, handler) {
  let old_listeners = ee.listeners(event).slice(0)

  ee.removeAllListeners(event)
  let new_handler = function(){
    if (!handler.apply(this, arguments)) {
      old_listeners.forEach((listener) => listener.apply(this, arguments))
      return false
    }
    return true
  }
  ee.addListener(event, new_handler)
}

const ESCAPABLE = /[\x00-\x1f\ud800-\udfff\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g

function unroll_lookup (escapable) {
  let unrolled = {}
  let c = []
  for (let i = 0; i < 65536; i ++) {
    c.push(String.fromCharCode(i))
  }
  escapable.lastIndex = 0
  c.join('').replace(escapable, (a) => {
    unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
  })
  return unrolled
}
const lookup = unroll_lookup(ESCAPABLE)

export function quote (string) {
  let quoted = JSON.stringify(string)
  ESCAPABLE.lastIndex = 0
  if (!ESCAPABLE.test(quoted)) {
    return quoted
  }
  return quoted.replace(ESCAPABLE, (a) => lookup[a])
}

export function parseCookie (cookie_header) {
  let cookies = {}
  if (cookie_header) {
    cookie_header.split(';').forEach((cookie) => {
      let parts = cookie.split('=')
      cookies[parts[0].trim()] = (parts[1] || '').trim()
    })
  }
  return cookies
}
export function random32 () {
  let randArr = crypto.randomBytes(4)
  return randArr[0] + randArr[1] * 256 + randArr[2] * 256 * 256 + randArr[3] * 256 * 256 * 256
}

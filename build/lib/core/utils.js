var Inflector, createCounter,
  slice = [].slice;

Inflector = require('inflector');

module.exports = {
  idCounter: 0,
  extend: function() {
    var j, key, len, source, sources, target, val;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (j = 0, len = sources.length; j < len; j++) {
      source = sources[j];
      for (key in source) {
        val = source[key];
        target[key] = val;
      }
    }
    return target;
  },
  dict: Object.create.bind(null, null, Object.create(null)),
  getNearestElementByTagName: function(el, tagName) {
    while (!((el == null) || this.elementHasTag(el, tagName))) {
      el = el.parentNode;
    }
    return el;
  },
  elementShow: function(el) {
    return el != null ? el.classList.remove("hidden") : void 0;
  },
  elementHide: function(el) {
    return el != null ? el.classList.add("hidden") : void 0;
  },
  elementHasTag: function(el, tagName) {
    var ref;
    return Boolean(((ref = el.tagName) != null ? ref.toLowerCase() : void 0) === tagName.toLowerCase());
  },
  elementIsVisible: function(el) {
    var height, i, inViewport, l, onTop, r, rects;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) {
      return false;
    }
    height = document.documentElement.clientHeight;
    rects = el.getClientRects();
    onTop = function(r) {
      var x, y;
      x = (r.left + r.right) / 2;
      y = (r.top + r.bottom) / 2;
      return document.elementFromPoint(x, y) === el;
    };
    i = 0;
    l = rects.length;
    while (i < l) {
      r = rects[i];
      inViewport = (r.top > 0 ? r.top <= height : r.bottom > 0 && r.bottom <= height);
      if (inViewport && onTop(r)) {
        return true;
      }
      i++;
    }
    return false;
  },
  formatPlural: function(count, noun, showCount) {
    if (showCount == null) {
      showCount = true;
    }
    return "" + (showCount ? (count || 0) + " " : '') + (count === 1 ? noun : Inflector.pluralize(noun));
  },
  formatIndefiniteArticle: function(noun) {
    var ref;
    if ((ref = noun[0].toLowerCase()) === 'a' || ref === 'e' || ref === 'i' || ref === 'o' || ref === 'u') {
      return "an " + noun;
    }
    return "a " + noun;
  },
  getSelection: function() {
    return window.getSelection();
  },
  getSelectionRange: function() {
    var selection;
    selection = this.getSelection();
    if (selection.type !== "None") {
      return selection.getRangeAt(0);
    }
  },
  getCursorNode: function() {
    return this.getSelectionRange().commonAncestorContainer;
  },
  addRange: function(range) {
    var selection;
    selection = window.getSelection();
    selection.removeAllRanges();
    return selection.addRange(range);
  },
  selectText: function(element, start, end) {
    var range, selection;
    if (end == null) {
      end = start;
    }
    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(element);
      return range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(element);
      if (start != null) {
        range.setStart(element, start);
      }
      if (end != null) {
        range.setEnd(element, end);
      }
      selection.removeAllRanges();
      return selection.addRange(range);
    }
  },
  selectEnd: function(element, range) {
    range || (range = document.createRange());
    element || (element = this.getSelection().focusNode);
    if (!element) {
      return;
    }
    range.setStartAfter(element);
    range.collapse(false);
    return this.addRange(range);
  },
  replaceRange: function(node, replacement, start, end, appendTrailingSpace) {
    var range, trailingSpace;
    if (end == null) {
      end = start;
    }
    if (appendTrailingSpace == null) {
      appendTrailingSpace = true;
    }
    trailingSpace = document.createTextNode("\u00a0");
    range = new Range();
    if (start != null) {
      range.setStart(node, start);
      range.setEnd(node, end);
    } else {
      range.selectNode(node);
    }
    range.deleteContents();
    range.insertNode(replacement);
    this.selectEnd(replacement, range);
    if (appendTrailingSpace) {
      range.insertNode(trailingSpace);
      return this.selectEnd(trailingSpace, range);
    }
  },
  getCallerChain: function(args, depth) {
    var caller, chain;
    caller = args.callee.caller;
    chain = [caller];
    while (depth-- && (caller = caller != null ? caller.caller : void 0)) {
      chain.push(caller);
    }
    return chain;
  },
  createCounter: createCounter = function(i) {
    if (i == null) {
      i = 0;
    }
    return function() {
      return i++;
    };
  },
  getUniqueId: (function(inc) {
    return function() {
      return "kd-" + (inc());
    };
  })(createCounter()),
  getRandomNumber: function(range, min) {
    var res;
    if (range == null) {
      range = 1e6;
    }
    if (min == null) {
      min = 0;
    }
    res = Math.floor(Math.random() * range + 1);
    if (res > min) {
      return res;
    } else {
      return res + min;
    }
  },
  uniqueId: function(prefix) {
    var id;
    id = this.idCounter++;
    if (prefix != null) {
      return "" + prefix + id;
    } else {
      return id;
    }
  },
  getRandomRGB: function() {
    var fn;
    fn = this.getRandomNumber;
    return "rgb(" + (fn(255)) + "," + (fn(255)) + "," + (fn(255)) + ")";
  },
  getRandomHex: function() {
    var hex;
    hex = (Math.random() * 0x999999 << 0).toString(16);
    while (hex.length < 6) {
      hex += "0";
    }
    return "#" + hex;
  },
  curry: function(obligatory, optional) {
    return obligatory + (optional ? ' ' + optional : '');
  },
  parseQuery: (function() {
    var decode, params, parseQuery, plusses;
    params = /([^&=]+)=?([^&]*)/g;
    plusses = /\+/g;
    decode = function(str) {
      return decodeURIComponent(str.replace(plusses, " "));
    };
    return parseQuery = function(queryString) {
      var m, result;
      if (queryString == null) {
        queryString = location.search.substring(1);
      }
      result = {};
      while (m = params.exec(queryString)) {
        result[decode(m[1])] = decode(m[2]);
      }
      return result;
    };
  })(),
  stringifyQuery: (function() {
    var encode, spaces, stringifyQuery;
    spaces = /\s/g;
    encode = function(str) {
      return encodeURIComponent(str.replace(spaces, "+"));
    };
    return stringifyQuery = function(obj) {
      return Object.keys(obj).map(function(key) {
        return (encode(key)) + "=" + (encode(obj[key]));
      }).join('&').trim();
    };
  })(),
  capAndRemovePeriods: function(path) {
    var arg, newPath;
    newPath = (function() {
      var j, len, ref, results;
      ref = path.split(".");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        arg = ref[j];
        results.push(arg.capitalize());
      }
      return results;
    })();
    return newPath.join("");
  },
  slugify: function(title) {
    var url;
    if (title == null) {
      title = "";
    }
    return url = String(title).toLowerCase().replace(/^\s+|\s+$/g, "").replace(/[_|\s]+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/[-]+/g, "-").replace(/^-+|-+$/g, "");
  },
  stripTags: function(value) {
    return value.replace(/<(?:.|\n)*?>/gm, '');
  },
  decimalToAnother: function(n, radix) {
    var a, b, hex, i, j, k, ref, s, t;
    hex = [];
    for (i = j = 0; j <= 10; i = ++j) {
      hex[i + 1] = i;
    }
    s = '';
    a = n;
    while (a >= radix) {
      b = a % radix;
      a = Math.floor(a / radix);
      s += hex[b + 1];
    }
    s += hex[a + 1];
    n = s.length;
    t = '';
    for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      t = t + s.substring(n - i - 1, n - i);
    }
    s = t;
    return s;
  },
  enterFullscreen: (function() {
    var launchFullscreen;
    launchFullscreen = function(element) {
      if (element.requestFullscreen) {
        return element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        return element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        return element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        return element.msRequestFullscreen();
      }
    };
    return function(element) {
      if (element == null) {
        element = document.documentElement;
      }
      return launchFullscreen(element);
    };
  })(),
  exitFullscreen: function() {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    }
  },
  isFullscreen: function() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitIsFullScreen;
  },
  createExternalLink: function(href) {
    var tag;
    tag = document.createElement("a");
    tag.href = href.indexOf("http") > -1 ? href : "http://" + href;
    tag.target = "_blank";
    document.body.appendChild(tag);
    tag.click();
    return document.body.removeChild(tag);
  },
  wait: function(duration, fn) {
    if ("function" === typeof duration) {
      fn = duration;
      duration = 0;
    }
    return setTimeout(fn, duration);
  },
  killWait: function(id) {
    if (id) {
      clearTimeout(id);
    }
    return null;
  },
  repeat: function(duration, fn) {
    if ("function" === typeof duration) {
      fn = duration;
      duration = 500;
    }
    return setInterval(fn, duration);
  },
  killRepeat: function(id) {
    return clearInterval(id);
  },
  defer: (function(queue) {
    if ((typeof window !== "undefined" && window !== null ? window.postMessage : void 0) && window.addEventListener) {
      window.addEventListener("message", (function(ev) {
        if (ev.source === window && ev.data === "kd-tick") {
          ev.stopPropagation();
          if (queue.length > 0) {
            return queue.shift()();
          }
        }
      }), true);
      return function(fn) {
        queue.push(fn);
        return window.postMessage("kd-tick", "*");
      };
    } else {
      return function(fn) {
        return setTimeout(fn, 1);
      };
    }
  })([]),
  getCancellableCallback: function(callback) {
    var cancelled, kallback;
    cancelled = false;
    kallback = function() {
      var rest;
      rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!cancelled) {
        return callback.apply(null, rest);
      }
    };
    kallback.cancel = function() {
      return cancelled = true;
    };
    return kallback;
  },
  getTimedOutCallback: function(callback, failcallback, timeout) {
    var cancelled, fallback, fallbackTimer, kallback;
    if (timeout == null) {
      timeout = 5000;
    }
    cancelled = false;
    kallback = function() {
      var rest;
      rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      clearTimeout(fallbackTimer);
      if (!cancelled) {
        return callback.apply(null, rest);
      }
    };
    fallback = function() {
      var rest;
      rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!cancelled) {
        failcallback.apply(null, rest);
      }
      return cancelled = true;
    };
    fallbackTimer = setTimeout(fallback, timeout);
    return kallback;
  },
  getTimedOutCallbackOne: function(options) {
    var fallback, fallbackTimer, kallback, onResult, onSuccess, onTimeout, timedOut, timeout, timerName;
    if (options == null) {
      options = {};
    }
    timerName = options.name || "undefined";
    timeout = options.timeout || 10000;
    onSuccess = options.onSuccess || function() {};
    onTimeout = options.onTimeout || function() {};
    onResult = options.onResult || function() {};
    timedOut = false;
    kallback = (function(_this) {
      return function() {
        var rest;
        rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        clearTimeout(fallbackTimer);
        _this.updateLogTimer(timerName, fallbackTimer, Date.now());
        if (timedOut) {
          return onResult.apply(null, rest);
        } else {
          return onSuccess.apply(null, rest);
        }
      };
    })(this);
    fallback = (function(_this) {
      return function() {
        var rest;
        rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        timedOut = true;
        _this.updateLogTimer(timerName, fallbackTimer);
        return onTimeout.apply(null, rest);
      };
    })(this);
    fallbackTimer = setTimeout(fallback, timeout);
    this.logTimer(timerName, fallbackTimer, Date.now());
    kallback.cancel = function() {
      return clearTimeout(fallbackTimer);
    };
    return kallback;
  },
  logTimer: function(timerName, timerNumber, startTime) {
    var base;
    log("logTimer name:" + timerName);
    (base = this.timers)[timerName] || (base[timerName] = {});
    return this.timers[timerName][timerNumber] = {
      start: startTime,
      status: "started"
    };
  },
  updateLogTimer: function(timerName, timerNumber, endTime) {
    var elapsed, startTime, status, timer;
    timer = this.timers[timerName][timerNumber];
    status = endTime ? "ended" : "failed";
    startTime = timer.start;
    elapsed = endTime - startTime;
    timer = {
      start: startTime,
      end: endTime,
      status: status,
      elapsed: elapsed
    };
    this.timers[timerName][timerNumber] = timer;
    return log("updateLogTimer name:" + timerName + ", status:" + status + " elapsed:" + elapsed);
  },
  timers: {},
  stopDOMEvent: function(event) {
    if (!event) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  },
  utf8Encode: function(string) {
    var c, n, utftext;
    string = string.replace(/\r\n/g, "\n");
    utftext = "";
    n = 0;
    while (n < string.length) {
      c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      n++;
    }
    return utftext;
  },
  utf8Decode: function(utftext) {
    var c, c1, c2, c3, i, string;
    string = "";
    i = 0;
    c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  },
  runXpercent: function(percent) {
    var chance;
    chance = Math.floor(Math.random() * 100);
    return chance <= percent;
  },
  shortenUrl: function(url, callback) {
    var request;
    request = $.ajax("https://www.googleapis.com/urlshortener/v1/url", {
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        longUrl: url
      }),
      timeout: 4000,
      dataType: "json"
    });
    request.done((function(_this) {
      return function(data) {
        return callback((data != null ? data.id : void 0) || url, data);
      };
    })(this));
    return request.error(function(arg1) {
      var responseText, status, statusText;
      status = arg1.status, statusText = arg1.statusText, responseText = arg1.responseText;
      error("URL shorten error, returning self as fallback.", status, statusText, responseText);
      return callback(url);
    });
  },
  formatBytesToHumanReadable: function(bytes, fixedAmout) {
    var minus, thresh, unitIndex, units;
    if (fixedAmout == null) {
      fixedAmout = 2;
    }
    minus = '';
    if (bytes < 0) {
      minus = '-';
      bytes *= -1;
    }
    thresh = 1024;
    units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    unitIndex = -1;
    if (bytes < thresh) {
      return bytes + " B";
    }
    while (true) {
      bytes /= thresh;
      ++unitIndex;
      if (!(bytes >= thresh)) {
        break;
      }
    }
    return "" + minus + (bytes.toFixed(fixedAmout)) + " " + units[unitIndex];
  },
  splitTrim: function(str, delim, filterEmpty) {
    var arr, ref;
    if (delim == null) {
      delim = ',';
    }
    if (filterEmpty == null) {
      filterEmpty = true;
    }
    arr = (ref = str != null ? str.split(delim).map(function(part) {
      return part.trim();
    }) : void 0) != null ? ref : [];
    if (filterEmpty) {
      arr = arr.filter(Boolean);
    }
    return arr;
  },
  arrayToObject: function(list, key) {
    var dict, j, len, obj;
    dict = {};
    for (j = 0, len = list.length; j < len; j++) {
      obj = list[j];
      if (obj[key] != null) {
        dict[obj[key]] = obj;
      }
    }
    return dict;
  },
  partition: function(list, fn) {
    var item, j, len, result;
    result = [[], []];
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      result[+(!fn(item))].push(item);
    }
    return result;
  },

  /*
  //     Underscore.js 1.3.1
  //     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
  //     Underscore is freely distributable under the MIT license.
  //     Portions of Underscore are inspired or borrowed from Prototype,
  //     Oliver Steele's Functional, and John Resig's Micro-Templating.
  //     For all details and documentation:
  //     http://documentcloud.github.com/underscore
   */
  throttle: function(wait, func, options) {
    var args, context, later, previous, ref, result, timeout;
    if ((typeof func) === 'number') {
      ref = [func, wait], wait = ref[0], func = ref[1];
    }
    context = null;
    args = null;
    result = null;
    timeout = null;
    previous = 0;
    if (options == null) {
      options = {};
    }
    later = function() {
      previous = (options.leading === false ? 0 : Date.now);
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) {
        return context = args = null;
      }
    };
    return function() {
      var now, remaining;
      now = Date.now;
      if (!previous && options.leading === false) {
        previous = now;
      }
      remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },
  debounce: function(wait, func, immediate) {
    var args, context, later, ref, result, timeout, timestamp;
    if ((typeof func) === 'number') {
      ref = [func, wait], wait = ref[0], func = ref[1];
    }
    timeout = null;
    args = null;
    context = null;
    timestamp = null;
    result = null;
    later = function() {
      var last;
      last = Date.now - timestamp;
      if (last < wait && last >= 0) {
        return timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) {
            return context = args = null;
          }
        }
      }
    };
    return function() {
      var callNow;
      context = this;
      args = arguments;
      timestamp = Date.now;
      callNow = immediate && !timeout;
      if (timeout == null) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  },
  relativeOffset: function(child, parent) {
    var node, x, y;
    x = 0;
    y = 0;
    node = child;
    while (node) {
      x += node.offsetLeft;
      y += node.offsetTop;
      if (node === parent) {
        break;
      }
      node = node.parentNode;
      if (node == null) {
        throw new Error("Not a descendant!");
      }
    }
    return [x, y];
  },
  isTouchDevice: function() {
    var e;
    try {
      document.createEvent('TouchEvent');
      return true;
    } catch (_error) {
      e = _error;
      return false;
    }
  }
};

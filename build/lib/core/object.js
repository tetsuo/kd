var KD, KDEventEmitter, KDObject,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

KD = require('./kd');

KDEventEmitter = require('./eventemitter');

module.exports = KDObject = (function(superClass) {
  var NOTREADY, READY, ref;

  extend(KDObject, superClass);

  ref = [0, 1], NOTREADY = ref[0], READY = ref[1];

  KDObject.prototype.utils = KD.utils;

  function KDObject(options, data) {
    if (options == null) {
      options = {};
    }
    this.id || (this.id = options.id || KD.utils.getUniqueId());
    this.setOptions(options);
    if (data) {
      this.setData(data);
    }
    if (options.delegate) {
      this.setDelegate(options.delegate);
    }
    this.registerKDObjectInstance();
    KDObject.__super__.constructor.apply(this, arguments);
    if (options.testPath) {
      KD.registerInstanceForTesting(this);
    }
    this.on('error', KD.error);
    this.once('ready', (function(_this) {
      return function() {
        return _this.readyState = READY;
      };
    })(this));
  }

  KDObject.prototype.define = function(property, options) {
    if ('function' === typeof options) {
      options = {
        get: options
      };
    }
    return Object.defineProperty(this, property, options);
  };

  KDObject.prototype.bound = function(method) {
    var boundMethod;
    if ('function' !== typeof this[method]) {
      throw new Error("bound: unknown method! " + method);
    }
    boundMethod = "__bound__" + method;
    boundMethod in this || Object.defineProperty(this, boundMethod, {
      value: this[method].bind(this)
    });
    return this[boundMethod];
  };

  KDObject.prototype.lazyBound = function() {
    var method, ref1, rest;
    method = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return (ref1 = this[method]).bind.apply(ref1, [this].concat(slice.call(rest)));
  };

  KDObject.prototype.forwardEvent = function(target, eventName, prefix) {
    if (prefix == null) {
      prefix = "";
    }
    return target.on(eventName, this.lazyBound('emit', prefix + eventName));
  };

  KDObject.prototype.forwardEvents = function(target, eventNames, prefix) {
    var eventName, i, len, results;
    if (prefix == null) {
      prefix = "";
    }
    results = [];
    for (i = 0, len = eventNames.length; i < len; i++) {
      eventName = eventNames[i];
      results.push(this.forwardEvent(target, eventName, prefix));
    }
    return results;
  };

  KDObject.prototype.ready = function(listener) {
    if (typeof Promise !== "undefined" && Promise !== null ? Promise.prototype.nodeify : void 0) {
      return new Promise((function(_this) {
        return function(resolve) {
          if (_this.readyState === READY) {
            resolve();
          }
          return _this.once('ready', resolve);
        };
      })(this)).nodeify(listener);
    } else if (this.readyState === READY) {
      return this.utils.defer(listener);
    } else {
      return this.once('ready', listener);
    }
  };

  KDObject.prototype.registerSingleton = KD.registerSingleton;

  KDObject.prototype.getSingleton = KD.getSingleton;

  KDObject.prototype.getInstance = function(instanceId) {
    var ref1;
    return (ref1 = KD.getAllKDInstances()[instanceId]) != null ? ref1 : null;
  };

  KDObject.prototype.registerKDObjectInstance = function() {
    return KD.registerInstance(this);
  };

  KDObject.prototype.setData = function(data1) {
    this.data = data1;
  };

  KDObject.prototype.getData = function() {
    return this.data;
  };

  KDObject.prototype.setOptions = function(options1) {
    this.options = options1 != null ? options1 : {};
  };

  KDObject.prototype.setOption = function(option, value) {
    return this.options[option] = value;
  };

  KDObject.prototype.unsetOption = function(option) {
    if (this.options[option]) {
      return delete this.options[option];
    }
  };

  KDObject.prototype.getOptions = function() {
    return this.options;
  };

  KDObject.prototype.getOption = function(key) {
    var ref1;
    return (ref1 = this.options[key]) != null ? ref1 : null;
  };

  KDObject.prototype.changeId = function(id) {
    KD.deleteInstance(id);
    this.id = id;
    return KD.registerInstance(this);
  };

  KDObject.prototype.getId = function() {
    return this.id;
  };

  KDObject.prototype.setDelegate = function(delegate) {
    this.delegate = delegate;
  };

  KDObject.prototype.getDelegate = function() {
    return this.delegate;
  };

  KDObject.prototype.destroy = function() {
    this.isDestroyed = true;
    this.emit('KDObjectWillBeDestroyed');
    return KD.deleteInstance(this.id);
  };

  KDObject.prototype.chainNames = function(options) {
    options.chain;
    options.newLink;
    return options.chain + "." + options.newLink;
  };

  return KDObject;

})(KDEventEmitter);

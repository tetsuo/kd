var debugStates, dom, getSingleton, instances, instancesToBeTested, lastFuncCall, singletons, subscriptions, utils;

utils = require('./utils');

dom = require('kd-dom');

debugStates = {};

instances = {};

singletons = {};

subscriptions = [];

lastFuncCall = null;

instancesToBeTested = {};

getSingleton = function(name) {
  if (singletons[name] != null) {
    return singletons[name];
  } else {
    console.warn("[getSingleton] " + name + " doesn't exist");
    return null;
  }
};

module.exports = {
  extend: function(obj) {
    var key, results, val;
    results = [];
    for (key in obj) {
      val = obj[key];
      if (this[key]) {
        throw new Error(key + " is already registered");
      } else {
        results.push(this[key] = val);
      }
    }
    return results;
  },
  registerSingleton: function(name, obj, override) {
    var existing;
    if (override == null) {
      override = false;
    }
    if ((existing = singletons[name]) != null) {
      if (override) {
        console.warn("[registerSingleton] overriding " + name);
        if (typeof existing.destroy === "function") {
          existing.destroy();
        }
        return singletons[name] = obj;
      } else {
        console.error("[registerSingleton] " + name + " exists. if you want to override set override param to true.");
        return singletons[name];
      }
    } else {
      return singletons[name] = obj;
    }
  },
  registerInstance: function(inst) {
    if (instances[inst.id]) {
      console.warn('[registerInstance] instance is being overwritten');
    }
    return instances[inst.id] = inst;
  },
  unregisterInstance: function(id) {
    return delete instances[id];
  },
  deleteInstance: function(id) {
    return delete instances[id];
  },
  getSingleton: getSingleton,
  singleton: getSingleton,
  getAllKDInstances: function() {
    return instances;
  },
  getInstanceForTesting: function(key) {
    return instancesToBeTested[key];
  },
  registerInstanceForTesting: function(inst) {
    var key;
    key = inst.getOption('testPath');
    instancesToBeTested[key] = inst;
    return inst.on('KDObjectWillBeDestroyed', (function(_this) {
      return function() {
        return delete instancesToBeTested[key];
      };
    })(this));
  },
  noop: function() {},
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  time: console.time.bind(console),
  timeEnd: console.timeEnd.bind(console),
  debugStates: debugStates,
  instances: instances,
  singletons: singletons,
  subscriptions: subscriptions,
  lastFuncCall: lastFuncCall,
  instancesToBeTested: instancesToBeTested,
  utils: utils,
  dom: dom
};

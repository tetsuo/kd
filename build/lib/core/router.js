var Encoder, KD, KDNotificationView, KDObject, KDRouter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

KD = require('./kd');

KDObject = require('./object');

KDNotificationView = require('../components/notifications/notificationview');

Encoder = require('htmlencode');

module.exports = KDRouter = (function(superClass) {
  var createObjectRef, history, listenerKey, revive, routeWithoutEdgeAtIndex;

  extend(KDRouter, superClass);

  history = window.history;

  listenerKey = 'ಠ_ಠ';

  KDRouter.registerStaticEmitter();

  createObjectRef = function(obj) {
    var ref;
    if (!(((obj != null ? obj.bongo_ : void 0) != null) && (obj.getId != null))) {
      return;
    }
    return {
      constructorName: (ref = obj.bongo_) != null ? ref.constructorName : void 0,
      id: obj.getId()
    };
  };

  revive = function(objRef, callback) {
    if (!(((objRef != null ? objRef.constructorName : void 0) != null) && (objRef.id != null))) {
      return callback(null);
    } else {
      return KD.remote.cacheable(objRef.constructorName, objRef.id, callback);
    }
  };

  function KDRouter(routes) {
    KDRouter.__super__.constructor.call(this);
    this.tree = {};
    this.routes = {};
    this.visitedRoutes = [];
    if (routes) {
      this.addRoutes(routes);
    }
    KD.utils.defer((function(_this) {
      return function() {
        return KDRouter.emit('RouterIsReady', _this);
      };
    })(this));
  }

  KDRouter.prototype.listen = function() {
    var hashFragment;
    if (location.hash.length) {
      hashFragment = location.hash.substr(1);
      this.userRoute = hashFragment;
      this.utils.defer((function(_this) {
        return function() {
          return _this.handleRoute(hashFragment, {
            shouldPushState: true,
            replaceState: true
          });
        };
      })(this));
    }
    return this.startListening();
  };

  KDRouter.prototype.popState = function(event) {
    return revive(event.state, (function(_this) {
      return function(err, state) {
        if (err) {
          return KD.showError(err);
        }
        return _this.handleRoute("" + location.pathname + location.search, {
          shouldPushState: false,
          state: state
        });
      };
    })(this));
  };

  KDRouter.prototype.clear = function(route, replaceState) {
    if (route == null) {
      route = '/';
    }
    if (replaceState == null) {
      replaceState = true;
    }
    delete this.userRoute;
    return this.handleRoute(route, {
      replaceState: replaceState
    });
  };

  KDRouter.prototype.back = function() {
    if (this.visitedRoutes.length <= 1) {
      return this.clear();
    } else {
      return history.back();
    }
  };

  KDRouter.prototype.startListening = function() {
    if (this.isListening) {
      return false;
    }
    this.isListening = true;
    window.addEventListener('popstate', this.bound("popState"));
    return true;
  };

  KDRouter.prototype.stopListening = function() {
    if (!this.isListening) {
      return false;
    }
    this.isListening = false;
    window.removeEventListener('popstate', this.bound("popState"));
    return true;
  };

  KDRouter.handleNotFound = function(route) {
    console.trace();
    return KD.log("The route " + (Encoder.XSSEncode(route)) + " was not found!");
  };

  KDRouter.prototype.getCurrentPath = function() {
    return this.currentPath;
  };

  KDRouter.prototype.handleNotFound = function(route) {
    var message;
    message = /<|>/.test(route) ? "Invalid route!" : "404 Not found! " + (Encoder.XSSEncode(route));
    delete this.userRoute;
    this.clear();
    KD.log("The route " + route + " was not found!");
    return new KDNotificationView({
      title: message
    });
  };

  routeWithoutEdgeAtIndex = function(route, i) {
    return "/" + (route.slice(0, i).concat(route.slice(i + 1)).join('/'));
  };

  KDRouter.prototype.addRoute = function(route, listener) {
    var edge, i, j, last, len, node;
    this.routes[route] = listener;
    node = this.tree;
    route = route.split('/');
    route.shift();
    for (i = j = 0, len = route.length; j < len; i = ++j) {
      edge = route[i];
      last = edge.length - 1;
      if ('?' === edge.charAt(last)) {
        this.addRoute(routeWithoutEdgeAtIndex(route, i), listener);
        edge = edge.substr(0, last);
      }
      if (/^:/.test(edge)) {
        node[':'] || (node[':'] = {
          name: edge.substr(1)
        });
        node = node[':'];
      } else {
        node[edge] || (node[edge] = {});
        node = node[edge];
      }
    }
    node[listenerKey] || (node[listenerKey] = []);
    if (indexOf.call(node[listenerKey], listener) < 0) {
      return node[listenerKey].push(listener);
    }
  };

  KDRouter.prototype.addRoutes = function(routes) {
    var listener, results, route;
    results = [];
    for (route in routes) {
      if (!hasProp.call(routes, route)) continue;
      listener = routes[route];
      results.push(this.addRoute(route, listener));
    }
    return results;
  };

  KDRouter.prototype.handleRoute = function(userRoute, options) {
    var edge, frags, j, k, len, len1, listener, listeners, method, node, notFound, objRef, param, params, path, qs, query, ref, ref1, replaceState, routeInfo, shouldPushState, state, suppressListeners;
    if (options == null) {
      options = {};
    }
    if ((userRoute.indexOf('!')) === 0) {
      userRoute = userRoute.slice(1);
    }
    if (this.visitedRoutes.last !== userRoute) {
      this.visitedRoutes.push(userRoute);
    }
    ref1 = ((ref = userRoute != null ? userRoute : typeof this.getDefaultRoute === "function" ? this.getDefaultRoute() : void 0) != null ? ref : '/').split('?'), frags = ref1[0], query = 2 <= ref1.length ? slice.call(ref1, 1) : [];
    query = this.utils.parseQuery(query.join('&'));
    shouldPushState = options.shouldPushState, replaceState = options.replaceState, state = options.state, suppressListeners = options.suppressListeners;
    if (shouldPushState == null) {
      shouldPushState = true;
    }
    objRef = createObjectRef(state);
    node = this.tree;
    params = {};
    frags = frags.split('/');
    frags.shift();
    frags = frags.filter(Boolean);
    path = "/" + (frags.join('/'));
    qs = this.utils.stringifyQuery(query);
    if (qs.length) {
      path += "?" + qs;
    }
    notFound = false;
    for (j = 0, len = frags.length; j < len; j++) {
      edge = frags[j];
      if (node[edge]) {
        node = node[edge];
      } else {
        param = node[':'];
        if (param != null) {
          params[param.name] = edge;
          node = param;
        } else {
          notFound = true;
        }
      }
    }
    if (!suppressListeners && shouldPushState && !replaceState && path === this.currentPath) {
      this.emit('AlreadyHere', path, {
        params: params,
        frags: frags
      });
      return;
    }
    if (notFound) {
      this.handleNotFound(frags.join('/'));
    }
    this.currentPath = path;
    if (shouldPushState) {
      method = replaceState ? 'replaceState' : 'pushState';
      history[method](objRef, path, path);
    }
    routeInfo = {
      params: params,
      query: query
    };
    this.emit('RouteInfoHandled', {
      params: params,
      query: query,
      path: path
    });
    if (!suppressListeners) {
      listeners = node[listenerKey];
      if (listeners != null ? listeners.length : void 0) {
        for (k = 0, len1 = listeners.length; k < len1; k++) {
          listener = listeners[k];
          listener.call(this, routeInfo, state, path);
        }
      }
    }
    return this;
  };

  KDRouter.prototype.handleQuery = function(query) {
    var nextRoute;
    if ('string' !== typeof query) {
      query = this.utils.stringifyQuery(query);
    }
    if (!query.length) {
      return;
    }
    nextRoute = this.currentPath + "?" + query;
    return this.handleRoute(nextRoute);
  };

  return KDRouter;

})(KDObject);

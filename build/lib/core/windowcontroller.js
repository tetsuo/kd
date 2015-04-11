var $, KD, KDController, KDWindowController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = require('jquery');

KD = require('./kd');

KDController = require('./controller');


/*
todo:

  - make addLayer implementation more clear, by default adding a layer
    should set a listener for next ReceivedClickElsewhere and remove the layer automatically
    2012/5/21 Sinan
  - do not self-invoke (:293) -og
 */

module.exports = KDWindowController = (function(superClass) {
  var addListener;

  extend(KDWindowController, superClass);

  addListener = function(eventName, listener, capturePhase) {
    if (capturePhase == null) {
      capturePhase = true;
    }
    return window.addEventListener(eventName, listener, capturePhase);
  };

  function KDWindowController(options, data) {
    this.windowResizeListeners = {};
    this.keyEventsToBeListened = ['keydown', 'keyup', 'keypress'];
    this.keyView = null;
    this.dragView = null;
    this.layers = [];
    this.unloadListeners = {};
    this.focusListeners = [];
    this.focused = true;
    this.bindEvents();
    KDWindowController.__super__.constructor.call(this, options, data);
  }

  KDWindowController.prototype.addLayer = function(layer) {
    if (indexOf.call(this.layers, layer) < 0) {
      this.layers.push(layer);
      return layer.on('KDObjectWillBeDestroyed', (function(_this) {
        return function() {
          return _this.removeLayer(layer);
        };
      })(this));
    }
  };

  KDWindowController.prototype.removeLayer = function(layer) {
    var index;
    if (indexOf.call(this.layers, layer) >= 0) {
      index = this.layers.indexOf(layer);
      return this.layers.splice(index, 1);
    }
  };

  KDWindowController.prototype.bindEvents = function() {
    var eventName, i, layers, len, ref;
    ref = this.keyEventsToBeListened;
    for (i = 0, len = ref.length; i < len; i++) {
      eventName = ref[i];
      window.addEventListener(eventName, this.bound('key'));
    }
    window.addEventListener('resize', this.bound('notifyWindowResizeListeners'));
    document.addEventListener('scroll', (function(_this) {
      return function() {
        var body, timer;
        timer = null;
        body = document.body;
        return KD.utils.throttle(function(event) {
          return _this.emit("ScrollHappened", event);
        }, 50);
      };
    })(this)(), false);
    addListener("dragenter", (function(_this) {
      return function(event) {
        if (!_this.dragInAction) {
          _this.emit('DragEnterOnWindow', event);
          return _this.setDragInAction(true);
        }
      };
    })(this));
    addListener("dragleave", (function(_this) {
      return function(event) {
        var ref1, ref2;
        if (!((0 < (ref1 = event.clientX) && ref1 < _this.winWidth) && (0 < (ref2 = event.clientY) && ref2 < _this.winHeight))) {
          _this.emit('DragExitOnWindow', event);
          return _this.setDragInAction(false);
        }
      };
    })(this));
    addListener("drop", (function(_this) {
      return function(event) {
        _this.emit('DragExitOnWindow', event);
        _this.emit('DropOnWindow', event);
        return _this.setDragInAction(false);
      };
    })(this));
    layers = this.layers;
    addListener('mousedown', (function(_this) {
      return function(e) {
        var lastLayer;
        lastLayer = layers.last;
        if (lastLayer && $(e.target).closest(lastLayer != null ? lastLayer.$() : void 0).length === 0) {
          lastLayer.emit('ReceivedClickElsewhere', e);
          return _this.removeLayer(lastLayer);
        }
      };
    })(this));
    addListener('mouseup', (function(_this) {
      return function(e) {
        if (_this.dragView) {
          _this.unsetDragView(e);
        }
        return _this.emit('ReceivedMouseUpElsewhere', e);
      };
    })(this));
    addListener('mousemove', (function(_this) {
      return function(e) {
        if (_this.dragView) {
          return _this.redirectMouseMoveEvent(e);
        }
      };
    })(this));
    addListener('click', function(e) {
      var href, isHttp, isMail, nearestLink, ref1;
      nearestLink = KD.utils.getNearestElementByTagName(e.target, 'a');
      if ((nearestLink != null ? (ref1 = nearestLink.target) != null ? ref1.length : void 0 : void 0) === 0) {
        href = nearestLink.getAttribute("href");
        isHttp = (href != null ? href.indexOf("http") : void 0) === 0;
        isMail = (href != null ? href.indexOf("mailto") : void 0) === 0;
        if (isHttp) {
          return nearestLink.target = "_blank";
        } else if (!isMail) {
          e.preventDefault();
          if (href && !/^#/.test(href)) {
            return KD.getSingleton("router").handleRoute(href);
          }
        }
      }
    }, false);
    addListener('beforeunload', this.bound('beforeUnload'));
    window.onfocus = this.bound('focusChange');
    return window.onblur = this.bound('focusChange');
  };

  KDWindowController.prototype.addUnloadListener = function(key, listener) {
    var base;
    (base = this.unloadListeners)[key] || (base[key] = []);
    return this.unloadListeners[key].push(listener);
  };

  KDWindowController.prototype.clearUnloadListeners = function(key) {
    if (key) {
      return this.unloadListeners[key] = [];
    } else {
      return this.unloadListeners = {};
    }
  };

  KDWindowController.prototype.isFocused = function() {
    return this.focused;
  };

  KDWindowController.prototype.addFocusListener = function(listener) {
    return this.focusListeners.push(listener);
  };

  KDWindowController.prototype.focusChange = function(event) {
    var i, len, listener, ref, results;
    if (!event) {
      return;
    }
    this.focused = document.hasFocus();
    ref = this.focusListeners;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      listener = ref[i];
      results.push(listener(this.focused, event));
    }
    return results;
  };

  KDWindowController.prototype.beforeUnload = function(event) {
    var i, key, len, listener, listeners, message, ref;
    if (!event) {
      return;
    }
    ref = this.unloadListeners;
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      listeners = ref[key];
      for (i = 0, len = listeners.length; i < len; i++) {
        listener = listeners[i];
        if (!(listener() === false)) {
          continue;
        }
        message = key !== 'window' ? " on " + key : '';
        return "Please make sure that you saved all your work" + message + ".";
      }
    }
  };

  KDWindowController.prototype.setDragInAction = function(dragInAction) {
    this.dragInAction = dragInAction != null ? dragInAction : false;
    return document.body.classList[this.dragInAction ? 'add' : 'remove']('dragInAction');
  };

  KDWindowController.prototype.setMainView = function(mainView) {
    this.mainView = mainView;
  };

  KDWindowController.prototype.getMainView = function(view) {
    return this.mainView;
  };

  KDWindowController.prototype.revertKeyView = function(view) {
    if (!view) {
      KD.warn('view, which shouldn\'t be the keyview anymore, must be passed as a parameter!');
      return;
    }
    if (view === this.keyView && this.keyView !== this.oldKeyView) {
      return this.setKeyView(this.oldKeyView);
    }
  };

  KDWindowController.prototype.setKeyView = function(keyView) {
    if (keyView != null) {
      if (typeof keyView.activateKeyView === "function") {
        keyView.activateKeyView();
      }
    }
    if (keyView === this.keyView) {
      return;
    }
    this.oldKeyView = this.keyView;
    this.keyView = keyView;
    if (keyView != null) {
      if (typeof keyView.activateKeyView === "function") {
        keyView.activateKeyView();
      }
    }
    return this.emit('WindowChangeKeyView', keyView);
  };

  KDWindowController.prototype.setDragView = function(dragView) {
    this.setDragInAction(true);
    return this.dragView = dragView;
  };

  KDWindowController.prototype.unsetDragView = function(e) {
    this.setDragInAction(false);
    this.dragView.emit("DragFinished", e);
    return this.dragView = null;
  };

  KDWindowController.prototype.redirectMouseMoveEvent = function(event) {
    var delta, initial, initialX, initialY, pageX, pageY, view;
    view = this.dragView;
    pageX = event.pageX, pageY = event.pageY;
    initial = view.dragState.position.initial;
    initialX = initial.x;
    initialY = initial.y;
    delta = {
      x: pageX - initialX,
      y: pageY - initialY
    };
    return view.drag(event, delta);
  };

  KDWindowController.prototype.getKeyView = function() {
    return this.keyView;
  };

  KDWindowController.prototype.key = function(event) {
    var ref;
    this.emit(event.type, event);
    return (ref = this.keyView) != null ? ref.handleEvent(event) : void 0;
  };

  KDWindowController.prototype.registerWindowResizeListener = function(instance) {
    this.windowResizeListeners[instance.id] = instance;
    return instance.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        return _this.windowResizeListeners[instance.id] = null;
      };
    })(this));
  };

  KDWindowController.prototype.unregisterWindowResizeListener = function(instance) {
    return this.windowResizeListeners[instance.id] = null;
  };

  KDWindowController.prototype.notifyWindowResizeListeners = function(event) {
    var inst, key, ref, results;
    event || (event = {
      type: "resize"
    });
    ref = this.windowResizeListeners;
    results = [];
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      inst = ref[key];
      if (inst != null ? inst._windowDidResize : void 0) {
        results.push(inst._windowDidResize(event));
      }
    }
    return results;
  };

  return KDWindowController;

})(KDController);

(function() {
  KD = require('./kd');
  return KD.registerSingleton("windowController", new KDWindowController);
})();

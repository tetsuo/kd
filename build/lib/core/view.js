var $, KD, KDObject, KDView, MutationSummary,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

$ = require('jquery');

KD = require('./kd');

KDObject = require('./object');

MutationSummary = require('mutation-summary');

module.exports = KDView = (function(superClass) {
  var defineProperty, deprecated, eventNames, eventToMethodMap, overrideAndMergeObjects;

  extend(KDView, superClass);

  defineProperty = Object.defineProperty;

  deprecated = function(methodName) {
    return KD.warn(methodName + " is deprecated from KDView if you need it override in your subclass");
  };

  eventNames = /^((dbl)?click|key(up|down|press)|mouse(up|down|over|enter|leave|move)|drag(start|end|enter|leave|over)|blur|change|focus|drop|contextmenu|scroll|paste|error|load|wheel)$/;

  eventToMethodMap = function() {
    return {
      dblclick: 'dblClick',
      keyup: 'keyUp',
      keydown: 'keyDown',
      keypress: 'keyPress',
      mouseup: 'mouseUp',
      mousedown: 'mouseDown',
      mouseenter: 'mouseEnter',
      mouseleave: 'mouseLeave',
      mousemove: 'mouseMove',
      wheel: 'mouseWheel',
      mousewheel: 'mouseWheel',
      mouseover: 'mouseOver',
      contextmenu: 'contextMenu',
      dragstart: 'dragStart',
      dragenter: 'dragEnter',
      dragleave: 'dragLeave',
      dragover: 'dragOver',
      paste: 'paste',
      transitionend: 'transitionEnd'
    };
  };

  overrideAndMergeObjects = function(objects) {
    var item, ref, title;
    ref = objects.overridden;
    for (title in ref) {
      if (!hasProp.call(ref, title)) continue;
      item = ref[title];
      if (objects.overrider[title]) {
        continue;
      }
      objects.overrider[title] = item;
    }
    return objects.overrider;
  };

  KDView.prototype.appendToDomBody = function() {
    this.parentIsInDom = true;
    if (!this.lazy) {
      $("body").append(this.$());
      return this.utils.defer((function(_this) {
        return function() {
          return _this.emit("viewAppended");
        };
      })(this));
    }
  };

  KDView.appendToDOMBody = function(view) {
    KD.warn("KDView.appendToDOMBody is deprecated; use #appendToDomBody instead");
    return view.appendToDomBody();
  };

  function KDView(options, data) {
    if (options == null) {
      options = {};
    }
    options.tagName || (options.tagName = "div");
    options.domId || (options.domId = null);
    options.cssClass || (options.cssClass = "");
    options.parent || (options.parent = null);
    options.partial || (options.partial = null);
    options.delegate || (options.delegate = null);
    options.bind || (options.bind = "");
    options.draggable || (options.draggable = null);
    options.size || (options.size = null);
    options.position || (options.position = null);
    options.attributes || (options.attributes = null);
    options.prefix || (options.prefix = "");
    options.suffix || (options.suffix = "");
    options.tooltip || (options.tooltip = null);
    if (options.lazyLoadThreshold == null) {
      options.lazyLoadThreshold = false;
    }
    options.droppable || (options.droppable = null);
    options.resizable || (options.resizable = null);
    KDView.__super__.constructor.call(this, options, data);
    if (data != null) {
      if (typeof data.on === "function") {
        data.on('update', this.bound('render'));
      }
    }
    this.defaultInit();
  }

  KDView.prototype.defaultInit = function() {
    var attributes, cssClass, draggable, lazyLoadThreshold, options, partial, pistachio, pistachioParams, position, size, tagName, tooltip;
    options = this.getOptions();
    this.domId = options.domId, this.parent = options.parent;
    this.subViews = [];
    cssClass = options.cssClass, attributes = options.attributes, size = options.size, position = options.position, partial = options.partial, draggable = options.draggable, pistachio = options.pistachio, pistachioParams = options.pistachioParams, lazyLoadThreshold = options.lazyLoadThreshold, tooltip = options.tooltip, draggable = options.draggable, tagName = options.tagName;
    this.setDomElement(cssClass);
    this.setDataId();
    if (this.domId) {
      this.setDomId(this.domId);
    }
    if (attributes) {
      this.setAttributes(attributes);
    }
    if (position) {
      this.setPosition(position);
    }
    if (partial) {
      this.updatePartial(partial);
    }
    if (draggable) {
      this.setClass('kddraggable');
    }
    this.addEventHandlers(options);
    if (lazyLoadThreshold) {
      this.setLazyLoader(lazyLoadThreshold);
    }
    if (tooltip) {
      this.setTooltip(tooltip);
    }
    if (draggable) {
      this.setDraggable(draggable);
    }
    this.bindEvents();
    this.on('childAppended', this.childAppended.bind(this));
    return this.on('viewAppended', (function(_this) {
      return function() {
        var child, fireViewAppended, i, key, len, results, results1, subViews;
        _this.setViewReady();
        _this.viewAppended();
        _this.childAppended(_this);
        _this.parentIsInDom = true;
        fireViewAppended = function(child) {
          if (!child.parentIsInDom) {
            child.parentIsInDom = true;
            if (!child.lazy) {
              return child.emit('viewAppended');
            }
          }
        };
        subViews = _this.getSubViews();
        if (Array.isArray(subViews)) {
          results = [];
          for (i = 0, len = subViews.length; i < len; i++) {
            child = subViews[i];
            results.push(fireViewAppended(child));
          }
          return results;
        } else if ((subViews != null) && 'object' === typeof subViews) {
          results1 = [];
          for (key in subViews) {
            if (!hasProp.call(subViews, key)) continue;
            child = subViews[key];
            results1.push(fireViewAppended(child));
          }
          return results1;
        }
      };
    })(this));
  };

  KDView.prototype.getDomId = function() {
    return this.domElement.attr("id");
  };

  KDView.prototype.setDomElement = function(cssClass) {
    var domId, el, i, klass, len, ref, ref1, tagName;
    if (cssClass == null) {
      cssClass = '';
    }
    ref = this.getOptions(), domId = ref.domId, tagName = ref.tagName;
    if (domId) {
      el = document.getElementById(domId);
    }
    this.lazy = el == null ? (el = document.createElement(tagName), domId ? el.id = domId : void 0, false) : true;
    ref1 = ("kdview " + cssClass).split(' ');
    for (i = 0, len = ref1.length; i < len; i++) {
      klass = ref1[i];
      if (klass.length) {
        el.classList.add(klass);
      }
    }
    this.domElement = $(el);
    if (this.lazy) {
      return this.utils.defer((function(_this) {
        return function() {
          return _this.emit('viewAppended');
        };
      })(this));
    }
  };

  KDView.prototype.setDomId = function(id) {
    return this.domElement.attr("id", id);
  };

  KDView.prototype.setData = function(data) {
    var ref, ref1;
    if ((ref = this.data) != null) {
      if (typeof ref.off === "function") {
        ref.off('update', this.bound('render'));
      }
    }
    KDView.__super__.setData.call(this, data);
    if ((ref1 = this.data) != null) {
      if (typeof ref1.on === "function") {
        ref1.on('update', this.bound('render'));
      }
    }
    if (this.parentIsInDom) {
      return this.render();
    }
  };

  KDView.prototype.setDataId = function() {
    return this.domElement.data("data-id", this.getId());
  };

  KDView.prototype.getAttribute = function(attr) {
    return this.getElement().getAttribute(attr);
  };

  KDView.prototype.setAttribute = function(attr, val) {
    return this.getElement().setAttribute(attr, val);
  };

  KDView.prototype.setAttributes = function(attributes) {
    var attr, results, val;
    results = [];
    for (attr in attributes) {
      if (!hasProp.call(attributes, attr)) continue;
      val = attributes[attr];
      results.push(this.setAttribute(attr, val));
    }
    return results;
  };

  KDView.prototype.isInDom = (function() {
    var findUltimateAncestor;
    findUltimateAncestor = function(el) {
      var ancestor;
      ancestor = el;
      while (ancestor.parentNode) {
        ancestor = ancestor.parentNode;
      }
      return ancestor;
    };
    return function() {
      return findUltimateAncestor(this.$()[0]).body != null;
    };
  })();

  KDView.prototype.getDomElement = function() {
    return this.domElement;
  };

  KDView.prototype.getElement = function() {
    return this.getDomElement()[0];
  };

  KDView.prototype.getTagName = function() {
    return this.options.tagName || 'div';
  };

  KDView.prototype.$ = function(selector) {
    if (selector) {
      return this.getDomElement().find(selector);
    } else {
      return this.getDomElement();
    }
  };

  KDView.prototype.append = function(child, selector) {
    this.$(selector).append(child.$());
    if (this.parentIsInDom) {
      child.emit('viewAppended');
    }
    return this;
  };

  KDView.prototype.appendTo = function(parent, selector) {
    this.$().appendTo(parent.$(selector));
    if (this.parentIsInDom) {
      this.emit('viewAppended');
    }
    return this;
  };

  KDView.prototype.appendToSelector = function(selector) {
    $(selector).append(this.$());
    return this.emit('viewAppended');
  };

  KDView.prototype.prepend = function(child, selector) {
    this.$(selector).prepend(child.$());
    if (this.parentIsInDom) {
      child.emit('viewAppended');
    }
    return this;
  };

  KDView.prototype.prependTo = function(parent, selector) {
    this.$().prependTo(parent.$(selector));
    if (this.parentIsInDom) {
      this.emit('viewAppended');
    }
    return this;
  };

  KDView.prototype.prependToSelector = function(selector) {
    $(selector).prepend(this.$());
    return this.emit('viewAppended');
  };

  KDView.prototype.setPartial = function(partial, selector) {
    this.$(selector).append(partial);
    return this;
  };

  KDView.prototype.updatePartial = function(partial, selector) {
    return this.$(selector).html(partial);
  };

  KDView.prototype.clear = function() {
    return this.getElement().innerHTML = '';
  };

  KDView.setElementClass = function(el, addOrRemove, cssClass) {
    var cl, i, len, ref, results;
    ref = cssClass.split(' ');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      cl = ref[i];
      if (cl !== '') {
        results.push(el.classList[addOrRemove](cl));
      }
    }
    return results;
  };

  KDView.prototype.setCss = function(property, value) {
    return this.$().css(property, value);
  };

  KDView.prototype.setStyle = function(properties) {
    var property, results, value;
    results = [];
    for (property in properties) {
      if (!hasProp.call(properties, property)) continue;
      value = properties[property];
      results.push(this.$().css(property, value));
    }
    return results;
  };

  KDView.prototype.setClass = function(cssClass) {
    if (!cssClass) {
      return;
    }
    KDView.setElementClass(this.getElement(), "add", cssClass);
    return this;
  };

  KDView.prototype.unsetClass = function(cssClass) {
    if (!cssClass) {
      return;
    }
    KDView.setElementClass(this.getElement(), "remove", cssClass);
    return this;
  };

  KDView.prototype.toggleClass = function(cssClass) {
    if (this.hasClass(cssClass)) {
      this.unsetClass(cssClass);
    } else {
      this.setClass(cssClass);
    }
    return this;
  };

  KDView.prototype.hasClass = function(cssClass) {
    if (!cssClass) {
      return false;
    }
    return this.getElement().classList.contains(cssClass);
  };

  KDView.prototype.getBounds = function() {
    return {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight(),
      n: this.constructor.name
    };
  };

  KDView.prototype.setRandomBG = function() {
    return this.getDomElement().css("background-color", KD.utils.getRandomRGB());
  };

  KDView.prototype.hide = function(duration) {
    return this.setClass('hidden');
  };

  KDView.prototype.show = function(duration) {
    return this.unsetClass('hidden');
  };

  KDView.prototype.setPosition = function() {
    var positionOptions;
    positionOptions = this.getOptions().position;
    positionOptions.position = "absolute";
    return this.$().css(positionOptions);
  };

  KDView.prototype.getWidth = function() {
    return this.$().outerWidth(false);
  };

  KDView.prototype.setWidth = function(w, unit) {
    if (unit == null) {
      unit = "px";
    }
    this.getElement().style.width = "" + w + unit;
    return this.emit("ViewResized", {
      newWidth: w,
      unit: unit
    });
  };

  KDView.prototype.getHeight = function() {
    return this.getDomElement().outerHeight(false);
  };

  KDView.prototype.setHeight = function(h, unit) {
    if (unit == null) {
      unit = "px";
    }
    this.getElement().style.height = "" + h + unit;
    return this.emit("ViewResized", {
      newHeight: h,
      unit: unit
    });
  };

  KDView.prototype.setX = function(x) {
    return this.$().css({
      left: x
    });
  };

  KDView.prototype.setY = function(y) {
    return this.$().css({
      top: y
    });
  };

  KDView.prototype.getX = function() {
    return this.getElement().getBoundingClientRect().left;
  };

  KDView.prototype.getY = function() {
    return this.getElement().getBoundingClientRect().top;
  };

  KDView.prototype.getRelativeX = function() {
    return this.$().position().left;
  };

  KDView.prototype.getRelativeY = function() {
    return this.$().position().top;
  };

  KDView.prototype.destroyChild = function(prop) {
    var base;
    if (this[prop] != null) {
      if (typeof (base = this[prop]).destroy === "function") {
        base.destroy();
      }
      delete this[prop];
      return true;
    } else {
      return false;
    }
  };

  KDView.prototype.attach = function(view) {
    this.getElement().appendChild(view.getElement());
    view.setParent(this);
    return this.subViews.push(view);
  };

  KDView.prototype.detach = function() {
    var ref;
    if ((ref = this.parent) != null) {
      ref.getElement().removeChild(this.getElement());
    }
    this.orphanize();
    return this.unsetParent();
  };

  KDView.prototype.orphanize = function() {
    var index, ref;
    if (((ref = this.parent) != null ? ref.subViews : void 0) && (index = this.parent.subViews.indexOf(this)) >= 0) {
      this.parent.subViews.splice(index, 1);
      return this.unsetParent();
    }
  };

  KDView.prototype.destroy = function() {
    if (this.getSubViews().length > 0) {
      this.destroySubViews();
    }
    this.orphanize();
    this.getDomElement().remove();
    if (this.$overlay != null) {
      this.removeOverlay();
    }
    return KDView.__super__.destroy.apply(this, arguments);
  };

  KDView.prototype.destroySubViews = function() {
    var i, len, ref, view;
    ref = this.getSubViews().slice();
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      if (typeof view.destroy === "function") {
        view.destroy();
      }
    }
  };

  KDView.prototype.addSubView = function(subView, selector, shouldPrepend) {
    if (subView == null) {
      throw new Error('no subview was specified');
    }
    this.subViews.push(subView);
    subView.setParent(this);
    subView.parentIsInDom = this.parentIsInDom;
    if (!subView.lazy) {
      if (shouldPrepend) {
        this.prepend(subView, selector);
      } else {
        this.append(subView, selector);
      }
    }
    subView.on("ViewResized", function() {
      return subView.parentDidResize();
    });
    if (this.template != null) {
      this.template.addSymbol(subView);
    }
    return subView;
  };

  KDView.prototype.removeSubView = function(subView) {
    return subView.destroy();
  };

  KDView.prototype.getSubViews = function() {

    /*
    FIX: NEEDS REFACTORING
    used in @destroy
    not always sub views stored in @subviews but in @items, @itemsOrdered etc
    see KDListView KDTreeView etc. and fix it.
     */
    var subViews;
    subViews = this.subViews;
    if (this.items != null) {
      subViews = subViews.concat([].slice.call(this.items));
    }
    return subViews;
  };

  KDView.prototype.setParent = function(parent) {
    if (this.parent != null) {
      return KD.error('View already has a parent', this, this.parent);
    } else {
      if (defineProperty) {
        return defineProperty(this, 'parent', {
          value: parent,
          configurable: true
        });
      } else {
        return this.parent = parent;
      }
    }
  };

  KDView.prototype.unsetParent = function() {
    return delete this.parent;
  };

  KDView.prototype.embedChild = function(placeholderId, child, isCustom) {
    this.addSubView(child, '#' + placeholderId, false);
    if (!isCustom) {
      return this.$('#' + placeholderId).replaceWith(child.$());
    }
  };

  KDView.prototype.render = function(fields) {
    if (this.template != null) {
      return this.template.update(fields);
    }
  };

  KDView.prototype.addEventHandlers = function(options) {
    var cb, eventName, results;
    results = [];
    for (eventName in options) {
      if (!hasProp.call(options, eventName)) continue;
      cb = options[eventName];
      if (eventNames.test(eventName) && "function" === typeof cb) {
        results.push(this.on(eventName, cb));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  KDView.prototype.parentDidResize = function(parent, event) {
    var i, len, ref, results, subView;
    if (this.getSubViews()) {
      ref = this.getSubViews();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        subView = ref[i];
        results.push(subView.parentDidResize(parent, event));
      }
      return results;
    }
  };

  KDView.prototype.setLazyLoader = function(threshold) {
    var bind, view;
    if (threshold == null) {
      threshold = .75;
    }
    bind = this.getOptions().bind;
    if (!/scroll/.test(bind)) {
      this.getOptions().bind = KD.utils.curry('scroll', bind);
    }
    view = this;
    return this.on('scroll', (function() {
      var lastPos;
      threshold = Math.max(50, threshold);
      lastPos = 0;
      return function(event) {
        var currentPos, direction, height, ref, scrollHeight, scrollTop;
        ref = this.getElement(), scrollHeight = ref.scrollHeight, scrollTop = ref.scrollTop;
        height = this.getHeight();
        if (scrollTop < 0) {
          return lastPos = height;
        }
        if (scrollHeight - scrollTop < height) {
          return;
        }
        currentPos = scrollTop + height;
        direction = currentPos > lastPos ? 'down' : 'up';
        if (direction === 'up' && scrollTop < threshold) {
          this.emit('TopLazyLoadThresholdReached');
        }
        if (direction === 'down' && currentPos > scrollHeight - threshold) {
          this.emit('LazyLoadThresholdReached');
        }
        return lastPos = currentPos;
      };
    })());
  };

  KDView.prototype.bindEvents = function($elm) {
    var defaultEvents, event, eventsToBeBound, instanceEvents;
    $elm || ($elm = this.getDomElement());
    defaultEvents = "mousedown mouseup click dblclick";
    instanceEvents = this.getOptions().bind;
    eventsToBeBound = (function() {
      var i, len;
      if (instanceEvents) {
        eventsToBeBound = defaultEvents.trim().split(" ");
        instanceEvents = instanceEvents.trim().split(" ");
        for (i = 0, len = instanceEvents.length; i < len; i++) {
          event = instanceEvents[i];
          if (indexOf.call(eventsToBeBound, event) < 0) {
            eventsToBeBound.push(event);
          }
        }
        return eventsToBeBound.join(" ");
      } else {
        return defaultEvents;
      }
    })();
    $elm.bind(eventsToBeBound, (function(_this) {
      return function(event) {
        var willPropagateToDOM;
        willPropagateToDOM = _this.handleEvent(event);
        if (!willPropagateToDOM) {
          event.stopPropagation();
        }
        return true;
      };
    })(this));
    return eventsToBeBound;
  };

  KDView.prototype.bindTransitionEnd = function() {
    var el, key, transitionEvent, transitions, val;
    el = document.createElement('fakeelement');
    transitions = {
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'webkitTransition': 'webkitTransitionEnd'
    };
    transitionEvent = 'transitionend';
    for (key in transitions) {
      if (!hasProp.call(transitions, key)) continue;
      val = transitions[key];
      if (!(key in el.style)) {
        continue;
      }
      transitionEvent = val;
      break;
    }
    this.bindEvent(transitionEvent);
    if (transitionEvent !== "transitionend") {
      return this.on(transitionEvent, this.emit.bind(this, "transitionend"));
    }
  };

  KDView.prototype.bindEvent = function($elm, eventName) {
    var ref;
    if (!eventName) {
      ref = [$elm, this.$()], eventName = ref[0], $elm = ref[1];
    }
    return $elm.bind(eventName, (function(_this) {
      return function(event) {
        var shouldPropagate;
        shouldPropagate = _this.handleEvent(event);
        if (!shouldPropagate) {
          event.stopPropagation();
        }
        return true;
      };
    })(this));
  };

  KDView.prototype.handleEvent = function(event) {
    var methodName, shouldPropagate;
    methodName = eventToMethodMap()[event.type] || event.type;
    shouldPropagate = this[methodName] != null ? this[methodName](event) : true;
    if (shouldPropagate !== false) {
      this.emit(event.type, event);
    }
    return shouldPropagate;
  };

  KDView.prototype.scroll = function(event) {
    return true;
  };

  KDView.prototype.load = function(event) {
    return true;
  };

  KDView.prototype.error = function(event) {
    return true;
  };

  KDView.prototype.keyUp = function(event) {
    return true;
  };

  KDView.prototype.keyDown = function(event) {
    return true;
  };

  KDView.prototype.keyPress = function(event) {
    return true;
  };

  KDView.prototype.dblClick = function(event) {
    return true;
  };

  KDView.prototype.click = function(event) {
    return true;
  };

  KDView.prototype.contextMenu = function(event) {
    return true;
  };

  KDView.prototype.mouseMove = function(event) {
    return true;
  };

  KDView.prototype.mouseEnter = function(event) {
    return true;
  };

  KDView.prototype.mouseLeave = function(event) {
    return true;
  };

  KDView.prototype.mouseUp = function(event) {
    return true;
  };

  KDView.prototype.mouseOver = function(event) {
    return true;
  };

  KDView.prototype.mouseWheel = function(event) {
    return true;
  };

  KDView.prototype.mouseDown = function(event) {
    this.unsetKeyView();
    return true;
  };

  KDView.prototype.paste = function(event) {
    return true;
  };

  KDView.prototype.dragEnter = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.dragOver = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.dragLeave = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.drop = function(event) {
    event.preventDefault();
    return event.stopPropagation();
  };

  KDView.prototype.submit = function(event) {
    return false;
  };

  KDView.prototype.setEmptyDragState = function(moveBacktoInitialPosition) {
    var el;
    if (moveBacktoInitialPosition == null) {
      moveBacktoInitialPosition = false;
    }
    if (moveBacktoInitialPosition && this.dragState) {
      el = this.$();
      el.css('left', 0);
      el.css('top', 0);
    }
    return this.dragState = {
      containment: null,
      handle: null,
      axis: null,
      direction: {
        current: {
          x: null,
          y: null
        },
        global: {
          x: null,
          y: null
        }
      },
      position: {
        relative: {
          x: 0,
          y: 0
        },
        initial: {
          x: 0,
          y: 0
        },
        global: {
          x: 0,
          y: 0
        }
      },
      meta: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    };
  };

  KDView.prototype.setDraggable = function(options) {
    var handle;
    if (options == null) {
      options = {};
    }
    if (options === true) {
      options = {};
    }
    this.setEmptyDragState();
    handle = options.handle instanceof KDView ? options.handle : this;
    this.on("DragFinished", (function(_this) {
      return function(e) {
        return _this.beingDragged = false;
      };
    })(this));
    return handle.on("mousedown", (function(_this) {
      return function(event) {
        var bounds, dragEl, dragMeta, dragPos, dragState, oPad, p, padding, v, view;
        if ("string" === typeof options.handle) {
          if ($(event.target).closest(options.handle).length === 0) {
            return;
          }
        }
        _this.dragIsAllowed = true;
        _this.setEmptyDragState();
        dragState = _this.dragState;
        if (options.containment) {
          dragState.containment = {};
          dragState.containment.m = {
            w: _this.getWidth(),
            h: _this.getHeight()
          };
          view = options.containment.view;
          bounds = 'string' === typeof view ? _this[view].getBounds() : view instanceof KDView ? view.getBounds() : _this.parent.getBounds();
          dragState.containment.viewBounds = bounds;
          padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          };
          oPad = options.containment.padding;
          if ('number' === typeof oPad) {
            for (p in padding) {
              if (!hasProp.call(padding, p)) continue;
              v = padding[p];
              v = oPad;
            }
          } else if ('object' === typeof oPad) {
            KD.utils.extend(padding, oPad);
          }
          dragState.containment.padding = padding;
        }
        dragState.handle = options.handle;
        dragState.axis = options.axis;
        dragMeta = dragState.meta;
        dragEl = _this.getElement();
        dragMeta.top = parseInt(dragEl.style.top, 10) || 0;
        dragMeta.right = parseInt(dragEl.style.right, 10) || 0;
        dragMeta.bottom = parseInt(dragEl.style.bottom, 10) || 0;
        dragMeta.left = parseInt(dragEl.style.left, 10) || 0;
        dragPos = _this.dragState.position;
        dragPos.initial.x = event.pageX;
        dragPos.initial.y = event.pageY;
        KD.getSingleton('windowController').setDragView(_this);
        _this.emit("DragStarted", event, _this.dragState);
        event.stopPropagation();
        event.preventDefault();
        return false;
      };
    })(this));
  };

  KDView.prototype.drag = function(event, delta) {
    var axis, containment, cp, directionX, directionY, dragCurDir, dragDir, dragGlobDir, dragGlobPos, dragInitPos, dragMeta, dragPos, dragRelPos, draggedDistance, el, m, newX, newY, p, ref, targetPosX, targetPosY, x, y;
    ref = this.dragState, directionX = ref.directionX, directionY = ref.directionY, axis = ref.axis, containment = ref.containment;
    x = delta.x, y = delta.y;
    dragPos = this.dragState.position;
    dragRelPos = dragPos.relative;
    dragInitPos = dragPos.initial;
    dragGlobPos = dragPos.global;
    dragDir = this.dragState.direction;
    dragGlobDir = dragDir.global;
    dragCurDir = dragDir.current;
    axis = this.getOptions().draggable.axis;
    draggedDistance = axis ? axis === "x" ? Math.abs(x) : Math.abs(y) : Math.max(Math.abs(x), Math.abs(y));
    this.dragIsAllowed = this.beingDragged = !(draggedDistance < 20 && !this.beingDragged);
    if (x > dragRelPos.x) {
      dragCurDir.x = 'right';
    } else if (x < dragRelPos.x) {
      dragCurDir.x = 'left';
    }
    if (y > dragRelPos.y) {
      dragCurDir.y = 'bottom';
    } else if (y < dragRelPos.y) {
      dragCurDir.y = 'top';
    }
    dragGlobPos.x = dragInitPos.x + x;
    dragGlobPos.y = dragInitPos.y + y;
    dragGlobDir.x = x > 0 ? 'right' : 'left';
    dragGlobDir.y = y > 0 ? 'bottom' : 'top';
    if (this.dragIsAllowed) {
      el = this.$();
      dragMeta = this.dragState.meta;
      targetPosX = dragMeta.right && !dragMeta.left ? 'right' : 'left';
      targetPosY = dragMeta.bottom && !dragMeta.top ? 'bottom' : 'top';
      newX = targetPosX === 'left' ? dragMeta.left + dragRelPos.x : dragMeta.right - dragRelPos.x;
      newY = targetPosY === 'top' ? dragMeta.top + dragRelPos.y : dragMeta.bottom - dragRelPos.y;
      if (containment) {
        m = containment.m;
        p = containment.viewBounds;
        cp = containment.padding;
        if (newX <= cp.left) {
          newX = cp.left;
        }
        if (newY <= cp.top) {
          newY = cp.top;
        }
        if (newX + m.w >= p.w - cp.right) {
          newX = p.w - m.w - cp.right;
        }
        if (newY + m.h >= p.h - cp.bottom) {
          newY = p.h - m.h - cp.bottom;
        }
      }
      if (axis !== 'y') {
        el.css(targetPosX, newX);
      }
      if (axis !== 'x') {
        el.css(targetPosY, newY);
      }
    }
    dragRelPos.x = x;
    dragRelPos.y = y;
    return this.emit("DragInAction", x, y);
  };

  KDView.prototype.viewAppended = function() {};

  KDView.prototype.childAppended = function(child) {
    var ref;
    return (ref = this.parent) != null ? ref.emit('childAppended', child) : void 0;
  };

  KDView.prototype.setViewReady = function() {
    return this.viewIsReady = true;
  };

  KDView.prototype.isViewReady = function() {
    return this.viewIsReady || false;
  };

  KDView.prototype.observeMutations = function() {
    var MutationObserver, observerSummary;
    if (!MutationSummary) {
      return;
    }
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    return observerSummary = new MutationSummary({
      callback: (function(_this) {
        return function() {
          var rest;
          rest = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.emit.apply(_this, ['MutationHappened'].concat(slice.call(rest)));
        };
      })(this),
      rootNode: this.getElement(),
      queries: [
        {
          all: true
        }
      ]
    });
  };

  KDView.prototype.putOverlay = function(options) {
    var KDOverlayView;
    if (options == null) {
      options = {};
    }
    options.delegate = this;
    KDOverlayView = require('../components/overlay/overlayview');
    return this.overlay = new KDOverlayView(options);
  };

  KDView.prototype.removeOverlay = function() {
    var ref;
    return (ref = this.overlay) != null ? ref.destroy() : void 0;
  };

  KDView.prototype.unsetTooltip = function() {
    var ref;
    if ((ref = this.tooltip) != null) {
      ref.destroy();
    }
    return this.tooltip = null;
  };

  KDView.prototype.setTooltip = function(o) {
    var KDTooltip, placementMap;
    if (o == null) {
      o = {};
    }
    placementMap = {
      above: "s",
      below: "n",
      left: "e",
      right: "w"
    };
    o.title || (o.title = "");
    o.cssClass || (o.cssClass = "");
    o.placement || (o.placement = "top");
    o.direction || (o.direction = "center");
    o.offset || (o.offset = {
      top: 0,
      left: 0
    });
    o.delayIn || (o.delayIn = 0);
    o.delayOut || (o.delayOut = 0);
    if (o.html == null) {
      o.html = true;
    }
    if (o.animate == null) {
      o.animate = false;
    }
    o.selector || (o.selector = null);
    o.gravity || (o.gravity = placementMap[o.placement]);
    o.fade || (o.fade = o.animate);
    o.fallback || (o.fallback = o.title);
    o.view || (o.view = null);
    if (o.sticky == null) {
      o.sticky = false;
    }
    if (o.permanent == null) {
      o.permanent = false;
    }
    o.delegate || (o.delegate = this);
    o.events || (o.events = ['mouseenter', 'mouseleave', 'mousemove']);
    this.unsetTooltip();
    KDTooltip = require('../components/tooltip/tooltip');
    return this.tooltip = new KDTooltip(o, {});
  };

  KDView.prototype.getTooltip = function() {
    return this.tooltip;
  };

  KDView.prototype._windowDidResize = function() {};

  KDView.prototype.listenWindowResize = function(state) {
    var windowController;
    if (state == null) {
      state = true;
    }
    windowController = KD.getSingleton('windowController');
    if (state) {
      return windowController.registerWindowResizeListener(this);
    } else {
      return windowController.unregisterWindowResizeListener(this);
    }
  };

  KDView.prototype.setKeyView = function() {
    var windowController;
    windowController = KD.getSingleton('windowController');
    return windowController.setKeyView(this);
  };

  KDView.prototype.unsetKeyView = function() {
    var windowController;
    windowController = KD.getSingleton('windowController');
    return windowController.setKeyView(null);
  };

  KDView.prototype.activateKeyView = function() {
    return typeof this.emit === "function" ? this.emit('KDViewBecameKeyView') : void 0;
  };

  return KDView;

})(KDObject);

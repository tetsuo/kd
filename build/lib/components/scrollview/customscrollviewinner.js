var $, Hammer, KD, KDCustomHTMLView, KDCustomScrollViewWrapper, KDScrollThumb, KDScrollTrack, KDScrollView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

KDScrollView = require('./scrollview');

KDScrollThumb = require('./scrollthumb');

KDScrollTrack = require('./scrolltrack');

Hammer = require('hammerjs');

module.exports = KDCustomScrollViewWrapper = (function(superClass) {
  var DOWNARROW, END, HOME, PAGEDOWN, PAGEUP, SPACEBAR, UPARROW;

  extend(KDCustomScrollViewWrapper, superClass);

  SPACEBAR = 32;

  PAGEUP = 33;

  PAGEDOWN = 34;

  END = 35;

  HOME = 36;

  UPARROW = 38;

  DOWNARROW = 40;

  function KDCustomScrollViewWrapper(options, data) {
    var base, calculateEvent, hammer, prevDeltaX, prevDeltaY;
    if (options == null) {
      options = {};
    }
    options.bind = KD.utils.curry('keydown', options.bind);
    if (options.attributes == null) {
      options.attributes = {};
    }
    if ((base = options.attributes).tabindex == null) {
      base.tabindex = "0";
    }
    this.globalKeydownEventBound = false;
    KDCustomScrollViewWrapper.__super__.constructor.call(this, options, data);
    this.on('MutationHappened', this.bound("toggleGlobalKeydownEventOnSizeCheck"));
    if (!KD.utils.isTouchDevice()) {
      return;
    }
    hammer = new Hammer(this.getElement());
    hammer.get('pan').set({
      direction: Hammer.DIRECTION_ALL
    });
    prevDeltaX = prevDeltaY = 0;
    calculateEvent = function(event) {
      var currentDeltaX, currentDeltaY, currentVeloX, currentVeloY, deltaX, deltaY, direction, velocityX, velocityY;
      event.stopPropagation = function() {};
      event.preventDefault = function() {};
      velocityX = event.velocityX, velocityY = event.velocityY, deltaX = event.deltaX, deltaY = event.deltaY, direction = event.direction;
      currentDeltaX = deltaX;
      currentDeltaY = deltaY;
      currentVeloX = Math.min(.5, velocityX * (direction === 16 ? -1 : 1));
      currentVeloY = Math.min(.5, velocityY * (direction === 16 ? -1 : 1));
      event.deltaX = (currentDeltaX - prevDeltaX) * currentVeloX;
      event.deltaY = (currentDeltaY - prevDeltaY) * currentVeloY;
      prevDeltaX = currentDeltaX;
      prevDeltaY = currentDeltaY;
      return event;
    };
    hammer.on('panend pancancel', function(event) {
      return prevDeltaX = prevDeltaY = 0;
    });
    hammer.on('panup pandown', (function(_this) {
      return function(event) {
        return _this.mouseWheel(calculateEvent(event));
      };
    })(this));
  }

  KDCustomScrollViewWrapper.prototype.scroll = function(event) {
    if (this.verticalThumb.beingDragged || this.horizontalThumb.beingDragged) {
      return KD.utils.stopDOMEvent(event);
    }
  };

  KDCustomScrollViewWrapper.prototype.mouseWheel = function(event) {
    var deltaFactor, deltaX, deltaY, resX, resY, speed, stop, x, y;
    KDCustomScrollViewWrapper.__super__.mouseWheel.apply(this, arguments);
    deltaX = event.deltaX, deltaY = event.deltaY, deltaFactor = event.deltaFactor;
    speed = deltaFactor || this.getOptions().mouseWheelSpeed || 1;
    x = -deltaX;
    y = -deltaY;
    resX = x !== 0 && this.getScrollWidth() > this.horizontalThumb.getTrackSize() ? this._scrollHorizontally({
      speed: speed,
      velocity: x
    }) : false;
    resY = y !== 0 && this.getScrollHeight() > this.verticalThumb.getTrackSize() ? this._scrollVertically({
      speed: speed,
      velocity: y
    }) : false;
    stop = Math.abs(x) > Math.abs(y) ? resX : resY;
    if (!stop) {
      KD.utils.stopDOMEvent(event);
    }
    return !stop;
  };

  KDCustomScrollViewWrapper.prototype._scrollVertically = (function() {
    var lastPosition;
    lastPosition = 0;
    return function(arg) {
      var actPosition, newPosition, shouldStop, speed, stepInPixels, velocity;
      speed = arg.speed, velocity = arg.velocity;
      stepInPixels = velocity * speed;
      actPosition = this.getScrollTop();
      newPosition = actPosition + stepInPixels;
      shouldStop = velocity > 0 ? lastPosition > newPosition : lastPosition < newPosition;
      this.setScrollTop(lastPosition = newPosition);
      return shouldStop;
    };
  })();

  KDCustomScrollViewWrapper.prototype._scrollHorizontally = (function() {
    var lastPosition;
    lastPosition = 0;
    return function(arg) {
      var actPosition, newPosition, shouldStop, speed, stepInPixels, velocity;
      speed = arg.speed, velocity = arg.velocity;
      stepInPixels = velocity * speed;
      actPosition = this.getScrollLeft();
      newPosition = actPosition - stepInPixels;
      shouldStop = velocity > 0 ? lastPosition < newPosition : lastPosition > newPosition;
      this.setScrollLeft(lastPosition = newPosition);
      return shouldStop;
    };
  })();

  KDCustomScrollViewWrapper.prototype.toggleGlobalKeydownEventOnSizeCheck = function() {
    var needToBind, winHeight;
    winHeight = $(window).height();
    needToBind = this.getHeight() >= winHeight;
    return this.toggleGlobalKeydownEvent(needToBind);
  };

  KDCustomScrollViewWrapper.prototype.toggleGlobalKeydownEvent = function(needToBind) {
    var eventName;
    eventName = "keydown.customscroll" + (this.getId());
    if (needToBind) {
      if (!this.globalKeydownEventBound) {
        $(document).on(eventName, this.bound("keyDown"));
      }
    } else {
      if (this.globalKeydownEventBound) {
        $(document).off(eventName);
      }
    }
    return this.globalKeydownEventBound = needToBind;
  };

  KDCustomScrollViewWrapper.prototype.destroy = function() {
    this.toggleGlobalKeydownEvent(false);
    return KDCustomScrollViewWrapper.__super__.destroy.apply(this, arguments);
  };

  KDCustomScrollViewWrapper.prototype.pageUp = function() {
    return this.scrollTo({
      top: Math.max(this.getScrollTop() - this.getHeight(), 0)
    });
  };

  KDCustomScrollViewWrapper.prototype.pageDown = function() {
    return this.scrollTo({
      top: this.getScrollTop() + this.getHeight()
    });
  };

  KDCustomScrollViewWrapper.prototype.keyDown = function(event) {
    var editables, shouldPropagate;
    editables = "input,textarea,select,datalist,keygen,[contenteditable='true']";
    if (($(document.activeElement)).is(editables)) {
      return true;
    }
    if (!(this.getDomElement().is(":visible"))) {
      return true;
    }
    if (this.getScrollHeight() <= this.verticalThumb.getTrackSize()) {
      return true;
    }
    shouldPropagate = false;
    if (event.which === SPACEBAR && event.shiftKey) {
      this.pageUp();
    } else if (event.metaKey || event.ctrlKey) {
      if (event.which === UPARROW) {
        this.scrollTo({
          top: 0
        });
      }
      if (event.which === DOWNARROW) {
        this.scrollToBottom();
      }
    } else {
      switch (event.which) {
        case PAGEUP:
          this.pageUp();
          break;
        case SPACEBAR:
        case PAGEDOWN:
          this.pageDown();
          break;
        case END:
          this.scrollToBottom();
          break;
        case HOME:
          this.scrollTo({
            top: 0
          });
          break;
        default:
          shouldPropagate = true;
      }
    }
    return shouldPropagate;
  };

  return KDCustomScrollViewWrapper;

})(KDScrollView);

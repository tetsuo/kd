var KD, KDCustomHTMLView, KDCustomScrollView, KDCustomScrollViewWrapper, KDScrollTrack,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

KDScrollTrack = require('./scrolltrack');

KDCustomScrollViewWrapper = require('./customscrollviewinner');

module.exports = KDCustomScrollView = (function(superClass) {
  var intent;

  extend(KDCustomScrollView, superClass);

  function KDCustomScrollView(options, data) {
    var Wrapper, lazyLoadThreshold, mouseWheelSpeed, ref, wrapperClass;
    if (options == null) {
      options = {};
    }
    options.bind = KD.utils.curry('mouseenter mouseleave', options.bind);
    options.cssClass = KD.utils.curry('kdcustomscrollview', options.cssClass);
    if (options.mouseWheelSpeed == null) {
      options.mouseWheelSpeed = 3;
    }
    KDCustomScrollView.__super__.constructor.call(this, options, data);
    ref = this.getOptions(), mouseWheelSpeed = ref.mouseWheelSpeed, lazyLoadThreshold = ref.lazyLoadThreshold, wrapperClass = ref.wrapperClass;
    if (options.offscreenIndicatorClassName != null) {
      this.listenWindowResize();
    }
    Wrapper = wrapperClass || KDCustomScrollViewWrapper;
    this.wrapper = new Wrapper({
      tagName: 'main',
      lazyLoadThreshold: lazyLoadThreshold,
      mouseWheelSpeed: mouseWheelSpeed,
      scroll: options.offscreenIndicatorClassName != null ? this.bound('updateOffscreenIndicators') : void 0
    });
    this.verticalTrack = new KDScrollTrack({
      delegate: this.wrapper
    });
    this.horizontalTrack = new KDScrollTrack({
      delegate: this.wrapper,
      type: 'horizontal'
    });
    this.wrapper.verticalThumb = this.verticalTrack.thumb;
    this.wrapper.horizontalThumb = this.horizontalTrack.thumb;
    this.wrapper.on('ScrollTrackShown', (function(_this) {
      return function(type) {
        return _this.setClass("has-" + type);
      };
    })(this));
    this.wrapper.on('ScrollTrackHidden', (function(_this) {
      return function(type) {
        return _this.unsetClass("has-" + type);
      };
    })(this));
    this.wrapper.on('MutationHappened', (function(_this) {
      return function() {
        _this.verticalTrack.thumb.reset();
        return _this.horizontalTrack.thumb.reset();
      };
    })(this));
    this.on('mouseenter', this.bound('showTracks'));
    this.on('mouseleave', this.bound('hideTracks'));
  }

  KDCustomScrollView.prototype._windowDidResize = function() {
    return this.updateOffscreenIndicators();
  };

  KDCustomScrollView.prototype.updateOffscreenIndicators = function() {
    var above, below, offscreenIndicatorClassName, ref, wrapperEl;
    wrapperEl = this.wrapper.getElement();
    offscreenIndicatorClassName = this.getOptions().offscreenIndicatorClassName;
    ref = [].slice.call(wrapperEl.getElementsByClassName(offscreenIndicatorClassName)).reduce(function(memo, child) {
      var _, ref, y;
      ref = KD.utils.relativeOffset(child, wrapperEl), _ = ref[0], y = ref[1];
      if (y < wrapperEl.scrollTop) {
        memo.above.push(child);
      } else if (y > wrapperEl.scrollTop + wrapperEl.offsetHeight) {
        memo.below.push(child);
      }
      return memo;
    }, {
      above: [],
      below: []
    }), above = ref.above, below = ref.below;
    if (above.length > 0) {
      this.emit('OffscreenItemsAbove', above);
    } else {
      this.emit('NoOffscreenItemsAbove');
    }
    if (below.length > 0) {
      return this.emit('OffscreenItemsBelow', below);
    } else {
      return this.emit('NoOffscreenItemsBelow');
    }
  };

  KDCustomScrollView.prototype.viewAppended = function() {
    this.addSubView(this.wrapper);
    this.addSubView(this.verticalTrack);
    this.addSubView(this.horizontalTrack);
    return this.wrapper.observeMutations();
  };

  intent = null;

  KDCustomScrollView.prototype.hideTracks = function() {
    return intent = KD.utils.wait(1000, (function(_this) {
      return function() {
        _this.verticalTrack.setClass('out');
        return _this.horizontalTrack.setClass('out');
      };
    })(this));
  };

  KDCustomScrollView.prototype.showTracks = function() {
    if (intent) {
      KD.utils.killWait(intent);
    }
    this.verticalTrack.unsetClass('out');
    return this.horizontalTrack.unsetClass('out');
  };

  return KDCustomScrollView;

})(KDCustomHTMLView);

var KD, KDScrollThumb, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDScrollThumb = (function(superClass) {
  extend(KDScrollThumb, superClass);

  function KDScrollThumb(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = 'vertical');
    options.cssClass = KD.utils.curry('kdscrollthumb', options.cssClass);
    if (options.draggable == null) {
      options.draggable = {
        axis: options.type === 'vertical' ? 'y' : 'x',
        containment: this
      };
    }
    KDScrollThumb.__super__.constructor.call(this, options, data);
    ref = this.getOptions(), this.type = ref.type, this.track = ref.track;
    this.view = this.track.getDelegate();
    this.on('viewAppended', this.bound('calculateSize'));
    this.on('DragInAction', this.bound('handleDrag'));
    this.view.on('scroll', this.bound('calculatePosition'));
    this.listenWindowResize();
  }

  KDScrollThumb.prototype.resetSizes = function() {
    this.size = null;
    this.trackSize = null;
    return this.scrollSize = null;
  };

  KDScrollThumb.prototype.reset = function() {
    this.resetSizes();
    this.calculateSize();
    return this.calculatePosition();
  };

  KDScrollThumb.prototype.handleDrag = function() {
    var availOffset, offset, ratio, size, thumbDiff, trackSize;
    size = this.getSize();
    offset = this.getOffset();
    thumbDiff = this.getSize(true) - this.size;
    trackSize = this.getTrackSize() - thumbDiff;
    availOffset = trackSize - size;
    ratio = Math.min(Math.max(0, offset / availOffset), 1);
    if (this.isVertical()) {
      return this.view.setScrollTop((this.view.getScrollHeight() - trackSize) * ratio);
    } else {
      return this.view.setScrollLeft((this.view.getScrollWidth() - trackSize) * ratio);
    }
  };

  KDScrollThumb.prototype.isVertical = function() {
    return this.type === 'vertical';
  };

  KDScrollThumb.prototype.getTrackSize = function() {
    if (this.trackSize) {
      return this.trackSize;
    } else if (this.isVertical()) {
      return this.track.getHeight();
    } else {
      return this.track.getWidth();
    }
  };

  KDScrollThumb.prototype.setSize = function(size) {
    if (this.isVertical()) {
      this.setHeight(size);
    } else {
      this.setWidth(size);
    }
    return this.size = size;
  };

  KDScrollThumb.prototype.getSize = function(force) {
    if (this.size && !force) {
      return this.size;
    } else if (this.isVertical()) {
      return this.getHeight();
    } else {
      return this.getWidth();
    }
  };

  KDScrollThumb.prototype.setOffset = function(offset) {
    return this.setStyle(this.isVertical() ? {
      top: offset
    } : {
      left: offset
    });
  };

  KDScrollThumb.prototype.getOffset = function() {
    if (this.isVertical()) {
      return this.getY() - this.track.getY();
    } else {
      return this.getX() - this.track.getX();
    }
  };

  KDScrollThumb.prototype.getScrollOffset = function() {
    if (this.isVertical()) {
      return this.view.getScrollTop();
    } else {
      return this.view.getScrollLeft();
    }
  };

  KDScrollThumb.prototype.getScrollSize = function() {
    if (this.scrollSize) {
      return this.scrollSize;
    } else if (this.isVertical()) {
      return this.view.getScrollHeight();
    } else {
      return this.view.getScrollWidth();
    }
  };

  KDScrollThumb.prototype.calculateSize = function() {
    this.trackSize = this.getTrackSize();
    this.scrollSize = this.getScrollSize();
    this.setTrackVisibility();
    return this.setSize(this.trackSize * this.trackSize / this.scrollSize);
  };

  KDScrollThumb.prototype.calculatePosition = function(event) {
    var ratio, thumbDiff, trackSize;
    ratio = this.getScrollOffset() / this.getScrollSize();
    thumbDiff = this.getSize(true) - this.size;
    trackSize = this.getTrackSize();
    this.setTrackVisibility();
    return this.setOffset((trackSize - thumbDiff) * ratio);
  };

  KDScrollThumb.prototype.setTrackVisibility = function() {
    if (this.getTrackSize() >= this.getScrollSize()) {
      return this.track.hide();
    } else {
      return this.track.show();
    }
  };

  KDScrollThumb.prototype._windowDidResize = function() {
    return this.reset();
  };

  return KDScrollThumb;

})(KDView);

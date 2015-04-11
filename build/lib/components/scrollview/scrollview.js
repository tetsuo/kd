var $, KD, KDScrollView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

require('jquery-mousewheel')($);

KDView = require('../../core/view');

module.exports = KDScrollView = (function(superClass) {
  extend(KDScrollView, superClass);

  function KDScrollView(options, data) {
    if (options == null) {
      options = {};
    }
    options.bind = KD.utils.curry('mousewheel scroll', options.bind);
    options.cssClass = KD.utils.curry('kdscrollview', options.cssClass);
    KDScrollView.__super__.constructor.call(this, options, data);
    this.stopScrolling = false;
  }

  KDScrollView.prototype.hasScrollBars = function() {
    return this.hasVerticalScrollBars() || this.hasHorizontalScrollBars();
  };

  KDScrollView.prototype.hasVerticalScrollBars = function() {
    return this.getScrollHeight() > this.getHeight();
  };

  KDScrollView.prototype.hasHorizontalScrollBars = function() {
    return this.getScrollWidth() > this.getWidth();
  };

  KDScrollView.prototype.getScrollHeight = function() {
    return this.getElement().scrollHeight;
  };

  KDScrollView.prototype.getScrollWidth = function() {
    return this.getElement().scrollWidth;
  };

  KDScrollView.prototype.getScrollTop = function() {
    return this.getElement().scrollTop;
  };

  KDScrollView.prototype.getScrollLeft = function() {
    return this.getElement().scrollLeft;
  };

  KDScrollView.prototype.setScrollHeight = function(val) {
    return this.getElement().scrollHeight = val;
  };

  KDScrollView.prototype.setScrollWidth = function(val) {
    return this.getElement().scrollWidth = val;
  };

  KDScrollView.prototype.setScrollTop = function(val) {
    return this.getElement().scrollTop = val;
  };

  KDScrollView.prototype.setScrollLeft = function(val) {
    return this.getElement().scrollLeft = val;
  };

  KDScrollView.prototype.scrollTo = function(options, callback) {
    var duration, left, top;
    top = options.top, left = options.left, duration = options.duration;
    top || (top = 0);
    left || (left = 0);
    if (duration != null) {
      return this.$().animate({
        scrollTop: top,
        scrollLeft: left
      }, duration, callback);
    } else {
      this.setScrollTop(top);
      this.setScrollLeft(left);
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  KDScrollView.prototype.scrollToBottom = function() {
    return this.scrollTo({
      top: this.getScrollHeight() - this.getHeight()
    });
  };

  KDScrollView.prototype.scrollToSubView = function(subView) {
    var subViewHeight, subViewRelTop, subViewTop, viewHeight, viewScrollTop, viewTop;
    viewTop = this.getY();
    viewHeight = this.getHeight();
    viewScrollTop = this.getScrollTop();
    subViewTop = subView.getY();
    subViewHeight = subView.getHeight();
    subViewRelTop = subViewTop - viewTop + viewScrollTop;
    if (subViewTop - viewTop + subViewHeight < viewHeight && subViewTop - viewTop >= 0) {

    } else if (subViewTop - viewTop < 0) {
      return this.scrollTo({
        top: subViewRelTop
      });
    } else if (subViewTop - viewTop + subViewHeight > viewHeight) {
      return this.scrollTo({
        top: subViewRelTop - viewHeight + subViewHeight
      });
    }
  };

  KDScrollView.prototype.isAtBottom = function() {
    return this.getScrollTop() + this.getHeight() >= this.getScrollHeight();
  };

  KDScrollView.prototype.mouseWheel = function() {
    if (this.stopScrolling) {
      return false;
    }
    return true;
  };

  return KDScrollView;

})(KDView);

var KD, KDScrollThumb, KDScrollTrack, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KD = require('../../core/kd');

KDView = require('../../core/view');

KDScrollThumb = require('./scrollthumb');

module.exports = KDScrollTrack = (function(superClass) {
  extend(KDScrollTrack, superClass);

  function KDScrollTrack(options, data) {
    if (options == null) {
      options = {};
    }
    options.type || (options.type = 'vertical');
    options.cssClass = KD.utils.curry("kdscrolltrack " + options.type + " out", options.cssClass);
    KDScrollTrack.__super__.constructor.call(this, options, data);
    this.type = this.getOptions().type;
    this.scrollView = this.getDelegate();
    this.addSubView(this.thumb = new KDScrollThumb({
      cssClass: 'kdscrollthumb',
      type: this.type,
      track: this
    }));
  }

  KDScrollTrack.prototype.click = function(event) {
    var offset, scrollHeight, scrollWidth, thumbSize;
    if (indexOf.call(event.target.classList, 'kdscrolltrack') < 0) {
      return;
    }
    thumbSize = this.thumb.getSize(true);
    if (this.type === 'vertical') {
      scrollHeight = this.scrollView.getScrollHeight();
      offset = event.originalEvent.layerY || event.offsetY;
      return this.scrollView.scrollTo({
        top: (offset - thumbSize / 2) / this.getHeight() * scrollHeight
      });
    } else {
      scrollWidth = this.scrollView.getScrollWidth();
      offset = event.originalEvent.layerX || event.offsetX;
      return this.scrollView.scrollTo({
        left: (offset - thumbSize / 2) / this.getWidth() * scrollWidth
      });
    }
  };

  KDScrollTrack.prototype.show = function() {
    this.getDelegate().emit('ScrollTrackShown', this.type);
    return this.unsetClass('invisible');
  };

  KDScrollTrack.prototype.hide = function() {
    this.getDelegate().emit('ScrollTrackHidden', this.type);
    return this.setClass('invisible');
  };

  return KDScrollTrack;

})(KDView);

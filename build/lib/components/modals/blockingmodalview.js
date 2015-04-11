var $, KD, KDBlockingModalView, KDModalView, KDOverlayView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDModalView = require('./modalview');

KDOverlayView = require('../overlay/overlayview');

module.exports = KDBlockingModalView = (function(superClass) {
  extend(KDBlockingModalView, superClass);

  function KDBlockingModalView(options, data) {
    if (options == null) {
      options = {};
    }
    KDBlockingModalView.__super__.constructor.call(this, options, data);
    $(window).off("keydown.modal");
  }

  KDBlockingModalView.prototype.putOverlay = function() {
    this.overlay = new KDOverlayView({
      isRemovable: false
    });
    return this.overlay.on("click", (function(_this) {
      return function() {
        return _this.doBlockingAnimation();
      };
    })(this));
  };

  KDBlockingModalView.prototype.doBlockingAnimation = function() {
    this.setClass("blocking-animation");
    return KD.utils.wait(200, (function(_this) {
      return function() {
        return _this.unsetClass("blocking-animation");
      };
    })(this));
  };

  KDBlockingModalView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<div class='kdmodal " + cssClass + "'>\n  <div class='kdmodal-shadow'>\n    <div class='kdmodal-inner'>\n      <div class='kdmodal-title'></div>\n      <div class='kdmodal-content'></div>\n    </div>\n  </div>\n</div>");
  };

  KDBlockingModalView.prototype.click = function(e) {};

  return KDBlockingModalView;

})(KDModalView);

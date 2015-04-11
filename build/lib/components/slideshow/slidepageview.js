var KD, KDSlidePageView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDSlidePageView = (function(superClass) {
  extend(KDSlidePageView, superClass);

  function KDSlidePageView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kd-page', options.cssClass);
    KDSlidePageView.__super__.constructor.call(this, options, data);
    this._currentCssClass = null;
  }

  KDSlidePageView.prototype.move = function(cssClass) {
    if (!cssClass) {
      return;
    }
    this.unsetClass(this._currentCssClass);
    this._currentCssClass = cssClass;
    return this.setClass(cssClass);
  };

  return KDSlidePageView;

})(KDView);

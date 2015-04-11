var KDSplitComboView, KDSplitView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

KDSplitView = require('./splitview');

module.exports = KDSplitComboView = (function(superClass) {
  extend(KDSplitComboView, superClass);

  function KDSplitComboView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass || (options.cssClass = "kdsplitcomboview");
    KDSplitComboView.__super__.constructor.call(this, options, data);
    this.init(options);
  }

  KDSplitComboView.prototype.init = function(options) {
    return this.addSubView(this.createSplitView(options.direction, options.sizes, options.views));
  };

  KDSplitComboView.prototype.createSplitView = function(type, sizes, viewsConfig) {
    var config, i, index, len, options, views;
    views = [];
    for (index = i = 0, len = viewsConfig.length; i < len; index = ++i) {
      config = viewsConfig[index];
      if (config.type === "split") {
        options = config.options;
        views.push(this.createSplitView(options.direction, options.sizes, config.views));
      } else {
        views.push(config);
      }
    }
    return new KDSplitView({
      type: type,
      sizes: sizes,
      views: views
    });
  };

  return KDSplitComboView;

})(KDView);

var KDLoaderView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

require('canvas-loader');

KDView = require('../../core/view');

module.exports = KDLoaderView = (function(superClass) {
  extend(KDLoaderView, superClass);

  function KDLoaderView(options, data) {
    var o;
    o = options || {};
    o.loaderOptions || (o.loaderOptions = {});
    o.size || (o.size = {});
    options = {
      tagName: o.tagName || "span",
      bind: o.bind || "mouseenter mouseleave",
      showLoader: o.showLoader || false,
      size: {
        width: o.size.width || 24,
        height: o.size.height || 24
      },
      loaderOptions: {
        color: o.loaderOptions.color || "#000000",
        shape: o.loaderOptions.shape || "rect",
        diameter: o.loaderOptions.diameter || 20,
        density: o.loaderOptions.density || 12,
        range: o.loaderOptions.range || 1,
        speed: o.loaderOptions.speed || 1,
        FPS: o.loaderOptions.FPS || 24
      }
    };
    options.loaderOptions.diameter = options.size.height = options.size.width;
    options.cssClass = o.cssClass ? o.cssClass + " kdloader" : "kdloader";
    KDLoaderView.__super__.constructor.call(this, options, data);
  }

  KDLoaderView.prototype.viewAppended = function() {
    var height, loaderOptions, option, ref, showLoader, value;
    this.canvas = new CanvasLoader(this.getElement(), {
      id: "cl_" + this.id
    });
    ref = this.getOptions(), loaderOptions = ref.loaderOptions, showLoader = ref.showLoader;
    for (option in loaderOptions) {
      if (!hasProp.call(loaderOptions, option)) continue;
      value = loaderOptions[option];
      this.canvas["set" + (option.capitalize())](value);
    }
    height = this.getOption('size').height;
    this.setCss('line-height', height ? height + 'px' : 'initial');
    if (showLoader) {
      return this.show();
    }
  };

  KDLoaderView.prototype.show = function() {
    KDLoaderView.__super__.show.apply(this, arguments);
    this.active = true;
    if (this.canvas) {
      return this.canvas.show();
    }
  };

  KDLoaderView.prototype.hide = function() {
    KDLoaderView.__super__.hide.apply(this, arguments);
    this.active = false;
    if (this.canvas) {
      return this.canvas.hide();
    }
  };

  return KDLoaderView;

})(KDView);

var KD, KDTabPaneView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDTabPaneView = (function(superClass) {
  extend(KDTabPaneView, superClass);

  function KDTabPaneView(options, data) {
    var defaultCssClass;
    if (options == null) {
      options = {};
    }
    if (options.hiddenHandle == null) {
      options.hiddenHandle = false;
    }
    options.name || (options.name = "");
    if (options.detachable == null) {
      options.detachable = true;
    }
    defaultCssClass = "kdtabpaneview kdhiddentab " + (KD.utils.slugify(options.name.toLowerCase())) + " clearfix";
    options.cssClass = KD.utils.curry(defaultCssClass, options.cssClass);
    KDTabPaneView.__super__.constructor.call(this, options, data);
    this.name = options.name;
    this.lastScrollTops = {
      parent: 0,
      self: 0
    };
    this.on('KDTabPaneActive', this.bound('setMainView'));
    this.on('KDTabPaneLazyViewAdded', this.bound('fireLazyCallback'));
  }

  KDTabPaneView.prototype.show = function() {
    var ref;
    if (this.getOption('detachable')) {
      if ((ref = this.parent) != null) {
        ref.getElement().appendChild(this.getElement());
      }
    }
    this.unsetClass('kdhiddentab');
    this.setClass('active');
    this.active = true;
    this.emit('KDTabPaneActive');
    return this.applyScrollTops();
  };

  KDTabPaneView.prototype.hide = function() {
    var ref;
    if (!this.active) {
      return;
    }
    this.setScrollTops();
    this.emit('KDTabPaneInactive');
    this.unsetClass('active');
    this.setClass('kdhiddentab');
    if (this.getOption('detachable')) {
      if ((ref = this.parent) != null) {
        ref.getElement().removeChild(this.getElement());
      }
    }
    return this.active = false;
  };

  KDTabPaneView.prototype.setScrollTops = function() {
    var ref;
    this.lastScrollTops.parent = ((ref = this.parent) != null ? ref.getElement().scrollTop : void 0) || 0;
    return this.lastScrollTops.self = this.getElement().scrollTop;
  };

  KDTabPaneView.prototype.applyScrollTops = function() {
    return KD.utils.defer((function(_this) {
      return function() {
        var ref;
        _this.getElement().scrollTop = _this.lastScrollTops.self;
        return (ref = _this.parent) != null ? ref.getElement().scrollTop = _this.lastScrollTops.parent : void 0;
      };
    })(this));
  };

  KDTabPaneView.prototype.setTitle = function(title) {
    this.getDelegate().setPaneTitle(this, title);
    return this.name = title;
  };

  KDTabPaneView.prototype.getHandle = function() {
    return this.getDelegate().getHandleByPane(this);
  };

  KDTabPaneView.prototype.hideTabCloseIcon = function() {
    return this.getDelegate().hideCloseIcon(this);
  };

  KDTabPaneView.prototype.setMainView = function(view) {
    var data, options, ref, viewClass, viewOptions;
    if (!view) {
      ref = this.getOptions(), view = ref.view, viewOptions = ref.viewOptions;
    }
    if (this.mainView) {
      return;
    }
    if (!(view || viewOptions)) {
      return;
    }
    if (view instanceof KDView) {
      this.mainView = this.addSubView(view);
    } else if (viewOptions) {
      viewClass = viewOptions.viewClass, options = viewOptions.options, data = viewOptions.data;
      this.mainView = this.addSubView(new viewClass(options, data));
    } else {
      return KD.warn("probably you set a weird lazy view!");
    }
    this.emit("KDTabPaneLazyViewAdded", this, this.mainView);
    return this.mainView;
  };

  KDTabPaneView.prototype.getMainView = function() {
    return this.mainView;
  };

  KDTabPaneView.prototype.destroyMainView = function() {
    this.mainView.destroy();
    return this.mainView = null;
  };

  KDTabPaneView.prototype.fireLazyCallback = function(pane, view) {
    var callback, viewOptions;
    viewOptions = this.getOptions().viewOptions;
    if (!viewOptions) {
      return;
    }
    callback = viewOptions.callback;
    if (!callback) {
      return;
    }
    return callback.call(this, pane, view);
  };

  return KDTabPaneView;

})(KDView);

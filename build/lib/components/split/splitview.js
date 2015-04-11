var KD, KDSplitResizer, KDSplitView, KDSplitViewPanel, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

KDSplitViewPanel = require('./splitpanel');

KDSplitResizer = require('./splitresizer');

module.exports = KDSplitView = (function(superClass) {
  var deprecated;

  extend(KDSplitView, superClass);

  function KDSplitView(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "vertical");
    if (options.resizable == null) {
      options.resizable = true;
    }
    options.sizes || (options.sizes = [.5, .5]);
    options.minimums || (options.minimums = [0, 0]);
    options.maximums || (options.maximums = ['100%', '100%']);
    options.views || (options.views = []);
    options.fixed || (options.fixed = []);
    options.duration || (options.duration = 200);
    options.separator || (options.separator = null);
    if (options.colored == null) {
      options.colored = false;
    }
    options.resizeHandleSize || (options.resizeHandleSize = 2);
    options.type = options.type.toLowerCase();
    options.cssClass = KD.utils.curry("kdsplitview kdsplitview-" + options.type, options.cssClass);
    KDSplitView.__super__.constructor.call(this, options, data);
    ref = this.getOptions(), this.type = ref.type, this.resizable = ref.resizable;
    this.panels = [];
    this.resizer = null;
    this.sizes = [];
    this.minimums = [];
    this.maximums = [];
    this.size = 0;
  }

  KDSplitView.prototype.viewAppended = function() {
    var ref;
    this._calculateSizes();
    this._createPanels();
    this._putPanels();
    this._resizePanels();
    this._putViews();
    if (this.resizable && this.panels[1]) {
      this._createResizer();
    }
    this.listenWindowResize();
    return (ref = this.parent) != null ? ref.on("PanelDidResize", KD.utils.debounce(10, this.bound('_windowDidResize'))) : void 0;
  };

  KDSplitView.prototype._createPanels = function() {
    this._createPanel(0);
    if (this.sizes[1] != null) {
      return this._createPanel(1);
    }
  };

  KDSplitView.prototype._createPanel = function(index) {
    var fixed, panel, panelClass, ref;
    ref = this.getOptions(), fixed = ref.fixed, panelClass = ref.panelClass;
    panel = new (panelClass || KDSplitViewPanel)({
      cssClass: "kdsplitview-panel panel-" + index,
      index: index,
      type: this.type,
      size: this.sizes[index],
      fixed: !!fixed[index]
    });
    panel.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        return _this._panelIsBeingDestroyed(panel);
      };
    })(this));
    this.emit("SplitPanelCreated", panel);
    this.panels[index] = panel;
    return panel;
  };

  KDSplitView.prototype._putPanels = function() {
    this.addSubView(this.panels[0]);
    this.addSubView(this.panels[1]);
    if (this.getOptions().colored) {
      this.panels[0].setCss({
        backgroundColor: KD.utils.getRandomRGB()
      });
      return this.panels[1].setCss({
        backgroundColor: KD.utils.getRandomRGB()
      });
    }
  };

  KDSplitView.prototype._resizePanels = function() {
    return this.resizePanel(this.sizes[0]);
  };

  KDSplitView.prototype._panelIsBeingDestroyed = function(panel) {
    var index, views;
    views = this.getOptions().views;
    index = panel.index;
    this.panels[index] = null;
    this.sizes[index] = null;
    this.minimums[index] = null;
    this.maximums[index] = null;
    return views[index] = null;
  };

  KDSplitView.prototype._createResizer = function() {
    var ref, resizeHandleSize, type;
    ref = this.getOptions(), type = ref.type, resizeHandleSize = ref.resizeHandleSize;
    this.resizer = this.addSubView(new KDSplitResizer({
      cssClass: "kdsplitview-resizer " + type,
      type: this.type,
      panel0: this.panels[0],
      panel1: this.panels[1],
      handleSize: resizeHandleSize
    }));
    return this._repositionResizer();
  };

  KDSplitView.prototype._repositionResizer = function() {
    return this.resizer._setOffset(this.sizes[0]);
  };

  KDSplitView.prototype._putViews = function() {
    var views;
    views = this.getOptions().views;
    if (!views) {
      return;
    }
    if (views[0]) {
      this.setView(views[0], 0);
    }
    if (views[1]) {
      return this.setView(views[1], 1);
    }
  };

  KDSplitView.prototype._calculateSizes = function() {
    var givenSizes, legitSizes, sizes, splitSize, totalSize;
    this._setMinsAndMaxs();
    sizes = this.getOptions().sizes;
    givenSizes = sizes;
    splitSize = this._getSize();
    legitSizes = [];
    legitSizes[0] = this._getLegitPanelSize(this._sanitizeSize(givenSizes[0]), 0);
    legitSizes[1] = this._getLegitPanelSize(this._sanitizeSize(givenSizes[1]), 1);
    totalSize = legitSizes[0] + legitSizes[1];
    if (totalSize > splitSize) {
      legitSizes[1] = splitSize - legitSizes[0];
    } else if (totalSize < splitSize) {
      if (givenSizes[0] && (!givenSizes[1] || givenSizes[1] === 'auto')) {
        legitSizes[1] = splitSize - legitSizes[0];
      } else if (givenSizes[1] && (!givenSizes[0] || givenSizes[0] === 'auto')) {
        legitSizes[0] = splitSize - legitSizes[1];
      }
    }
    this.size = splitSize;
    return this.sizes = legitSizes;
  };

  KDSplitView.prototype._sanitizeSize = function(size) {
    if ("number" === typeof size) {
      if ((1 > size && size > 0)) {
        return this._getSize() * size;
      } else {
        return size;
      }
    } else if (/px$/.test(size)) {
      return parseInt(size, 10);
    } else if (/%$/.test(size)) {
      return this._getSize() / 100 * parseInt(size, 10);
    } else {
      return null;
    }
  };

  KDSplitView.prototype._setMinsAndMaxs = function() {
    var maximums, minimums, ref;
    ref = this.getOptions(), minimums = ref.minimums, maximums = ref.maximums;
    this.minimums[0] = this._sanitizeSize(minimums[0]);
    this.minimums[1] = this._sanitizeSize(minimums[1]);
    this.maximums[0] = this._sanitizeSize(maximums[0]);
    return this.maximums[1] = this._sanitizeSize(maximums[1]);
  };

  KDSplitView.prototype._getSize = function() {
    if (this.size) {
      return this.size;
    } else if (this.isVertical()) {
      return this.getWidth();
    } else {
      return this.getHeight();
    }
  };

  KDSplitView.prototype._setSize = function(size) {
    if (this.isVertical()) {
      return this.setWidth(size);
    } else {
      return this.setHeight(size);
    }
  };

  KDSplitView.prototype._getParentSize = function() {
    if (this.isVertical()) {
      if (this.parent && this.parent.isInDom()) {
        return this.parent.getWidth();
      } else {
        return window.innerWidth;
      }
    } else {
      if (this.parent && this.parent.isInDom()) {
        return this.parent.getHeight();
      } else {
        return window.innerHeight;
      }
    }
  };

  KDSplitView.prototype._getLegitPanelSize = function(size, index) {
    var max, min;
    min = this.minimums[index] || 0;
    max = this.maximums[index] || this._getSize();
    return Math.min(Math.max(min, size), max);
  };

  KDSplitView.prototype._windowDidResize = function() {
    this.size = null;
    this._setSize(this._getParentSize());
    this._calculateSizes();
    this._resizePanels();
    if (this.resizable) {
      return this._repositionResizer();
    }
  };

  KDSplitView.prototype.mouseUp = function(event) {
    return this.$().unbind("mousemove.resizeHandle");
  };

  KDSplitView.prototype._panelReachedMinimum = function(index) {
    var panel;
    panel = this.panels[index];
    panel.emit("PanelReachedMinimum");
    return this.emit("PanelReachedMinimum", {
      panel: panel
    });
  };

  KDSplitView.prototype._panelReachedMaximum = function(index) {
    var panel;
    panel = this.panels[index];
    panel.emit("PanelReachedMaximum");
    return this.emit("PanelReachedMaximum", {
      panel: panel
    });
  };

  KDSplitView.prototype._resizeDidStart = function(event) {
    this.emit("ResizeDidStart", event);
    return document.body.classList.add("resize-in-action");
  };

  KDSplitView.prototype._resizeDidStop = (function() {
    var unsetResizeInAction;
    unsetResizeInAction = KD.utils.throttle(1000, function(view) {
      return document.body.classList.remove("resize-in-action");
    });
    return function(event) {
      var s1, s2;
      s1 = this.sizes[0] / this._getSize();
      s2 = this.sizes[1] / this._getSize();
      this.setOption('sizes', [s1, s2]);
      this.emit("ResizeDidStop", event);
      return unsetResizeInAction(this);
    };
  })();

  KDSplitView.prototype.isVertical = function() {
    return this.type === "vertical";
  };

  KDSplitView.prototype.getPanelIndex = function(panel) {
    return panel.index;
  };

  KDSplitView.prototype.hidePanel = function(index, callback) {
    var panel;
    if (callback == null) {
      callback = KD.noop;
    }
    panel = this.panels[index];
    panel._lastSize = panel._getSize();
    if (panel.isFloating) {
      panel.setCss("width", 0);
      return callback({
        panel: panel,
        index: index
      });
    } else {
      return this.resizePanel(0, index, callback.bind(this, {
        panel: panel,
        index: index
      }));
    }
  };

  KDSplitView.prototype.showPanel = function(index, callback) {
    var left, newSize, panel;
    if (callback == null) {
      callback = KD.noop;
    }
    panel = this.panels[index];
    newSize = panel._lastSize || this.sizes[index] || 200;
    panel._lastSize = null;
    if (panel.isFloating) {
      panel.setCss('width', newSize);
      left = panel.getRelativeX();
      if (left > 0) {
        panel.setCss('left', left - newSize);
      }
      KD.getSingleton('windowController').addLayer(panel);
      panel.once('ReceivedClickElsewhere', (function(_this) {
        return function() {
          return _this.hidePanel(index);
        };
      })(this));
      return callback({
        panel: panel,
        index: index
      });
    } else {
      return this.resizePanel(newSize, index, callback.bind(this, {
        panel: panel,
        index: index
      }));
    }
  };

  KDSplitView.prototype.setFloatingPanel = function(index, size) {
    var panel;
    if (size == null) {
      size = 0;
    }
    panel = this.panels[index];
    panel.setClass('floating');
    panel.isFloating = true;
    panel._lastSize = panel._getSize();
    this.resizePanel(size, index);
    return this.emit('PanelSetToFloating', panel);
  };

  KDSplitView.prototype.unsetFloatingPanel = function(index) {
    var panel;
    panel = this.panels[index];
    delete panel.isFloating;
    panel.unsetClass('floating');
    this.showPanel(index);
    return this.emit('PanelSetToNormal', panel);
  };

  KDSplitView.prototype.resizePanel = function(value, index, callback, forceResize) {
    var affectedPanel, askedPanel, offset, sizes;
    if (value == null) {
      value = 0;
    }
    if (index == null) {
      index = 0;
    }
    if (callback == null) {
      callback = KD.noop;
    }
    if (forceResize == null) {
      forceResize = false;
    }
    if (this.sizes[1] == null) {
      return;
    }
    if (this.beingResized) {
      return;
    }
    if (!this.panels.first || !this.panels.last) {
      return;
    }
    this._resizeDidStart();
    value = this._sanitizeSize(value);
    if (value > this._getSize()) {
      value = this._getSize();
    }
    askedPanel = this.panels[index];
    affectedPanel = this.panels[(index + 1) % 2];
    if (askedPanel._getSize() === value && !forceResize) {
      this._resizeDidStop();
      callback();
      return;
    }
    this.beingResized = true;
    value = this._getLegitPanelSize(value, index);
    sizes = [value, this._getSize() - value];
    offset = index ? sizes[1] : sizes[0];
    askedPanel._setSize(sizes[0]);
    affectedPanel._setSize(sizes[1]);
    this.panels[1]._setOffset(offset);
    if (this.resizer) {
      this.resizer._setOffset(offset);
    }
    this._resizeDidStop();
    return this.beingResized = false;
  };

  KDSplitView.prototype.merge = function() {
    var views;
    views = this.getOptions().views;
    this.getOptions().views = [];
    views.forEach((function(_this) {
      return function(view, i) {
        if (!view) {
          return;
        }
        view.detach();
        view.unsetParent();
        return _this.panels[i].subViews = [];
      };
    })(this));
    this.emit("SplitIsBeingMerged", views);
    return this.destroy();
  };

  KDSplitView.prototype.removePanel = function(index) {};

  KDSplitView.prototype.setView = function(view, index) {
    if (!view) {
      return KD.warn("view is missing at KDSplitView::setView");
    }
    if (index > this.panels.length) {
      return KD.warn("index is missing at KDSplitView::setView");
    }
    if (!(view instanceof KDView)) {
      return KD.warn("index is missing at KDSplitView::setView");
    }
    return this.panels[index].addSubView(view);
  };

  deprecated = function() {
    return KD.warn('deprecated method invoked');
  };

  KDSplitView.prototype._repositionPanels = deprecated;

  KDSplitView.prototype._repositionResizers = deprecated;

  KDSplitView.prototype._setPanelPositions = deprecated;

  return KDSplitView;

})(KDView);

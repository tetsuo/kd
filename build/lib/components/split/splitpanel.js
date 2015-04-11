var KD, KDScrollView, KDSplitView, KDSplitViewPanel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDSplitView = require('./splitview');

KDScrollView = require('../scrollview/scrollview');

module.exports = KDSplitViewPanel = (function(superClass) {
  extend(KDSplitViewPanel, superClass);

  function KDSplitViewPanel(options, data) {
    var ref, type;
    if (options == null) {
      options = {};
    }
    if (options.fixed == null) {
      options.fixed = false;
    }
    options.view || (options.view = null);
    KDSplitViewPanel.__super__.constructor.call(this, options, data);
    type = this.getOptions().type;
    this.vertical = type.toLowerCase() === "vertical";
    ref = this.getOptions(), this.fixed = ref.fixed, this.size = ref.size, this.index = ref.index;
  }

  KDSplitViewPanel.prototype.splitPanel = function(options) {
    var index, split, splitClass, view;
    if (options == null) {
      options = {};
    }
    if (this.subViews.first instanceof KDSplitView) {
      return KD.warn("this panel is already splitted");
    }
    view = this.subViews.first;
    index = this.parent.panels.indexOf(this);
    this.subViews = [];
    if (view) {
      view.detach();
      view.unsetParent();
      options.views = [view];
    }
    options.colored = true;
    splitClass = this.parent.getOptions().splitClass;
    split = new (splitClass || KDSplitView)(options);
    this.parent.setView(split, index);
    return split;
  };

  KDSplitViewPanel.prototype._getSize = function() {
    if (this.vertical) {
      return this.getWidth();
    } else {
      return this.getHeight();
    }
  };

  KDSplitViewPanel.prototype._setSize = function(size) {
    if (this._wouldResize(size)) {
      if (size < 0) {
        size = 0;
      }
      if (this.vertical) {
        this.setWidth(size);
      } else {
        this.setHeight(size);
      }
      this.parent.sizes[this.index] = this.size = size;
      this.parent.emit("PanelDidResize", {
        panel: this
      });
      this.emit("PanelDidResize", {
        newSize: size
      });
      return size;
    } else {
      return false;
    }
  };

  KDSplitViewPanel.prototype._wouldResize = function(size) {
    var maximum, minimum, ref, ref1;
    minimum = (ref = this.parent.minimums[this.index]) != null ? ref : 0;
    maximum = (ref1 = this.parent.maximums[this.index]) != null ? ref1 : 999999;
    if ((maximum >= size && size >= minimum)) {
      return true;
    } else {
      if (size < minimum) {
        this.parent._panelReachedMinimum(this.index);
      } else if (size > maximum) {
        this.parent._panelReachedMaximum(this.index);
      }
      return false;
    }
  };

  KDSplitViewPanel.prototype._setOffset = function(offset) {
    offset = Math.max(offset, 0);
    if (this.vertical) {
      return this.setX(offset);
    } else {
      return this.setY(offset);
    }
  };

  KDSplitViewPanel.prototype._getOffset = function() {
    if (this.vertical) {
      return parseInt(this.getElement().style.left, 10);
    } else {
      return parseInt(this.getElement().style.top, 10);
    }
  };

  return KDSplitViewPanel;

})(KDScrollView);

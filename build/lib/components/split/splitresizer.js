var KDSplitResizer, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

module.exports = KDSplitResizer = (function(superClass) {
  extend(KDSplitResizer, superClass);

  function KDSplitResizer(options, data) {
    var axis, ref;
    if (options == null) {
      options = {};
    }
    options.handleSize || (options.handleSize = 2);
    this.isVertical = options.type.toLowerCase() === "vertical";
    axis = this.isVertical ? "x" : "y";
    if (options.draggable == null) {
      options.draggable = {
        axis: axis
      };
    }
    KDSplitResizer.__super__.constructor.call(this, options, data);
    ref = this.getOptions(), this.panel0 = ref.panel0, this.panel1 = ref.panel1;
    this.on("DragFinished", this.dragFinished);
    this.on("DragInAction", this.dragInAction);
    this.on("DragStarted", this.dragStarted);
  }

  KDSplitResizer.prototype._setOffset = function(offset) {
    var newOffset;
    if (offset < 0) {
      offset = 0;
    }
    newOffset = offset - this.getOption('handleSize');
    if (this.isVertical) {
      return this.$().css({
        left: newOffset
      });
    } else {
      return this.$().css({
        top: newOffset
      });
    }
  };

  KDSplitResizer.prototype._getOffset = function(offset) {
    if (this.isVertical) {
      return this.getRelativeX();
    } else {
      return this.getRelativeY();
    }
  };

  KDSplitResizer.prototype._animateTo = function(offset) {
    var d;
    d = this.parent.options.duration;
    if (this.isVertical) {
      offset -= this.getWidth() / 2;
      return this.$().animate({
        left: offset
      }, d);
    } else {
      offset -= this.getHeight() / 2;
      return this.$().animate({
        top: offset
      }, d);
    }
  };

  KDSplitResizer.prototype.dragFinished = function(event, dragState) {
    return this.parent._resizeDidStop(event);
  };

  KDSplitResizer.prototype.dragStarted = function(event, dragState) {
    this.parent._resizeDidStart();
    this.rOffset = this._getOffset();
    this.p0Size = this.panel0._getSize();
    this.p1Size = this.panel1._getSize();
    return this.p1Offset = this.panel1._getOffset();
  };

  KDSplitResizer.prototype.dragInAction = function(x, y) {
    if (this.isVertical) {
      if (this.panel0._wouldResize(x + this.p0Size)) {
        return this.parent.resizePanel(x + this.p0Size);
      } else {
        return this._setOffset(this.panel1._getOffset());
      }
    } else {
      if (this.panel0._wouldResize(y + this.p0Size)) {
        return this.parent.resizePanel(y + this.p0Size);
      } else {
        return this._setOffset(this.panel1._getOffset());
      }
    }
  };

  return KDSplitResizer;

})(KDView);

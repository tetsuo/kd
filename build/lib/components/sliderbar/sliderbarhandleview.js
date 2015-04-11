var KDCustomHTMLView, KDSliderBarHandleView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDSliderBarHandleView = (function(superClass) {
  extend(KDSliderBarHandleView, superClass);

  function KDSliderBarHandleView(options) {
    if (options == null) {
      options = {};
    }
    options.tagName = "a";
    options.cssClass = "handle";
    if (options.value == null) {
      options.value = 0;
    }
    options.draggable = {
      axis: "x"
    };
    KDSliderBarHandleView.__super__.constructor.call(this, options);
    this.value = this.getOption('value');
  }

  KDSliderBarHandleView.prototype.attachEvents = function() {
    var currentValue, maxValue, minValue, ref, width;
    ref = this.parent.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue, width = ref.width;
    currentValue = this.value;
    this.on("DragStarted", function() {
      return currentValue = this.value;
    });
    this.on("DragInAction", function() {
      var relPos, valueChange;
      relPos = this.dragState.position.relative.x;
      valueChange = ((maxValue - minValue) * relPos) / width;
      this.setValue(currentValue + valueChange);
      if (this.parent.getOption("snapOnDrag")) {
        return this.snap();
      }
    });
    return this.on("DragFinished", function() {
      if (this.parent.getOption("snap")) {
        return this.snap();
      }
    });
  };

  KDSliderBarHandleView.prototype.getPosition = function() {
    var maxValue, minValue, percentage, position, ref, sliderWidth;
    ref = this.parent.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue;
    sliderWidth = this.parent.getWidth();
    percentage = ((this.value - minValue) * 100) / (maxValue - minValue);
    position = (sliderWidth / 100) * percentage;
    return position + "px";
  };

  KDSliderBarHandleView.prototype.setValue = function(value) {
    var leftLimit, ref, rightLimit;
    ref = this.getOptions(), leftLimit = ref.leftLimit, rightLimit = ref.rightLimit;
    if (typeof rightLimit === "number") {
      value = Math.min(value, rightLimit);
    }
    if (typeof leftLimit === "number") {
      value = Math.max(value, leftLimit);
    }
    this.value = value;
    this.setX(this.getPosition());
    return this.parent.setValue(value, this, false);
  };

  KDSliderBarHandleView.prototype.getSnappedValue = function(value) {
    var interval, mid, mod;
    interval = this.parent.getOptions().interval;
    value || (value = this.value);
    if (interval) {
      mod = value % interval;
      mid = interval / 2;
      return value = (function() {
        switch (false) {
          case !(mod <= mid):
            return value - mod;
          case !(mod > mid):
            return value + (interval - mod);
          default:
            return value;
        }
      })();
    }
  };

  KDSliderBarHandleView.prototype.snap = function() {
    var interval, value;
    interval = this.parent.getOptions().interval;
    value = this.getSnappedValue();
    if (interval && this.parent.getOption("snap")) {
      this.setValue(value);
      if (this.parent.getOption('drawBar')) {
        return this.parent.drawBar();
      }
    }
  };

  KDSliderBarHandleView.prototype.viewAppended = function() {
    this.setX("" + (this.getPosition()));
    this.attachEvents();
    if (this.parent.getOption("snap")) {
      return this.snap();
    }
  };

  return KDSliderBarHandleView;

})(KDCustomHTMLView);

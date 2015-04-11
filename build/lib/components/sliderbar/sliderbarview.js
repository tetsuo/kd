var KD, KDCustomHTMLView, KDSliderBarHandleView, KDSliderBarView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

KDSliderBarHandleView = require('./sliderbarhandleview');

module.exports = KDSliderBarView = (function(superClass) {
  extend(KDSliderBarView, superClass);

  function KDSliderBarView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    this._createLabel = bind(this._createLabel, this);
    options.cssClass = KD.utils.curry("sliderbar-container", options.cssClass);
    if (options.minValue == null) {
      options.minValue = 0;
    }
    if (options.maxValue == null) {
      options.maxValue = 100;
    }
    if (options.interval == null) {
      options.interval = false;
    }
    if (options.drawBar == null) {
      options.drawBar = true;
    }
    if (options.showLabels == null) {
      options.showLabels = true;
    }
    if (options.snap == null) {
      options.snap = true;
    }
    if (options.snapOnDrag == null) {
      options.snapOnDrag = false;
    }
    options.width || (options.width = 300);
    if (options.drawOpposite == null) {
      options.drawOpposite = false;
    }
    KDSliderBarView.__super__.constructor.call(this, options, data);
    this.handles = [];
    this.labels = [];
  }

  KDSliderBarView.prototype.createHandles = function() {
    var handle, j, len1, ref, sortRef, value;
    ref = this.getOption("handles");
    for (j = 0, len1 = ref.length; j < len1; j++) {
      value = ref[j];
      this.handles.push(this.addSubView(handle = new KDSliderBarHandleView({
        value: value
      })));
    }
    sortRef = function(a, b) {
      if (a.options.value < b.options.value) {
        return -1;
      }
      if (a.options.value > b.options.value) {
        return 1;
      }
      return 0;
    };
    this.handles.sort(sortRef);
    return this.setClass("labeled");
  };

  KDSliderBarView.prototype.drawBar = function() {
    var diff, handle, j, left, len, len1, positions, ref, right;
    positions = [];
    ref = this.handles;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      handle = ref[j];
      positions.push(handle.getRelativeX());
    }
    len = positions.length;
    left = (len > 1 ? parseInt(positions.first) : void 0) || 0;
    right = parseInt(positions.last);
    diff = right - left;
    if (!this.bar) {
      this.addSubView(this.bar = new KDCustomHTMLView({
        cssClass: "bar"
      }));
    }
    this.bar.setWidth(diff);
    return this.bar.setX(left + "px");
  };

  KDSliderBarView.prototype.drawOppositeBar = function() {
    var diff, handle, j, len1, positions, ref, right;
    positions = [];
    ref = this.handles;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      handle = ref[j];
      positions.push(handle.getRelativeX());
    }
    right = parseInt(positions.last);
    diff = this.getWidth() - right;
    if (!this.oppositeBar) {
      this.addSubView(this.oppositeBar = new KDCustomHTMLView({
        cssClass: "opposite bar"
      }));
    }
    this.oppositeBar.setWidth(diff);
    return this.oppositeBar.setX(right + "px");
  };

  KDSliderBarView.prototype._createLabel = function(value) {
    var interval, label, maxValue, minValue, pos, ref, showLabels;
    ref = this.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue, interval = ref.interval, showLabels = ref.showLabels;
    pos = ((value - minValue) * 100) / (maxValue - minValue);
    this.labels.push(this.addSubView(label = new KDCustomHTMLView({
      cssClass: "sliderbar-label",
      partial: "" + value
    })));
    return label.setX(pos + "%");
  };

  KDSliderBarView.prototype.addLabels = function() {
    var interval, j, k, len1, maxValue, minValue, ref, ref1, ref2, ref3, results, results1, showLabels, value;
    ref = this.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue, interval = ref.interval, showLabels = ref.showLabels;
    if (Array.isArray(showLabels)) {
      results = [];
      for (j = 0, len1 = showLabels.length; j < len1; j++) {
        value = showLabels[j];
        results.push(this._createLabel(value));
      }
      return results;
    } else {
      results1 = [];
      for (value = k = ref1 = minValue, ref2 = maxValue, ref3 = interval; ref3 > 0 ? k <= ref2 : k >= ref2; value = k += ref3) {
        results1.push(this._createLabel(value));
      }
      return results1;
    }
  };

  KDSliderBarView.prototype.getValues = function() {
    var handle, j, len1, ref, results;
    ref = this.handles;
    results = [];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      handle = ref[j];
      results.push(handle.getOptions().value);
    }
    return results;
  };

  KDSliderBarView.prototype.setValue = function(value, handle, updateHandle) {
    if (handle == null) {
      handle = this.handles.first;
    }
    if (updateHandle == null) {
      updateHandle = true;
    }
    if (updateHandle) {
      handle.setValue(value);
    }
    if (this.getOption('drawBar')) {
      this.drawBar();
    }
    if (this.getOption('drawOpposite')) {
      this.drawOppositeBar();
    }
    this.setLimits();
    this.emit("ValueIsChanging", handle.value);
    return this.emit("ValueChanged", handle);
  };

  KDSliderBarView.prototype.setLimits = function() {
    var handle, i, interval, j, len1, maxValue, minValue, options, ref, ref1, ref2, ref3, results;
    ref = this.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue, interval = ref.interval;
    if (this.handles.length === 1) {
      this.handles.first.options.leftLimit = minValue;
      return this.handles.first.options.rightLimit = maxValue;
    } else {
      ref1 = this.handles;
      results = [];
      for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
        handle = ref1[i];
        options = handle.getOptions();
        options.leftLimit = ((ref2 = this.handles[i - 1]) != null ? ref2.value : void 0) + interval || minValue;
        results.push(options.rightLimit = ((ref3 = this.handles[i + 1]) != null ? ref3.value : void 0) - interval || maxValue);
      }
      return results;
    }
  };

  KDSliderBarView.prototype.attachEvents = function() {
    return this.on("click", function(event) {
      var clickedPos, clickedValue, closestHandle, diff, handle, j, len1, maxValue, minValue, mindiff, ref, ref1, sliderWidth, snappedValue, value;
      ref = this.getOptions(), maxValue = ref.maxValue, minValue = ref.minValue;
      sliderWidth = this.getWidth();
      clickedPos = event.pageX - this.getBounds().x;
      clickedValue = ((maxValue - minValue) * clickedPos) / sliderWidth + minValue;
      snappedValue = this.handles.first.getSnappedValue(clickedValue);
      closestHandle = null;
      mindiff = null;
      ref1 = this.handles;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        handle = ref1[j];
        value = handle.value;
        diff = Math.abs(clickedValue - value);
        if ((diff < mindiff) || !mindiff) {
          mindiff = diff;
          closestHandle = handle;
        }
      }
      return closestHandle.setValue(snappedValue);
    });
  };

  KDSliderBarView.prototype.viewAppended = function() {
    this.setWidth(this.getOption("width"));
    this.createHandles();
    this.setLimits();
    if (this.getOption('drawBar')) {
      this.drawBar();
    }
    if (this.getOption('drawOpposite')) {
      this.drawOppositeBar();
    }
    if (this.getOption('showLabels')) {
      this.addLabels();
    }
    return this.attachEvents();
  };

  return KDSliderBarView;

})(KDCustomHTMLView);

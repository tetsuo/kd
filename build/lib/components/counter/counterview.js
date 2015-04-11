var KD, KDCounterDigitView, KDCounterView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

KDCounterDigitView = require('./counterdigitview');

module.exports = KDCounterView = (function(superClass) {
  extend(KDCounterView, superClass);

  function KDCounterView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    if (options.style == null) {
      options.style = "dark";
    }
    if (options.from == null) {
      options.from = 5000;
    }
    if (options.to == null) {
      options.to = 10000;
    }
    if (options.interval == null) {
      options.interval = 1000;
    }
    if (options.step == null) {
      options.step = 1;
    }
    if (options.autoStart == null) {
      options.autoStart = true;
    }
    options.direction = options.from < options.to ? "up" : "down";
    if (options.digits == null) {
      options.digits = options.direction === "up" ? options.to.toString().length : options.from.toString().length;
    }
    options.cssClass = KD.utils.curry(options.style + " " + options.direction + " kd-counter", options.cssClass);
    KDCounterView.__super__.constructor.call(this, options, data);
    this.digitsList = [];
    this.currentValue = options.from;
    this.createCounter();
    if (options.autoStart) {
      this.start();
    }
  }

  KDCounterView.prototype.createCounter = function() {
    var digits, from, i, j, ref, ref1, results;
    ref = this.getOptions(), from = ref.from, digits = ref.digits;
    results = [];
    for (i = j = 0, ref1 = digits; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      results.push(this.digitsList.push(this.addSubView(new KDCounterDigitView({
        initialValue: from.toString()[i]
      }))));
    }
    return results;
  };

  KDCounterView.prototype.setValue = function(value) {
    var i, j, ref, results;
    if (value === this.currentValue) {
      return;
    }
    this.currentValue = value;
    value = value.toString();
    results = [];
    for (i = j = 0, ref = value.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      results.push(this.digitsList[i].setValue(value[i]));
    }
    return results;
  };

  KDCounterView.prototype.start = function() {
    var timer;
    timer = this.getOption("interval");
    return this.counterInterval = KD.utils.repeat(timer, (function(_this) {
      return function() {
        var newValue;
        if (_this.getOption("direction") === "up") {
          newValue = _this.currentValue + _this.getOption("step");
        } else {
          newValue = _this.currentValue - _this.getOption("step");
        }
        _this.setValue(newValue);
        return _this.currentValue = newValue;
      };
    })(this));
  };

  return KDCounterView;

})(KDView);

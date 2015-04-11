var KD, KDCounterDigitView, KDCustomHTMLView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDCounterDigitView = (function(superClass) {
  extend(KDCounterDigitView, superClass);

  function KDCounterDigitView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.tagName = "ul";
    if (options.initialValue == null) {
      options.initialValue = 0;
    }
    KDCounterDigitView.__super__.constructor.call(this, options, data);
    this.currentValue = options.initialValue;
    this.createDigit();
  }

  KDCounterDigitView.prototype.createDigit = function() {
    this.addSubView(this.digit = new KDCustomHTMLView({
      tagName: "li",
      cssClass: "real",
      partial: "<span class=\"top\">" + (this.getOption('initialValue')) + "</span>\n<span class=\"bottom\">" + (this.getOption('initialValue')) + "</span>"
    }));
    this.addSubView(this.fakeDigit = new KDCustomHTMLView({
      tagName: "li",
      cssClass: "fake",
      partial: "<span class=\"top\">" + (this.getOption('initialValue')) + "</span>\n<span class=\"bottom\">" + (this.getOption('initialValue')) + "</span>"
    }));
    return this.setValue(this.getOption("initialValue"));
  };

  KDCounterDigitView.prototype.setValue = function(value) {
    if (value === this.currentValue) {
      return;
    }
    this.currentValue = value;
    this.digit.updatePartial("<span class=\"top\">" + value + "</span>\n<span class=\"bottom\">" + value + "</span>");
    this.setClass("animate");
    return KD.utils.wait(500, (function(_this) {
      return function() {
        _this.fakeDigit.updatePartial("<span class=\"top\">" + value + "</span>\n<span class=\"bottom\">" + value + "</span>");
        return _this.unsetClass("animate");
      };
    })(this));
  };

  return KDCounterDigitView;

})(KDCustomHTMLView);

var $, KDInputSwitch, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDInputView = require('./inputview');

module.exports = KDInputSwitch = (function(superClass) {
  extend(KDInputSwitch, superClass);

  function KDInputSwitch(options) {
    if (options == null) {
      options = {};
    }
    options.type = "switch";
    KDInputSwitch.__super__.constructor.call(this, options);
    this.setPartial("<input class='checkbox hidden no-kdinput' type='checkbox' name='" + (this.getName()) + "'/>");
  }

  KDInputSwitch.prototype.setDomElement = function() {
    return this.domElement = $("<span class='kdinput kdinputswitch off'></span>");
  };

  KDInputSwitch.prototype.setDefaultValue = function(value) {
    switch (value) {
      case true:
      case "on":
      case "true":
      case "yes":
      case 1:
        return this._setDefaultValue(true);
      default:
        return this._setDefaultValue(false);
    }
  };

  KDInputSwitch.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDInputSwitch.prototype.getValue = function() {
    return this.getDomElement().find("input").eq(0).is(":checked");
  };

  KDInputSwitch.prototype.setValue = function(value) {
    switch (value) {
      case true:
        return this.switchAnimateOn();
      case false:
        return this.switchAnimateOff();
    }
  };

  KDInputSwitch.prototype._setDefaultValue = function(val) {
    return setTimeout((function(_this) {
      return function() {
        val = !!val;
        if (val) {
          _this.inputDefaultValue = true;
          _this.getDomElement().find("input").eq(0).attr("checked", true);
          return _this.getDomElement().removeClass("off").addClass("on");
        } else {
          _this.inputDefaultValue = false;
          _this.getDomElement().find("input").eq(0).attr("checked", false);
          return _this.getDomElement().removeClass("on").addClass("off");
        }
      };
    })(this), 0);
  };

  KDInputSwitch.prototype.switchAnimateOff = function() {
    var counter, timer;
    if (!this.getValue()) {
      return;
    }
    counter = 0;
    return timer = setInterval((function(_this) {
      return function() {
        _this.getDomElement().css("background-position", "left -" + (counter * 20) + "px");
        if (counter === 6) {
          clearInterval(timer);
          _this.getDomElement().find("input").eq(0).attr("checked", false);
          _this.getDomElement().removeClass("on").addClass("off");
          _this.switchStateChanged();
        }
        return counter++;
      };
    })(this), 20);
  };

  KDInputSwitch.prototype.switchAnimateOn = function() {
    var counter, timer;
    if (this.getValue()) {
      return;
    }
    counter = 6;
    return timer = setInterval((function(_this) {
      return function() {
        _this.getDomElement().css("background-position", "left -" + (counter * 20) + "px");
        if (counter === 0) {
          clearInterval(timer);
          _this.getDomElement().find("input").eq(0).attr("checked", true);
          _this.getDomElement().removeClass("off").addClass("on");
          _this.switchStateChanged();
        }
        return counter--;
      };
    })(this), 20);
  };

  KDInputSwitch.prototype.switchStateChanged = function() {
    if (this.getCallback() != null) {
      return this.getCallback().call(this, this.getValue());
    }
  };

  KDInputSwitch.prototype.mouseDown = function() {
    switch (this.getValue()) {
      case true:
        this.setValue(false);
        break;
      case false:
        this.setValue(true);
    }
    return false;
  };

  return KDInputSwitch;

})(KDInputView);

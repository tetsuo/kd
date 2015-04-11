var $, KD, KDInputView, KDOnOffSwitch,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDInputView = require('./inputview');

module.exports = KDOnOffSwitch = (function(superClass) {
  extend(KDOnOffSwitch, superClass);

  function KDOnOffSwitch(options, data) {
    if (options == null) {
      options = {};
    }
    options.type = "switch";
    options.title || (options.title = "");
    options.size || (options.size = "small");
    options.labels || (options.labels = ["ON", "OFF"]);
    if (options.defaultValue == null) {
      options.defaultValue = false;
    }
    KDOnOffSwitch.__super__.constructor.call(this, options, data);
    this.setClass(options.size);
    this.setPartial("<input class='checkbox hidden no-kdinput' type='checkbox' name='" + (this.getName()) + "'/>");
    this.setDefaultValue(options.defaultValue);
  }

  KDOnOffSwitch.prototype.setDomElement = function(cssClass) {
    var labels, name, ref, title;
    ref = this.getOptions(), title = ref.title, labels = ref.labels, name = ref.name;
    if (title !== '') {
      title = "<span>" + title + "</span>";
    }
    this.inputName = name;
    return this.domElement = $("<div class='kdinput on-off off " + cssClass + "'>\n  " + title + "\n  <a href='#' class='on' title='turn on'>" + labels[0] + "</a><a href='#' class='off' title='turn off'>" + labels[1] + "</a>\n</div> ");
  };

  KDOnOffSwitch.prototype.getValue = function() {
    return this.$("input").attr("checked") === "checked";
  };

  KDOnOffSwitch.prototype.setValue = function(value, wCallback) {
    if (wCallback == null) {
      wCallback = true;
    }
    switch (value) {
      case true:
        return this.setOn(wCallback);
      case false:
        return this.setOff(wCallback);
    }
  };

  KDOnOffSwitch.prototype.setDefaultValue = function(value) {
    switch (value) {
      case true:
      case "on":
      case "true":
      case "yes":
      case 1:
        return this.setValue(true, false);
      default:
        return this.setValue(false, false);
    }
  };

  KDOnOffSwitch.prototype.setOff = function(wCallback) {
    if (wCallback == null) {
      wCallback = true;
    }
    if (!this.getValue() && wCallback) {
      return;
    }
    this.$("input").attr("checked", false);
    this.$('a.on').removeClass('active');
    this.$('a.off').addClass('active');
    if (wCallback) {
      return this.switchStateChanged();
    }
  };

  KDOnOffSwitch.prototype.setOn = function(wCallback) {
    if (wCallback == null) {
      wCallback = true;
    }
    if (this.getValue() && wCallback) {
      return;
    }
    this.$("input").attr("checked", true);
    this.$('a.off').removeClass('active');
    this.$('a.on').addClass('active');
    if (wCallback) {
      return this.switchStateChanged();
    }
  };

  KDOnOffSwitch.prototype.switchStateChanged = function() {
    this.emit('SwitchStateChanged', this.getValue());
    if (this.getCallback() != null) {
      return this.getCallback().call(this, this.getValue());
    }
  };

  KDOnOffSwitch.prototype.click = KD.utils.stopDOMEvent;

  KDOnOffSwitch.prototype.mouseDown = function(event) {
    if ($(event.target).is('a.on')) {
      return this.setValue(true);
    } else if ($(event.target).is('a.off')) {
      return this.setValue(false);
    }
  };

  return KDOnOffSwitch;

})(KDInputView);

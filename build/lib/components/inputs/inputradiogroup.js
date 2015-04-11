var $, KDInputRadioGroup, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDInputView = require('./inputview');

module.exports = KDInputRadioGroup = (function(superClass) {
  extend(KDInputRadioGroup, superClass);

  function KDInputRadioGroup(options) {
    options.type || (options.type = 'radio');
    if (options.hideRadios == null) {
      options.hideRadios = false;
    }
    if (options.showIcons == null) {
      options.showIcons = false;
    }
    options.cssClassPrefix || (options.cssClassPrefix = '');
    KDInputRadioGroup.__super__.constructor.call(this, options);
    this._currentValue = this.getOption('defaultValue');
  }

  KDInputRadioGroup.prototype.setDomElement = function() {
    var disabledClass, div, i, j, label, len, options, radio, radioOptions, ref;
    options = this.getOptions();
    this.domElement = $("<fieldset class='" + (this.utils.curry('radiogroup kdinput', options.cssClass)) + "'></fieldset>");
    ref = options.radios;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      radioOptions = ref[i];
      if (radioOptions.visible == null) {
        radioOptions.visible = true;
      }
      radioOptions.callback || (radioOptions.callback = function() {});
      disabledClass = radioOptions.disabled ? 'disabled ' : '';
      div = $("<div/>", {
        "class": "kd-" + (this.getType()) + "-holder " + disabledClass + options.cssClassPrefix + (this.utils.slugify(radioOptions.value))
      });
      radio = $("<input/>", {
        type: this.getType(),
        name: options.name,
        value: radioOptions.value,
        "class": "no-kdinput" + (options.hideRadios ? ' hidden' : ''),
        id: (this.getId()) + "_" + (this.getType()) + "_" + i,
        change: radioOptions.callback
      });
      if (radioOptions.disabled) {
        radio[0].setAttribute('disabled', 'disabled');
      }
      label = $("<label/>", {
        "for": (this.getId()) + "_" + (this.getType()) + "_" + i,
        html: radioOptions.title,
        "class": options.cssClassPrefix + this.utils.slugify(radioOptions.value)
      });
      div.append(radio);
      if (options.showIcons) {
        div.append($("<span/>", {
          "class": "icon"
        }));
      }
      div.append(label);
      this.domElement.append(div);
      if (!radioOptions.visible) {
        div.hide();
      }
    }
    return this.domElement;
  };

  KDInputRadioGroup.prototype.click = function(event) {
    var input;
    input = $(event.target).closest(".kd-" + (this.getType()) + "-holder").find('input');
    if (input.length < 1) {
      return;
    }
    if (input[0].getAttribute('disabled') === 'disabled') {
      return false;
    }
    return this.setValue(input[0].getAttribute("value"));
  };

  KDInputRadioGroup.prototype.setDefaultValue = function(value) {
    this.inputDefaultValue = value;
    return this.setValue(value, true);
  };

  KDInputRadioGroup.prototype.getValue = function() {
    return this.$('input[checked=checked]').val();
  };

  KDInputRadioGroup.prototype.setValue = function(value, isDefault) {
    var inputElement;
    if (isDefault == null) {
      isDefault = false;
    }
    this.$("input").attr("checked", false);
    inputElement = this.$("input[value='" + value + "']");
    inputElement.attr("checked", "checked");
    inputElement.prop("checked", true);
    if ((value != null) && value !== this._currentValue && !isDefault) {
      this.emit("change", value);
    }
    this._currentValue = value;
    this.$(".kd-radio-holder").removeClass('active');
    if ((value != null) && value !== "") {
      return this.$(".kd-radio-holder." + value).addClass('active');
    }
  };

  KDInputRadioGroup.prototype.getInputElements = function() {
    return this.getDomElement().find('input');
  };

  return KDInputRadioGroup;

})(KDInputView);

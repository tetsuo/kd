var $, KD, KDInputView, KDSelectBox,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDInputView = require('./inputview');

module.exports = KDSelectBox = (function(superClass) {
  extend(KDSelectBox, superClass);

  function KDSelectBox(options) {
    if (options == null) {
      options = {};
    }
    options.type = "select";
    KDSelectBox.__super__.constructor.call(this, options);
  }

  KDSelectBox.prototype.setDomElement = function(cssClass) {
    var name;
    this.inputName = this.getOption("name");
    name = "name='" + this.options.name + "'";
    this.domElement = $("<div class='kdselectbox " + cssClass + "'>\n  <select " + name + "></select>\n  <span class='title'></span>\n  <span class='arrows'></span>\n</div>\"");
    this._$select = this.$("select").eq(0);
    this._$title = this.$("span.title").eq(0);
    return this.domElement;
  };

  KDSelectBox.prototype.bindEvents = function() {
    this._$select.bind("blur change focus", (function(_this) {
      return function(event) {
        var base;
        if (event.type === "change") {
          if (typeof (base = _this.getCallback()) === "function") {
            base(_this.getValue());
          }
        }
        _this.emit(event.type, event, _this.getValue());
        return _this.handleEvent(event);
      };
    })(this));
    return KDSelectBox.__super__.bindEvents.apply(this, arguments);
  };

  KDSelectBox.prototype.setDefaultValue = function(value) {
    if (value !== "") {
      this.getDomElement().val(value);
    }
    this._$select.val(value);
    this._$title.text(this._$select.find("option[value=\"" + value + "\"]").text());
    return this.inputDefaultValue = value;
  };

  KDSelectBox.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDSelectBox.prototype.getValue = function() {
    return this._$select.val();
  };

  KDSelectBox.prototype.setValue = function(value) {
    this._$select.val(value);
    return this.change();
  };

  KDSelectBox.prototype.makeDisabled = function() {
    this.setClass("disabled");
    return this._$select.attr("disabled", "disabled");
  };

  KDSelectBox.prototype.makeEnabled = function() {
    this.unsetClass("disabled");
    return this._$select.removeAttr("disabled");
  };

  KDSelectBox.prototype.setSelectOptions = function(options) {
    var $optGroup, firstOption, i, j, len, len1, optGroup, option, subOptions, value;
    firstOption = null;
    if (!options.length) {
      for (optGroup in options) {
        if (!hasProp.call(options, optGroup)) continue;
        subOptions = options[optGroup];
        $optGroup = $("<optgroup label='" + optGroup + "'/>");
        this._$select.append($optGroup);
        for (i = 0, len = subOptions.length; i < len; i++) {
          option = subOptions[i];
          firstOption || (firstOption = option);
          $optGroup.append("<option value='" + option.value + "'>" + option.title + "</option>");
        }
      }
    } else if (options.length) {
      for (j = 0, len1 = options.length; j < len1; j++) {
        option = options[j];
        this._$select.append("<option value='" + option.value + "'>" + option.title + "</option>");
        firstOption || (firstOption = option);
      }
    } else {
      KD.warn("no valid options specified for the input:", this);
    }
    value = this.getDefaultValue() || (firstOption != null ? firstOption.value : void 0) || "";
    this._$select.val(value + "");
    return this._$title.text(this._$select.find("option[value=\"" + value + "\"]").text());
  };

  KDSelectBox.prototype.removeSelectOptions = function() {
    this._$select.find("optgroup").remove();
    return this._$select.find("option").remove();
  };

  KDSelectBox.prototype.change = function() {
    return this._$title.text(this._$select.find("option[value=\"" + (this.getValue()) + "\"]").text());
  };

  KDSelectBox.prototype.focus = function() {
    return this.setClass('focus');
  };

  KDSelectBox.prototype.blur = function() {
    return this.unsetClass('focus');
  };

  return KDSelectBox;

})(KDInputView);

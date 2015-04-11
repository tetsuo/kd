var $, KDInputView, KDMultipleChoice,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = require('jquery');

KDInputView = require('./inputview');

module.exports = KDMultipleChoice = (function(superClass) {
  var setCurrent;

  extend(KDMultipleChoice, superClass);

  function KDMultipleChoice(options, data) {
    if (options == null) {
      options = {};
    }
    if (options.disabled == null) {
      options.disabled = false;
    }
    options.size || (options.size = "small");
    options.labels || (options.labels = ["ON", "OFF"]);
    options.titles || (options.titles = options.labels);
    if (options.multiple == null) {
      options.multiple = false;
    }
    options.defaultValue || (options.defaultValue = options.multiple ? options.labels[0] : void 0);
    if (!options.multiple && Array.isArray(options.defaultValue)) {
      options.defaultValue = options.defaultValue[0];
    }
    KDMultipleChoice.__super__.constructor.call(this, options, data);
    this.setClass(options.size);
    this.setPartial("<input class='hidden no-kdinput' name='" + (this.getName()) + "'/>");
    this.oldValue = null;
    if (options.multiple) {
      this.currentValue = [];
    }
    this.setDisabled(options.disabled);
  }

  KDMultipleChoice.prototype.setDomElement = function(cssClass) {
    var activeClass, clsName, defaultValue, i, j, label, labelItems, labels, len, name, ref, titles;
    ref = this.getOptions(), titles = ref.titles, labels = ref.labels, name = ref.name, defaultValue = ref.defaultValue;
    this.inputName = name;
    labelItems = "";
    for (i = j = 0, len = labels.length; j < len; i = ++j) {
      label = labels[i];
      activeClass = label === defaultValue ? ' active' : '';
      clsName = "multiple-choice-" + label + activeClass;
      labelItems += "<a href='#' name='" + label + "' class='" + clsName + "' title='" + (titles[i] || 'Select ' + label) + "'>" + label + "</a>";
    }
    return this.domElement = $("<div class='kdinput on-off multiple-choice " + cssClass + "'>\n  " + labelItems + "\n</div> ");
  };

  KDMultipleChoice.prototype.getDefaultValue = function() {
    return this.getOptions().defaultValue;
  };

  KDMultipleChoice.prototype.getValue = function() {
    return this.currentValue;
  };

  setCurrent = function(view, label) {
    if (indexOf.call(view.currentValue, label) >= 0) {
      view.$("a[name$='" + label + "']").removeClass('active');
      return view.currentValue.splice(view.currentValue.indexOf(label), 1);
    } else {
      view.$("a[name$='" + label + "']").addClass('active');
      return view.currentValue.push(label);
    }
  };

  KDMultipleChoice.prototype.setDisabled = function(disable) {
    if (disable == null) {
      disable = true;
    }
    return this._disabled = disable;
  };

  KDMultipleChoice.prototype.setValue = function(label, wCallback) {
    var multiple, obj, ref, val;
    if (wCallback == null) {
      wCallback = true;
    }
    multiple = this.getOptions().multiple;
    if (multiple) {
      this.oldValue = (ref = [
        (function() {
          var j, len, ref1, results;
          ref1 = this.currentValue;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            obj = ref1[j];
            results.push(obj);
          }
          return results;
        }).call(this)
      ]) != null ? ref.first : void 0;
      if (Array.isArray(label)) {
        [
          (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = label.length; j < len; j++) {
              val = label[j];
              results.push(setCurrent(this, val));
            }
            return results;
          }).call(this)
        ];
      } else {
        setCurrent(this, label);
      }
      if (wCallback) {
        return this.switchStateChanged();
      }
    } else {
      this.$("a").removeClass('active');
      this.$("a[name='" + label + "']").addClass('active');
      this.oldValue = this.currentValue;
      this.currentValue = label;
      if (this.currentValue !== this.oldValue && wCallback) {
        return this.switchStateChanged();
      }
    }
  };

  KDMultipleChoice.prototype.switchStateChanged = function() {
    if (this._disabled) {
      return;
    }
    if (this.getCallback() != null) {
      return this.getCallback().call(this, this.getValue());
    }
  };

  KDMultipleChoice.prototype.fallBackToOldState = function() {
    var multiple;
    multiple = this.getOptions().multiple;
    if (multiple) {
      this.currentValue = [];
      this.$("a").removeClass('active');
    }
    return this.setValue(this.oldValue, false);
  };

  KDMultipleChoice.prototype.mouseDown = function(event) {
    if (this._disabled) {
      return;
    }
    if ($(event.target).is('a')) {
      return this.setValue(event.target.name);
    }
  };

  return KDMultipleChoice;

})(KDInputView);

var $, JsPath, KD, KDFormView, KDInputView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

$ = require('jquery');

KD = require('../../core/kd');

KDInputView = require('../inputs/inputview');

JsPath = require('jspath');

KDView = require('../../core/view');

module.exports = KDFormView = (function(superClass) {
  extend(KDFormView, superClass);

  KDFormView.findChildInputs = function(parent) {
    var inputs, subViews;
    inputs = [];
    subViews = parent.getSubViews();
    if (subViews.length > 0) {
      subViews.forEach(function(subView) {
        if (subView instanceof KDInputView) {
          inputs.push(subView);
        }
        return inputs = inputs.concat(KDFormView.findChildInputs(subView));
      });
    }
    return inputs;
  };

  KDFormView.sanitizeFormOptions = function(options) {
    var key, option, results;
    results = [];
    for (key in options) {
      option = options[key];
      if (option.title == null) {
        option.title = key;
      }
      option.key = key;
      results.push(option);
    }
    return results;
  };


  /*
  INSTANCE LEVEL
   */

  function KDFormView(options, data) {
    if (options == null) {
      options = {};
    }
    options.tagName = "form";
    options.cssClass = KD.utils.curry("kdformview", options.cssClass);
    options.callback || (options.callback = KD.noop);
    options.customData || (options.customData = {});
    options.bind || (options.bind = "submit");
    KDFormView.__super__.constructor.call(this, options, data);
    this.unsetClass("kdview");
    this.valid = null;
    this.setCallback(options.callback);
    this.customData = {};
  }

  KDFormView.prototype.childAppended = function(child) {
    if (typeof child.associateForm === "function") {
      child.associateForm(this);
    }
    if (child instanceof KDInputView) {
      this.emit('inputWasAdded', child);
    }
    return KDFormView.__super__.childAppended.apply(this, arguments);
  };

  KDFormView.prototype.getCustomData = function(path) {
    if (path) {
      return JsPath.getAt(this.customData, path);
    } else {
      return this.customData;
    }
  };

  KDFormView.prototype.addCustomData = function(path, value) {
    var key, results;
    if ('string' === typeof path) {
      return JsPath.setAt(this.customData, path, value);
    } else {
      results = [];
      for (key in path) {
        if (!hasProp.call(path, key)) continue;
        value = path[key];
        results.push(JsPath.setAt(this.customData, key, value));
      }
      return results;
    }
  };

  KDFormView.prototype.removeCustomData = function(path) {
    var i, isArrayElement, last, pathUntil;
    if ('string' === typeof path) {
      path = path.split('.');
    }
    pathUntil = 2 <= path.length ? slice.call(path, 0, i = path.length - 1) : (i = 0, []), last = path[i++];
    isArrayElement = !isNaN(+last);
    if (isArrayElement) {
      return JsPath.spliceAt(this.customData, pathUntil, last);
    } else {
      return JsPath.deleteAt(this.customData, path);
    }
  };

  KDFormView.prototype.serializeFormData = function(data) {
    var i, inputData, len, ref;
    if (data == null) {
      data = {};
    }
    ref = this.getDomElement().serializeArray();
    for (i = 0, len = ref.length; i < len; i++) {
      inputData = ref[i];
      data[inputData.name] = inputData.value;
    }
    return data;
  };

  KDFormView.prototype.getData = function() {
    var formData;
    formData = $.extend({}, this.getCustomData());
    this.serializeFormData(formData);
    return formData;
  };

  KDFormView.prototype.getFormData = function() {
    var formData, inputs;
    inputs = KDFormView.findChildInputs(this);
    formData = this.getCustomData() || {};
    inputs.forEach(function(input) {
      if (input.getName()) {
        return formData[input.getName()] = input.getValue();
      }
    });
    return formData;
  };

  KDFormView.prototype.focusFirstElement = function() {
    return KDFormView.findChildInputs(this)[0].$().trigger("focus");
  };

  KDFormView.prototype.setCallback = function(callback) {
    return this.formCallback = callback;
  };

  KDFormView.prototype.getCallback = function() {
    return this.formCallback;
  };

  KDFormView.prototype.reset = function() {
    return this.getElement().reset();
  };

  KDFormView.prototype.submit = function(event) {
    var form, formData, inputs, toBeValidatedInputs, validInputs, validationCount;
    KD.utils.stopDOMEvent(event);
    form = this;
    inputs = KDFormView.findChildInputs(form);
    validationCount = 0;
    toBeValidatedInputs = [];
    validInputs = [];
    formData = this.getCustomData() || {};
    this.once("FormValidationFinished", function(isValid) {
      var ref;
      if (isValid == null) {
        isValid = true;
      }
      form.valid = isValid;
      if (isValid) {
        if ((ref = form.getCallback()) != null) {
          ref.call(form, formData, event);
        }
        return form.emit("FormValidationPassed");
      } else {
        return form.emit("FormValidationFailed");
      }
    });
    inputs.forEach(function(input) {
      var inputOptions, name, value;
      inputOptions = input.getOptions();
      if (inputOptions.validate || inputOptions.required) {
        return toBeValidatedInputs.push(input);
      } else {
        name = input.getName();
        value = input.getValue();
        if (name) {
          return formData[name] = value;
        }
      }
    });
    toBeValidatedInputs.forEach(function(inputToBeValidated) {
      (function() {
        return inputToBeValidated.once("ValidationResult", function(result) {
          var i, input, len, valid;
          validationCount++;
          if (result) {
            validInputs.push(inputToBeValidated);
          }
          if (toBeValidatedInputs.length === validationCount) {
            if (validInputs.length === toBeValidatedInputs.length) {
              for (i = 0, len = validInputs.length; i < len; i++) {
                input = validInputs[i];
                formData[input.getName()] = input.getValue();
              }
            } else {
              valid = false;
            }
            return form.emit("FormValidationFinished", valid);
          }
        });
      })();
      return inputToBeValidated.validate(null, event);
    });
    if (toBeValidatedInputs.length === 0) {
      return form.emit("FormValidationFinished");
    }
  };

  return KDFormView;

})(KDView);

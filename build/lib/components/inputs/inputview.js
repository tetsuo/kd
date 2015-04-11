var $, Encoder, KD, KDInputValidator, KDInputView, KDNotificationView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = require('jquery');

KD = require('../../core/kd');

KDNotificationView = require('../notifications/notificationview');

KDView = require('../../core/view');

KDInputValidator = require('./inputvalidator');

Encoder = require('htmlencode');


/**
 * The base input field view. Similar to the classic `<input type="foo">`
 * element, but with additional options such as validation.
 *
 * ## Usage
 *
 * ```coffee
 * view = new KDInputView
 *   placeholder: 'Type something here for an inspiring message!'
 *
 * view.on 'keyup', (e) ->
 *   if e.keyCode is 13 #13==Enter
 *     new KDNotificationView
 *       content: "You said #{e.target.value}!"
 *
 * appView.addSubView view
 * ```
 *
 * Create a simple text input view, with a placeholder. When the `keyup`
 * event is fired, we check what the key is. If the keyCode is `13`
 * *(An Enter key)*, we create a notification with the value of the field.
 */

module.exports = KDInputView = (function(superClass) {
  extend(KDInputView, superClass);


  /**
   * Options supports the following keys.
   * - **options.type**: The type of this input. All html input types are
   *   supported. It should be noted that `"textarea"` and `"select"` do not
   *   create `<input>` elements, but rather they create `<textarea>` and
   *   `<select>` respectively.
   *
   *   Supports the options `"text"`, `"password"`, `"hidden"`, `"checkbox"`,
   *   `"range"`, `"textarea"`, and `"select"`.
   * - **options.name**: The `name="foo"` attribute of this `<input>` element.
   * - **options.label**: The label instance for this input field.
   * - **options.defaultValue**: The default value for this instance.
   * - **options.placeholder**: The HTML5 placeholder for this input.
   * - **options.disabled**: Whether or not this input is disabled. Defaults to
   *   `false`
   * - **options.selectOptions**: If this input is of the type `"select"`, this
   *   list populates the select options. Defaults to `null`
   * - **options.validate**: An object containing validation options, which are
   *   passed to the KDInputValidator for this input. Note that the validator is
   *   created internally, you do not need to create it. Defaults to `null`
   * - **options.autogrow**: If the input type can grow, such as a `textarea`,
   *   this will cause the input to grow to the content size, rather than scroll.
   *   Defaults to `false`
   * - **options.bind**: A string of event names, separated by a space. Defaults
   *   to `" blur change focus"`
   * - **options.forceCase**: Force either uppercase, or lowercase for this field
   *   type. If `null`, case is not enforced. Supports the options: `"uppercase"`,
   *   `"lowercase"`, `null`
   *
   * @param {Object} options
   * @param {Object} data
   */

  function KDInputView(o, data) {
    var options;
    if (o == null) {
      o = {};
    }
    o.type || (o.type = "text");
    o.name || (o.name = "");
    o.label || (o.label = null);
    o.cssClass || (o.cssClass = "");
    o.callback || (o.callback = null);
    if (o.defaultValue == null) {
      o.defaultValue = "";
    }
    o.placeholder || (o.placeholder = "");
    if (o.disabled == null) {
      o.disabled = false;
    }
    o.selectOptions || (o.selectOptions = null);
    o.validate || (o.validate = null);
    if (o.decorateValidation == null) {
      o.decorateValidation = true;
    }
    o.hint || (o.hint = null);
    if (o.autogrow == null) {
      o.autogrow = false;
    }
    if (o.enableTabKey == null) {
      o.enableTabKey = false;
    }
    o.forceCase || (o.forceCase = null);
    o.bind = KD.utils.curry('blur change focus paste cut input copy', o.bind);
    this.setType(o.type);
    KDInputView.__super__.constructor.call(this, o, data);
    options = this.getOptions();
    this.validationNotifications = {};
    this.valid = true;
    this.inputCallback = null;
    this.previousHeight = null;
    this.setName(options.name);
    this.setLabel();
    this.setCallback();
    this.setDefaultValue(options.defaultValue);
    this.setPlaceholder(options.placeholder);
    if (options.disabled) {
      this.makeDisabled();
    }
    if ((options.selectOptions != null) && 'function' !== typeof options.selectOptions) {
      this.setSelectOptions(options.selectOptions);
    }
    if (options.autogrow) {
      this.setAutoGrow();
    }
    if (options.enableTabKey) {
      this.enableTabKey();
    }
    if (options.forceCase) {
      this.setCase(options.forceCase);
    }
    if (options.required) {
      (function(v) {
        if (v.rules == null) {
          v.rules = {};
        }
        if (v.messages == null) {
          v.messages = {};
        }
        v.rules.required = true;
        return v.messages.required = options.required;
      })(options.validate != null ? options.validate : options.validate = {});
    }
    if (options.validate) {
      this.setValidation(options.validate);
    }
    this.bindValidationEvents();
    if (options.type === "select" && options.selectOptions) {
      this.on("viewAppended", (function(_this) {
        return function() {
          var kallback;
          o = _this.getOptions();
          if ('function' === typeof o.selectOptions) {
            kallback = _this.bound("setSelectOptions");
            return o.selectOptions.call(_this, kallback);
          } else if (!o.selectOptions.length) {
            if (!o.defaultValue) {
              return _this.setValue(o.selectOptions[Object.keys(o.selectOptions)[0]][0].value);
            }
          } else {
            if (!o.defaultValue) {
              return _this.setValue(o.selectOptions[0].value);
            }
          }
        };
      })(this));
    }
    if (o.autogrow) {
      this.once("focus", (function(_this) {
        return function() {
          if (!_this.initialHeight) {
            return _this.initialHeight = _this.$().height();
          }
        };
      })(this));
    }
  }

  KDInputView.prototype.setDomElement = function(cssClass) {
    var name;
    if (cssClass == null) {
      cssClass = "";
    }
    name = "name='" + this.options.name + "'";
    return this.domElement = (function() {
      switch (this.getType()) {
        case "text":
          return $("<input " + name + " type='text' class='kdinput text " + cssClass + "'/>");
        case "password":
          return $("<input " + name + " type='password' class='kdinput text " + cssClass + "'/>");
        case "hidden":
          return $("<input " + name + " type='hidden' class='kdinput hidden " + cssClass + "'/>");
        case "checkbox":
          return $("<input " + name + " type='checkbox' class='kdinput checkbox " + cssClass + "'/>");
        case "textarea":
          return $("<textarea " + name + " class='kdinput text " + cssClass + "'></textarea>");
        case "select":
          return $("<select " + name + " class='kdinput select " + cssClass + "'/>");
        case "range":
          return $("<input " + name + " type='range' class='kdinput range " + cssClass + "'/>");
        default:
          return $("<input " + name + " type='" + (this.getType()) + "' class='kdinput " + (this.getType()) + " " + cssClass + "'/>");
      }
    }).call(this);
  };

  KDInputView.prototype.bindValidationEvents = function() {
    this.on("ValidationError", this.bound("giveValidationFeedback"));
    this.on("ValidationPassed", this.bound("giveValidationFeedback"));
    return this.on("focus", this.bound("clearValidationFeedback"));
  };

  KDInputView.prototype.setLabel = function(label) {
    if (label == null) {
      label = this.getOptions().label;
    }
    if (!label) {
      return;
    }
    this.inputLabel = label;
    this.inputLabel.$()[0].setAttribute("for", this.getName());
    return this.inputLabel.$().bind("click", (function(_this) {
      return function() {
        _this.$().trigger("focus");
        return _this.$().trigger("click");
      };
    })(this));
  };

  KDInputView.prototype.getLabel = function() {
    return this.inputLabel;
  };

  KDInputView.prototype.setCallback = function() {
    return this.inputCallback = this.getOptions().callback;
  };

  KDInputView.prototype.getCallback = function() {
    return this.inputCallback;
  };

  KDInputView.prototype.setType = function(inputType) {
    this.inputType = inputType != null ? inputType : "text";
  };

  KDInputView.prototype.getType = function() {
    return this.inputType;
  };

  KDInputView.prototype.setName = function(inputName) {
    this.inputName = inputName;
  };

  KDInputView.prototype.getName = function() {
    return this.inputName;
  };

  KDInputView.prototype.setFocus = function() {
    (KD.getSingleton("windowController")).setKeyView(this);
    return this.$().trigger('focus');
  };

  KDInputView.prototype.setBlur = function() {
    (KD.getSingleton("windowController")).setKeyView(null);
    return this.$().trigger('blur');
  };

  KDInputView.prototype.setSelectOptions = function(options) {
    var $optGroup, i, j, len, len1, optGroup, option, subOptions;
    if (!options.length) {
      for (optGroup in options) {
        if (!hasProp.call(options, optGroup)) continue;
        subOptions = options[optGroup];
        $optGroup = $("<optgroup label='" + optGroup + "'/>");
        this.$().append($optGroup);
        for (i = 0, len = subOptions.length; i < len; i++) {
          option = subOptions[i];
          $optGroup.append("<option value='" + option.value + "'>" + option.title + "</option>");
        }
      }
    } else if (options.length) {
      for (j = 0, len1 = options.length; j < len1; j++) {
        option = options[j];
        this.$().append("<option value='" + option.value + "'>" + option.title + "</option>");
      }
    } else {
      KD.warn("no valid options specified for the input:", this);
    }
    return this.$().val(this.getDefaultValue());
  };

  KDInputView.prototype.setDefaultValue = function(value) {
    if ((value == null) && value !== '') {
      return;
    }
    KDInputView.prototype.setValue.call(this, value);
    return this.inputDefaultValue = value;
  };

  KDInputView.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDInputView.prototype.setPlaceholder = function(value) {
    if (this.$().is("input") || this.$().is("textarea")) {
      this.$().attr("placeholder", value);
      return this.options.placeholder = value;
    }
  };


  /**
   * Disable this input field.
   */

  KDInputView.prototype.makeDisabled = function() {
    return this.getDomElement().attr("disabled", "disabled");
  };


  /**
   * Enable this input field.
   */

  KDInputView.prototype.makeEnabled = function() {
    return this.getDomElement().removeAttr("disabled");
  };


  /**
   * Get the value of this input field.
   */

  KDInputView.prototype.getValue = function() {
    var forceCase, value;
    if (this.getOption("type") === "checkbox") {
      value = this.$().is(':checked');
    } else {
      value = this.getDomElement().val();
      forceCase = this.getOptions().forceCase;
      if (forceCase) {
        value = forceCase.toLowerCase() === 'uppercase' ? value.toUpperCase() : value.toLowerCase();
      }
    }
    return value;
  };


  /**
   * Set the value of this input field.
   */

  KDInputView.prototype.setValue = function(value) {
    var $el, el, ref;
    $el = this.$();
    el = $el[0];
    if ((ref = this.getOption("type")) === "checkbox" || ref === "radio") {
      if (value) {
        return el.setAttribute("checked", "checked");
      } else {
        return el.removeAttribute("checked");
      }
    } else {
      return $el.val(value);
    }
  };

  KDInputView.prototype.setCase = function(forceCase) {
    var cb;
    cb = (function(_this) {
      return function() {
        var $el, el, end, start, val;
        $el = _this.getDomElement();
        el = $el[0];
        val = _this.getValue();
        if (val === $el.val()) {
          return;
        }
        start = el.selectionStart;
        end = el.selectionEnd;
        _this.setValue(val);
        if (el.setSelectionRange) {
          return el.setSelectionRange(start, end);
        }
      };
    })(this);
    this.on("keyup", cb);
    return this.on("blur", cb);
  };

  KDInputView.prototype.unsetValidation = function() {
    return this.setValidation({});
  };

  KDInputView.prototype.setValidation = function(ruleSet) {
    var i, len, oldCallback, oldCallbacks, oldEventName, ref;
    this.valid = false;
    this.currentRuleset = ruleSet;
    this.validationCallbacks || (this.validationCallbacks = {});
    this.createRuleChain(ruleSet);
    ref = this.validationCallbacks;
    for (oldEventName in ref) {
      if (!hasProp.call(ref, oldEventName)) continue;
      oldCallbacks = ref[oldEventName];
      for (i = 0, len = oldCallbacks.length; i < len; i++) {
        oldCallback = oldCallbacks[i];
        this.off(oldEventName, oldCallback);
      }
    }
    return this.ruleChain.forEach((function(_this) {
      return function(rule) {
        var base, cb, eventName;
        eventName = ruleSet.events ? ruleSet.events[rule] ? ruleSet.events[rule] : ruleSet.event ? ruleSet.event : void 0 : ruleSet.event ? ruleSet.event : void 0;
        if (eventName) {
          (base = _this.validationCallbacks)[eventName] || (base[eventName] = []);
          _this.validationCallbacks[eventName].push(cb = function(event) {
            if (indexOf.call(_this.ruleChain, rule) >= 0) {
              return _this.validate(rule, event);
            }
          });
          return _this.on(eventName, cb);
        }
      };
    })(this));
  };

  KDInputView.prototype.validate = function(rule, event) {
    var allClear, errMsg, ref, result, ruleSet, rulesToBeValidated;
    if (event == null) {
      event = {};
    }
    this.ruleChain || (this.ruleChain = []);
    this.validationResults || (this.validationResults = {});
    rulesToBeValidated = rule ? [rule] : this.ruleChain;
    ruleSet = this.currentRuleset || this.getOptions().validate;
    if (this.ruleChain.length > 0) {
      rulesToBeValidated.forEach((function(_this) {
        return function(rule) {
          var result;
          if (KDInputValidator["rule" + (rule.capitalize())] != null) {
            result = KDInputValidator["rule" + (rule.capitalize())](_this, event);
            return _this.setValidationResult(rule, result);
          } else if ("function" === typeof ruleSet.rules[rule]) {
            return ruleSet.rules[rule](_this, event);
          }
        };
      })(this));
    } else {
      this.valid = true;
    }
    allClear = true;
    ref = this.validationResults;
    for (result in ref) {
      if (!hasProp.call(ref, result)) continue;
      errMsg = ref[result];
      if (errMsg) {
        allClear = false;
      }
    }
    this.valid = allClear ? true : false;
    if (this.valid) {
      this.emit("ValidationPassed");
    }
    this.emit("ValidationResult", this.valid);
    return this.valid;
  };

  KDInputView.prototype.createRuleChain = function(ruleSet) {
    var i, len, ref, results, rule, rules, value;
    rules = ruleSet.rules;
    this.validationResults || (this.validationResults = {});
    this.ruleChain = typeof rules === "object" ? (function() {
      var results;
      results = [];
      for (rule in rules) {
        if (!hasProp.call(rules, rule)) continue;
        value = rules[rule];
        results.push(rule);
      }
      return results;
    })() : [rules];
    ref = this.ruleChain;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      rule = ref[i];
      results.push(this.validationResults[rule] = null);
    }
    return results;
  };

  KDInputView.prototype.setValidationResult = function(rule, err, showNotification) {
    var k, v;
    if (showNotification == null) {
      showNotification = true;
    }
    if (err) {
      this.validationResults[rule] = err;
      if (this.getOptions().validate.notifications && showNotification) {
        this.showValidationError(err);
      }
      this.emit("ValidationError", err);
      return this.valid = false;
    } else {
      this.validationResults[rule] = null;
      return this.valid = !(((function() {
        var ref, results;
        ref = this.validationResults;
        results = [];
        for (k in ref) {
          if (!hasProp.call(ref, k)) continue;
          v = ref[k];
          results.push(v);
        }
        return results;
      }).call(this)).map(function(result) {
        return Boolean(result);
      }).indexOf(true) > -1);
    }
  };

  KDInputView.prototype.showValidationError = function(message) {
    var container, notice, notifications, ref, ref1, str;
    if ((ref = this.validationNotifications[message]) != null) {
      ref.destroy();
    }
    ref1 = this.getOption('validate'), container = ref1.container, notifications = ref1.notifications;
    if ((notifications != null ? notifications.type : void 0) === 'tooltip') {
      if (this.tooltip) {
        str = "- " + message + "<br>" + (this.tooltip.getOption('title'));
      }
      this.unsetTooltip();
      notifications = {
        cssClass: notifications.cssClass || 'input-validation',
        delegate: notifications.delegate || this,
        title: notifications.title || str || message,
        placement: notifications.placement || 'right',
        direction: notifications.direction || 'left',
        forcePosition: true
      };
      this.validationNotifications[message] = notice = this.setTooltip(notifications);
      notice.show();
    } else if (notifications) {
      this.validationNotifications[message] = notice = new KDNotificationView({
        container: container,
        title: message,
        type: 'growl',
        cssClass: 'mini',
        duration: 2500
      });
    }
    return notice.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        message = notice.getOptions().title;
        return delete _this.validationNotifications[message];
      };
    })(this));
  };

  KDInputView.prototype.clearValidationFeedback = function() {
    this.unsetClass("validation-error validation-passed");
    return this.emit("ValidationFeedbackCleared");
  };

  KDInputView.prototype.giveValidationFeedback = function(err) {
    if (!this.getOption("decorateValidation")) {
      return;
    }
    if (err) {
      return this.setClass("validation-error");
    } else {
      this.setClass("validation-passed");
      return this.unsetClass("validation-error");
    }
  };

  KDInputView.prototype.setCaretPosition = function(pos) {
    return this.selectRange(pos, pos);
  };

  KDInputView.prototype.getCaretPosition = function() {
    var el, r, rc, re;
    el = this.$()[0];
    if (el.selectionStart) {
      return el.selectionStart;
    } else if (document.selection) {
      el.focus();
      r = document.selection.createRange();
      if (!r) {
        return 0;
      }
      re = el.createTextRange();
      rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }
    return 0;
  };

  KDInputView.prototype.selectAll = function() {
    return this.getDomElement().select();
  };

  KDInputView.prototype.selectRange = function(selectionStart, selectionEnd) {
    var input, range;
    input = this.$()[0];
    if (input.setSelectionRange) {
      input.focus();
      return input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      return range.select();
    }
  };

  KDInputView.prototype.setAutoGrow = function() {
    var $input;
    $input = this.$();
    $input.css('overflow', 'hidden');
    this.setClass('autogrow');
    this._clone = $('<div/>', {
      "class": 'invisible'
    });
    this.on('focus', (function(_this) {
      return function() {
        _this._clone.appendTo('body');
        return _this._clone.css({
          height: 'auto',
          zIndex: 100000,
          width: $input.css('width'),
          boxSizing: $input.css('box-sizing'),
          borderTop: $input.css('border-top'),
          borderRight: $input.css('border-right'),
          borderBottom: $input.css('border-bottom'),
          borderLeft: $input.css('border-left'),
          minHeight: $input.css('minHeight'),
          maxHeight: $input.css('maxHeight'),
          paddingTop: $input.css('padding-top'),
          paddingRight: $input.css('padding-right'),
          paddingBottom: $input.css('padding-bottom'),
          paddingLeft: $input.css('padding-left'),
          wordBreak: $input.css('wordBreak'),
          fontSize: $input.css('fontSize'),
          fontWeight: $input.css('fontWeight'),
          lineHeight: $input.css('lineHeight'),
          whiteSpace: 'pre-line'
        });
      };
    })(this));
    this.on('blur', (function(_this) {
      return function() {
        return _this._clone.detach();
      };
    })(this));
    return this.on('input', (function(_this) {
      return function(event) {
        return KD.utils.defer(function() {
          return _this.resize(event);
        });
      };
    })(this));
  };

  KDInputView.prototype.resize = function(event) {
    var border, getValue, height, newHeight, padding, safeValue, val;
    if (!this._clone) {
      return;
    }
    if (!document.body.contains(this._clone[0])) {
      this._clone.appendTo('body');
    }
    val = this.getElement().value.replace(/\n/g, '\n&nbsp;');
    safeValue = Encoder.XSSEncode(val);
    this._clone.html(safeValue);
    height = this._clone.height();
    getValue = (function(_this) {
      return function(rule) {
        return parseInt(_this._clone.css(rule), 10);
      };
    })(this);
    if (this.$().css('boxSizing') === 'border-box') {
      padding = getValue('paddingTop') + getValue('paddingBottom');
      border = getValue('borderTopWidth') + getValue('borderBottomWidth');
      height = height + border + padding;
    }
    newHeight = this.initialHeight ? Math.max(this.initialHeight, height) : height;
    if (this.previousHeight !== newHeight) {
      this.setHeight(newHeight);
      this.emit('InputHeightChanged');
    }
    return this.previousHeight = newHeight;
  };

  KDInputView.prototype.enableTabKey = function() {
    return this.inputTabKeyEnabled = true;
  };

  KDInputView.prototype.disableTabKey = function() {
    return this.inputTabKeyEnabled = false;
  };

  KDInputView.prototype.change = function() {};

  KDInputView.prototype.keyUp = function() {
    return true;
  };

  KDInputView.prototype.keyDown = function(event) {
    if (this.inputTabKeyEnabled) {
      this.checkTabKey(event);
    }
    return true;
  };

  KDInputView.prototype.focus = function() {
    this.setKeyView();
    return true;
  };

  KDInputView.prototype.blur = function() {
    KD.getSingleton("windowController").revertKeyView(this);
    return true;
  };

  KDInputView.prototype.mouseDown = function() {
    this.setFocus();
    return false;
  };

  KDInputView.prototype.checkTabKey = function(event) {
    var post, pre, se, sel, ss, t, tab, tabLength;
    tab = "  ";
    tabLength = tab.length;
    t = event.target;
    ss = t.selectionStart;
    se = t.selectionEnd;
    if (event.which === 9) {
      event.preventDefault();
      if (ss !== se && t.value.slice(ss, se).indexOf("n") !== -1) {
        pre = t.value.slice(0, ss);
        sel = t.value.slice(ss, se).replace(/n/g, "n" + tab);
        post = t.value.slice(se, t.value.length);
        t.value = pre.concat(tab).concat(sel).concat(post);
        t.selectionStart = ss + tab.length;
        return t.selectionEnd = se + tab.length;
      } else {
        t.value = t.value.slice(0, ss).concat(tab).concat(t.value.slice(ss, t.value.length));
        if (ss === se) {
          return t.selectionStart = t.selectionEnd = ss + tab.length;
        } else {
          t.selectionStart = ss + tab.length;
          return t.selectionEnd = se + tab.length;
        }
      }
    } else if (event.which === 8 && t.value.slice(ss - tabLength, ss) === tab) {
      event.preventDefault();
      t.value = t.value.slice(0, ss - tabLength).concat(t.value.slice(ss, t.value.length));
      return t.selectionStart = t.selectionEnd = ss - tab.length;
    } else if (event.which === 46 && t.value.slice(se, se + tabLength) === tab) {
      event.preventDefault();
      t.value = t.value.slice(0, ss).concat(t.value.slice(ss + tabLength, t.value.length));
      return t.selectionStart = t.selectionEnd = ss;
    } else if (event.which === 37 && t.value.slice(ss - tabLength, ss) === tab) {
      event.preventDefault();
      return t.selectionStart = t.selectionEnd = ss - tabLength;
    } else if (event.which === 39 && t.value.slice(ss, ss + tabLength) === tab) {
      event.preventDefault();
      return t.selectionStart = t.selectionEnd = ss + tabLength;
    }
  };

  return KDInputView;

})(KDView);

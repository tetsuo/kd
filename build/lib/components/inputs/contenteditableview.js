var $, Encoder, KD, KDContentEditableView, KDInputValidator, KDNotificationView, KDView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDInputValidator = require('./inputvalidator');

KDView = require('../../core/view');

KDNotificationView = require('../notifications/notificationview');

Encoder = require('htmlencode');

module.exports = KDContentEditableView = (function(superClass) {
  extend(KDContentEditableView, superClass);

  function KDContentEditableView(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    this.keyDown = bind(this.keyDown, this);
    this.input = bind(this.input, this);
    this.click = bind(this.click, this);
    options.cssClass = KD.utils.curry("kdcontenteditableview", options.cssClass);
    options.bind = KD.utils.curry("click input paste drop focus blur", options.bind);
    options.type || (options.type = "text");
    if (options.multiline == null) {
      options.multiline = false;
    }
    options.placeholder || (options.placeholder = "");
    if (options.tabNavigation == null) {
      options.tabNavigation = false;
    }
    KDContentEditableView.__super__.constructor.call(this, options, data);
    if ((ref = this.getDelegate()) != null) {
      ref.on("EditingModeToggled", (function(_this) {
        return function(state) {
          return _this.setEditingMode(state);
        };
      })(this));
    }
    document.addEventListener('focus', (function(_this) {
      return function(event) {
        if (event.target === _this.editableElement) {
          return _this.focus();
        }
      };
    })(this), true);
    document.addEventListener('blur', (function(_this) {
      return function(event) {
        if (event.target === _this.editableElement) {
          return _this.blur();
        }
      };
    })(this), true);
    this.validationNotifications = {};
  }

  KDContentEditableView.prototype.viewAppended = function() {
    this.setEditingMode(false);
    return KDContentEditableView.__super__.viewAppended.apply(this, arguments);
  };

  KDContentEditableView.prototype.getEditableElement = function() {
    if (!this.editableElement) {
      if (this.getData()) {
        this.editableElement = this.getElement().children[0];
      } else {
        this.editableElement = document.createElement("div");
        this.getDomElement().append(this.editableElement);
      }
    }
    return this.editableElement;
  };

  KDContentEditableView.prototype.getEditableDomElement = function() {
    if (!this.editableDomElement) {
      this.editableDomElement = $(this.getEditableElement());
    }
    return this.editableDomElement;
  };

  KDContentEditableView.prototype.setEditingMode = function(state) {
    this.editingMode = state;
    this.getEditableElement().setAttribute("contenteditable", state);
    if (this.getValue() === "") {
      if (this.editingMode && this.getOptions().placeholder) {
        return this.setPlaceholder();
      } else {
        return this.unsetPlaceholder();
      }
    }
  };

  KDContentEditableView.prototype.getValue = function(forceType) {
    var element, placeholder, ref, type, value;
    ref = this.getOptions(), type = ref.type, placeholder = ref.placeholder;
    element = this.getEditableElement();
    if (forceType) {
      type = forceType;
    }
    switch (type) {
      case "text":
        value = element.textContent;
        break;
      case "html":
        value = element.innerHTML;
    }
    if (value === Encoder.htmlDecode(placeholder)) {
      return "";
    } else {
      return value.trim();
    }
  };

  KDContentEditableView.prototype.setContent = function(content) {
    var element, type;
    type = this.getOptions().type;
    element = this.getEditableElement();
    if (content) {
      switch (type) {
        case "text":
          return element.textContent = content;
        case "html":
          return element.innerHTML = content;
      }
    } else if (this.editingMode && content === "") {
      return this.setPlaceholder();
    }
  };

  KDContentEditableView.prototype.focus = function() {
    var base, windowController;
    if (this.getValue().length === 0) {
      this.unsetPlaceholder();
    }
    this.getEditableDomElement().trigger('focus');
    windowController = KD.getSingleton('windowController');
    windowController.addLayer(this);
    this.setKeyView();
    if (!this.focused) {
      this.once("ReceivedClickElsewhere", this.bound('blur'));
    }
    this.focused = true;
    return typeof (base = this.getOptions()).focus === "function" ? base.focus() : void 0;
  };

  KDContentEditableView.prototype.blur = function() {
    var windowController;
    this.focused = false;
    windowController = KD.getSingleton('windowController');
    windowController.removeLayer(this);
    this.unsetKeyView();
    if (this.getValue('text').length === 0) {
      this.setPlaceholder();
    } else {
      if (this.getOptions().type !== 'html') {
        this.setContent(this.getValue());
      }
    }
    return this.emit('BlurHappened');
  };

  KDContentEditableView.prototype.click = function() {
    if (this.editingMode && !this.focused) {
      return this.focus();
    }
  };

  KDContentEditableView.prototype.input = function(event) {
    return this.emit("ValueChanged", event);
  };

  KDContentEditableView.prototype.keyDown = function(event) {
    var maxLength, multiline, ref, ref1, ref2, tabNavigation, validate, value;
    ref = this.getOptions(), tabNavigation = ref.tabNavigation, multiline = ref.multiline, validate = ref.validate;
    switch (event.which) {
      case 9:
        if (tabNavigation) {
          KD.utils.stopDOMEvent(event);
        }
        break;
      case 13:
        KD.utils.stopDOMEvent(event);
    }
    switch (event.which) {
      case 9:
        if (!tabNavigation) {
          break;
        }
        this.blur();
        if (event.shiftKey) {
          this.emit("PreviousTabStop");
        } else {
          this.emit("NextTabStop");
        }
        break;
      case 13:
        if (this.getOptions().multiline) {
          this.appendNewline();
        } else {
          this.emit("EnterPressed");
        }
    }
    value = this.getValue();
    maxLength = ((ref1 = this.getOptions().validate) != null ? (ref2 = ref1.rules) != null ? ref2.maxLength : void 0 : void 0) || 0;
    if (event.which === 13 || (maxLength > 0 && value.length === maxLength)) {
      return event.preventDefault();
    } else if (value.length === 0) {
      this.unsetPlaceholder();
      if (event.target !== this.getEditableElement()) {
        return this.focus();
      }
    }
  };

  KDContentEditableView.prototype.paste = function(event) {
    var text;
    event.preventDefault();
    text = event.originalEvent.clipboardData.getData("text/plain");
    return document.execCommand("insertText", false, text);
  };

  KDContentEditableView.prototype.drop = function(event) {
    var clientX, clientY, commonAncestorContainer, endOffset, ref, ref1, startOffset, text;
    event.preventDefault();
    text = event.originalEvent.dataTransfer.getData("text/plain");
    ref = event.originalEvent, clientX = ref.clientX, clientY = ref.clientY;
    if (this.getValue() === "") {
      startOffset = 0;
      this.unsetPlaceholder();
    }
    ref1 = document.caretRangeFromPoint(clientX, clientY), commonAncestorContainer = ref1.commonAncestorContainer, startOffset = ref1.startOffset, endOffset = ref1.endOffset;
    return this.utils.replaceRange(commonAncestorContainer, text, startOffset);
  };

  KDContentEditableView.prototype.setPlaceholder = function() {
    var placeholder;
    this.setClass("placeholder");
    placeholder = this.getOptions().placeholder;
    if (placeholder) {
      return this.setContent(placeholder);
    }
  };

  KDContentEditableView.prototype.unsetPlaceholder = function() {
    var content, defaultValue, element, value;
    this.unsetClass("placeholder");
    content = "";
    defaultValue = this.getOptions().defaultValue;
    value = this.getValue();
    if (this.editingMode) {
      content = value || "";
    } else {
      content = value || defaultValue || "";
    }
    element = this.getEditableDomElement();
    element.text("");
    return element.append(document.createTextNode(content));
  };

  KDContentEditableView.prototype.validate = function(event) {
    var message, name, ref, ref1, rule, valid, validator;
    valid = true;
    ref1 = ((ref = this.getOptions().validate) != null ? ref.rules : void 0) || {};
    for (name in ref1) {
      if (!hasProp.call(ref1, name)) continue;
      rule = ref1[name];
      validator = KDInputValidator["rule" + (name.capitalize())];
      if (validator && (message = validator(this, event))) {
        valid = false;
        this.notify(message, {
          title: message,
          type: "mini",
          cssClass: "error",
          duration: 2500
        });
        break;
      }
    }
    return valid;
  };

  KDContentEditableView.prototype.notify = function(message, options) {
    var notice;
    this.validationNotifications[message] = notice = new KDNotificationView(options);
    return notice.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        message = notice.getOptions().title;
        return delete _this.validationNotifications[message];
      };
    })(this));
  };

  KDContentEditableView.prototype.appendNewline = function() {
    var count, i, j, newline, range, ref, selection;
    selection = window.getSelection();
    count = selection.baseNode.length === selection.focusOffset ? 1 : 0;
    range = selection.getRangeAt(0);
    for (i = j = 0, ref = count; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      range.insertNode(newline = document.createElement("br"));
    }
    return this.utils.selectEnd(newline);
  };

  KDContentEditableView.prototype.viewAppended = function() {
    KDContentEditableView.__super__.viewAppended.apply(this, arguments);
    if (!this.editingMode && this.getValue().length === 0) {
      return this.unsetPlaceholder();
    }
  };

  return KDContentEditableView;

})(KDView);

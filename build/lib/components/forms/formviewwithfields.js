var KD, KDButtonBar, KDCustomHTMLView, KDFormView, KDFormViewWithFields, KDInputView, KDLabelView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDInputView = require('../inputs/inputview');

KDView = require('../../core/view');

KDCustomHTMLView = require('../../core/customhtmlview');

KDFormView = require('./formview');

KDButtonBar = require('../buttons/buttonbar');

KDLabelView = require('../inputs/labelview');

module.exports = KDFormViewWithFields = (function(superClass) {
  extend(KDFormViewWithFields, superClass);

  function KDFormViewWithFields() {
    var buttons, fields, ref;
    KDFormViewWithFields.__super__.constructor.apply(this, arguments);
    this.setClass("with-fields");
    this.inputs = {};
    this.fields = {};
    ref = this.getOptions(), fields = ref.fields, buttons = ref.buttons;
    if (fields) {
      this.createFields(KDFormView.sanitizeFormOptions(fields));
    }
    if (buttons) {
      this.createButtons(buttons);
      this.buttons = this.buttonField.buttons;
    }
  }

  KDFormViewWithFields.prototype.createFields = function(fields) {
    var fieldData, i, len, results;
    results = [];
    for (i = 0, len = fields.length; i < len; i++) {
      fieldData = fields[i];
      results.push(this.addSubView(this.createField(fieldData)));
    }
    return results;
  };

  KDFormViewWithFields.prototype.createButtons = function(buttons) {
    return this.addSubView(this.buttonField = new KDButtonBar({
      buttons: buttons
    }));
  };

  KDFormViewWithFields.prototype.createField = function(fieldData, field, isNextElement) {
    var hint, input, inputWrapper, itemClass, key, label, next, ref, ref1, title;
    if (isNextElement == null) {
      isNextElement = false;
    }
    itemClass = fieldData.itemClass, title = fieldData.title;
    itemClass || (itemClass = KDInputView);
    fieldData.cssClass || (fieldData.cssClass = "");
    fieldData.name || (fieldData.name = title);
    field || (field = new KDView({
      cssClass: "formline " + (KD.utils.slugify(fieldData.name)) + " " + fieldData.cssClass
    }));
    if (fieldData.label) {
      field.addSubView(label = fieldData.label = this.createLabel(fieldData));
    }
    if (!isNextElement) {
      field.addSubView(inputWrapper = new KDCustomHTMLView({
        cssClass: "input-wrapper"
      }));
      inputWrapper.addSubView(input = this.createInput(itemClass, fieldData));
    } else {
      field.addSubView(input = this.createInput(itemClass, fieldData));
    }
    if (fieldData.hint) {
      inputWrapper.addSubView(hint = new KDCustomHTMLView({
        partial: fieldData.hint,
        tagName: "cite",
        cssClass: "hint"
      }));
    }
    this.fields[title] = field;
    if (fieldData.nextElement) {
      ref = fieldData.nextElement;
      for (key in ref) {
        next = ref[key];
        next.title || (next.title = key);
        this.createField(next, inputWrapper || field, true);
      }
    }
    if (fieldData.nextElementFlat) {
      ref1 = fieldData.nextElementFlat;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        next = ref1[key];
        next.title || (next.title = key);
        this.createField(next, field);
      }
    }
    return field;
  };

  KDFormViewWithFields.prototype.createLabel = function(data) {
    return new KDLabelView({
      title: data.label,
      cssClass: this.utils.slugify(data.label)
    });
  };

  KDFormViewWithFields.prototype.createInput = function(itemClass, options) {
    var data, input;
    data = options.data;
    if (data) {
      delete options.data;
    }
    this.inputs[options.title] = input = new itemClass(options, data);
    return input;
  };

  return KDFormViewWithFields;

})(KDFormView);

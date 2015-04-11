var $, KD, KDAutoComplete, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDInputView = require('../inputs/inputview');

module.exports = KDAutoComplete = (function(superClass) {
  extend(KDAutoComplete, superClass);

  function KDAutoComplete() {
    return KDAutoComplete.__super__.constructor.apply(this, arguments);
  }

  KDAutoComplete.prototype.mouseDown = function() {
    return this.focus();
  };

  KDAutoComplete.prototype.setDomElement = function() {
    return this.domElement = $("<div class='kdautocompletewrapper clearfix'><input type='text' placeholder='" + (this.getOptions().placeholder) + "' class='kdinput text'/></div>");
  };

  KDAutoComplete.prototype.setDomId = function() {
    this.$input().attr('id', this.getDomId());
    this.$input().attr('name', this.getName());
    return this.$input().data('data-id', this.getId());
  };

  KDAutoComplete.prototype.setDefaultValue = function(value) {
    this.inputDefaultValue = value;
    return this.setValue(value);
  };

  KDAutoComplete.prototype.$input = function() {
    return this.$("input").eq(0);
  };

  KDAutoComplete.prototype.getValue = function() {
    return this.$input().val();
  };

  KDAutoComplete.prototype.setValue = function(value) {
    return this.$input().val(value);
  };

  KDAutoComplete.prototype.bindEvents = function() {
    return KDAutoComplete.__super__.bindEvents.call(this, this.$input());
  };

  KDAutoComplete.prototype.blur = function(event) {
    this.unsetClass('focus');
    return true;
  };

  KDAutoComplete.prototype.focus = function(event) {
    this.setClass("focus");
    return KDAutoComplete.__super__.focus.apply(this, arguments);
  };

  KDAutoComplete.prototype.keyDown = function(event) {
    (KD.getSingleton("windowController")).setKeyView(this);
    return true;
  };

  KDAutoComplete.prototype.getLeftOffset = function() {
    return this.$input().prev().width();
  };

  KDAutoComplete.prototype.setPlaceholder = function(value) {
    return this.$input()[0].setAttribute("placeholder", value);
  };

  KDAutoComplete.prototype.setFocus = function() {
    KDAutoComplete.__super__.setFocus.apply(this, arguments);
    return this.$input().trigger("focus");
  };

  KDAutoComplete.prototype.setBlur = function() {
    KDAutoComplete.__super__.setBlur.apply(this, arguments);
    return this.$input().trigger("blur");
  };

  return KDAutoComplete;

})(KDInputView);

var $, KD, KDInputView, KDMultipleInputView, KDSimpleAutocomplete, MultipleInputListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = require('jquery');

KD = require('../../core/kd');

KDSimpleAutocomplete = require('./simpleautocomplete');

MultipleInputListView = require('./multipleinputlistview');

KDInputView = require('../inputs/inputview');

module.exports = KDMultipleInputView = (function(superClass) {
  extend(KDMultipleInputView, superClass);

  function KDMultipleInputView(options) {
    this._values = [];
    options = $.extend({
      icon: 'noicon',
      title: ''
    }, options);
    KDMultipleInputView.__super__.constructor.call(this, options);
  }

  KDMultipleInputView.prototype.focus = function(pubInst, event) {
    return (KD.getSingleton("windowController")).setKeyView(this);
  };

  KDMultipleInputView.prototype.viewAppended = function() {
    this.list = new MultipleInputListView({
      delegate: this
    });
    return this.addSubView(this.list);
  };

  KDMultipleInputView.prototype.$input = function() {
    return this.$().find("input.main").eq(0);
  };

  KDMultipleInputView.prototype.getValues = function() {
    return this._values;
  };

  KDMultipleInputView.prototype.addItemToSubmitQueue = function() {
    KDMultipleInputView.__super__.addItemToSubmitQueue.apply(this, arguments);
    return this.inputAddCurrentValue();
  };

  KDMultipleInputView.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      this.inputAddCurrentValue();
    }
    return KDMultipleInputView.__super__.keyUp.apply(this, arguments);
  };

  KDMultipleInputView.prototype.inputRemoveValue = function(value) {
    var index;
    index = this._values.indexOf(value);
    if (index > -1) {
      this._values.splice(index, 1);
    }
    return this._inputChanged();
  };

  KDMultipleInputView.prototype.clear = function() {
    this._values = [];
    this.removeAllItems();
    return this._inputChanged();
  };

  KDMultipleInputView.prototype.inputAddCurrentValue = function() {
    var value;
    value = this.$input().val();
    value = $.trim(value);
    if (indexOf.call(this._values, value) >= 0 || value === '') {
      return;
    }
    this._values.push(value);
    this.$input().val('');
    this.list.addItems([value]);
    return this._inputChanged();
  };

  KDMultipleInputView.prototype._inputChanged = function() {
    var i, index, input, inputName, j, len, len1, newInput, ref, ref1, value;
    if (!this._hiddenInputs) {
      this._hiddenInputs = [];
    }
    ref = this._hiddenInputs;
    for (i = 0, len = ref.length; i < len; i++) {
      input = ref[i];
      input.destroy();
    }
    inputName = this.getOptions().name;
    ref1 = this._values;
    for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
      value = ref1[index];
      newInput = new KDInputView({
        type: 'hidden',
        name: inputName + ("[" + index + "]"),
        defaultValue: value
      });
      this._hiddenInputs.push(newInput);
      this.addSubView(newInput);
    }
    return this.emit('MultipleInputChanged', {
      values: this.getValue()
    });
  };

  KDMultipleInputView.prototype.click = function(event) {
    if ($(event.target).hasClass('addNewItem')) {
      return this.inputAddCurrentValue();
    }
  };

  KDMultipleInputView.prototype.setDomId = function() {
    this.$input().attr("id", this.getDomId());
    return this.$input().data("data-id", this.getId());
  };

  KDMultipleInputView.prototype.setDomElement = function() {
    return this.domElement = $("<div class='filter kdview'> <h2>" + (this.getOptions().title) + "</h2> <div class='clearfix'> <span class='" + (this.getOptions().icon) + "'></span> <input type='text' class='main'> <a href='#' class='addNewItem'>+</a> </div> </div>");
  };

  return KDMultipleInputView;

})(KDSimpleAutocomplete);

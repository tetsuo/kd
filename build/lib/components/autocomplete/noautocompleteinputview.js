var $, KDMultipleInputView, NoAutocompleteInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDMultipleInputView = require('./multipleinputview');

module.exports = NoAutocompleteInputView = (function(superClass) {
  extend(NoAutocompleteInputView, superClass);

  function NoAutocompleteInputView() {
    return NoAutocompleteInputView.__super__.constructor.apply(this, arguments);
  }

  NoAutocompleteInputView.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      return this.inputAddCurrentValue();
    }
  };

  NoAutocompleteInputView.prototype.setDomElement = function(cssClass) {
    var placeholder;
    placeholder = this.getOptions().placeholder;
    return this.domElement = $("<div class='" + cssClass + "'><input type='text' class='main' placeholder='" + (placeholder || '') + "' /></div>");
  };

  NoAutocompleteInputView.prototype.addItemToSubmitQueue = function(item) {
    return false;
  };

  return NoAutocompleteInputView;

})(KDMultipleInputView);

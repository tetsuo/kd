var JsPath, KDAutoComplete, KDSimpleAutocomplete,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

JsPath = require('jspath');

KDAutoComplete = require('./autocomplete');

module.exports = KDSimpleAutocomplete = (function(superClass) {
  extend(KDSimpleAutocomplete, superClass);

  function KDSimpleAutocomplete() {
    return KDSimpleAutocomplete.__super__.constructor.apply(this, arguments);
  }

  KDSimpleAutocomplete.prototype.addItemToSubmitQueue = function(item) {
    var itemValue;
    itemValue = JsPath.getAt(item.getData(), this.getOptions().itemDataPath);
    return this.setValue(itemValue);
  };

  KDSimpleAutocomplete.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      return;
    }
    return KDSimpleAutocomplete.__super__.keyUp.apply(this, arguments);
  };

  KDSimpleAutocomplete.prototype.showNoDataFound = function() {
    this.dropdown.removeAllItems();
    return this.hideDropdown();
  };

  return KDSimpleAutocomplete;

})(KDAutoComplete);

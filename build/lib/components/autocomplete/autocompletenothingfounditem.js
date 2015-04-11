var KDAutoCompleteNothingFoundItem, KDAutocompleteUnselecteableItem,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDAutocompleteUnselecteableItem = require('./autocompleteunselecteableitem');

module.exports = KDAutoCompleteNothingFoundItem = (function(superClass) {
  extend(KDAutoCompleteNothingFoundItem, superClass);

  function KDAutoCompleteNothingFoundItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curry("kdautocompletelistitem no-result", options.cssClass);
    KDAutoCompleteNothingFoundItem.__super__.constructor.call(this, options, data);
  }

  KDAutoCompleteNothingFoundItem.prototype.partial = function(data) {
    return "nothing here.";
  };

  return KDAutoCompleteNothingFoundItem;

})(KDAutocompleteUnselecteableItem);

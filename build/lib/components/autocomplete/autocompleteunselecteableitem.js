var KDAutocompleteUnselecteableItem, KDListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDListItemView = require('../list/listitemview');

module.exports = KDAutocompleteUnselecteableItem = (function(superClass) {
  extend(KDAutocompleteUnselecteableItem, superClass);

  function KDAutocompleteUnselecteableItem() {
    return KDAutocompleteUnselecteableItem.__super__.constructor.apply(this, arguments);
  }

  KDAutocompleteUnselecteableItem.prototype.click = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.keyUp = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.keyDown = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.makeItemActive = function() {};

  KDAutocompleteUnselecteableItem.prototype.destroy = function() {
    return KDAutocompleteUnselecteableItem.__super__.destroy.call(this, false);
  };

  return KDAutocompleteUnselecteableItem;

})(KDListItemView);

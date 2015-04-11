var KD, KDAutoCompleteFetchingItem, KDAutocompleteUnselecteableItem,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDAutocompleteUnselecteableItem = require('./autocompleteunselecteableitem');

module.exports = KDAutoCompleteFetchingItem = (function(superClass) {
  extend(KDAutoCompleteFetchingItem, superClass);

  function KDAutoCompleteFetchingItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kdautocompletelistitem fetching', options.cssClass);
    KDAutoCompleteFetchingItem.__super__.constructor.call(this, options, data);
  }

  KDAutoCompleteFetchingItem.prototype.partial = function() {
    return 'loading...';
  };

  return KDAutoCompleteFetchingItem;

})(KDAutocompleteUnselecteableItem);

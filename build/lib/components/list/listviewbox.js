var KDCustomHTMLView, KDListItemView, KDListViewBox,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDListItemView = require('./listitemview');

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDListViewBox = (function(superClass) {
  extend(KDListViewBox, superClass);

  function KDListViewBox(options) {
    if (options == null) {
      options = {};
    }
    options.tagName = 'section';
    KDListViewBox.__super__.constructor.call(this, options);
    this.observeMutations();
    this.on('MutationHappened', this.bound('updateProps'));
  }

  KDListViewBox.prototype.getItems = function() {
    return this.subViews.filter(function(item) {
      return item instanceof KDListItemView;
    });
  };

  KDListViewBox.prototype.updateProps = function() {
    if (this.getItems().length === 0) {
      return this.emit('BoxIsEmptied', this.getId());
    }
  };

  return KDListViewBox;

})(KDCustomHTMLView);

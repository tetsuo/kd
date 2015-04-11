var $, KDListView, MultipleInputListView, MultipleListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDListView = require('../list/listview');

MultipleListItemView = require('./multiplelistitemview');

module.exports = MultipleInputListView = (function(superClass) {
  extend(MultipleInputListView, superClass);

  function MultipleInputListView() {
    return MultipleInputListView.__super__.constructor.apply(this, arguments);
  }

  MultipleInputListView.prototype.setDomElement = function() {
    return this.domElement = $("<p class='search-tags clearfix'></p>");
  };

  MultipleInputListView.prototype.addItems = function(items) {
    var i, item, len, newItem, results;
    results = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      newItem = new MultipleListItemView({
        delegate: this
      }, item);
      results.push(this.addItem(newItem));
    }
    return results;
  };

  MultipleInputListView.prototype.removeListItem = function(instance) {
    MultipleInputListView.__super__.removeListItem.call(this, instance);
    return this.getDelegate().inputRemoveValue(instance.getData());
  };

  return MultipleInputListView;

})(KDListView);

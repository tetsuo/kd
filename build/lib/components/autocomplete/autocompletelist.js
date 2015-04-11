var KDAutoCompleteListView, KDListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDListView = require('../list/listview');

module.exports = KDAutoCompleteListView = (function(superClass) {
  extend(KDAutoCompleteListView, superClass);

  function KDAutoCompleteListView(options, data) {
    KDAutoCompleteListView.__super__.constructor.call(this, options, data);
    this.setClass("kdautocompletelist");
  }

  KDAutoCompleteListView.prototype.goDown = function() {
    var activeItem, nextItem, ref;
    activeItem = this.getActiveItem();
    if (activeItem.index != null) {
      nextItem = this.items[activeItem.index + 1];
      if (nextItem != null) {
        return nextItem.makeItemActive();
      }
    } else {
      return (ref = this.items[0]) != null ? ref.makeItemActive() : void 0;
    }
  };

  KDAutoCompleteListView.prototype.goUp = function() {
    var activeItem;
    activeItem = this.getActiveItem();
    if (activeItem.index != null) {
      if (this.items[activeItem.index - 1] != null) {
        return this.items[activeItem.index - 1].makeItemActive();
      } else {
        return this.emit('ItemsDeselected');
      }
    } else {
      return this.items[0].makeItemActive();
    }
  };

  KDAutoCompleteListView.prototype.getActiveItem = function() {
    var active, i, item, j, len, ref;
    active = {
      index: null,
      item: null
    };
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      if (item.active) {
        active.item = item;
        active.index = i;
        break;
      }
    }
    return active;
  };

  KDAutoCompleteListView.prototype.setActiveItem = function(target) {
    var item, j, len, ref, results;
    ref = this.items;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      results.push(item.active = item === target);
    }
    return results;
  };

  return KDAutoCompleteListView;

})(KDListView);

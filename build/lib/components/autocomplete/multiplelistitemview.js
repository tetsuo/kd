var $, KDListItemView, MultipleListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDListItemView = require('../list/listitemview');

module.exports = MultipleListItemView = (function(superClass) {
  extend(MultipleListItemView, superClass);

  function MultipleListItemView() {
    return MultipleListItemView.__super__.constructor.apply(this, arguments);
  }

  MultipleListItemView.prototype.click = function(event) {
    if ($(event.target).hasClass('removeIcon')) {
      return this.getDelegate().removeListItem(this);
    }
  };

  MultipleListItemView.prototype.setDomElement = function() {
    return this.domElement = $('<span />');
  };

  MultipleListItemView.prototype.partial = function() {
    return (this.getData()) + " <cite class='removeIcon'>x</cite>";
  };

  return MultipleListItemView;

})(KDListItemView);

var $, KDAutoCompletedItem, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDView = require('../../core/view');

module.exports = KDAutoCompletedItem = (function(superClass) {
  extend(KDAutoCompletedItem, superClass);

  function KDAutoCompletedItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curry("kdautocompletedlistitem", options.cssClass);
    KDAutoCompletedItem.__super__.constructor.apply(this, arguments);
  }

  KDAutoCompletedItem.prototype.click = function(event) {
    if ($(event.target).is('span.close-icon')) {
      this.getDelegate().removeFromSubmitQueue(this);
    }
    return this.getDelegate().getView().$input().trigger("focus");
  };

  KDAutoCompletedItem.prototype.viewAppended = function() {
    return this.setPartial(this.partial());
  };

  KDAutoCompletedItem.prototype.partial = function(data) {
    return this.getDelegate().getOptions().itemClass.prototype.partial(this.getData());
  };

  return KDAutoCompletedItem;

})(KDView);

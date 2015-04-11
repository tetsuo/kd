var KD, KDAutoCompleteListItemView, KDListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDListItemView = require('../list/listitemview');

module.exports = KDAutoCompleteListItemView = (function(superClass) {
  extend(KDAutoCompleteListItemView, superClass);

  function KDAutoCompleteListItemView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry("kdautocompletelistitem", options.cssClass);
    options.bind = "mouseenter mouseleave";
    KDAutoCompleteListItemView.__super__.constructor.call(this, options, data);
    this.active = false;
  }

  KDAutoCompleteListItemView.prototype.viewAppended = function() {
    return this.updatePartial(this.partial(this.data));
  };

  KDAutoCompleteListItemView.prototype.mouseEnter = function() {
    return this.makeItemActive();
  };

  KDAutoCompleteListItemView.prototype.mouseLeave = function() {
    return this.makeItemInactive();
  };

  KDAutoCompleteListItemView.prototype.makeItemActive = function() {
    var i, item, len, ref;
    ref = this.getDelegate().items;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      item.makeItemInactive();
    }
    this.active = true;
    return this.setClass("active");
  };

  KDAutoCompleteListItemView.prototype.makeItemInactive = function() {
    this.active = false;
    return this.unsetClass("active");
  };

  KDAutoCompleteListItemView.prototype.click = function(event) {
    var list;
    list = this.getDelegate();
    list.emit('KDAutoCompleteSubmit', this, this.data);
    return KD.utils.stopDOMEvent(event);
  };

  KDAutoCompleteListItemView.prototype.partial = function() {
    return "<div class='autocomplete-item clearfix'>Default item</div>";
  };

  return KDAutoCompleteListItemView;

})(KDListItemView);

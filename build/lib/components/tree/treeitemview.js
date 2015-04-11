var JTreeItemView, KDListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDListItemView = require('../list/listitemview');

module.exports = JTreeItemView = (function(superClass) {
  extend(JTreeItemView, superClass);

  function JTreeItemView(options, data) {
    var childClass, childOptions, ref;
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.tagName || (options.tagName = "li");
    options.type || (options.type = "jtreeitem");
    options.bind || (options.bind = "mouseenter contextmenu dragstart dragenter dragleave dragend dragover drop");
    options.childClass || (options.childClass = null);
    options.childOptions || (options.childOptions = {});
    JTreeItemView.__super__.constructor.call(this, options, data);
    this.setClass("jtreeitem");
    this.expanded = false;
    ref = this.getOptions(), childClass = ref.childClass, childOptions = ref.childOptions;
    if (childClass) {
      this.child = new childClass(childOptions, this.getData());
    }
  }

  JTreeItemView.prototype.viewAppended = function() {
    var ref;
    if (this.getOptions().childClass) {
      return this.addSubView(this.child);
    } else {
      return this.updatePartial("<span class='arrow'></span>\n" + ((ref = this.getData().title) != null ? ref : ""));
    }
  };

  JTreeItemView.prototype.toggle = function(callback) {
    if (this.expanded) {
      return this.collapse();
    } else {
      return this.expand();
    }
  };

  JTreeItemView.prototype.expand = function(callback) {
    this.expanded = true;
    return this.setClass("expanded");
  };

  JTreeItemView.prototype.collapse = function(callback) {
    this.expanded = false;
    return this.unsetClass("expanded");
  };

  JTreeItemView.prototype.decorateSubItemsState = function(state) {
    if (state == null) {
      state = true;
    }
    if (state) {
      return this.setClass("has-sub-items");
    } else {
      return this.unsetClass("has-sub-items");
    }
  };

  return JTreeItemView;

})(KDListItemView);

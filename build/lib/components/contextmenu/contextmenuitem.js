var JContextMenuItem, JTreeItemView, KD, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

JTreeItemView = require('../tree/treeitemview');

module.exports = JContextMenuItem = (function(superClass) {
  extend(JContextMenuItem, superClass);

  function JContextMenuItem(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.type = "contextitem";
    options.cssClass || (options.cssClass = "default " + (KD.utils.slugify(data.title)));
    if (data.title == null) {
      data.title = '';
    }
    JContextMenuItem.__super__.constructor.call(this, options, data);
    this.unsetClass("jtreeitem");
    if (data) {
      if (data.type === "divider" || data.type === "separator") {
        this.setClass("separator");
      }
      if (data.cssClass) {
        this.setClass(data.cssClass);
      }
      if (data.type === "customView") {
        this.addCustomView(data);
      }
      if (data.disabled) {
        this.setClass("disabled");
      }
    }
  }

  JContextMenuItem.prototype.viewAppended = function() {
    if (!this.customView) {
      return JContextMenuItem.__super__.viewAppended.call(this);
    }
  };

  JContextMenuItem.prototype.mouseDown = function() {
    return true;
  };

  JContextMenuItem.prototype.addCustomView = function(data) {
    this.setClass("custom-view");
    this.unsetClass("default");
    this.customView = data.view || new KDView;
    delete data.view;
    return this.addSubView(this.customView);
  };

  return JContextMenuItem;

})(JTreeItemView);

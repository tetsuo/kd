var JContextMenuTreeView, JTreeView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

JTreeView = require('../tree/treeview');

module.exports = JContextMenuTreeView = (function(superClass) {
  extend(JContextMenuTreeView, superClass);

  function JContextMenuTreeView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.type || (options.type = "contextmenu");
    if (options.animated == null) {
      options.animated = false;
    }
    options.cssClass || (options.cssClass = "default");
    JContextMenuTreeView.__super__.constructor.call(this, options, data);
    this.unsetClass("jtreeview");
  }

  return JContextMenuTreeView;

})(JTreeView);

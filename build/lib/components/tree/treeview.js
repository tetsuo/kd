var JTreeView, KD, KDListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDListView = require('../list/listview');

module.exports = JTreeView = (function(superClass) {
  extend(JTreeView, superClass);

  function JTreeView(options, data) {
    if (options == null) {
      options = {};
    }
    if (options.animated == null) {
      options.animated = false;
    }
    options.cssClass = KD.utils.curry('jtreeview expanded', options.cssClass);
    JTreeView.__super__.constructor.call(this, options, data);
  }

  JTreeView.prototype.toggle = function(callback) {
    if (this.expanded) {
      return this.collapse(callback);
    } else {
      return this.expand(callback);
    }
  };

  JTreeView.prototype.expand = function(callback) {
    if (this.getOptions().animated) {
      return this.$().slideDown(150, (function(_this) {
        return function() {
          _this.setClass("expanded");
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    } else {
      this.show();
      this.setClass("expanded");
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  JTreeView.prototype.collapse = function(callback) {
    if (this.getOptions().animated) {
      return this.$().slideUp(100, (function(_this) {
        return function() {
          _this.unsetClass("expanded");
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    } else {
      this.hide();
      this.unsetClass("expanded");
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  JTreeView.prototype.mouseDown = function() {
    KD.getSingleton("windowController").setKeyView(this);
    return false;
  };

  JTreeView.prototype.keyDown = function(event) {
    return this.emit("KeyDownOnTreeView", event);
  };

  JTreeView.prototype.destroy = function() {
    KD.getSingleton("windowController").revertKeyView(this);
    return JTreeView.__super__.destroy.apply(this, arguments);
  };

  return JTreeView;

})(KDListView);

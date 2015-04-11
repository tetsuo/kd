var KD, KDModalView, KDModalViewStack, KDObject,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDModalView = require('./modalview');

KDObject = require('../../core/object');

module.exports = KDModalViewStack = (function(superClass) {
  extend(KDModalViewStack, superClass);

  function KDModalViewStack(options, data) {
    if (options == null) {
      options = {};
    }
    if (options.lastToFirst == null) {
      options.lastToFirst = false;
    }
    KDModalViewStack.__super__.constructor.call(this, options, data);
    this.modals = [];
  }

  KDModalViewStack.prototype.addModal = function(modal) {
    var lastToFirst;
    if (!(modal instanceof KDModalView)) {
      return KD.warn("You can only add KDModalView instances to the modal stack.");
    }
    modal.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        return _this.next();
      };
    })(this));
    lastToFirst = this.getOptions().lastToFirst;
    this.modals.push(modal);
    KD.utils.defer((function(_this) {
      return function() {
        modal.hide();
        if (lastToFirst) {
          _this.modals.forEach(function(modal) {
            return modal.hide();
          });
          return _this.modals.last.show();
        } else {
          return _this.modals.first.show();
        }
      };
    })(this));
    return modal;
  };

  KDModalViewStack.prototype.next = function() {
    var lastToFirst, ref, ref1;
    lastToFirst = this.getOptions().lastToFirst;
    if (lastToFirst) {
      this.modals.pop();
      return (ref = this.modals.last) != null ? ref.show() : void 0;
    } else {
      this.modals.shift();
      return (ref1 = this.modals.first) != null ? ref1.show() : void 0;
    }
  };

  KDModalViewStack.prototype.destroy = function() {
    this.modals.forEach(function(modal) {
      return KD.utils.defer(function() {
        return modal.destroy();
      });
    });
    this.modals = [];
    return KDModalViewStack.__super__.destroy.apply(this, arguments);
  };

  return KDModalViewStack;

})(KDObject);

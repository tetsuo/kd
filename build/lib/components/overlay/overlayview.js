var KD, KDOverlayView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDOverlayView = (function(superClass) {
  extend(KDOverlayView, superClass);

  function KDOverlayView(options, data) {
    if (options == null) {
      options = {};
    }
    if (options.isRemovable == null) {
      options.isRemovable = true;
    }
    if (options.animated == null) {
      options.animated = false;
    }
    if (options.color == null) {
      options.color = false;
    }
    if (options.transparent == null) {
      options.transparent = false;
    }
    if (options.opacity == null) {
      options.opacity = 0.5;
    }
    if (options.appendToDomBody == null) {
      options.appendToDomBody = true;
    }
    options.cssClass = KD.utils.curry("kdoverlay", options.cssClass);
    KDOverlayView.__super__.constructor.call(this, options, data);
    if (options.animated) {
      this.setClass("animated");
    }
    if (options.transparent) {
      this.setClass("transparent");
    }
    if (options.color) {
      this.setStyle({
        backgroundColor: options.color,
        opacity: options.opacity
      });
    }
    if (options.container instanceof KDView) {
      options.container.addSubView(this);
      this.setCss("position", "absolute");
    } else if (options.appendToDomBody) {
      this.appendToDomBody();
    }
    if (options.animated) {
      this.utils.defer((function(_this) {
        return function() {
          return _this.setClass("in");
        };
      })(this));
      this.utils.wait(300, (function(_this) {
        return function() {
          return _this.emit("OverlayAdded", _this);
        };
      })(this));
    } else {
      this.emit("OverlayAdded", this);
    }
    if (options.isRemovable) {
      if (options.animated) {
        this.once("click", (function(_this) {
          return function() {
            _this.unsetClass("in");
            return _this.utils.wait(300, function() {
              return _this.remove();
            });
          };
        })(this));
      } else {
        this.once("click", (function(_this) {
          return function() {
            return _this.remove();
          };
        })(this));
      }
    }
  }

  KDOverlayView.prototype.remove = function() {
    this.emit("OverlayWillBeRemoved");
    this.destroy();
    return this.emit("OverlayRemoved", this);
  };

  return KDOverlayView;

})(KDView);

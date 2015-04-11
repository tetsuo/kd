var KD, KDSpotlightView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDSpotlightView = (function(superClass) {
  extend(KDSpotlightView, superClass);

  function KDSpotlightView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry("kdspotlightview", options.cssClass);
    if (options.margin == null) {
      options.margin = 50;
    }
    if (options.radial == null) {
      options.radial = true;
    }
    if (options.isRemovable == null) {
      options.isRemovable = true;
    }
    KDSpotlightView.__super__.constructor.call(this, options, data);
    if (!options.radial) {
      this.setClass("shadow");
    }
    this.createElements();
    this.appendToDomBody();
  }

  KDSpotlightView.prototype.createElements = function() {
    var boundaries, height, isRemovable, left, position, ref, results, top, view, width;
    isRemovable = this.getOptions().isRemovable;
    ref = this.getBoundaries();
    results = [];
    for (position in ref) {
      boundaries = ref[position];
      width = boundaries.width, height = boundaries.height, top = boundaries.top, left = boundaries.left;
      if (width > 0 && height > 0) {
        view = new KDView({
          cssClass: KD.utils.curry("kdoverlay", position),
          size: {
            width: width,
            height: height
          },
          position: {
            top: top,
            left: left
          }
        });
        if (isRemovable) {
          view.on("click", (function(_this) {
            return function() {
              _this.destroy();
              return _this.emit("OverlayDestroyed");
            };
          })(this));
        }
        results.push(this.addSubView(view));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  KDSpotlightView.prototype.getBoundaries = function() {
    var bottomHeight, boundaries, delegate, height, left, leftWidth, margin, radial, top, topHeight, width, windowHeight, windowWidth;
    radial = this.getOptions().radial;
    delegate = this.getDelegate();
    top = delegate.getY();
    left = delegate.getX();
    width = delegate.getWidth();
    height = delegate.getHeight();
    margin = this.getOption("margin");
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    if (radial) {
      width = height = Math.min(width, height);
    }
    topHeight = top - margin;
    leftWidth = left - margin;
    bottomHeight = windowHeight - (top + height + margin);
    boundaries = {
      top: {
        top: 0,
        left: 0,
        width: windowWidth,
        height: topHeight
      },
      left: {
        top: topHeight,
        left: 0,
        width: leftWidth,
        height: windowHeight - top + margin
      },
      bottom: {
        top: top + height + margin,
        left: leftWidth,
        width: windowWidth - left + margin,
        height: bottomHeight
      },
      right: {
        top: topHeight,
        left: left + width + margin,
        width: windowWidth - (left + width + margin),
        height: windowHeight - (bottomHeight + topHeight)
      },
      main: {
        top: topHeight,
        left: leftWidth,
        width: width + margin + margin,
        height: height + margin + margin
      }
    };
    return boundaries;
  };

  return KDSpotlightView;

})(KDView);

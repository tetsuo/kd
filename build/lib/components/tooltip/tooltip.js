var Encoder, KD, KDTooltip, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');


/*

  KDTooltip

  A tooltip has a position and a direction, relative to the delegate
  element it is attached to.

  Valid positioning types are 'top','bottom','left' and 'right'
  Valid direction types are 'top','bottom','left','right' and 'center'

  Should a tooltip move off-screen, it will be relocated to be fully
  visible.
 */

KDView = require('../../core/view');

Encoder = require('htmlencode');

module.exports = KDTooltip = (function(superClass) {
  var directionMap, getBoundaryViolations, getCoordsDiff, getCoordsFromPlacement, placementMap;

  extend(KDTooltip, superClass);

  function KDTooltip(options, data) {
    var windowController;
    options.bind || (options.bind = 'mouseenter mouseleave');
    if (options.sticky == null) {
      options.sticky = false;
    }
    options.cssClass = KD.utils.curry('kdtooltip', options.cssClass);
    KDTooltip.__super__.constructor.call(this, options, data);
    this.visible = false;
    this.parentView = this.getDelegate();
    this.wrapper = new KDView({
      cssClass: 'wrapper'
    });
    if (this.getOptions().animate) {
      this.setClass('out');
    } else {
      this.hide();
    }
    this.addListeners();
    windowController = KD.getSingleton('windowController');
    windowController.on('ScrollHappened', this.bound("hide"));
    this.once('viewAppended', (function(_this) {
      return function() {
        var html, ref, title, view;
        ref = _this.getOptions(), view = ref.view, title = ref.title, html = ref.html;
        if (view != null) {
          _this.setView(view);
        } else {
          _this.setClass('just-text');
          _this.setTitle(title, html);
        }
        _this.parentView.emit('TooltipReady');
        _this.addSubView(_this.wrapper);
        return _this.visible = true;
      };
    })(this));
  }

  KDTooltip.prototype.show = function(event) {
    var selector;
    selector = this.getOptions().selector;
    if (selector) {
      return;
    }
    this.display();
    KDTooltip.__super__.show.apply(this, arguments);
    return this.visible = true;
  };

  KDTooltip.prototype.hide = function(event) {
    var permanent, windowController;
    if (!this.visible) {
      return;
    }
    permanent = this.getOptions().permanent;
    KDTooltip.__super__.hide.apply(this, arguments);
    this.getDomElement().remove();
    windowController = KD.getSingleton('windowController');
    if (!permanent) {
      windowController.removeLayer(this);
    }
    return this.visible = false;
  };

  KDTooltip.prototype.update = function(o, view) {
    if (o == null) {
      o = this.getOptions();
    }
    if (!view) {
      o.selector || (o.selector = null);
      o.title || (o.title = "");
      this.setTitle(o.title, o.html);
      this.display();
    } else {
      this.setView(view);
    }
    return this.visible = true;
  };

  KDTooltip.prototype.addListeners = function() {
    var _hide, _show, events, i, len, name, permanent, ref, sticky;
    ref = this.getOptions(), events = ref.events, sticky = ref.sticky, permanent = ref.permanent;
    _show = this.bound('show');
    _hide = this.bound('hide');
    for (i = 0, len = events.length; i < len; i++) {
      name = events[i];
      this.parentView.bindEvent(name);
    }
    this.parentView.on('mouseenter', _show);
    if (!sticky) {
      this.parentView.on('mouseleave', _hide);
    }
    if (!permanent) {
      this.on('ReceivedClickElsewhere', _hide);
    }
    return this.once('KDObjectWillBeDestroyed', (function(_this) {
      return function() {
        _this.parentView.off('mouseenter', _show);
        if (!sticky) {
          return _this.parentView.off('mouseleave', _hide);
        }
      };
    })(this));
  };

  KDTooltip.prototype.setView = function(childView) {
    var constructorName, data, options;
    if (!childView) {
      return;
    }
    if (this.wrapper.view != null) {
      this.wrapper.view.destroy();
    }
    if (childView.constructorName) {
      options = childView.options, data = childView.data, constructorName = childView.constructorName;
      return this.childView = new constructorName(options, data);
    } else {
      return this.wrapper.addSubView(childView);
    }
  };

  KDTooltip.prototype.getView = function() {
    return this.childView;
  };

  KDTooltip.prototype.destroy = function() {
    this.parentView.tooltip = null;
    delete this.parentView.tooltip;
    return KDTooltip.__super__.destroy.apply(this, arguments);
  };

  KDTooltip.prototype.translateCompassDirections = function(o) {
    var gravity, placement;
    placement = o.placement, gravity = o.gravity;
    o.placement = placementMap[placement];
    o.direction = directionMap(o.placement, gravity);
    return o;
  };

  KDTooltip.prototype.display = function() {
    var animate, gravity, o, permanent, ref, windowController;
    o = this.getOptions();
    ref = this.getOptions(), permanent = ref.permanent, gravity = ref.gravity, animate = ref.animate;
    this.appendToDomBody();
    windowController = KD.getSingleton('windowController');
    if (!permanent) {
      windowController.addLayer(this);
    }
    if (gravity) {
      o = this.translateCompassDirections(o);
    }
    o.gravity = null;
    if (animate) {
      this.setClass('in');
    }
    KD.utils.defer((function(_this) {
      return function() {
        return _this.setPositions(o);
      };
    })(this));
    return this.visible = true;
  };

  KDTooltip.prototype.getCorrectPositionCoordinates = function(o, positionValues, callback) {
    var container, correctValues, d, direction, forcePosition, i, len, placement, selector, variant, variants, violations;
    if (o == null) {
      o = {};
    }
    if (callback == null) {
      callback = KD.noop;
    }
    container = this.$();
    selector = this.parentView.$(o.selector);
    d = {
      container: {
        height: container.height(),
        width: container.width()
      },
      selector: {
        offset: selector.offset(),
        height: selector.height(),
        width: selector.width()
      }
    };
    placement = positionValues.placement, direction = positionValues.direction;
    forcePosition = this.getOptions().forcePosition;
    violations = getBoundaryViolations(getCoordsFromPlacement(d, placement, direction), d.container.width, d.container.height);
    if (!forcePosition && Object.keys(violations).length > 0) {
      variants = [['top', 'right'], ['right', 'top'], ['right', 'bottom'], ['bottom', 'right'], ['top', 'left'], ['top', 'center'], ['right', 'center'], ['bottom', 'center'], ['bottom', 'left'], ['left', 'bottom'], ['left', 'center'], ['left', 'top']];
      for (i = 0, len = variants.length; i < len; i++) {
        variant = variants[i];
        if (Object.keys(getBoundaryViolations(getCoordsFromPlacement(d, variant[0], variant[1]), d.container.width, d.container.height)).length === 0) {
          placement = variant[0], direction = variant[1];
          break;
        }
      }
    }
    correctValues = {
      coords: getCoordsFromPlacement(d, placement, direction),
      placement: placement,
      direction: direction
    };
    callback(correctValues);
    return correctValues;
  };

  KDTooltip.prototype.setPositions = function(o, animate) {
    var coords, direction, direction_, i, j, len, len1, offset, placement, placement_, ref, ref1, ref2;
    if (o == null) {
      o = this.getOptions();
    }
    if (animate == null) {
      animate = false;
    }
    if (animate) {
      this.setClass('animate-movement');
    }
    placement = o.placement || 'top';
    direction = o.direction || 'right';
    offset = Number === typeof o.offset ? {
      top: o.offset,
      left: 0
    } : o.offset;
    direction = (placement === 'top' || placement === 'bottom') && (direction === 'top' || direction === 'bottom') ? 'center' : (placement === 'left' || placement === 'right') && (direction === 'left' || direction === 'right') ? 'center' : direction;
    ref = this.getCorrectPositionCoordinates(o, {
      placement: placement,
      direction: direction
    }), coords = ref.coords, placement = ref.placement, direction = ref.direction;
    ref1 = ['top', 'bottom', 'left', 'right'];
    for (i = 0, len = ref1.length; i < len; i++) {
      placement_ = ref1[i];
      if (placement === placement_) {
        this.setClass('placement-' + placement_);
      } else {
        this.unsetClass('placement-' + placement_);
      }
    }
    ref2 = ['top', 'bottom', 'left', 'right', 'center'];
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      direction_ = ref2[j];
      if (direction === direction_) {
        this.setClass('direction-' + direction_);
      } else {
        this.unsetClass('direction-' + direction_);
      }
    }
    this.$().css({
      left: coords.left + offset.left,
      top: coords.top + offset.top
    });
    return this.utils.wait(500, (function(_this) {
      return function() {
        return _this.unsetClass('animate-movement');
      };
    })(this));
  };

  KDTooltip.prototype.setTitle = function(title, isHTML) {
    if (!isHTML) {
      title = Encoder.htmlEncode(title);
    }
    return this.wrapper.updatePartial(title);
  };

  directionMap = function(placement, gravity) {
    if (placement === "top" || placement === "bottom") {
      if (/e/.test(gravity)) {
        return "left";
      } else if (/w/.test(gravity)) {
        return "right";
      } else {
        return "center";
      }
    } else if (placement === "left" || placement === "right") {
      if (/n/.test(gravity)) {
        return "top";
      } else if (/s/.test(gravity)) {
        return "bottom";
      } else {
        return placement;
      }
    }
  };

  placementMap = {
    top: "top",
    above: "top",
    below: "bottom",
    bottom: "bottom",
    left: "left",
    right: "right"
  };

  getBoundaryViolations = function(coordinates, width, height) {
    var violations;
    violations = {};
    if (coordinates.left < 0) {
      violations.left = -coordinates.left;
    }
    if (coordinates.top < 0) {
      violations.top = -coordinates.top;
    }
    if (coordinates.left + width > window.innerWidth) {
      violations.right = coordinates.left + width - window.innerWidth;
    }
    if (coordinates.top + height > window.innerHeight) {
      violations.bottom = coordinates.top + height - window.innerHeight;
    }
    return violations;
  };

  getCoordsDiff = function(dimensions, type, center) {
    var diff;
    if (center == null) {
      center = false;
    }
    diff = dimensions.selector[type] - dimensions.container[type];
    if (center) {
      return diff / 2;
    } else {
      return diff;
    }
  };

  getCoordsFromPlacement = function(dimensions, placement, direction) {
    var coordinates, dynamicAxis, dynamicC, exclusion, ref, staticAxis, staticC;
    coordinates = {
      top: dimensions.selector.offset.top,
      left: dimensions.selector.offset.left
    };
    ref = /o/.test(placement) ? ['height', 'width', 'top', 'left', 'right'] : ['width', 'height', 'left', 'top', 'bottom'], staticAxis = ref[0], dynamicAxis = ref[1], staticC = ref[2], dynamicC = ref[3], exclusion = ref[4];
    coordinates[staticC] += !(placement.length < 5) ? dimensions.selector[staticAxis] + 10 : -(dimensions.container[staticAxis] + 10);
    if (direction !== exclusion) {
      coordinates[dynamicC] += getCoordsDiff(dimensions, dynamicAxis, direction === 'center');
    }
    return coordinates;
  };

  return KDTooltip;

})(KDView);

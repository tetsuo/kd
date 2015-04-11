var KD, KDDiaContainer, KDDiaObject, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDDiaObject = require('./diaobject');

KDView = require('../../core/view');

module.exports = KDDiaContainer = (function(superClass) {
  extend(KDDiaContainer, superClass);

  function KDDiaContainer(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kddia-container', options.cssClass);
    if (options.draggable) {
      if ('object' !== typeof options.draggable) {
        options.draggable = {};
      }
    }
    if (options.itemClass == null) {
      options.itemClass = KDDiaObject;
    }
    KDDiaContainer.__super__.constructor.call(this, options, data);
    this.scale = 1;
    this.dias = {};
  }

  KDDiaContainer.prototype.mouseDown = function() {
    var dia, key;
    KDDiaContainer.__super__.mouseDown.apply(this, arguments);
    return this.emit("HighlightDia", (function() {
      var ref, results;
      ref = this.dias;
      results = [];
      for (key in ref) {
        dia = ref[key];
        results.push(dia);
      }
      return results;
    }).call(this));
  };

  KDDiaContainer.prototype.addDia = function(diaObj, pos) {
    if (pos == null) {
      pos = {};
    }
    this.addSubView(diaObj);
    diaObj.on("DiaObjectClicked", (function(_this) {
      return function() {
        return _this.emit("HighlightDia", diaObj);
      };
    })(this));
    diaObj.on("RemoveMyConnections", (function(_this) {
      return function() {
        return delete _this.dias[diaObj.getId()];
      };
    })(this));
    this.dias[diaObj.getId()] = diaObj;
    this.emit("NewDiaObjectAdded", this, diaObj);
    if (pos.x != null) {
      diaObj.setX(pos.x);
    }
    if (pos.y != null) {
      diaObj.setY(pos.y);
    }
    return diaObj;
  };

  KDDiaContainer.prototype.addItem = function(data, options) {
    var itemClass;
    if (options == null) {
      options = {};
    }
    itemClass = this.getOption('itemClass');
    return this.addDia(new itemClass(options, data));
  };

  KDDiaContainer.prototype.removeAllItems = function() {
    var _key, dia, ref, results;
    ref = this.dias;
    results = [];
    for (_key in ref) {
      dia = ref[_key];
      results.push(typeof dia.destroy === "function" ? dia.destroy() : void 0);
    }
    return results;
  };

  KDDiaContainer.prototype.setScale = function(scale) {
    var css, i, len, prop, props;
    if (scale == null) {
      scale = 1;
    }
    if (scale === this.scale) {
      return;
    }
    props = ['webkitTransform', 'MozTransform', 'transform'];
    css = {};
    for (i = 0, len = props.length; i < len; i++) {
      prop = props[i];
      css[prop] = "scale(" + scale + ")";
    }
    this.setStyle(css);
    return this.scale = scale;
  };

  return KDDiaContainer;

})(KDView);

var KD, KDDiaJoint, KDDiaObject, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KD = require('../../core/kd');

KDDiaJoint = require('./diajoint');

KDView = require('../../core/view');

module.exports = KDDiaObject = (function(superClass) {
  extend(KDDiaObject, superClass);

  function KDDiaObject(options, data) {
    var base, base1, base2;
    options.cssClass = KD.utils.curry('kddia-object', options.cssClass);
    if (options.draggable == null) {
      if ('object' !== typeof options.draggable) {
        options.draggable = {};
      }
      (base = options.draggable).containment || (base.containment = {});
      (base1 = options.draggable.containment).view || (base1.view = 'parent');
      if ((base2 = options.draggable.containment).padding == null) {
        base2.padding = {
          top: 1,
          right: 1,
          bottom: 1,
          left: 1
        };
      }
    }
    options.bind = KD.utils.curry('mouseleave', options.bind);
    if (options.joints == null) {
      options.joints = ['left', 'right'];
    }
    if (options.jointItemClass == null) {
      options.jointItemClass = KDDiaJoint;
    }
    options.allowedConnections || (options.allowedConnections = {});
    options.staticJoints || (options.staticJoints = []);
    KDDiaObject.__super__.constructor.call(this, options, data);
    this.joints = {};
    this.allowedConnections = this.getOption('allowedConnections');
    this.domElement.attr("dia-id", "dia-" + (this.getId()));
    this.wc = KD.getSingleton('windowController');
    this.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        return _this.emit('RemoveMyConnections');
      };
    })(this));
    this.once('viewAppended', (function(_this) {
      return function() {
        var i, joint, len, ref;
        ref = _this.getOption('joints');
        for (i = 0, len = ref.length; i < len; i++) {
          joint = ref[i];
          _this.addJoint(joint);
        }
        return _this.parent.on('UnhighlightDias', function() {
          var key, ref1, results;
          _this.unsetClass('highlight');
          ref1 = _this.joints;
          results = [];
          for (key in ref1) {
            joint = ref1[key];
            results.push(joint.hideDeleteButton());
          }
          return results;
        });
      };
    })(this));
  }

  KDDiaObject.prototype.mouseDown = function(e) {
    this.emit("DiaObjectClicked");
    this._mouseDown = true;
    this.wc.once('ReceivedMouseUpElsewhere', (function(_this) {
      return function() {
        return _this._mouseDown = false;
      };
    })(this));
    if (!this.getOption('draggable')) {
      return this.utils.stopDOMEvent(e);
    }
  };

  KDDiaObject.prototype.mouseLeave = function(e) {
    var bounds, joint;
    if (!this._mouseDown) {
      return;
    }
    bounds = this.getBounds();
    joint = null;
    bounds.w = bounds.w * this.parent.scale;
    bounds.h = bounds.h * this.parent.scale;
    if (e.pageX >= bounds.x + bounds.w) {
      joint = this.joints['right'];
    }
    if (e.pageX <= bounds.x) {
      joint = this.joints['left'];
    }
    if (e.pageY >= bounds.y + bounds.h) {
      joint = this.joints['bottom'];
    }
    if (e.pageY <= bounds.y) {
      joint = this.joints['top'];
    }
    if (joint) {
      return this.emit("JointRequestsLine", joint);
    }
  };

  KDDiaObject.prototype.addJoint = function(type) {
    var base, joint, jointItemClass, ref, staticJoints;
    if (this.joints[type] != null) {
      KD.warn("KDDiaObject: Tried to add same joint! Destroying old one. ");
      if (typeof (base = this.joints[type]).destroy === "function") {
        base.destroy();
      }
    }
    ref = this.getOptions(), jointItemClass = ref.jointItemClass, staticJoints = ref.staticJoints;
    this.addSubView(joint = new jointItemClass({
      type: type,
      "static": indexOf.call(staticJoints, type) >= 0
    }));
    return this.joints[type] = joint;
  };

  KDDiaObject.prototype.getJointPos = function(joint) {
    var dx, dy, j, jx, jy, p, ref, ref1, ref2, ref3, ref4, s, x, y;
    if (typeof joint === "string") {
      joint = this.joints[joint];
    }
    if (!joint) {
      return {
        x: 0,
        y: 0
      };
    }
    ref = [this.parent.getElement(), this.getElement(), joint.getElement()], p = ref[0], s = ref[1], j = ref[2];
    ref1 = [p.offsetLeft + s.offsetLeft, p.offsetTop + s.offsetTop], x = ref1[0], y = ref1[1];
    ref2 = [j.offsetLeft, j.offsetTop], jx = ref2[0], jy = ref2[1];
    ref4 = (ref3 = joint.type) === 'left' || ref3 === 'right' ? [10, 4] : [4, 10], dx = ref4[0], dy = ref4[1];
    return {
      x: x + jx + dx,
      y: y + jy + dy
    };
  };

  KDDiaObject.prototype.getDiaId = function() {
    return this.domElement.attr("dia-id");
  };

  return KDDiaObject;

})(KDView);

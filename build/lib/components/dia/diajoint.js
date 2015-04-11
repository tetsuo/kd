var KD, KDDiaJoint, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KD = require('../../core/kd');

KDView = require('../../core/view');

module.exports = KDDiaJoint = (function(superClass) {
  var types;

  extend(KDDiaJoint, superClass);

  types = ['left', 'right', 'top', 'bottom'];

  function KDDiaJoint(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = 'left');
    if (ref = options.type, indexOf.call(types, ref) < 0) {
      KD.warn("Unknown joint type '" + options.type + "', falling back to 'left'");
      options.type = 'left';
    }
    if (options["static"] == null) {
      options["static"] = false;
    }
    if (options.size == null) {
      options.size = 10;
    }
    options.cssClass = KD.utils.curry("kddia-joint " + options.type, options.cssClass);
    KDDiaJoint.__super__.constructor.call(this, options, data);
    this.connections = {};
    this.type = this.getOption('type');
    this.size = this.getOption('size');
  }

  KDDiaJoint.prototype.viewAppended = function() {
    KDDiaJoint.__super__.viewAppended.apply(this, arguments);
    return this.domElement.attr("dia-id", this.getDiaId());
  };

  KDDiaJoint.prototype.getDiaId = function() {
    return "dia-" + (this.parent.getId()) + "-joint-" + this.type;
  };

  KDDiaJoint.prototype.getPos = function() {
    return this.parent.getJointPos(this);
  };

  KDDiaJoint.prototype.click = function(e) {
    if (this.inDeleteMode()) {
      this.emit('DeleteRequested', this.parent, this.type);
    }
    return this.utils.stopDOMEvent(e);
  };

  KDDiaJoint.prototype.mouseDown = function(e) {
    if (this.inDeleteMode()) {
      return;
    }
    this.utils.stopDOMEvent(e);
    this.parent.emit("JointRequestsLine", this);
    return false;
  };

  KDDiaJoint.prototype.inDeleteMode = function() {
    return this.hasClass('deleteMode');
  };

  KDDiaJoint.prototype.showDeleteButton = function() {
    if (!this.isStatic()) {
      return this.setClass('deleteMode');
    }
  };

  KDDiaJoint.prototype.hideDeleteButton = function() {
    return this.unsetClass('deleteMode');
  };

  KDDiaJoint.prototype.isStatic = function() {
    return this.getOption('static');
  };

  return KDDiaJoint;

})(KDView);

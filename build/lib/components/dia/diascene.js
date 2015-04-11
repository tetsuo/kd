var $, KD, KDCustomHTMLView, KDDiaScene, KDView, _throttle,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

KDCustomHTMLView = require('../../core/customhtmlview');

_throttle = require('lodash.throttle');

module.exports = KDDiaScene = (function(superClass) {
  extend(KDDiaScene, superClass);

  function KDDiaScene(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry("kddia-scene", options.cssClass);
    options.bind = KD.utils.curry("mousemove", options.bind);
    options.lineCap || (options.lineCap = "round");
    if (options.lineWidth == null) {
      options.lineWidth = 2;
    }
    options.lineColor || (options.lineColor = "#ccc");
    options.lineColorActive || (options.lineColorActive = "orange");
    if (options.lineDashes == null) {
      options.lineDashes = [];
    }
    options.fakeLineColor || (options.fakeLineColor = "green");
    if (options.fakeLineDashes == null) {
      options.fakeLineDashes = [];
    }
    if (options.curveDistance == null) {
      options.curveDistance = 50;
    }
    KDDiaScene.__super__.constructor.apply(this, arguments);
    this.containers = [];
    this.connections = [];
    this.activeDias = [];
    this.activeJoints = [];
    this.fakeConnections = [];
  }

  KDDiaScene.prototype.diaAdded = function(container, diaObj) {
    diaObj.on("JointRequestsLine", this.bound("handleLineRequest"));
    diaObj.on("DragInAction", (function(_this) {
      return function() {
        return _this.highlightLines(diaObj);
      };
    })(this));
    return diaObj.on("RemoveMyConnections", (function(_this) {
      return function() {
        return _this.disconnectAllConnections(diaObj);
      };
    })(this));
  };

  KDDiaScene.prototype.addContainer = function(container, pos) {
    var padding, ref, ref1, ref2, ref3;
    if (pos == null) {
      pos = {};
    }
    this.addSubView(container);
    container.on("NewDiaObjectAdded", this.bound("diaAdded"));
    container.on("DragInAction", this.bound("updateScene"));
    container.on("UpdateScene", this.bound("updateScene"));
    container.on("HighlightDia", this.bound("highlightLines"));
    this.containers.push(container);
    padding = (ref = container.getOption('draggable')) != null ? (ref1 = ref.containment) != null ? ref1.padding : void 0 : void 0;
    if (padding) {
      pos.x = Math.max(padding, (ref2 = pos.x) != null ? ref2 : 0);
      pos.y = Math.max(padding, (ref3 = pos.y) != null ? ref3 : 0);
    }
    if (pos.x != null) {
      container.setX(pos.x);
    }
    if (pos.y != null) {
      container.setY(pos.y);
    }
    return this.createCanvas();
  };

  KDDiaScene.prototype.drawFakeLine = function(options) {
    var ex, ey, lineDashes, sx, sy;
    if (options == null) {
      options = {};
    }
    sx = options.sx, sy = options.sy, ex = options.ex, ey = options.ey;
    this.cleanup(this.fakeCanvas);
    this.fakeContext.beginPath();
    this.fakeContext.moveTo(sx, sy);
    this.fakeContext.lineTo(ex, ey);
    this.fakeContext.lineCap = this.getOption("lineCap");
    this.fakeContext.lineWidth = this.getOption("lineWidth");
    this.fakeContext.strokeStyle = this._trackJoint.parent.getOption('colorTag') || this.getOption("fakeLineColor");
    lineDashes = this.getOption("fakeLineDashes");
    if (lineDashes.length > 0) {
      this.fakeContext.setLineDash(lineDashes);
    }
    return this.fakeContext.stroke();
  };

  KDDiaScene.prototype.click = function(e) {
    if (e.target !== e.currentTarget) {
      return;
    }
    return this.highlightLines();
  };

  KDDiaScene.prototype.mouseMove = function(e) {
    var ex, ey, ref, x, y;
    if (!this._trackJoint) {
      return;
    }
    ref = this._trackJoint.getPos(), x = ref.x, y = ref.y;
    ex = x + (e.clientX - this._trackJoint.getX());
    ey = y + (e.clientY - this._trackJoint.getY());
    return this.drawFakeLine({
      sx: x,
      sy: y,
      ex: ex,
      ey: ey
    });
  };

  KDDiaScene.prototype.mouseUp = function(e) {
    var source, sourceId, target, targetId;
    if (!this._trackJoint) {
      return;
    }
    targetId = $(e.target).closest(".kddia-object").attr("dia-id");
    sourceId = this._trackJoint.getDiaId();
    delete this._trackJoint;
    this.cleanup(this.fakeCanvas);
    if (!targetId) {
      return;
    }
    source = this.getDia(sourceId);
    target = this.getDia(targetId);
    if (!target.joint) {
      target.joint = this.guessJoint(target, source);
    }
    if (target.joint) {
      return this.connect(source, target);
    }
  };

  KDDiaScene.prototype.guessJoint = function(target, source) {
    if (source.joint === "right" && (target.dia.joints.left != null)) {
      return "left";
    }
    if (source.joint === "left" && (target.dia.joints.right != null)) {
      return "right";
    }
  };

  KDDiaScene.prototype.getDia = function(id) {
    var container, dia, j, joint, len, objId, parts, ref, ref1;
    parts = (id.match(/dia\-((.*)\-joint\-(.*)|(.*))/)).filter(function(m) {
      return !!m;
    });
    if (!parts) {
      return null;
    }
    ref = parts.slice(-2), objId = ref[0], joint = ref[1];
    if (objId === joint) {
      joint = null;
    }
    ref1 = this.containers;
    for (j = 0, len = ref1.length; j < len; j++) {
      container = ref1[j];
      if (dia = container.dias[objId]) {
        break;
      }
    }
    return {
      dia: dia,
      joint: joint,
      container: container
    };
  };

  KDDiaScene.prototype.highlightLines = function(dia, update) {
    var connection, container, j, joint, k, l, len, len1, len2, ref, ref1, ref2, results, source, target;
    if (dia == null) {
      dia = [];
    }
    if (update == null) {
      update = true;
    }
    if (!Array.isArray(dia)) {
      dia = [dia];
    }
    this.activeDias = dia;
    ref = this.activeJoints;
    for (j = 0, len = ref.length; j < len; j++) {
      joint = ref[j];
      joint.off('DeleteRequested');
    }
    ref1 = this.containers;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      container = ref1[k];
      container.emit('UnhighlightDias');
    }
    this.activeJoints = [];
    if (update) {
      this.updateScene();
    }
    if (this.activeDias.length !== 1) {
      return;
    }
    dia = dia.first;
    ref2 = this.connections;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      connection = ref2[l];
      source = connection.source, target = connection.target;
      if ((source.dia === dia) || (target.dia === dia)) {
        results.push([source, target].forEach((function(_this) {
          return function(conn) {
            conn.dia.setClass('highlight');
            if (conn.dia !== dia) {
              joint = conn.dia.joints[conn.joint];
              if (indexOf.call(_this.activeJoints, joint) < 0) {
                joint.showDeleteButton();
                joint.on('DeleteRequested', _this.bound('disconnect'));
                return _this.activeJoints.push(joint);
              }
            }
          };
        })(this)));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  KDDiaScene.prototype.handleLineRequest = function(joint) {
    return this._trackJoint = joint;
  };

  KDDiaScene.prototype.findTargetConnection = function(dia, joint) {
    var activeDia, conn, isEqual, j, len, ref;
    isEqual = (function(_this) {
      return function(connection) {
        return (dia === connection.dia) && (joint === connection.joint);
      };
    })(this);
    activeDia = this.activeDias.first;
    ref = this.connections;
    for (j = 0, len = ref.length; j < len; j++) {
      conn = ref[j];
      if (((isEqual(conn.source)) || (isEqual(conn.target))) && ((conn.source.dia === activeDia) || (conn.target.dia === activeDia))) {
        return conn;
      }
    }
  };

  KDDiaScene.prototype.disconnect = function(dia, joint) {
    var c, connectionsToDelete;
    if (this.activeDias.length !== 1) {
      return;
    }
    connectionsToDelete = this.findTargetConnection(dia, joint);
    this.connections = (function() {
      var j, len, ref, results;
      ref = this.connections;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        if (c !== connectionsToDelete) {
          results.push(c);
        }
      }
      return results;
    }).call(this);
    return this.highlightLines(this.activeDias);
  };

  KDDiaScene.prototype.disconnectAllConnections = function(dia) {
    var connection, j, len, newConnections, ref, ref1, source, target;
    newConnections = [];
    ref = this.connections;
    for (j = 0, len = ref.length; j < len; j++) {
      connection = ref[j];
      source = connection.source, target = connection.target;
      if ((ref1 = dia.getDiaId()) !== source.dia.getDiaId() && ref1 !== target.dia.getDiaId()) {
        newConnections.push(connection);
      }
    }
    this.connections = newConnections;
    return this.highlightLines();
  };

  KDDiaScene.prototype.allowedToConnect = function(source, target) {
    var allowList, i, j, ref, ref1, ref2, ref3, restrictions;
    if (!(source && target)) {
      return false;
    }
    if (((ref = source.dia) != null ? ref.id : void 0) === ((ref1 = target.dia) != null ? ref1.id : void 0)) {
      return false;
    }
    for (i = j = 0; j <= 1; i = ++j) {
      if ((source.dia.allowedConnections != null) && Object.keys(source.dia.allowedConnections).length > 0) {
        allowList = source.dia.allowedConnections;
        restrictions = allowList[target.dia.constructor.name];
        if (!restrictions) {
          return false;
        }
        if (ref2 = source.joint, indexOf.call(restrictions, ref2) >= 0) {
          return false;
        }
      }
      ref3 = [target, source], source = ref3[0], target = ref3[1];
    }
    return true;
  };

  KDDiaScene.prototype.connect = function(source, target, update) {
    if (update == null) {
      update = true;
    }
    if (!this.allowedToConnect(source, target)) {
      return;
    }
    this.emit("ConnectionCreated", source, target);
    this.connections.push({
      source: source,
      target: target
    });
    return this.highlightLines(target.dia, update);
  };

  KDDiaScene.prototype.resetScene = function() {
    this.fakeConnections = [];
    return this.updateScene();
  };

  KDDiaScene.prototype.updateScene = function() {
    var connection, j, k, len, len1, ref, ref1, results;
    this.cleanup(this.realCanvas);
    ref = this.connections;
    for (j = 0, len = ref.length; j < len; j++) {
      connection = ref[j];
      this.drawConnectionLine(connection);
    }
    ref1 = this.fakeConnections;
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      connection = ref1[k];
      results.push(this.drawConnectionLine(connection));
    }
    return results;
  };

  KDDiaScene.prototype.drawConnectionLine = function(arg) {
    var activeColor, activeDia, cd, lineColor, lineDashes, options, ref, ref1, ref2, ref3, ref4, ref5, ref6, sJoint, source, sx, sy, tJoint, target, tx, ty;
    source = arg.source, target = arg.target, options = arg.options;
    if (!(source || target)) {
      return;
    }
    options || (options = {});
    activeColor = this.getOption('lineColorActive');
    lineDashes = this.getOption('lineDashes');
    lineColor = this.getOption('lineColor');
    this.realContext.beginPath();
    activeDia = (ref = source.dia, indexOf.call(this.activeDias, ref) >= 0) ? source : (ref1 = target.dia, indexOf.call(this.activeDias, ref1) >= 0) ? target : void 0;
    if (activeDia) {
      lineColor = options.lineColor || (activeDia.dia.getOption('colorTag')) || activeColor;
      lineDashes = options.lineDashes || (activeDia.dia.getOption('lineDashes')) || lineDashes;
    }
    sJoint = source.dia.getJointPos(source.joint);
    tJoint = target.dia.getJointPos(target.joint);
    this.realContext.strokeStyle = lineColor;
    if (lineDashes.length > 0) {
      this.realContext.setLineDash(lineDashes);
    }
    this.realContext.moveTo(sJoint.x, sJoint.y);
    cd = this.getOption('curveDistance');
    ref2 = [0, 0, 0, 0], sx = ref2[0], sy = ref2[1], tx = ref2[2], ty = ref2[3];
    if ((ref3 = source.joint) === "top" || ref3 === "bottom") {
      sy = source.joint === "top" ? -cd : cd;
    } else if ((ref4 = source.joint) === "left" || ref4 === "right") {
      sx = source.joint === "left" ? -cd : cd;
    }
    if ((ref5 = target.joint) === "top" || ref5 === "bottom") {
      ty = target.joint === "top" ? -cd : cd;
    } else if ((ref6 = target.joint) === "left" || ref6 === "right") {
      tx = target.joint === "left" ? -cd : cd;
    }
    this.realContext.bezierCurveTo(sJoint.x + sx, sJoint.y + sy, tJoint.x + tx, tJoint.y + ty, tJoint.x, tJoint.y);
    this.realContext.lineWidth = this.getOption('lineWidth');
    return this.realContext.stroke();
  };

  KDDiaScene.prototype.addFakeConnection = function(connection) {
    this.drawConnectionLine(connection);
    return this.fakeConnections.push(connection);
  };

  KDDiaScene.prototype.createCanvas = function() {
    var ref, ref1;
    if ((ref = this.realCanvas) != null) {
      ref.destroy();
    }
    if ((ref1 = this.fakeCanvas) != null) {
      ref1.destroy();
    }
    this.addSubView(this.realCanvas = new KDCustomHTMLView({
      tagName: "canvas",
      attributes: this.getSceneSize()
    }));
    this.realContext = this.realCanvas.getElement().getContext("2d");
    if (this.realContext.setLineDash == null) {
      this.realContext.setLineDash = KD.noop;
    }
    this.addSubView(this.fakeCanvas = new KDCustomHTMLView({
      tagName: "canvas",
      cssClass: "fakeCanvas",
      attributes: this.getSceneSize()
    }));
    return this.fakeContext = this.fakeCanvas.getElement().getContext("2d");
  };

  KDDiaScene.prototype.setScale = function(scale) {
    var container, j, len, ref;
    if (scale == null) {
      scale = 1;
    }
    ref = this.containers;
    for (j = 0, len = ref.length; j < len; j++) {
      container = ref[j];
      container.setScale(scale);
    }
    return this.updateScene();
  };

  KDDiaScene.prototype.cleanup = function(canvas) {
    return canvas.setAttributes(this.getSceneSize());
  };

  KDDiaScene.prototype.parentDidResize = function() {
    KDDiaScene.__super__.parentDidResize.apply(this, arguments);
    return _throttle((function(_this) {
      return function() {
        return _this.updateScene();
      };
    })(this))();
  };

  KDDiaScene.prototype.getSceneSize = function() {
    return {
      width: this.getWidth(),
      height: this.getHeight()
    };
  };

  KDDiaScene.prototype.dumpScene = function() {
    return KD.log(this.containers, this.connections);
  };

  KDDiaScene.prototype.reset = function(update) {
    if (update == null) {
      update = true;
    }
    this.connections = [];
    this.fakeConnections = [];
    if (update) {
      return this.updateScene();
    }
  };

  return KDDiaScene;

})(KDView);

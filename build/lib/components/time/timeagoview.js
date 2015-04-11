var $, KD, KDTimeAgoView, KDView, timeago,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

timeago = require('timeago');

module.exports = KDTimeAgoView = (function(superClass) {
  extend(KDTimeAgoView, superClass);

  KDTimeAgoView.registerStaticEmitter();

  KD.utils.repeat(60000, function() {
    return KDTimeAgoView.emit("OneMinutePassed");
  });

  function KDTimeAgoView(options, data) {
    if (options == null) {
      options = {};
    }
    options.tagName = "time";
    KDTimeAgoView.__super__.constructor.call(this, options, data);
    KDTimeAgoView.on("OneMinutePassed", (function(_this) {
      return function() {
        return _this.updatePartial(timeago(_this.getData()));
      };
    })(this));
  }

  KDTimeAgoView.prototype.setData = function() {
    KDTimeAgoView.__super__.setData.apply(this, arguments);
    if (this.parent) {
      return this.updatePartial(timeago(this.getData()));
    }
  };

  KDTimeAgoView.prototype.viewAppended = function() {
    return this.setPartial(timeago(this.getData()));
  };

  return KDTimeAgoView;

})(KDView);

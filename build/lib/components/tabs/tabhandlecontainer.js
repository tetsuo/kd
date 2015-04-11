var KDTabHandleContainer, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

module.exports = KDTabHandleContainer = (function(superClass) {
  extend(KDTabHandleContainer, superClass);

  function KDTabHandleContainer(options, data) {
    if (options == null) {
      options = {};
    }
    KDTabHandleContainer.__super__.constructor.call(this, options, data);
    this.tabs = new KDView({
      cssClass: 'kdtabhandle-tabs clearfix'
    });
  }

  KDTabHandleContainer.prototype.viewAppended = function() {
    return this.addSubView(this.tabs);
  };

  return KDTabHandleContainer;

})(KDView);

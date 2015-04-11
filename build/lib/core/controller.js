var KDController, KDObject,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDObject = require('./object');

module.exports = KDController = (function(superClass) {
  extend(KDController, superClass);

  function KDController() {
    return KDController.__super__.constructor.apply(this, arguments);
  }

  return KDController;

})(KDObject);

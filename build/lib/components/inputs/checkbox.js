var KDCheckBox, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDInputView = require('./inputview');

module.exports = KDCheckBox = (function(superClass) {
  extend(KDCheckBox, superClass);

  function KDCheckBox(options, data) {
    var base;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "checkbox");
    if (options.attributes == null) {
      options.attributes = {};
    }
    if ((base = options.attributes).checked == null) {
      base.checked = options.defaultValue || false;
    }
    KDCheckBox.__super__.constructor.call(this, options, data);
  }

  return KDCheckBox;

})(KDInputView);

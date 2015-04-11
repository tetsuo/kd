var KDDelimitedInputView, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDInputView = require('./inputview');

module.exports = KDDelimitedInputView = (function(superClass) {
  extend(KDDelimitedInputView, superClass);

  function KDDelimitedInputView(options, data) {
    var defaultValue;
    if (options == null) {
      options = {};
    }
    if (options.delimiter == null) {
      options.delimiter = ',';
    }
    if (options.usePadding == null) {
      options.usePadding = true;
    }
    defaultValue = options.defaultValue;
    if ((defaultValue != null ? defaultValue.join : void 0) != null) {
      options.defaultValue = this.join(defaultValue, options);
    }
    KDDelimitedInputView.__super__.constructor.call(this, options, data);
  }

  KDDelimitedInputView.prototype.change = function() {
    return this.setValue(this.getValue());
  };

  KDDelimitedInputView.prototype.getPadding = function(options) {
    if (options == null) {
      options = this.getOptions();
    }
    if (options.usePadding) {
      return ' ';
    } else {
      return '';
    }
  };

  KDDelimitedInputView.prototype.split = function(value, options) {
    if (options == null) {
      options = this.getOptions();
    }
    return this.utils.splitTrim(value, options.delimiter);
  };

  KDDelimitedInputView.prototype.join = function(value, options) {
    if (options == null) {
      options = this.getOptions();
    }
    return value.join("" + options.delimiter + (this.getPadding(options)));
  };

  KDDelimitedInputView.prototype.getValue = function() {
    return this.split(KDDelimitedInputView.__super__.getValue.apply(this, arguments));
  };

  KDDelimitedInputView.prototype.setValue = function(value) {
    return KDDelimitedInputView.__super__.setValue.call(this, value.join != null ? this.join(value) : value);
  };

  return KDDelimitedInputView;

})(KDInputView);

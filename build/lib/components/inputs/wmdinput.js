var KDInputView, KDWmdInput,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDInputView = require('./inputview');

module.exports = KDWmdInput = (function(superClass) {
  extend(KDWmdInput, superClass);

  function KDWmdInput(options, data) {
    var ref;
    options = options != null ? options : {};
    options.type = "textarea";
    options.preview = (ref = options.preview) != null ? ref : false;
    KDWmdInput.__super__.constructor.call(this, options, data);
    this.setClass("monospace");
  }

  KDWmdInput.prototype.setWMD = function() {
    var preview;
    preview = this.getOptions().preview;
    this.getDomElement().wmd({
      preview: preview
    });
    if (preview) {
      return this.getDomElement().after("<h3 class='wmd-preview-title'>Preview:</h3>");
    }
  };

  return KDWmdInput;

})(KDInputView);

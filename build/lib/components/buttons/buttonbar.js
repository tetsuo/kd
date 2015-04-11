var $, KD, KDButtonBar, KDButtonView, KDFormView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

KDButtonView = require('./buttonview');

KDFormView = require('../forms/formview');

module.exports = KDButtonBar = (function(superClass) {
  extend(KDButtonBar, superClass);

  function KDButtonBar(options, data) {
    var button, buttonOptions, buttons, i, len, ref;
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry("formline button-field clearfix", options.cssClass);
    KDButtonBar.__super__.constructor.call(this, options, data);
    this.buttons = {};
    buttons = options.buttons;
    ref = KDFormView.sanitizeFormOptions(buttons);
    for (i = 0, len = ref.length; i < len; i++) {
      buttonOptions = ref[i];
      button = this.createButton(buttonOptions);
      this.addSubView(button);
      this.buttons[buttonOptions.key] = button;
    }
  }

  KDButtonBar.prototype._itemClass = KDButtonView;

  KDButtonBar.prototype.createButton = function(options) {
    var button, o;
    options || (options = {});
    options.itemClass || (options.itemClass = this._itemClass);
    o = $.extend({}, options);
    delete o.itemClass;
    return button = new options.itemClass(o);
  };

  return KDButtonBar;

})(KDView);

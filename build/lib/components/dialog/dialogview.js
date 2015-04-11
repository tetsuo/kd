var $, KD, KDButtonView, KDDialogView, KDOverlayView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

KDOverlayView = require('../overlay/overlayview');

KDButtonView = require('../buttons/buttonview');

module.exports = KDDialogView = (function(superClass) {
  extend(KDDialogView, superClass);

  function KDDialogView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kddialogview', options.cssClass);
    if (options.offset == null) {
      options.offset = true;
    }
    options.container || (options.container = null);
    options.buttons || (options.buttons = {
      Cancel: {
        style: 'clean-red',
        callback: this.bound('hide')
      }
    });
    KDDialogView.__super__.constructor.call(this, options, data);
    this.bindTransitionEnd();
    this.setButtons();
    $(window).one("keydown.kddialogview", (function(_this) {
      return function(event) {
        if (event.which === 27) {
          return _this.hide();
        }
      };
    })(this));
  }

  KDDialogView.prototype.show = function() {
    return KD.utils.defer((function(_this) {
      return function() {
        var container, ref;
        if ((ref = _this.overlay) != null) {
          ref.destroy();
        }
        container = _this.getOptions().container;
        _this.overlay = new KDOverlayView({
          click: _this.bound('hide'),
          container: container
        });
        return _this.setClass('in');
      };
    })(this));
  };

  KDDialogView.prototype.hide = function() {
    this.once('transitionend', (function(_this) {
      return function() {
        _this.overlay.destroy();
        return _this.destroy();
      };
    })(this));
    return this.unsetClass('in');
  };

  KDDialogView.prototype.setButtons = function() {
    var buttonOptions, buttonTitle, buttons, results;
    buttons = this.getOptions().buttons;
    this.buttons = {};
    this.buttonHolder = new KDView({
      cssClass: "kddialog-buttons clearfix"
    });
    this.addSubView(this.buttonHolder);
    results = [];
    for (buttonTitle in buttons) {
      if (!hasProp.call(buttons, buttonTitle)) continue;
      buttonOptions = buttons[buttonTitle];
      results.push(this.createButton(buttonTitle, buttonOptions));
    }
    return results;
  };

  KDDialogView.prototype.createButton = function(title, buttonOptions) {
    var button;
    this.buttonHolder.addSubView(button = new KDButtonView({
      title: title,
      loader: buttonOptions.loader,
      style: buttonOptions.style,
      callback: buttonOptions.callback
    }));
    return this.buttons[title] = button;
  };

  KDDialogView.prototype.destroy = function() {
    $(window).off("keydown.kddialogview");
    return KDDialogView.__super__.destroy.apply(this, arguments);
  };

  return KDDialogView;

})(KDView);

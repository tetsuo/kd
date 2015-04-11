var KD, KDCustomHTMLView, KDHitEnterInputView, KDInputView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

KDInputView = require('./inputview');

module.exports = KDHitEnterInputView = (function(superClass) {
  extend(KDHitEnterInputView, superClass);

  function KDHitEnterInputView(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = 'textarea');
    options.cssClass = KD.utils.curry('hitenterview', options.cssClass);
    options.button || (options.button = null);
    if (options.showButton == null) {
      options.showButton = false;
    }
    options.label || (options.label = null);
    options.placeholder || (options.placeholder = "");
    options.callback || (options.callback = null);
    options.togglerPartials || (options.togglerPartials = ['quick update disabled', 'quick update enabled']);
    KDHitEnterInputView.__super__.constructor.call(this, options, data);
    this.button = (ref = this.getOptions().button) != null ? ref : null;
    this.enableEnterKey();
    if (options.label != null) {
      this.setToggler();
    }
    if (this.getOptions().showButton) {
      this.disableEnterKey();
    }
    this.on('ValidationPassed', (function(_this) {
      return function() {
        var callback;
        callback = _this.getOptions().callback;
        return callback != null ? callback.call(_this, _this.getValue()) : void 0;
      };
    })(this));
  }

  KDHitEnterInputView.prototype.enableEnterKey = function() {
    this.setClass("active");
    if (this.button) {
      this.hideButton();
    }
    if (this.inputEnterToggler != null) {
      this.inputEnterToggler.$().html(this.getOptions().togglerPartials[1]);
    }
    return this.enterKeyEnabled = true;
  };

  KDHitEnterInputView.prototype.disableEnterKey = function() {
    this.unsetClass("active");
    if (this.button) {
      this.showButton();
    }
    if (this.inputEnterToggler != null) {
      this.inputEnterToggler.$().html(this.getOptions().togglerPartials[0]);
    }
    return this.enterKeyEnabled = false;
  };

  KDHitEnterInputView.prototype.setToggler = function() {
    var o;
    o = this.getOptions();
    this.inputEnterToggler = new KDCustomHTMLView({
      tagName: "a",
      cssClass: "hitenterview-toggle",
      partial: o.showButton ? o.togglerPartials[0] : o.togglerPartials[1],
      click: this.bound("toggleEnterKey")
    });
    return this.inputLabel.addSubView(this.inputEnterToggler);
  };

  KDHitEnterInputView.prototype.hideButton = function() {
    return this.button.hide();
  };

  KDHitEnterInputView.prototype.showButton = function() {
    return this.button.show();
  };

  KDHitEnterInputView.prototype.toggleEnterKey = function() {
    if (this.enterKeyEnabled) {
      return this.disableEnterKey();
    } else {
      return this.enableEnterKey();
    }
  };

  KDHitEnterInputView.prototype.keyDown = function(event) {
    if (event.which === 13 && (event.altKey || event.shiftKey) !== true && this.enterKeyEnabled) {
      event.preventDefault();
      this.emit("EnterPerformed");
      this.validate();
      return false;
    } else if (event.which === 27) {
      return this.emit("EscapePerformed");
    }
  };

  return KDHitEnterInputView;

})(KDInputView);

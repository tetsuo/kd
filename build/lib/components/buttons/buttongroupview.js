var KDButtonGroupView, KDButtonView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDButtonView = require('./buttonview');

KDView = require('../../core/view');

module.exports = KDButtonGroupView = (function(superClass) {
  extend(KDButtonGroupView, superClass);

  function KDButtonGroupView(options, data) {
    var cssClass;
    if (options == null) {
      options = {};
    }
    cssClass = options.cssClass;
    cssClass = cssClass ? " " + cssClass : "";
    options.cssClass = "kdbuttongroup" + cssClass;
    options.buttons || (options.buttons = {});
    KDButtonGroupView.__super__.constructor.call(this, options, data);
    this.buttons = {};
    this.createButtons(options.buttons);
  }

  KDButtonGroupView.prototype.createButtons = function(allButtonOptions) {
    var buttonClass, buttonOptions, buttonTitle, results;
    results = [];
    for (buttonTitle in allButtonOptions) {
      if (!hasProp.call(allButtonOptions, buttonTitle)) continue;
      buttonOptions = allButtonOptions[buttonTitle];
      buttonClass = buttonOptions.buttonClass || KDButtonView;
      buttonOptions.title || (buttonOptions.title = buttonTitle);
      buttonOptions.style || (buttonOptions.style = "");
      this.addSubView(this.buttons[buttonTitle] = new buttonClass(buttonOptions));
      results.push(this.buttons[buttonTitle].on("click", (function(_this) {
        return function(event) {
          return _this.buttonReceivedClick(_this.buttons[buttonTitle], event);
        };
      })(this)));
    }
    return results;
  };

  KDButtonGroupView.prototype.buttonReceivedClick = function(button, event) {
    var otherButton, ref, title;
    ref = this.buttons;
    for (title in ref) {
      if (!hasProp.call(ref, title)) continue;
      otherButton = ref[title];
      otherButton.unsetClass("toggle");
    }
    return button.setClass("toggle");
  };

  return KDButtonGroupView;

})(KDView);

var $, KDButtonView, KDCustomHTMLView, KDNoAutocompleteInputView, KDView, NoAutocompleteMultipleListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDButtonView = require('../buttons/buttonview');

KDCustomHTMLView = require('../../core/customhtmlview');

KDView = require('../../core/view');

KDNoAutocompleteInputView = require('./noautocompleteinputview');

module.exports = NoAutocompleteMultipleListView = (function(superClass) {
  extend(NoAutocompleteMultipleListView, superClass);

  function NoAutocompleteMultipleListView(options, data) {
    var defaults;
    if (options == null) {
      options = {};
    }
    defaults = {
      cssClass: 'common-view input-with-extras'
    };
    options = $.extend(defaults, options);
    NoAutocompleteMultipleListView.__super__.constructor.call(this, options, data);
  }

  NoAutocompleteMultipleListView.prototype.viewAppended = function() {
    var button, defaults, icon, input, options, ref;
    ref = this.options, icon = ref.icon, input = ref.input, button = ref.button;
    if (icon) {
      this.setClass("with-icon");
      options = {
        tagName: "span",
        cssClass: "icon " + icon
      };
      this.addSubView(this.icon = new KDCustomHTMLView(options));
    }
    if (input) {
      this.addSubView(this.input = new KDNoAutocompleteInputView(input));
    }
    if (button) {
      defaults = {
        callback: (function(_this) {
          return function(event) {
            event.preventDefault();
            event.stopPropagation();
            return _this.input.inputAddCurrentValue();
          };
        })(this)
      };
      button = $.extend(defaults, button);
      return this.addSubView(this.button = new KDButtonView(button));
    }
  };

  return NoAutocompleteMultipleListView;

})(KDView);

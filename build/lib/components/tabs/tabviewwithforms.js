var $, KDFormViewWithFields, KDTabPaneView, KDTabView, KDTabViewWithForms,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDTabView = require('./tabview');

KDTabPaneView = require('./tabpaneview');

KDFormViewWithFields = require('../forms/formviewwithfields');

module.exports = KDTabViewWithForms = (function(superClass) {
  extend(KDTabViewWithForms, superClass);

  function KDTabViewWithForms(options, data) {
    var forms;
    if (options == null) {
      options = {};
    }
    if (options.navigable == null) {
      options.navigable = true;
    }
    if (options.goToNextFormOnSubmit == null) {
      options.goToNextFormOnSubmit = true;
    }
    KDTabViewWithForms.__super__.constructor.call(this, options, data);
    this.forms = {};
    this.hideHandleCloseIcons();
    forms = this.getOptions().forms;
    if (forms) {
      this.createTabs(forms = KDFormViewWithFields.sanitizeFormOptions(forms));
      this.showPane(this.panes[0]);
    }
    if (forms.length === 1) {
      this.hideHandleContainer();
    }
  }

  KDTabViewWithForms.prototype.handleClicked = function(index, event) {
    if (this.getOptions().navigable) {
      return KDTabViewWithForms.__super__.handleClicked.apply(this, arguments);
    }
  };

  KDTabViewWithForms.prototype.createTab = function(formData, index) {
    var oldCallback, tab;
    this.addPane((tab = new KDTabPaneView({
      name: formData.title
    })), formData.shouldShow);
    oldCallback = formData.callback;
    formData.callback = (function(_this) {
      return function(formData) {
        var forms;
        if (_this.getOptions().goToNextFormOnSubmit) {
          _this.showNextPane();
        }
        if (typeof oldCallback === "function") {
          oldCallback(formData);
        }
        forms = _this.getOptions().forms;
        if (forms && index === Object.keys(forms).length - 1) {
          return _this.fireFinalCallback();
        }
      };
    })(this);
    this.createForm(formData, tab);
    return tab;
  };

  KDTabViewWithForms.prototype.createTabs = function(forms) {
    return forms.forEach((function(_this) {
      return function(formData, i) {
        return _this.createTab(formData, i);
      };
    })(this));
  };

  KDTabViewWithForms.prototype.createForm = function(formData, parentTab) {
    var form;
    parentTab.addSubView(form = new KDFormViewWithFields(formData));
    this.forms[formData.title] = parentTab.form = form;
    return form;
  };

  KDTabViewWithForms.prototype.getFinalData = function() {
    var finalData, j, len, pane, ref;
    finalData = {};
    ref = this.panes;
    for (j = 0, len = ref.length; j < len; j++) {
      pane = ref[j];
      finalData = $.extend(pane.form.getData(), finalData);
    }
    return finalData;
  };

  KDTabViewWithForms.prototype.fireFinalCallback = function() {
    var base, finalData;
    finalData = this.getFinalData();
    return typeof (base = this.getOptions()).callback === "function" ? base.callback(finalData) : void 0;
  };

  return KDTabViewWithForms;

})(KDTabView);

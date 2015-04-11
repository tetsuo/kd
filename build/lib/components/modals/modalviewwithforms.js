var KDModalView, KDModalViewWithForms, KDTabViewWithForms,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDModalView = require('./modalview');

KDTabViewWithForms = require('../tabs/tabviewwithforms');

module.exports = KDModalViewWithForms = (function(superClass) {
  extend(KDModalViewWithForms, superClass);

  function KDModalViewWithForms(options, data) {
    this.modalButtons = [];
    KDModalViewWithForms.__super__.constructor.call(this, options, data);
    this.addSubView(this.modalTabs = new KDTabViewWithForms(options.tabs));
  }

  KDModalViewWithForms.prototype.aggregateFormData = function() {
    var data, form, formName;
    data = (function() {
      var ref, results;
      ref = this.modalTabs.forms;
      results = [];
      for (formName in ref) {
        if (!hasProp.call(ref, formName)) continue;
        form = ref[formName];
        results.push({
          name: formName,
          data: form.getData()
        });
      }
      return results;
    }).call(this);
    return data.reduce(function(acc, form) {
      var key, ref, val;
      ref = form.data;
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        val = ref[key];
        if (key in acc) {
          console.warn("Property " + key + " will be overwitten!");
        }
        acc[key] = val;
      }
      return acc;
    }, {});
  };

  return KDModalViewWithForms;

})(KDModalView);

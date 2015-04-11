var $, KDInputCheckboxGroup, KDInputRadioGroup,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDInputRadioGroup = require('./inputradiogroup');

module.exports = KDInputCheckboxGroup = (function(superClass) {
  extend(KDInputCheckboxGroup, superClass);

  function KDInputCheckboxGroup(options, data) {
    if (options == null) {
      options = {};
    }
    options.checkboxes || (options.checkboxes = []);
    options.radios || (options.radios = options.checkboxes);
    options.type || (options.type = 'checkbox');
    KDInputCheckboxGroup.__super__.constructor.call(this, options, data);
  }

  KDInputCheckboxGroup.prototype.click = function(event) {
    if (event.target.tagName !== 'LABEL') {
      return this.setValue(this.getValue());
    }
  };

  KDInputCheckboxGroup.prototype.getValue = function() {
    var el, i, len, ref, values;
    values = [];
    ref = this.getDomElement().find('input:checked');
    for (i = 0, len = ref.length; i < len; i++) {
      el = ref[i];
      values.push($(el).val());
    }
    return values;
  };

  KDInputCheckboxGroup.prototype.setValue = function(value) {
    var i, len, results, v;
    this.$('input').prop('checked', false);
    this.$('.kd-radio-holder').removeClass('active');
    if (value instanceof Array) {
      results = [];
      for (i = 0, len = value.length; i < len; i++) {
        v = value[i];
        results.push(this._setValue(v));
      }
      return results;
    } else {
      return this._setValue(value);
    }
  };

  KDInputCheckboxGroup.prototype._setValue = function(value) {
    this.$("input[value='" + value + "']").prop('checked', true);
    if (value) {
      return this.$(".kd-radio-holder.role-" + value).addClass('active');
    }
  };

  return KDInputCheckboxGroup;

})(KDInputRadioGroup);

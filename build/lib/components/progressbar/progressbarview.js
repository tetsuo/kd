var KD, KDCustomHTMLView, KDProgressBarView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDProgressBarView = (function(superClass) {
  extend(KDProgressBarView, superClass);

  function KDProgressBarView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry("progressbar-container", options.cssClass);
    if (options.determinate == null) {
      options.determinate = true;
    }
    if (options.initial == null) {
      options.initial = false;
    }
    if (options.title == null) {
      options.title = "";
    }
    KDProgressBarView.__super__.constructor.call(this, options, data);
  }

  KDProgressBarView.prototype.viewAppended = function() {
    var initial, ref, title;
    ref = this.getOptions(), initial = ref.initial, title = ref.title;
    this.createBar();
    return this.updateBar(initial || 1, "%", title);
  };

  KDProgressBarView.prototype.createBar = function(value, label) {
    if (label == null) {
      label = this.getOptions().title;
    }
    this.addSubView(this.bar = new KDCustomHTMLView({
      cssClass: "bar"
    }));
    this.addSubView(this.spinner = new KDCustomHTMLView({
      cssClass: "bar spinner hidden"
    }));
    this.addSubView(this.darkLabel = new KDCustomHTMLView({
      tagName: "span",
      cssClass: 'dark-label'
    }));
    this.bar.addSubView(this.lightLabel = new KDCustomHTMLView({
      tagName: "span",
      cssClass: 'light-label'
    }));
    return this.lightLabel.setWidth(this.getWidth());
  };

  KDProgressBarView.prototype.updateBar = function(value, unit, label) {
    var determinate;
    if (unit == null) {
      unit = '%';
    }
    if (label == null) {
      label = this.getOptions().title;
    }
    determinate = this.getOptions().determinate;
    if (determinate) {
      this.bar.show();
      this.spinner.hide();
      this.bar.setWidth(value, unit);
      this.darkLabel.updatePartial(label + "&nbsp;");
      return this.lightLabel.updatePartial(label + "&nbsp;");
    } else {
      this.bar.hide();
      return this.spinner.show();
    }
  };

  return KDProgressBarView;

})(KDCustomHTMLView);

var $, KDLabelView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDView = require('../../core/view');

module.exports = KDLabelView = (function(superClass) {
  extend(KDLabelView, superClass);

  function KDLabelView(options) {
    if ((options != null ? options.title : void 0) != null) {
      this.setTitle(options.title);
    }
    KDLabelView.__super__.constructor.call(this, options);
  }

  KDLabelView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<label class='kdlabel " + cssClass + "'>" + (this.getTitle()) + "</label>");
  };

  KDLabelView.prototype.setTitle = function(title) {
    return this.labelTitle = title || '';
  };

  KDLabelView.prototype.updateTitle = function(title) {
    this.setTitle(title);
    return this.$().html(title);
  };

  KDLabelView.prototype.getTitle = function() {
    return this.labelTitle;
  };

  return KDLabelView;

})(KDView);

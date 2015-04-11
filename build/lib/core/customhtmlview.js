var KDCustomHTMLView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('./view');

module.exports = KDCustomHTMLView = (function(superClass) {
  extend(KDCustomHTMLView, superClass);

  function KDCustomHTMLView(options, data) {
    var ref, ref1;
    if (options == null) {
      options = {};
    }
    if (typeof options === 'string') {
      this.tagName = options;
    }
    if (this.tagName == null) {
      this.tagName = (ref = options.tagName) != null ? ref : 'div';
    }
    if (this.tagName === 'a' && (((ref1 = options.attributes) != null ? ref1.href : void 0) == null)) {
      options.attributes || (options.attributes = {});
      options.attributes.href = '#';
    }
    KDCustomHTMLView.__super__.constructor.call(this, options, data);
  }

  KDCustomHTMLView.prototype.setDomElement = function(cssClass) {
    var el;
    KDCustomHTMLView.__super__.setDomElement.apply(this, arguments);
    this.unsetClass('kdview');
    el = this.getElement();
    if (!el.classList.length) {
      return el.removeAttribute('class');
    }
  };

  return KDCustomHTMLView;

})(KDView);

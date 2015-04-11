var KDListItemView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

module.exports = KDListItemView = (function(superClass) {
  extend(KDListItemView, superClass);

  function KDListItemView(options, data) {
    var ref, ref1;
    if (options == null) {
      options = {};
    }
    options.type = (ref = options.type) != null ? ref : "default";
    options.cssClass = "kdlistitemview kdlistitemview-" + options.type + " " + ((ref1 = options.cssClass) != null ? ref1 : '');
    options.bind || (options.bind = "mouseenter mouseleave");
    options.childClass || (options.childClass = null);
    options.childOptions || (options.childOptions = {});
    if (options.selectable == null) {
      options.selectable = true;
    }
    KDListItemView.__super__.constructor.call(this, options, data);
    this.content = {};
  }

  KDListItemView.prototype.viewAppended = function() {
    var childClass, childOptions, ref;
    ref = this.getOptions(), childClass = ref.childClass, childOptions = ref.childOptions;
    if (childClass) {
      return this.addSubView(this.child = new childClass(childOptions, this.getData()));
    } else {
      return this.setPartial(this.partial(this.data));
    }
  };

  KDListItemView.prototype.partial = function() {
    return "<div class='kdlistitemview-default-content'> <p>This is a default partial of <b>KDListItemView</b>, you need to override this partial to have your custom content here.</p> </div>";
  };

  KDListItemView.prototype.dim = function() {
    return this.setClass("dimmed");
  };

  KDListItemView.prototype.undim = function() {
    return this.unsetClass("dimmed");
  };

  KDListItemView.prototype.highlight = function() {
    this.undim();
    return this.setClass("selected");
  };

  KDListItemView.prototype.removeHighlight = function() {
    this.undim();
    return this.unsetClass("selected");
  };

  KDListItemView.prototype.getItemDataId = function() {
    var data, id;
    data = this.getData();
    if (!data) {
      return;
    }
    return id = (typeof data.getId === "function" ? data.getId() : void 0) ? data.getId() : data.id != null ? data.id : data._id != null ? data._id : void 0;
  };

  return KDListItemView;

})(KDView);

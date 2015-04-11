var KDFileUploadListView, KDFileUploadThumbItemView, KDFileUploadThumbListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDFileUploadThumbItemView = require('./fileuploadthumbitemview');

KDFileUploadListView = require('./fileuploadlistview');

module.exports = KDFileUploadThumbListView = (function(superClass) {
  extend(KDFileUploadThumbListView, superClass);

  function KDFileUploadThumbListView(options, data) {
    if (options.itemClass == null) {
      options.itemClass = KDFileUploadThumbItemView;
    }
    KDFileUploadThumbListView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadthumblist");
  }

  return KDFileUploadThumbListView;

})(KDFileUploadListView);

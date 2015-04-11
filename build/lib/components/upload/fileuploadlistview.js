var KDFileUploadListItemView, KDFileUploadListView, KDListView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDListView = require('../list/listview');

KDFileUploadListItemView = require('./fileuploadlistitemview');

module.exports = KDFileUploadListView = (function(superClass) {
  extend(KDFileUploadListView, superClass);

  function KDFileUploadListView(options, data) {
    if (options.itemClass == null) {
      options.itemClass = KDFileUploadListItemView;
    }
    KDFileUploadListView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadlist");
    this.itemsByName = {};
  }

  KDFileUploadListView.prototype.addItem = function(file) {
    var itemInstance;
    itemInstance = new (this.getOptions().itemClass)({
      delegate: this
    }, file);
    this.getDelegate().on("removeFile", this.getDelegate().removeFile);
    this.addItem(itemInstance);
    return this.itemsByName[file.name] = itemInstance;
  };

  return KDFileUploadListView;

})(KDListView);

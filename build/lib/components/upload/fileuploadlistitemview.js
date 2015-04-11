var $, KDFileUploadListItemView, KDListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDListItemView = require('../list/listitemview');

module.exports = KDFileUploadListItemView = (function(superClass) {
  extend(KDFileUploadListItemView, superClass);

  function KDFileUploadListItemView(options, data) {
    KDFileUploadListItemView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadlistitem clearfix");
    this.active = false;
  }

  KDFileUploadListItemView.prototype.click = function(e) {
    if ($(e.target).is("span.iconic.x")) {
      return this.emit("removeFile", {
        orgEvent: e
      });
    }
  };

  KDFileUploadListItemView.prototype.viewAppended = function() {
    return this.$().append(this.partial(this.data));
  };

  KDFileUploadListItemView.prototype.partial = function(file) {
    return $("<span class='file-title'>" + file.name + "</span> <span class='file-size'>" + ((file.size / 1024).toFixed(2)) + "kb</span> <span class='x'></span>");
  };

  return KDFileUploadListItemView;

})(KDListItemView);

var $, KDFileUploadThumbItemView, KDListItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDListItemView = require('../list/listitemview');

module.exports = KDFileUploadThumbItemView = (function(superClass) {
  extend(KDFileUploadThumbItemView, superClass);

  function KDFileUploadThumbItemView(options, data) {
    KDFileUploadThumbItemView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadthumbitem clearfix");
    this.active = false;
  }

  KDFileUploadThumbItemView.prototype.click = function(e) {
    if ($(e.target).is("span.iconic.x")) {
      return this.emit("removeFile", {
        orgEvent: e
      });
    }
  };

  KDFileUploadThumbItemView.prototype.viewAppended = function() {
    return this.$().append(this.partial(this.data));
  };

  KDFileUploadThumbItemView.getURLVendor = function() {
    return window.URL || window.webkitURL || window.mozURL;
  };

  KDFileUploadThumbItemView.prototype.partial = function(file) {
    var URL, fileUrl, imageType;
    imageType = /image.*/;
    URL = this.getURLVendor();
    fileUrl = file.type.match(imageType) ? URL.createObjectURL(file) : "./a/images/icon.file.png";
    return $("<img class='thumb' src='" + fileUrl + "'/> <p class='meta'> <span class='file-title'>" + file.name + "</span> <span class='file-size'>" + ((file.size / 1024).toFixed(2)) + "kb</span> <span class='close-icon'></span> </p>");
  };

  return KDFileUploadThumbItemView;

})(KDListItemView);

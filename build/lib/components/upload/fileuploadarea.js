var KDCustomHTMLView, KDFileUploadArea, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDFileUploadArea = (function(superClass) {
  extend(KDFileUploadArea, superClass);

  function KDFileUploadArea() {
    return KDFileUploadArea.__super__.constructor.apply(this, arguments);
  }

  KDFileUploadArea.prototype.dragEnter = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.setClass("hover");
  };

  KDFileUploadArea.prototype.dragOver = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.setClass("hover");
  };

  KDFileUploadArea.prototype.dragLeave = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.unsetClass("hover");
  };

  KDFileUploadArea.prototype.drop = function(jQueryEvent) {
    var file, files, i, len, orgEvent;
    jQueryEvent.preventDefault();
    jQueryEvent.stopPropagation();
    this.unsetClass("hover");
    orgEvent = jQueryEvent.originalEvent;
    files = orgEvent.dataTransfer.files;
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      this.getDelegate().fileDropped(file);
    }
    return false;
  };

  KDFileUploadArea.prototype.viewAppended = function() {
    var o, title;
    title = this.getOptions().title;
    o = this.getDelegate().getOptions();
    this.setPartial("<span>" + title + "</span>");
    return this.addSubView(new KDCustomHTMLView({
      cssClass: "info",
      tagName: "span",
      tooltip: {
        title: "Max. File Amount: <b>" + o.limit + "</b> files<br/>Max. File Size: <b>" + o.fileMaxSize + "</b> kbytes<br/>Max. Total Size: <b>" + o.totalMaxSize + "</b> kbytes",
        placement: "above",
        offset: 0,
        delayIn: 300,
        html: true,
        animate: true,
        selector: null,
        partial: "i"
      }
    }));
  };

  return KDFileUploadArea;

})(KDView);

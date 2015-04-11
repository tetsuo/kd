var KDFileUploadArea, KDFileUploadListView, KDFileUploadThumbListView, KDFileUploadView, KDListViewController, KDMultipartUploader, KDNotificationView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');

KDListViewController = require('../list/listviewcontroller');

KDNotificationView = require('../notifications/notificationview');

KDFileUploadArea = require('./fileuploadarea');

KDFileUploadListView = require('./fileuploadlistview');

KDFileUploadThumbListView = require('./fileuploadthumblistview');

KDMultipartUploader = require('./multipartuploader');

module.exports = KDFileUploadView = (function(superClass) {
  extend(KDFileUploadView, superClass);

  function KDFileUploadView(options, data) {
    if (window.FileReader != null) {
      if (options.limit == null) {
        options.limit = 20;
      }
      if (options.fileMaxSize == null) {
        options.fileMaxSize = 4096;
      }
      if (options.filetotalSize == null) {
        options.filetotalSize = 4096;
      }
      if (options.extensions == null) {
        options.extensions = null;
      }
      if (options.preview == null) {
        options.preview = "list";
      }
      if (options.title == null) {
        options.title = "Drop your files here!";
      }
      if (options.onlyOne == null) {
        options.onlyOne = false;
      }
      KDFileUploadView.__super__.constructor.call(this, options, data);
      this.listController = null;
      this.addDropArea();
      this.addList();
      this.files = {};
      this.totalSizeToUpload = 0;
      this.setClass("kdfileupload");
    } else {
      KDFileUploadView.__super__.constructor.call(this, options, data);
      this.setPartial("<p class='warning info'><strong>Oops sorry,</strong> file upload is only working on Chrome, Firefox and Opera at the moment. We're working on a fix.</p>");
    }
  }

  KDFileUploadView.prototype.addDropArea = function() {
    this.dropArea = new KDFileUploadArea({
      title: this.getOptions().title,
      bind: 'drop dragenter dragleave dragover dragstart dragend',
      cssClass: "kdfileuploadarea",
      delegate: this
    });
    return this.addSubView(this.dropArea);
  };

  KDFileUploadView.prototype.addList = function() {
    this.fileList = (function() {
      switch (this.getOptions().preview) {
        case "thumbs":
          return this.addThumbnailList();
        default:
          return this.addFileList();
      }
    }).call(this);
    this.listController = new KDListViewController({
      view: this.fileList
    });
    return this.addSubView(this.listController.getView());
  };

  KDFileUploadView.prototype.addFileList = function() {
    return new KDFileUploadListView({
      delegate: this
    });
  };

  KDFileUploadView.prototype.addThumbnailList = function() {
    return new KDFileUploadThumbListView({
      delegate: this
    });
  };

  KDFileUploadView.prototype.fileDropped = function(file) {
    var uploader;
    uploader = new KDMultipartUploader({
      url: '/Upload',
      file: file
    });
    uploader.send();
    uploader.once('FileReadComplete', (function(_this) {
      return function(event) {
        _this.emit('FileReadComplete', {
          file: file,
          progressEvent: event
        });
        return _this.fileReadComplete(file, event);
      };
    })(this));
    uploader.once('FileUploadSuccess', (function(_this) {
      return function(res) {
        return _this.fileUploadComplete(file, res);
      };
    })(this));
    return uploader.once('FileUploadError', this.bound('handleUploadError'));
  };

  KDFileUploadView.prototype.handleUploadError = function(xhr) {};

  KDFileUploadView.prototype.fileUploadComplete = function(file, res) {
    var ref;
    if ((ref = this.fileList.itemsByName[file.name]) != null) {
      ref.setClass('uploaded');
    }
    return this.emit('FileUploadComplete', res);
  };

  KDFileUploadView.prototype.fileReadComplete = function(file, event) {
    file.data = event.target.result;
    return this.putFileInQueue(file);
  };

  KDFileUploadView.prototype.putFileInQueue = function(file) {
    if (this.getOptions().onlyOne) {
      this.files = {};
      this.fileList.empty();
    }
    if (!this.isDuplicate(file) && this.checkLimits(file)) {
      this.files[file.name] = file;
      this.fileList.addItem(file);
      return true;
    } else {
      return false;
    }
  };

  KDFileUploadView.prototype.removeFile = function(pubInst, event) {
    var file;
    file = pubInst.getData();
    delete this.files[file.name];
    return this.fileList.removeItem(pubInst);
  };

  KDFileUploadView.prototype.isDuplicate = function(file) {
    if (this.files[file.name] != null) {
      this.notify("File is already in queue!");
      return true;
    } else {
      return false;
    }
  };

  KDFileUploadView.prototype.checkLimits = function(file) {
    return this.checkFileAmount() && this.checkFileSize(file) && this.checkTotalSize(file);
  };

  KDFileUploadView.prototype.checkFileAmount = function() {
    var amount, file, maxAmount, name, ref;
    maxAmount = this.getOptions().limit;
    amount = 1;
    ref = this.files;
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      file = ref[name];
      amount++;
    }
    if (amount > maxAmount) {
      this.notify("Total number of allowed file is " + maxAmount);
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.checkTotalSize = function(file) {
    var name, ref, totalMaxSize, totalSize;
    totalMaxSize = this.getOptions().totalMaxSize;
    totalSize = file.size;
    ref = this.files;
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      file = ref[name];
      totalSize += file.size;
    }
    if (totalSize / 1024 > totalMaxSize) {
      this.notify("Total allowed filesize is " + totalMaxSize + " kilobytes");
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.checkFileSize = function(file) {
    var fileMaxSize;
    fileMaxSize = this.getOptions().fileMaxSize;
    if (file.size / 1024 > fileMaxSize) {
      this.notify("Maximum allowed filesize is " + fileMaxSize + " kilobytes");
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.notify = function(title) {
    return new KDNotificationView({
      title: title,
      duration: 2000,
      type: "tray"
    });
  };

  return KDFileUploadView;

})(KDView);

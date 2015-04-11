var KDEventEmitter, KDMultipartUploader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDEventEmitter = require('../../core/eventemitter');

module.exports = KDMultipartUploader = (function(superClass) {
  var boundary;

  extend(KDMultipartUploader, superClass);

  boundary = "gc0p4Jq0M2Yt08jU534c0p";

  function KDMultipartUploader(arg) {
    var id;
    this.url = arg.url, this.file = arg.file, id = arg.id;
    if (!("FileReader" in window)) {
      throw new Error("FileReader API not found!");
    }
    KDMultipartUploader.__super__.constructor.call(this);
    this.id = id != null ? id : 'file';
  }

  KDMultipartUploader.prototype.makeMultipartItem = function(name, value) {
    return "--" + boundary + "\r\n Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n " + value + "\r\n";
  };

  KDMultipartUploader.prototype.serializedToMultipart = function(list) {
    var i;
    return ((function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = list.length; j < len1; j++) {
        i = list[j];
        results.push(this.makeMultipartItem(i.name, i.value));
      }
      return results;
    }).call(this)).join("");
  };

  KDMultipartUploader.prototype.fileToMultipart = function(callback) {
    var fr, wrapFile;
    fr = new FileReader;
    if (!this.file) {
      return callback("");
    }
    wrapFile = (function(_this) {
      return function(fileData) {
        return "--" + boundary + "\r\n Content-Disposition: form-data; name=\"" + _this.id + "\"; filename=\"" + _this.file.name + "\"\r\n Content-Type: " + _this.file.type + "\r\n\r\n " + fileData + "\r\n --" + boundary + "--\r\n";
      };
    })(this);
    fr.onload = (function(_this) {
      return function(event) {
        if (event.loaded !== event.total) {
          return;
        }
        _this.emit('FileReadComplete', event);
        return callback(wrapFile(event.currentTarget.result));
      };
    })(this);
    return fr.readAsBinaryString(this.file);
  };

  KDMultipartUploader.prototype.send = function() {
    var body, fr, xhr;
    fr = new FileReader;
    xhr = new XMLHttpRequest;
    body = "";
    xhr.open("POST", this.url, true);
    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
    xhr.onreadystatechange = (function(_this) {
      return function() {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status >= 200 && xhr.status < 400) {
          return _this.emit('FileUploadSuccess', JSON.parse(xhr.responseText));
        } else {
          return _this.emit('FileUploadError', xhr);
        }
      };
    })(this);
    body += this.serializedToMultipart([
      {
        name: this.id + "-size",
        value: this.file.size
      }
    ]);
    this.fileToMultipart(function(fileData) {
      var arrb, blob, i, len, ui8a;
      body += fileData;
      len = i = body.length;
      arrb = new ArrayBuffer(len);
      ui8a = new Uint8Array(arrb);
      while (i--) {
        ui8a[i] = body.charCodeAt(i) & 0xff;
      }
      blob = new Blob([ui8a]);
      return xhr.send(blob);
    });
    return this;
  };

  return KDMultipartUploader;

})(KDEventEmitter);

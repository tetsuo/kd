var KD, KDButtonView, KDCustomHTMLView, KDView, KDWebcamView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

KDCustomHTMLView = require('../../core/customhtmlview');

KDButtonView = require('../buttons/buttonview');

module.exports = KDWebcamView = (function(superClass) {
  extend(KDWebcamView, superClass);

  function KDWebcamView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass || (options.cssClass = "kdwebcamview");
    if (options.screenFlash == null) {
      options.screenFlash = true;
    }
    if (options.hideControls == null) {
      options.hideControls = false;
    }
    options.snapTitle || (options.snapTitle = "Snap Photo");
    options.resnapTitle || (options.resnapTitle = "Resnap");
    options.saveTitle || (options.saveTitle = "Save");
    if (options.countdown == null) {
      options.countdown = 3;
    }
    KDWebcamView.__super__.constructor.call(this, options, data);
    this.attachEvents();
    this.video = new KDCustomHTMLView({
      tagName: "video",
      attributes: {
        autoplay: true
      }
    });
    this.picture = new KDCustomHTMLView({
      tagName: "canvas"
    });
    this.button = options.hideControls ? new KDView({
      cssClass: "hidden"
    }) : new KDButtonView({
      title: options.snapTitle,
      cssClass: "snap-button hidden",
      callback: this.bound('countDown')
    });
    this.retake = options.hideControls ? new KDView({
      cssClass: "hidden"
    }) : new KDButtonView({
      title: options.resnapTitle,
      cssClass: "snap-button retake hidden",
      callback: (function(_this) {
        return function() {
          return _this.resetView();
        };
      })(this)
    });
    this.save = options.hideControls ? new KDView({
      cssClass: "hidden"
    }) : new KDButtonView({
      title: options.saveTitle,
      cssClass: "snap-button save hidden",
      callback: (function(_this) {
        return function() {
          _this.resetView();
          _this.video.setClass("invisible");
          _this.button.hide();
          return _this.emit("save");
        };
      })(this)
    });
  }

  KDWebcamView.prototype.attachEvents = function() {
    var snapTitle;
    snapTitle = this.getOptions().snapTitle;
    this.on("KDObjectWillBeDestroyed", (function(_this) {
      return function() {
        return _this.unsetVideoStream();
      };
    })(this));
    this.on("viewAppended", (function(_this) {
      return function() {
        _this.context = _this.picture.getElement().getContext("2d");
        return _this.getUserMedia();
      };
    })(this));
    this.on("error", function(error) {
      return this.emit("forbidden");
    });
    this.on("snap", (function(_this) {
      return function() {
        return _this.video.setClass("invisible");
      };
    })(this));
    return this.on("countDownEnd", (function(_this) {
      return function() {
        _this.button.hide();
        _this.retake.show();
        _this.save.show();
        _this.takePicture();
        return _this.button.setTitle(snapTitle);
      };
    })(this));
  };

  KDWebcamView.prototype.resetView = function() {
    this.button.show();
    this.retake.hide();
    this.save.hide();
    return this.reset();
  };

  KDWebcamView.prototype.reset = function() {
    return this.video.unsetClass("invisible");
  };

  KDWebcamView.prototype.countDown = function() {
    var count, countdown, counter, timer;
    countdown = this.getOptions().countdown;
    if (countdown > 0) {
      counter = (function(_this) {
        return function() {
          _this.button.setTitle(countdown);
          return countdown--;
        };
      })(this);
      count = this.utils.repeat(1000, counter);
      counter();
      return timer = this.utils.wait((countdown + 1) * 1000, (function(_this) {
        return function() {
          _this.utils.killRepeat(count);
          _this.utils.killWait(timer);
          return _this.emit("countDownEnd");
        };
      })(this));
    } else {
      return this.emit("countDownEnd");
    }
  };

  KDWebcamView.prototype.autoResize = function() {
    var size, video;
    video = this.video.getElement();
    size = {
      width: video.clientWidth,
      height: video.clientHeight
    };
    this.picture.setAttributes(size);
    return this.setSize(size);
  };

  KDWebcamView.prototype.unsetVideoStream = function() {
    var ref, video;
    video = this.video.getElement();
    video.pause();
    KDWebcamView.setVideoStreamVendor(video, "");
    return (ref = this.localMediaStream) != null ? ref.stop() : void 0;
  };

  KDWebcamView.prototype.setVideoStream = function(stream) {
    var video;
    video = this.video.getElement();
    KDWebcamView.setVideoStreamVendor(video, stream);
    video.play();
    return video.addEventListener("playing", (function(_this) {
      return function() {
        _this.show();
        _this.button.show();
        _this.autoResize();
        return _this.emit("allowed");
      };
    })(this));
  };

  KDWebcamView.setVideoStreamVendor = function(video, stream) {
    if (video.mozSrcObject !== void 0) {
      return video.mozSrcObject = stream;
    } else {
      return video.src = stream;
    }
  };

  KDWebcamView.getUserMediaVendor = function() {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  };

  KDWebcamView.getURLVendor = function() {
    return window.URL || window.webkitURL || window.mozURL;
  };

  KDWebcamView.prototype.getUserMedia = function() {
    var _onError;
    _onError = (function(_this) {
      return function(error) {
        return _this.emit("error", error);
      };
    })(this);
    navigator.getUserMedia = KDWebcamView.getUserMediaVendor();
    window.URL = KDWebcamView.getURLVendor();
    if (navigator.getUserMedia) {
      return navigator.getUserMedia({
        video: true
      }, (function(_this) {
        return function(stream) {
          _this.localMediaStream = stream;
          return _this.setVideoStream((window.URL && window.URL.createObjectURL(stream)) || stream);
        };
      })(this), _onError);
    } else {
      return _onError({
        notSupported: true
      });
    }
  };

  KDWebcamView.prototype.flash = function() {
    var flash;
    flash = new KDView({
      cssClass: "kdwebcamview-flash"
    });
    flash.appendToDomBody();
    return KD.utils.defer(function() {
      flash.setClass("flashed");
      return KD.utils.wait(500, function() {
        return flash.destroy();
      });
    });
  };

  KDWebcamView.prototype.takePicture = function() {
    var picture, screenFlash, video;
    video = this.video.getElement();
    picture = this.picture.getElement();
    screenFlash = this.getOptions().screenFlash;
    if (screenFlash) {
      this.flash();
    }
    this.autoResize();
    this.context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
    return this.emit("snap", picture.toDataURL(), picture);
  };

  KDWebcamView.prototype.viewAppended = function() {
    var i, len, ref, results, view;
    KDWebcamView.__super__.viewAppended.call(this);
    ref = [this.button, this.save, this.retake, this.video, this.picture];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(this.addSubView(view));
    }
    return results;
  };

  return KDWebcamView;

})(KDView);

var $, KDLoaderView, KDNotificationView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDView = require('../../core/view');

KDLoaderView = require('../loader/loaderview');

module.exports = KDNotificationView = (function(superClass) {
  extend(KDNotificationView, superClass);

  function KDNotificationView(options) {
    KDNotificationView.__super__.constructor.call(this, options);
    options = this.notificationSetDefaults(options);
    this.notificationSetType(options.type);
    if (options.title != null) {
      this.notificationSetTitle(options.title);
    }
    if (options.content != null) {
      this.notificationSetContent(options.content);
    }
    if (options.duration != null) {
      this.notificationSetTimer(options.duration);
    }
    if (options.overlay != null) {
      this.notificationSetOverlay(options.overlay);
    }
    if (options.followUps != null) {
      this.notificationSetFollowUps(options.followUps);
    }
    if (options.showTimer != null) {
      this.notificationShowTimer();
    }
    this.notificationSetCloseHandle(options.closeManually);
    if (options.loader) {
      this.once("viewAppended", this.bound("setLoader"));
    }
    this.notificationDisplay();
  }

  KDNotificationView.prototype.setDomElement = function(cssClass) {
    if (cssClass == null) {
      cssClass = '';
    }
    return this.domElement = $("<div class='kdnotification " + cssClass + "'> <a class='kdnotification-close hidden'></a> <div class='kdnotification-timer hidden'></div> <div class='kdnotification-title'></div> <div class='kdnotification-content hidden'></div> </div>");
  };

  KDNotificationView.prototype.destroy = function() {
    this.notificationCloseHandle.unbind(".notification");
    if (this.notificationOverlay != null) {
      this.notificationOverlay.remove();
    }
    KDNotificationView.__super__.destroy.call(this);
    this.notificationStopTimer();
    return this.notificationRepositionOtherNotifications();
  };

  KDNotificationView.prototype.viewAppended = function() {
    return this.notificationSetPositions();
  };

  KDNotificationView.prototype.notificationSetDefaults = function(options) {
    if (options.duration == null) {
      options.duration = 1500;
    }
    if (options.duration > 2999 || options.duration === 0) {
      if (options.closeManually == null) {
        options.closeManually = true;
      }
    }
    return options;
  };

  KDNotificationView.prototype.notificationSetTitle = function(title) {
    if (!(title instanceof KDView)) {
      this.$().find(".kdnotification-title").html(title);
    } else {
      if (this.notificationTitle && this.notificationTitle instanceof KDView) {
        this.notificationTitle.destroy();
      }
      this.addSubView(title, ".kdnotification-title");
    }
    return this.notificationTitle = title;
  };

  KDNotificationView.prototype.notificationSetType = function(type) {
    if (type == null) {
      type = "main";
    }
    return this.notificationType = type;
  };

  KDNotificationView.prototype.notificationSetPositions = function() {
    var bottomMargin, i, k, l, len, len1, notification, sameTypeNotifications, styles, topMargin, winHeight, winWidth;
    this.setClass(this.notificationType);
    sameTypeNotifications = $("body").find(".kdnotification." + this.notificationType);
    if (this.getOptions().container) {
      winHeight = this.getOptions().container.getHeight();
      winWidth = this.getOptions().container.getWidth();
    } else {
      winWidth = window.innerWidth;
      winHeight = window.innerHeight;
    }
    switch (this.notificationType) {
      case "tray":
        bottomMargin = 8;
        for (i = k = 0, len = sameTypeNotifications.length; k < len; i = ++k) {
          notification = sameTypeNotifications[i];
          if (i !== 0) {
            bottomMargin += $(notification).outerHeight(false) + 8;
          }
        }
        styles = {
          bottom: bottomMargin,
          right: 8,
          paddingRight: this.options.content && this.options.title ? 10 : 25
        };
        break;
      case "growl":
        topMargin = 63;
        for (i = l = 0, len1 = sameTypeNotifications.length; l < len1; i = ++l) {
          notification = sameTypeNotifications[i];
          if (i !== 0) {
            topMargin += $(notification).outerHeight(false) + 8;
          }
        }
        styles = {
          top: topMargin,
          right: 8
        };
        break;
      case "mini":
        styles = {
          top: 0,
          left: winWidth / 2 - this.getDomElement().width() / 2
        };
        break;
      case "sticky":
        styles = {
          top: 0,
          left: winWidth / 2 - this.getDomElement().width() / 2
        };
        break;
      default:
        styles = {
          top: winHeight / 2 - this.getDomElement().height() / 2,
          left: winWidth / 2 - this.getDomElement().width() / 2
        };
    }
    return this.getDomElement().css(styles);
  };

  KDNotificationView.prototype.notificationRepositionOtherNotifications = function() {
    var elm, h, heights, i, j, k, l, len, len1, newValue, options, position, ref, results, sameTypeNotifications;
    sameTypeNotifications = $("body").find(".kdnotification." + this.notificationType);
    heights = (function() {
      var k, len, results;
      results = [];
      for (i = k = 0, len = sameTypeNotifications.length; k < len; i = ++k) {
        elm = sameTypeNotifications[i];
        results.push($(elm).outerHeight(false));
      }
      return results;
    })();
    results = [];
    for (i = k = 0, len = sameTypeNotifications.length; k < len; i = ++k) {
      elm = sameTypeNotifications[i];
      switch (this.notificationType) {
        case "tray":
        case "growl":
          newValue = 0;
          position = this.notificationType === "tray" ? "bottom" : "top";
          ref = heights.slice(0, +i + 1 || 9e9);
          for (j = l = 0, len1 = ref.length; l < len1; j = ++l) {
            h = ref[j];
            if (j !== 0) {
              newValue += h;
            } else {
              newValue = 8;
            }
          }
          options = {};
          options[position] = newValue + i * 8;
          results.push($(elm).css(options));
          break;
        default:
          results.push(void 0);
      }
    }
    return results;
  };

  KDNotificationView.prototype.notificationSetCloseHandle = function(closeManually) {
    if (closeManually == null) {
      closeManually = false;
    }
    this.notificationCloseHandle = this.getDomElement().find(".kdnotification-close");
    if (closeManually) {
      this.notificationCloseHandle.removeClass("hidden");
    }
    this.notificationCloseHandle.bind("click.notification", (function(_this) {
      return function(e) {
        return _this.destroy();
      };
    })(this));
    return $(window).bind("keydown.notification", (function(_this) {
      return function(e) {
        if (e.which === 27) {
          return _this.destroy();
        }
      };
    })(this));
  };

  KDNotificationView.prototype.notificationSetTimer = function(duration) {
    if (duration === 0) {
      return;
    }
    this.notificationTimerDiv = this.getDomElement().find(".kdnotification-timer");
    this.notificationTimerDiv.text(Math.floor(duration / 1000));
    this.notificationTimeout = setTimeout((function(_this) {
      return function() {
        return _this.getDomElement().fadeOut(200, function() {
          return _this.destroy();
        });
      };
    })(this), duration);
    return this.notificationInterval = setInterval((function(_this) {
      return function() {
        var next;
        next = parseInt(_this.notificationTimerDiv.text(), 10) - 1;
        return _this.notificationTimerDiv.text(next);
      };
    })(this), 1000);
  };

  KDNotificationView.prototype.notificationSetFollowUps = function(followUps) {
    var chainDuration;
    if (!Array.isArray(followUps)) {
      followUps = [followUps];
    }
    chainDuration = 0;
    return followUps.forEach((function(_this) {
      return function(followUp) {
        var ref;
        chainDuration += (ref = followUp.duration) != null ? ref : 10000;
        return _this.utils.wait(chainDuration, function() {
          if (followUp.title) {
            _this.notificationSetTitle(followUp.title);
          }
          if (followUp.content) {
            _this.notificationSetContent(followUp.content);
          }
          return _this.notificationSetPositions();
        });
      };
    })(this));
  };

  KDNotificationView.prototype.notificationShowTimer = function() {
    this.notificationTimerDiv.removeClass("hidden");
    this.getDomElement().bind("mouseenter", (function(_this) {
      return function() {
        return _this.notificationStopTimer();
      };
    })(this));
    return this.getDomElement().bind("mouseleave", (function(_this) {
      return function() {
        var newDuration;
        newDuration = parseInt(_this.notificationTimerDiv.text(), 10) * 1000;
        return _this.notificationSetTimer(newDuration);
      };
    })(this));
  };

  KDNotificationView.prototype.notificationStopTimer = function() {
    clearTimeout(this.notificationTimeout);
    return clearInterval(this.notificationInterval);
  };

  KDNotificationView.prototype.notificationSetOverlay = function(options) {
    if (options.transparent == null) {
      options.transparent = true;
    }
    if (options.destroyOnClick == null) {
      options.destroyOnClick = true;
    }
    this.notificationOverlay = $("<div/>", {
      "class": "kdoverlay transparent"
    });
    this.notificationOverlay.hide();
    if (!options.transparent) {
      this.notificationOverlay.removeClass("transparent");
    }
    this.notificationOverlay.appendTo("body");
    this.notificationOverlay.fadeIn(200);
    return this.notificationOverlay.bind("click", (function(_this) {
      return function() {
        if (options.destroyOnClick) {
          return _this.destroy();
        }
      };
    })(this));
  };

  KDNotificationView.prototype.notificationGetOverlay = function() {
    return this.notificationOverlay;
  };

  KDNotificationView.prototype.setLoader = function() {
    var diameters, loader, ref, ref1, ref2, ref3;
    this.setClass("w-loader");
    loader = this.getOptions().loader;
    diameters = {
      tray: 25,
      growl: 30,
      mini: 18,
      sticky: 25
    };
    loader.diameter = diameters[this.notificationType] || 30;
    this.loader = new KDLoaderView({
      size: {
        width: loader.diameter
      },
      loaderOptions: {
        color: loader.color || "#ffffff",
        shape: loader.shape || "spiral",
        diameter: loader.diameter,
        density: (ref = loader.density) != null ? ref : 30,
        range: (ref1 = loader.range) != null ? ref1 : 0.4,
        speed: (ref2 = loader.speed) != null ? ref2 : 1.5,
        FPS: (ref3 = loader.FPS) != null ? ref3 : 24
      }
    });
    this.addSubView(this.loader, null, true);
    this.setCss("paddingLeft", loader.diameter * 2);
    this.loader.setStyle({
      position: "absolute",
      left: loader.left || Math.floor(loader.diameter / 2),
      top: loader.top || "50%",
      marginTop: -(loader.diameter / 2)
    });
    return this.loader.show();
  };

  KDNotificationView.prototype.showLoader = function() {
    this.setClass("loading");
    return this.loader.show();
  };

  KDNotificationView.prototype.hideLoader = function() {
    this.unsetClass("loading");
    return this.loader.hide();
  };

  KDNotificationView.prototype.notificationSetContent = function(content) {
    this.notificationContent = content;
    return this.getDomElement().find(".kdnotification-content").removeClass("hidden").html(content);
  };

  KDNotificationView.prototype.notificationDisplay = function() {
    if (this.getOptions().container) {
      return this.getOptions().container.addSubView(this);
    } else {
      return this.appendToDomBody();
    }
  };

  return KDNotificationView;

})(KDView);

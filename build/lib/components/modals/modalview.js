var $, KD, KDButtonView, KDModalView, KDModalViewStack, KDOverlayView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

KDOverlayView = require('../overlay/overlayview');

KDButtonView = require('../buttons/buttonview');

KDModalViewStack = require('./modalviewstack');

module.exports = KDModalView = (function(superClass) {
  extend(KDModalView, superClass);

  function KDModalView(options, data) {
    var modalButtonsInnerWidth;
    if (options == null) {
      options = {};
    }
    if (options.overlay == null) {
      options.overlay = false;
    }
    if (options.overlayClick == null) {
      options.overlayClick = true;
    }
    options.height || (options.height = "auto");
    if (options.width == null) {
      options.width = 600;
    }
    options.position || (options.position = {});
    options.title || (options.title = null);
    options.subtitle || (options.subtitle = null);
    options.content || (options.content = null);
    options.buttons || (options.buttons = null);
    if (options.fx == null) {
      options.fx = false;
    }
    options.view || (options.view = null);
    if (options.draggable == null) {
      options.draggable = {
        handle: '.kdmodal-title'
      };
    }
    if (options.resizable == null) {
      options.resizable = false;
    }
    if (options.appendToDomBody == null) {
      options.appendToDomBody = true;
    }
    options.helpContent || (options.helpContent = null);
    options.helpTitle || (options.helpTitle = "Need help?");
    if (options.cancelable == null) {
      options.cancelable = true;
    }
    KDModalView.__super__.constructor.call(this, options, data);
    this.setClass("initial");
    if (options.overlay) {
      this.putOverlay(options.overlay);
    }
    if (options.fx) {
      this.setClass("fx");
    }
    if (options.title) {
      this.setTitle(options.title);
    }
    if (options.subtitle) {
      this.setSubtitle(options.subtitle);
    }
    if (options.content) {
      this.setContent(options.content);
    }
    if (options.view) {
      this.addSubView(options.view);
    }
    if (options.cancel) {
      this.on('ModalCancelled', options.cancel);
    }
    this.on("viewAppended", (function(_this) {
      return function() {
        return _this.utils.wait(500, function() {
          return _this.unsetClass("initial");
        });
      };
    })(this));
    if (this.getOptions().appendToDomBody) {
      this.appendToDomBody();
    }
    this.setModalWidth(options.width);
    if (options.height) {
      this.setModalHeight(options.height);
    }
    if (options.buttons) {
      this.buttonHolder = new KDView({
        cssClass: "kdmodal-buttons clearfix"
      });
      this.addSubView(this.buttonHolder, ".kdmodal-inner");
      this.setButtons(options.buttons);
      modalButtonsInnerWidth = this.$(".kdmodal-inner").width();
      this.buttonHolder.setWidth(modalButtonsInnerWidth);
    }
    this.display();
    this._windowDidResize();
    $(window).one("keydown.modal", (function(_this) {
      return function(e) {
        if (e.which === 27) {
          return _this.cancel();
        }
      };
    })(this));
    this.on("childAppended", this.setPositions.bind(this));
    this.listenWindowResize();
  }

  KDModalView.prototype.setDomElement = function(cssClass) {
    var helpButton, helpContent, helpTitle, ref;
    ref = this.getOptions(), helpContent = ref.helpContent, helpTitle = ref.helpTitle;
    if (helpContent) {
      helpButton = "<span class='showHelp'>" + helpTitle + "</span>";
    } else {
      helpButton = "";
    }
    return this.domElement = $("<div class='kdmodal " + cssClass + "'>\n  <div class='kdmodal-inner'>\n    " + helpButton + "\n    <span class='close-icon closeModal' title='Close [ESC]'></span>\n    <div class='kdmodal-title hidden'></div>\n    <div class='kdmodal-content'></div>\n  </div>\n</div>");
  };

  KDModalView.prototype.addSubView = function(view, selector, shouldPrepend) {
    if (selector == null) {
      selector = ".kdmodal-content";
    }
    if (shouldPrepend == null) {
      shouldPrepend = false;
    }
    if (this.$(selector).length === 0) {
      selector = null;
    }
    return KDModalView.__super__.addSubView.call(this, view, selector, shouldPrepend);
  };

  KDModalView.prototype.setButtons = function(buttonDataSet, destroyExists) {
    var button, buttonOptions, buttonTitle, defaultFocusTitle, focused, ref;
    if (destroyExists == null) {
      destroyExists = false;
    }
    this.buttons || (this.buttons = {});
    this.setClass("with-buttons");
    defaultFocusTitle = null;
    if (destroyExists) {
      this.destroyButtons();
    }
    for (buttonTitle in buttonDataSet) {
      if (!hasProp.call(buttonDataSet, buttonTitle)) continue;
      buttonOptions = buttonDataSet[buttonTitle];
      if (defaultFocusTitle == null) {
        defaultFocusTitle = buttonTitle;
      }
      button = this.createButton(buttonOptions.title || buttonTitle, buttonOptions);
      this.buttons[buttonTitle] = button;
      if (buttonOptions.focus) {
        focused = true;
      }
    }
    if (!focused && defaultFocusTitle) {
      return (ref = this.buttons[defaultFocusTitle]) != null ? ref.setFocus() : void 0;
    }
  };

  KDModalView.prototype.destroyButtons = function() {
    var _key, button, ref, results;
    ref = this.buttons;
    results = [];
    for (_key in ref) {
      if (!hasProp.call(ref, _key)) continue;
      button = ref[_key];
      results.push(button.destroy());
    }
    return results;
  };

  KDModalView.prototype.click = function(e) {
    var helpContent;
    if ($(e.target).is(".closeModal")) {
      this.cancel();
    }
    if ($(e.target).is(".showHelp")) {
      helpContent = this.getOptions().helpContent;
      if (helpContent) {
        helpContent = KD.utils.applyMarkdown(helpContent);
        return new KDModalView({
          cssClass: "help-dialog",
          overlay: true,
          content: "<div class='modalformline'><p>" + helpContent + "</p></div>"
        });
      }
    }
  };

  KDModalView.prototype.setTitle = function(title) {
    this.$().find(".kdmodal-title").removeClass('hidden').html("<span class='title'>" + title + "</span>");
    return this.modalTitle = title;
  };

  KDModalView.prototype.setSubtitle = function(subtitle) {
    this.$().find(".kdmodal-title").append("<span class='subtitle'>" + subtitle + "</span>");
    return this.modalSubtitle = subtitle;
  };

  KDModalView.prototype.setModalHeight = function(value) {
    if (value === "auto") {
      this.$().css("height", "auto");
      return this.modalHeight = this.getHeight();
    } else {
      this.$().height(value);
      return this.modalHeight = value;
    }
  };

  KDModalView.prototype.setModalWidth = function(value) {
    this.modalWidth = value;
    return this.$().width(value);
  };

  KDModalView.prototype.setPositions = function() {
    return this.utils.defer((function(_this) {
      return function() {
        var bottom, height, left, newRules, ref, right, top, width;
        ref = _this.getOptions().position, top = ref.top, right = ref.right, bottom = ref.bottom, left = ref.left;
        newRules = {};
        height = $(window).height();
        width = $(window).width();
        newRules.top = Math.round(top != null ? top : height / 2 - _this.getHeight() / 2);
        newRules.left = Math.round(left != null ? left : width / 2 - _this.modalWidth / 2);
        if (right) {
          newRules.left = Math.round(width - _this.modalWidth - right - 20);
        }
        newRules.opacity = 1;
        return _this.$().css(newRules);
      };
    })(this));
  };

  KDModalView.prototype._windowDidResize = function() {
    var innerHeight;
    this.setPositions();
    innerHeight = window.innerHeight;
    this.$('.kdmodal-content').css({
      maxHeight: innerHeight - 120
    });
    if (!this.getOptions().position.top) {
      return this.setY(Math.round((innerHeight - this.getHeight()) / 2));
    }
  };

  KDModalView.prototype.putOverlay = function() {
    var overlayClick, overlayOptions, ref;
    ref = this.getOptions(), overlayOptions = ref.overlayOptions, overlayClick = ref.overlayClick;
    if (overlayOptions == null) {
      overlayOptions = {};
    }
    if (overlayOptions.isRemovable == null) {
      overlayOptions.isRemovable = overlayClick;
    }
    this.overlay = new KDOverlayView(overlayOptions);
    if (overlayClick) {
      return this.overlay.once('click', this.bound('destroy'));
    }
  };

  KDModalView.prototype.createButton = function(title, buttonOptions) {
    var button, itemClass;
    buttonOptions.title = title;
    buttonOptions.delegate = this;
    itemClass = buttonOptions.itemClass;
    delete buttonOptions.itemClass;
    this.buttonHolder.addSubView(button = new (itemClass || KDButtonView)(buttonOptions));
    button.on('KDModalShouldClose', (function(_this) {
      return function() {
        return _this.emit('KDModalShouldClose');
      };
    })(this));
    return button;
  };

  KDModalView.prototype.setContent = function(content) {
    this.modalContent = content;
    return this.getDomElement().find(".kdmodal-content").html(content);
  };

  KDModalView.prototype.display = function() {
    if (this.getOptions().fx) {
      return this.utils.defer((function(_this) {
        return function() {
          return _this.setClass("active");
        };
      })(this));
    }
  };

  KDModalView.prototype.cancel = function() {
    if (!this.getOptions().cancelable) {
      return;
    }
    this.emit('ModalCancelled');
    return this.destroy();
  };

  KDModalView.prototype.destroy = function() {
    var ref, uber;
    $(window).off("keydown.modal");
    uber = KDView.prototype.destroy.bind(this);
    if (this.options.fx) {
      this.unsetClass("active");
      setTimeout(uber, 300);
    } else {
      this.getDomElement().hide();
      uber();
    }
    if ((ref = this.overlay) != null) {
      ref.destroy();
    }
    return this.emit('KDModalViewDestroyed', this);
  };

  KDModalView.prototype.hide = function() {
    var ref;
    if ((ref = this.overlay) != null) {
      ref.hide();
    }
    return KDModalView.__super__.hide.apply(this, arguments);
  };

  KDModalView.prototype.show = function() {
    var ref;
    if ((ref = this.overlay) != null) {
      ref.show();
    }
    return KDModalView.__super__.show.apply(this, arguments);
  };


  /* STACK HELPERS */

  KDModalView.createStack = function(options) {
    return this.stack || (this.stack = new KDModalViewStack(options));
  };

  KDModalView.addToStack = function(modal) {
    return this.stack.addModal(modal);
  };

  KDModalView.destroyStack = function() {
    this.stack.destroy();
    return delete this.stack;
  };

  KDModalView.confirm = function(options) {
    var cancel, content, description, modal, noop, ok, title;
    noop = function() {
      return modal.destroy();
    };
    ok = options.ok, cancel = options.cancel, title = options.title, content = options.content, description = options.description;
    if (!ok || 'function' === typeof ok) {
      ok = {
        callback: ok
      };
    }
    if (!cancel || 'function' === typeof cancel) {
      cancel = {
        callback: cancel
      };
    }
    modal = new this({
      title: title || 'You must confirm this action',
      content: content || (description ? "<div class='modalformline'>\n  <p>" + description + "</p>\n</div>" : void 0),
      overlay: true,
      buttons: {
        OK: {
          title: ok.title,
          style: ok.style || "solid red medium",
          callback: ok.callback || noop
        },
        cancel: {
          title: cancel.title,
          style: cancel.style || "solid light-gray medium",
          callback: cancel.callback || noop
        }
      }
    });
    if (options.subView) {
      modal.addSubView(options.subView);
    }
    return modal;
  };

  return KDModalView;

})(KDView);

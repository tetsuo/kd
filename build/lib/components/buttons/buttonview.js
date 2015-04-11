var $, KD, KDButtonView, KDLoaderView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDView = require('../../core/view');

KDLoaderView = require('../loader/loaderview');


/**
 * KDButtonView implements a `<button>` DOM element, with the ability to subscribe
 * to click events.
 *
 * ## Usage
 *
 * ```coffee
 * view = new KDButtonView
 *   title: 'Click me!'
 *   cssClass: 'cupid-green'
 *   callback: ->
 *     alert 'I got clicked!'
 *
 * appView.addSubView view
 * ```
 *
 * This example will render a green button, with the text `"Click me!"`. When the
 * button is pressed by the user, an alert will pop up with the message `"I got
 * clicked!"`
 *
 * While this example is fine for an immediate action, what if we wanted our
 * button to load a project? For that, we tell the button to use a
 * [KDLoaderView](./kdloaderview.md). Lets see how this looks.
 *
 * ```coffee
 * view = new KDButtonView
 *   title: 'Take a long time.'
 *   cssClass: 'clean-red'
 *   loader: {}
 *   callback: ->
 *     longTimeDone = =>
 *       @hideLoader()
 *     setTimeout longTimeDone, 2000
 *
 * appView.addSubView view
 * ```
 *
 * In this example, a couple things are different. First, we define a loader
 * object. This is an object full of options that are passed to a
 * [KDLoaderView](./kdloaderview.md) instance. You'll note that we don't actually
 * define any options, but the empty object will cause a loader to be used with
 * the default options.
 *
 * Secondly, in our callback we turn the loader off with the
 * [hideLoader](#hideloader) method, after a `setTimeout` of 2000.
 *
 * The end result of these changes is that when our button is clicked, it starts
 * the loader *(with the options we define)*. When we want to turn it off, we call
 * the `@hideLoader()` method. Easy!
 *
 * ## Styling
 *
 * While not complete, the following list contains some useful built-in
 * css classes to style your button with.
 *
 * - **small-gray**: A small, gray button.
 * - **small-blue**: A small, blue button.
 * - **clean-gray**: A clean gray button, the default button style.
 * - **clean-red**: A clean red button.
 * - **cupid-green**: A green button.
 * - **transparent**: And no surprise, a transparent button.
 */

module.exports = KDButtonView = (function(superClass) {
  extend(KDButtonView, superClass);


  /**
   * Options supports the following keys:
   * - **options.title**: The title of the button.
   * - **options.callback**: The function to be called when the button is pressed.
   * - **options.loader**: The options to use for a loader on this button. If
   *   false, this button will not use a loader by default. See
   *   KDLoaderView for the supported options.
   *
   * @param {Object} options
   * @param {Object} data
   */

  function KDButtonView(options, data) {
    if (options == null) {
      options = {};
    }
    options.callback || (options.callback = KD.noop);
    options.title || (options.title = "");
    options.type || (options.type = "button");
    options.cssClass || (options.cssClass = options.style || (options.style = "clean-gray"));
    if (options.icon == null) {
      options.icon = false;
    }
    if (options.iconOnly == null) {
      options.iconOnly = false;
    }
    options.iconClass || (options.iconClass = "");
    if (options.disabled == null) {
      options.disabled = false;
    }
    options.hint || (options.hint = null);
    if (options.loader == null) {
      options.loader = false;
    }
    KDButtonView.__super__.constructor.call(this, options, data);
    this.setClass(options.style);
    this.setCallback(options.callback);
    this.setTitle(options.title);
    if (options.iconClass) {
      this.setIconClass(options.iconClass);
    }
    if (options.icon || options.iconOnly) {
      this.showIcon();
    }
    if (options.iconOnly) {
      this.setIconOnly(options.iconOnly);
    }
    if (options.disabled) {
      this.disable();
    }
    if (options.focus) {
      this.once("viewAppended", this.bound("setFocus"));
    }
    if (options.loader) {
      this.once("viewAppended", this.bound("setLoader"));
    }
  }

  KDButtonView.prototype.setFocus = function() {
    return this.$().trigger('focus');
  };

  KDButtonView.prototype.setDomElement = function(cssClass) {
    var el, i, klass, lazyDomId, len, ref, ref1, tagName;
    ref = this.getOptions(), lazyDomId = ref.lazyDomId, tagName = ref.tagName;
    if (lazyDomId) {
      el = document.getElementById(lazyDomId);
      ref1 = ("kdview " + cssClass).split(' ');
      for (i = 0, len = ref1.length; i < len; i++) {
        klass = ref1[i];
        if (klass.length) {
          el.classList.add(klass);
        }
      }
    }
    if (el == null) {
      if (lazyDomId) {
        KD.warn("No lazy DOM Element found with given id " + lazyDomId + ".");
      }
      el = "<button type='" + (this.getOptions().type) + "' class='kdbutton " + cssClass + "' id='" + (this.getId()) + "'>\n  <span class='icon hidden'></span>\n  <span class='button-title'>Title</span>\n</button>";
    }
    return this.domElement = $(el);
  };

  KDButtonView.prototype.setTitle = function(title) {
    this.buttonTitle = title;
    return this.$('.button-title').html(title);
  };

  KDButtonView.prototype.getTitle = function() {
    return this.buttonTitle;
  };

  KDButtonView.prototype.setCallback = function(callback) {
    return this.buttonCallback = callback;
  };

  KDButtonView.prototype.getCallback = function() {
    return this.buttonCallback;
  };

  KDButtonView.prototype.showIcon = function() {
    this.setClass("with-icon");
    return this.$('span.icon').removeClass('hidden');
  };

  KDButtonView.prototype.hideIcon = function() {
    this.unsetClass("with-icon");
    return this.$('span.icon').addClass('hidden');
  };

  KDButtonView.prototype.setIconClass = function(iconClass) {
    this.$('.icon').attr('class', 'icon');
    return this.$('.icon').addClass(iconClass);
  };

  KDButtonView.prototype.setIconOnly = function() {
    var $icon;
    this.unsetClass("with-icon");
    this.$().addClass('icon-only');
    $icon = this.$('span.icon');
    return this.$().html($icon);
  };

  KDButtonView.prototype.setLoader = function() {
    var loader, loaderSize, ref, ref1, ref2, ref3, ref4, ref5;
    this.setClass("w-loader");
    loader = this.getOptions().loader;
    loaderSize = this.getHeight() / 2;
    this.loader = new KDLoaderView({
      size: {
        width: (ref = loader.diameter) != null ? ref : loaderSize
      },
      loaderOptions: {
        color: loader.color || "#ffffff",
        shape: loader.shape || "spiral",
        diameter: (ref1 = loader.diameter) != null ? ref1 : loaderSize,
        density: (ref2 = loader.density) != null ? ref2 : 30,
        range: (ref3 = loader.range) != null ? ref3 : 0.4,
        speed: (ref4 = loader.speed) != null ? ref4 : 1.5,
        FPS: (ref5 = loader.FPS) != null ? ref5 : 24
      }
    });
    this.addSubView(this.loader, null, true);
    this.loader.$().css({
      position: "absolute",
      left: loader.left || "50%",
      top: loader.top || "50%",
      marginTop: -(loader.diameter / 2),
      marginLeft: -(loader.diameter / 2)
    });
    this.loader.hide();
    if (loader.show) {
      return this.showLoader();
    }
  };


  /**
   * Show the KDLoaderView on this button, if any. Note that the loader is
   * shown by default when the button is clicked.
   */

  KDButtonView.prototype.showLoader = function() {
    var icon, iconOnly, ref;
    if (!this.loader) {
      return KD.warn('KDButtonView::showLoader is called where no loader is set');
    }
    ref = this.getOptions(), icon = ref.icon, iconOnly = ref.iconOnly;
    this.setClass("loading");
    this.loader.show();
    if (icon && !iconOnly) {
      return this.hideIcon();
    }
  };


  /**
   * Hide the KDLoaderView on this button, if any.
   */

  KDButtonView.prototype.hideLoader = function() {
    var icon, iconOnly, ref;
    if (!this.loader) {
      return KD.warn('KDButtonView::hideLoader is called where no loader is set');
    }
    ref = this.getOptions(), icon = ref.icon, iconOnly = ref.iconOnly;
    this.unsetClass("loading");
    this.loader.hide();
    if (icon && !iconOnly) {
      return this.showIcon();
    }
  };

  KDButtonView.prototype.disable = function() {
    return this.$().attr("disabled", true);
  };

  KDButtonView.prototype.enable = function() {
    return this.$().attr("disabled", false);
  };

  KDButtonView.prototype.focus = function() {
    return this.$().trigger("focus");
  };

  KDButtonView.prototype.blur = function() {
    return this.$().trigger("blur");
  };

  KDButtonView.prototype.click = function(event) {
    var ref;
    if ((ref = this.loader) != null ? ref.active : void 0) {
      return this.utils.stopDOMEvent();
    }
    if (this.loader && !this.loader.active) {
      this.showLoader();
    }
    if (this.getOption('type') === "button") {
      this.utils.stopDOMEvent();
    }
    this.getCallback().call(this, event);
    return false;
  };

  KDButtonView.prototype.triggerClick = function() {
    return this.doOnSubmit();
  };

  return KDButtonView;

})(KDView);

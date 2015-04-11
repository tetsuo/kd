var $, JButtonMenu, KDButtonView, KDButtonViewWithMenu,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

JButtonMenu = require('./buttonmenu');

KDButtonView = require('./buttonview');

module.exports = KDButtonViewWithMenu = (function(superClass) {
  extend(KDButtonViewWithMenu, superClass);

  function KDButtonViewWithMenu() {
    return KDButtonViewWithMenu.__super__.constructor.apply(this, arguments);
  }

  KDButtonViewWithMenu.prototype.setDomElement = function(cssClass) {
    if (cssClass == null) {
      cssClass = '';
    }
    this.domElement = $("<div class='kdbuttonwithmenu-wrapper " + cssClass + "'>\n  <button class='kdbutton " + cssClass + " with-icon with-menu' id='" + (this.getId()) + "'>\n    <span class='icon hidden'></span>\n  </button>\n  <span class='chevron-separator'></span>\n  <span class='chevron'></span>\n</div>");
    this.$button = this.$('button').first();
    return this.domElement;
  };

  KDButtonViewWithMenu.prototype.setIconOnly = function() {
    var $icons;
    this.$().addClass('icon-only').removeClass('with-icon');
    $icons = this.$('span.icon,span.chevron');
    return this.$().html($icons);
  };

  KDButtonViewWithMenu.prototype.click = function(event) {
    if ($(event.target).is(".chevron")) {
      this.contextMenu(event);
      return false;
    }
    return this.getCallback().call(this, event);
  };

  KDButtonViewWithMenu.prototype.contextMenu = function(event) {
    this.createContextMenu(event);
    return false;
  };

  KDButtonViewWithMenu.prototype.createContextMenu = function(event) {
    var menuArrayToObj, menuObject, menuObjectProperty, menuObjectValue, o;
    o = this.getOptions();
    this.buttonMenu = new (o.buttonMenuClass || JButtonMenu)({
      cssClass: o.style,
      ghost: this.$('.chevron').clone(),
      event: event,
      delegate: this,
      treeItemClass: o.treeItemClass,
      itemChildClass: o.itemChildClass,
      itemChildOptions: o.itemChildOptions
    }, (function() {
      var i, len, ref;
      if ("function" === typeof o.menu) {
        return o.menu();
      } else {
        if (Array.isArray(o.menu)) {
          menuArrayToObj = {};
          ref = o.menu;
          for (i = 0, len = ref.length; i < len; i++) {
            menuObject = ref[i];
            for (menuObjectProperty in menuObject) {
              if (!hasProp.call(menuObject, menuObjectProperty)) continue;
              menuObjectValue = menuObject[menuObjectProperty];
              if ((menuObjectProperty != null) && (menuObjectValue != null)) {
                menuArrayToObj[menuObjectProperty] = menuObjectValue;
              }
            }
          }
          return menuArrayToObj;
        } else {
          return o.menu;
        }
      }
    })());
    return this.buttonMenu.on("ContextMenuItemReceivedClick", (function(_this) {
      return function() {
        return _this.buttonMenu.destroy();
      };
    })(this));
  };

  KDButtonViewWithMenu.prototype.setTitle = function(title) {
    return this.$button.append(title);
  };

  KDButtonViewWithMenu.prototype.setButtonStyle = function(newStyle) {
    var i, len, style, styles;
    styles = this.constructor.styles;
    for (i = 0, len = styles.length; i < len; i++) {
      style = styles[i];
      this.$().removeClass(style);
      this.$button.removeClass(style);
    }
    this.$button.addClass(newStyle);
    return this.$().addClass(newStyle);
  };

  KDButtonViewWithMenu.prototype.setIconOnly = function() {
    var $icon;
    this.$button.addClass('icon-only').removeClass('with-icon');
    $icon = this.$('span.icon');
    return this.$button.html($icon);
  };

  KDButtonViewWithMenu.prototype.disable = function() {
    return this.$button.attr("disabled", true);
  };

  KDButtonViewWithMenu.prototype.enable = function() {
    return this.$button.attr("disabled", false);
  };

  return KDButtonViewWithMenu;

})(KDButtonView);

var $, JButtonMenu, JContextMenuTreeView, KD, KDContextMenu,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

JContextMenuTreeView = require('../contextmenu/contextmenutreeview');

KDContextMenu = require('../contextmenu/contextmenu');

module.exports = JButtonMenu = (function(superClass) {
  extend(JButtonMenu, superClass);

  function JButtonMenu(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curry("kdbuttonmenu", options.cssClass);
    options.listViewClass || (options.listViewClass = JContextMenuTreeView);
    JButtonMenu.__super__.constructor.call(this, options, data);
  }

  JButtonMenu.prototype.viewAppended = function() {
    JButtonMenu.__super__.viewAppended.apply(this, arguments);
    this.setPartial("<div class='chevron-ghost-wrapper'><span class='chevron-ghost'></span></div>");
    return this.positionContextMenu();
  };

  JButtonMenu.prototype.positionContextMenu = KD.utils.debounce(10, function() {
    var button, buttonHeight, buttonWidth, ghostCss, mainHeight, mainScroll, menuHeight, menuWidth, top;
    button = this.getDelegate();
    mainHeight = $(window).height();
    mainScroll = $(window).scrollTop();
    buttonHeight = button.getHeight();
    buttonWidth = button.getWidth();
    top = button.getY() + buttonHeight;
    menuHeight = this.getHeight();
    menuWidth = this.getWidth();
    ghostCss = top + menuHeight > mainHeight + mainScroll ? (top = button.getY() - menuHeight, this.setClass("top-menu"), {
      top: "100%",
      height: buttonHeight
    }) : {
      top: -(buttonHeight + 1),
      height: buttonHeight
    };
    this.$(".chevron-ghost-wrapper").css(ghostCss);
    return this.$().css({
      top: top + mainScroll,
      left: button.getX() + buttonWidth - menuWidth
    });
  });

  return JButtonMenu;

})(KDContextMenu);

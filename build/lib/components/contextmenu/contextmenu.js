var JContextMenuTreeViewController, KD, KDContextMenu, KDCustomHTMLView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

KDCustomHTMLView = require('../../core/customhtmlview');

JContextMenuTreeViewController = require('./contextmenutreeviewcontroller');

module.exports = KDContextMenu = (function(superClass) {
  extend(KDContextMenu, superClass);

  function KDContextMenu(options, data) {
    var base, base1, o, ref;
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curry("kdcontextmenu", options.cssClass);
    options.menuMaxWidth || (options.menuMaxWidth = "auto");
    options.menuMinWidth || (options.menuMinWidth = "auto");
    options.menuWidth || (options.menuWidth = 172);
    options.offset || (options.offset = {});
    (base = options.offset).left || (base.left = 0);
    (base1 = options.offset).top || (base1.top = 0);
    if (options.arrow == null) {
      options.arrow = false;
    }
    if (options.sticky == null) {
      options.sticky = false;
    }
    KDContextMenu.__super__.constructor.call(this, options, data);
    this.topMargin = 0;
    this.leftMargin = 0;
    o = this.getOptions();
    this.sticky = o.sticky;
    KD.getSingleton("windowController").addLayer(this);
    this.on('ReceivedClickElsewhere', (function(_this) {
      return function() {
        if (!_this.sticky) {
          return _this.destroy();
        }
      };
    })(this));
    if (data) {
      this.treeController = new JContextMenuTreeViewController({
        type: o.type,
        view: o.view,
        delegate: this,
        treeItemClass: o.treeItemClass,
        listViewClass: o.listViewClass,
        itemChildClass: o.itemChildClass,
        itemChildOptions: o.itemChildOptions,
        addListsCollapsed: o.addListsCollapsed,
        putDepthInfo: o.putDepthInfo,
        lazyLoad: (ref = o.lazyLoad) != null ? ref : false
      }, data);
      this.addSubView(this.treeController.getView());
      this.treeController.getView().on('ReceivedClickElsewhere', (function(_this) {
        return function() {
          if (!_this.sticky) {
            return _this.destroy();
          }
        };
      })(this));
      this.treeController.on("NodeExpanded", this.bound("positionSubMenu"));
    }
    if (options.arrow) {
      this.on("viewAppended", this.bound("addArrow"));
    }
    this.appendToDomBody();
  }

  KDContextMenu.prototype.changeStickyState = function(state) {
    return this.sticky = state;
  };

  KDContextMenu.prototype.childAppended = function() {
    KDContextMenu.__super__.childAppended.apply(this, arguments);
    this.positionContextMenu();
    if (this.getOption("deferPositioning")) {
      return KD.utils.defer((function(_this) {
        return function() {
          return _this.positionContextMenu();
        };
      })(this));
    } else {
      return this.positionContextMenu();
    }
  };

  KDContextMenu.prototype.addArrow = function() {
    var o, ref, rule;
    o = this.getOptions().arrow;
    o.placement || (o.placement = "top");
    if (o.margin == null) {
      o.margin = 0;
    }
    if ((ref = o.placement) === 'top' || ref === 'bottom') {
      o.margin += this.leftMargin;
    } else {
      o.margin += this.topMargin;
    }
    this.arrow = new KDCustomHTMLView({
      tagName: "span",
      cssClass: "arrow " + o.placement
    });
    this.arrow.$().css((function() {
      switch (o.placement) {
        case "top":
          rule = {};
          if (o.margin > 0) {
            rule.left = o.margin;
          } else {
            rule.right = -o.margin;
          }
          return rule;
        case "bottom":
          rule = {};
          if (o.margin > 0) {
            rule.left = o.margin;
          } else {
            rule.right = -o.margin;
          }
          return rule;
        case "right":
          rule = {};
          if (o.margin > 0) {
            rule.top = o.margin;
          } else {
            rule.bottom = -o.margin;
          }
          return rule;
        case "left":
          rule = {};
          if (o.margin > 0) {
            rule.top = o.margin;
          } else {
            rule.bottom = -o.margin;
          }
          return rule;
        default:
          return {};
      }
    })());
    return this.addSubView(this.arrow);
  };

  KDContextMenu.prototype.positionContextMenu = KD.utils.debounce(10, function() {
    var event, expectedLeft, expectedTop, left, mainHeight, mainView, mainWidth, menuHeight, menuMaxWidth, menuMinWidth, menuWidth, options, style, top;
    options = this.getOptions();
    event = options.event || {};
    mainView = KD.getSingleton('mainView');
    mainHeight = mainView.getHeight();
    mainWidth = mainView.getWidth();
    menuWidth = options.menuWidth, menuHeight = options.menuHeight, menuMaxWidth = options.menuMaxWidth, menuMinWidth = options.menuMinWidth;
    if (menuHeight == null) {
      menuHeight = this.getHeight();
    }
    if (menuWidth == null) {
      menuWidth = this.getWidth();
    }
    top = (options.y || event.pageY || 0) + options.offset.top;
    left = (options.x || event.pageX || 0) + options.offset.left;
    expectedTop = top;
    expectedLeft = left;
    if (top + menuHeight > mainHeight) {
      top = mainHeight - menuHeight + options.offset.top;
    }
    if (left + menuWidth > mainWidth) {
      left = mainWidth - menuWidth + options.offset.left;
    }
    this.topMargin = expectedTop - top;
    this.leftMargin = expectedLeft - left;
    style = {
      width: menuWidth + "px",
      top: top,
      left: left
    };
    if (menuMaxWidth) {
      style.maxWidth = menuMaxWidth + "px";
    }
    if (menuMinWidth) {
      style.minWidth = menuMinWidth + "px";
    }
    return this.getDomElement().css(style);
  });

  KDContextMenu.prototype.positionSubMenu = function(nodeView) {
    var children, expandView, fullViewHeight, fullViewWidth, id, ref;
    ref = nodeView.getData(), children = ref.children, id = ref.id;
    if (children) {
      expandView = this.treeController.listControllers[id].getView();
      fullViewHeight = expandView.getY() + expandView.getHeight();
      if (fullViewHeight > window.innerHeight) {
        expandView.$().css("bottom", 0);
      }
      fullViewWidth = expandView.getX() + expandView.getWidth();
      if (fullViewWidth > window.innerWidth) {
        expandView.$().css("left", -expandView.getWidth());
        return expandView.setClass("left-aligned");
      }
    }
  };

  return KDContextMenu;

})(KDView);

var JContextMenuItem, JContextMenuTreeView, JContextMenuTreeViewController, JTreeViewController, KD, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDView = require('../../core/view');

JTreeViewController = require('../tree/treeviewcontroller');

JContextMenuItem = require('./contextmenuitem');

JContextMenuTreeView = require('./contextmenutreeview');

module.exports = JContextMenuTreeViewController = (function(superClass) {

  /*
  STATIC CONTEXT
   */
  var convertToArray, getUId, uId;

  extend(JContextMenuTreeViewController, superClass);

  uId = 0;

  getUId = function() {
    return ++uId;
  };

  convertToArray = JContextMenuTreeViewController.convertToArray = function(items, pId) {
    var childrenArr, divider, id, newItem, options, results, title;
    if (pId == null) {
      pId = null;
    }
    results = [];
    for (title in items) {
      if (!hasProp.call(items, title)) continue;
      options = items[title];
      id = null;
      if ((title.indexOf("customView")) === 0) {
        newItem = {
          type: 'customView',
          parentId: pId,
          view: options
        };
        results.push(newItem);
        continue;
      }
      if (options.children) {
        id = getUId();
        options.title = title;
        options.id = id;
        options.parentId = pId;
        results.push(options);
        childrenArr = convertToArray(options.children, id);
        results = results.concat(childrenArr);
        if (options.separator) {
          divider = {
            type: 'separator',
            parentId: pId
          };
          results.push(divider);
        }
        continue;
      }
      options.title = title;
      options.parentId = pId;
      results.push(options);
      if (options.separator) {
        divider = {
          type: 'separator',
          parentId: pId
        };
        results.push(divider);
      }
    }
    return results;
  };


  /*
  INSTANCE LEVEL
   */

  function JContextMenuTreeViewController(options, data) {
    var o;
    if (options == null) {
      options = {};
    }
    o = options;
    o.view || (o.view = new KDView({
      cssClass: "context-list-wrapper"
    }));
    o.type || (o.type = "contextmenu");
    o.treeItemClass || (o.treeItemClass = JContextMenuItem);
    o.listViewClass || (o.listViewClass = JContextMenuTreeView);
    if (o.addListsCollapsed == null) {
      o.addListsCollapsed = true;
    }
    if (o.putDepthInfo == null) {
      o.putDepthInfo = true;
    }
    JContextMenuTreeViewController.__super__.constructor.call(this, o, data);
    this.expandedNodes = [];
  }

  JContextMenuTreeViewController.prototype.loadView = function() {
    JContextMenuTreeViewController.__super__.loadView.apply(this, arguments);
    if (!this.getOptions().lazyLoad) {
      return this.selectFirstNode();
    }
  };

  JContextMenuTreeViewController.prototype.initTree = function(nodes) {
    if (!nodes.length) {
      this.setData(nodes = convertToArray(nodes));
    }
    return JContextMenuTreeViewController.__super__.initTree.call(this, nodes);
  };


  /*
  Helpers
   */

  JContextMenuTreeViewController.prototype.repairIds = function(nodeData) {
    if (nodeData.type === "divider") {
      nodeData.type = "separator";
    }
    return JContextMenuTreeViewController.__super__.repairIds.apply(this, arguments);
  };


  /*
  EXPAND / COLLAPSE
   */

  JContextMenuTreeViewController.prototype.expand = function(nodeView) {
    JContextMenuTreeViewController.__super__.expand.apply(this, arguments);
    this.emit("NodeExpanded", nodeView);
    if (nodeView.expanded) {
      return this.expandedNodes.push(nodeView);
    }
  };


  /*
  NODE SELECTION
   */

  JContextMenuTreeViewController.prototype.organizeSelectedNodes = function(listController, nodes, event) {
    var depth1, nodeView;
    if (event == null) {
      event = {};
    }
    nodeView = nodes[0];
    if (this.expandedNodes.length) {
      depth1 = nodeView.getData().depth;
      this.expandedNodes.forEach((function(_this) {
        return function(expandedNode) {
          var depth2;
          depth2 = expandedNode.getData().depth;
          if (depth1 <= depth2) {
            return _this.collapse(expandedNode);
          }
        };
      })(this));
    }
    return JContextMenuTreeViewController.__super__.organizeSelectedNodes.apply(this, arguments);
  };


  /*
  re-HANDLING MOUSE EVENTS
   */

  JContextMenuTreeViewController.prototype.dblClick = function(nodeView, event) {};

  JContextMenuTreeViewController.prototype.mouseEnter = function(nodeView, event) {
    var nodeData;
    if (this.mouseEnterTimeOut) {
      clearTimeout(this.mouseEnterTimeOut);
    }
    nodeData = nodeView.getData();
    if (nodeData.type !== "separator") {
      this.selectNode(nodeView, event);
      return this.mouseEnterTimeOut = setTimeout((function(_this) {
        return function() {
          return _this.expand(nodeView);
        };
      })(this), 150);
    }
  };

  JContextMenuTreeViewController.prototype.click = function(nodeView, event) {
    var contextMenu, nodeData;
    nodeData = nodeView.getData();
    if (nodeData.type === "separator" || nodeData.disabled) {
      return;
    }
    this.toggle(nodeView);
    contextMenu = this.getDelegate();
    if (nodeData.callback && "function" === typeof nodeData.callback) {
      nodeData.callback.call(contextMenu, nodeView, event);
    }
    contextMenu.emit("ContextMenuItemReceivedClick", nodeView, event);
    event.stopPropagation();
    return false;
  };


  /*
  re-HANDLING KEY EVENTS
   */

  JContextMenuTreeViewController.prototype.performDownKey = function(nodeView, event) {
    var nextNode, nodeData;
    nextNode = JContextMenuTreeViewController.__super__.performDownKey.call(this, nodeView, event);
    if (nextNode) {
      nodeData = nextNode.getData();
      if (nodeData.type === "separator") {
        return this.performDownKey(nextNode, event);
      }
    }
  };

  JContextMenuTreeViewController.prototype.performUpKey = function(nodeView, event) {
    var nextNode, nodeData;
    nextNode = JContextMenuTreeViewController.__super__.performUpKey.call(this, nodeView, event);
    if (nextNode) {
      nodeData = nextNode.getData();
      if (nodeData.type === "separator") {
        this.performUpKey(nextNode, event);
      }
    }
    return nextNode;
  };

  JContextMenuTreeViewController.prototype.performRightKey = function(nodeView, event) {
    JContextMenuTreeViewController.__super__.performRightKey.apply(this, arguments);
    return this.performDownKey(nodeView, event);
  };

  JContextMenuTreeViewController.prototype.performLeftKey = function(nodeView, event) {
    var parentNode;
    parentNode = JContextMenuTreeViewController.__super__.performLeftKey.call(this, nodeView, event);
    if (parentNode) {
      this.collapse(parentNode);
    }
    return parentNode;
  };

  JContextMenuTreeViewController.prototype.performEscapeKey = function(nodeView, event) {
    KD.getSingleton("windowController").revertKeyView();
    return this.getDelegate().destroy();
  };

  JContextMenuTreeViewController.prototype.performEnterKey = function(nodeView, event) {
    var contextMenu;
    KD.getSingleton("windowController").revertKeyView();
    contextMenu = this.getDelegate();
    contextMenu.emit("ContextMenuItemReceivedClick", nodeView);
    contextMenu.destroy();
    event.stopPropagation();
    event.preventDefault();
    return false;
  };

  return JContextMenuTreeViewController;

})(JTreeViewController);

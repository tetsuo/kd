var JTreeItemView, JTreeView, JTreeViewController, KD, KDListViewController, KDScrollView, KDViewController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KD = require('../../core/kd');

JTreeItemView = require('./treeitemview');

JTreeView = require('./treeview');

KDViewController = require('../../core/viewcontroller');

KDScrollView = require('../scrollview/scrollview');

KDListViewController = require('../list/listviewcontroller');

module.exports = JTreeViewController = (function(superClass) {
  var cacheDragHelper, dragHelper, keyMap;

  extend(JTreeViewController, superClass);

  keyMap = function() {
    return {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      8: 'backspace',
      9: 'tab',
      13: 'enter',
      27: 'escape'
    };
  };

  dragHelper = null;

  cacheDragHelper = (function() {
    dragHelper = document.createElement('img');
    dragHelper.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAYCAMAAAAs/jgVAAAA0lBMVEX///+It9YAAAD///8AAACIt9aIt9aIt9aIt9aIt9aIt9YAAAD///+It9aIt9aIt9aIt9aIt9aIt9aIt9bT09OIt9aIt9aIt9b///+It9bv9fr+/v79/f2QvNn4+PioyuHA2enP4u/09PS41Obf7PTn8ff6+vr29vb3+vygxd78/Pz19fX7+/vs7OzY2NjR0dGwz+Tv7+/T09Pz8/PX19fQ0NCYwdvx8fHLy8vq6urZ2dnX5/H5+fny8vLOzs739/fPz8/W1tbu7u7w8PDH3ezd3d0P0SzzAAAAGHRSTlMAACZqGJkG2/k2rkZV4bG0V9gDaYBabJYxtX/TAAACLElEQVR4Xu3V127bMBQG4NT1SOw4s0kP59Ce3iN7tu//Sj2i0iiKE8AB7Juiv0SIFAR9OAQJ7mwy/9NsvElz61yDA4cEgGWQZA0Evm0xyAFAYkVMr/nCtU8PjsnGcnxw2n7lGMsSnmSMAX9slNxRh2w4naMXjrGEByzgCWPsqtdE7qT7ARDrOuCqL4LdE8tlyCCHWMZmjw3kWuSDuJ5V4K9iKl7BWl7LcgHnXOLFecAHV8jtkU841wqrHGbhreHtWS6QN5nMbiR2BjPkfhaAoh7QEQVfKFqMkNMAoEAp3wNwC05FQGNbXQwAeuEX7z2DXVP0NIAv6uUhl8gslFKGmUzkbIBcx3L4/XUUC+q+crYg5NDSkTBaRIpo33J2qj1NYhCeL2IwRFMBC6Lqy8VWJ8MwxSuUQTgpuN2SI0Tbf6xyKETKaAVFKs4OlWc/Kt4ZX5NadgvuPrxPp+E0xWc4mX2Bi4FgKi6ytVQcESZafMAtnWWKDdnhBLlOnYshJteW+2Vqk0ko8qOSG1FCDJKjihMuIXS0Mpnj6e341sE2HTuWa9U5YgCM5eJyqUQeYCHIxRRAl5ygoIUP4FVcOdSUeAbv16WSPz/l+WWePz3nl/PhpxthjV22zkZo9i4e7i7u5tgeLn4P7TbfDme3+f4PJ0wdZ+o4aegs5wXX7m6D67aRe18ecpizPtlw+mf2RHhfnuWwwPPDDYr9w/PyAFo9z7d8vGJ5399kf+cfyh+807YxJJdmLQAAAABJRU5ErkJggg==';
    return dragHelper.width = 110;
  })();

  function JTreeViewController(options, data) {
    var o;
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = [];
    }
    o = options;
    o.view || (o.view = new KDScrollView({
      cssClass: "jtreeview-wrapper"
    }));
    o.listViewControllerClass || (o.listViewControllerClass = KDListViewController);
    o.treeItemClass || (o.treeItemClass = JTreeItemView);
    o.listViewClass || (o.listViewClass = JTreeView);
    o.itemChildClass || (o.itemChildClass = null);
    o.itemChildOptions || (o.itemChildOptions = {});
    o.nodeIdPath || (o.nodeIdPath = 'id');
    o.nodeParentIdPath || (o.nodeParentIdPath = 'parentId');
    if (o.contextMenu == null) {
      o.contextMenu = false;
    }
    if (o.multipleSelection == null) {
      o.multipleSelection = false;
    }
    if (o.addListsCollapsed == null) {
      o.addListsCollapsed = false;
    }
    if (o.sortable == null) {
      o.sortable = false;
    }
    if (o.putDepthInfo == null) {
      o.putDepthInfo = true;
    }
    if (o.addOrphansToRoot == null) {
      o.addOrphansToRoot = true;
    }
    if (o.dragdrop == null) {
      o.dragdrop = false;
    }
    JTreeViewController.__super__.constructor.call(this, o, data);
    this.listData = {};
    this.listControllers = {};
    this.nodes = {};
    this.indexedNodes = [];
    this.selectedNodes = [];
  }

  JTreeViewController.prototype.loadView = function(treeView) {
    this.initTree(this.getData());
    this.setKeyView();
    this.setMainListeners();
    return this.registerBoundaries();
  };

  JTreeViewController.prototype.registerBoundaries = function() {
    return this.boundaries = {
      top: this.getView().getY(),
      left: this.getView().getX(),
      width: this.getView().getWidth(),
      height: this.getView().getHeight()
    };
  };


  /*
  HELPERS
   */

  JTreeViewController.prototype.initTree = function(nodes) {
    this.removeAllNodes();
    return this.addNodes(nodes);
  };

  JTreeViewController.prototype.logTreeStructure = function() {
    var index, node, o, ref, results;
    o = this.getOptions();
    ref = this.indexedNodes;
    results = [];
    for (index in ref) {
      if (!hasProp.call(ref, index)) continue;
      node = ref[index];
      results.push(KD.log(index, this.getNodeId(node), this.getNodePId(node), node.depth));
    }
    return results;
  };

  JTreeViewController.prototype.getNodeId = function(nodeData) {
    return nodeData[this.getOptions().nodeIdPath];
  };

  JTreeViewController.prototype.getNodePId = function(nodeData) {
    return nodeData[this.getOptions().nodeParentIdPath];
  };

  JTreeViewController.prototype.getPathIndex = function(targetPath) {
    var i, index, len, node, ref;
    ref = this.indexedNodes;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      node = ref[index];
      if (this.getNodeId(node) === targetPath) {
        return index;
      }
    }
    return -1;
  };

  JTreeViewController.prototype.repairIds = function(nodeData) {
    var idPath, options, pIdPath, ref;
    options = this.getOptions();
    idPath = options.nodeIdPath;
    pIdPath = options.nodeParentIdPath;
    nodeData[idPath] || (nodeData[idPath] = this.utils.getUniqueId());
    nodeData[idPath] = "" + (this.getNodeId(nodeData));
    nodeData[pIdPath] = this.getNodePId(nodeData) ? "" + (this.getNodePId(nodeData)) : "0";
    this.nodes[this.getNodeId(nodeData)] = {};
    if (options.putDepthInfo) {
      if ((ref = this.nodes[nodeData[pIdPath]]) != null ? ref.getData : void 0) {
        nodeData.depth = this.nodes[nodeData[pIdPath]].getData().depth + 1;
      } else {
        nodeData.depth = 0;
      }
    }
    if (nodeData[pIdPath] !== "0" && !this.nodes[nodeData[pIdPath]]) {
      if (options.addOrphansToRoot) {
        nodeData[pIdPath] = "0";
      } else {
        nodeData = false;
      }
    }
    return nodeData;
  };

  JTreeViewController.prototype.isNodeVisible = function(nodeView) {
    var nodeData, parentNode;
    nodeData = nodeView.getData();
    parentNode = this.nodes[this.getNodePId(nodeData)];
    if (parentNode) {
      if (parentNode.expanded) {
        return this.isNodeVisible(parentNode);
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  JTreeViewController.prototype.areSibling = function(node1, node2) {
    var node1PId, node2PId;
    node1PId = this.getNodePId(node1.getData());
    node2PId = this.getNodePId(node2.getData());
    return node1PId === node2PId;
  };


  /*
  DECORATORS
   */

  JTreeViewController.prototype.setFocusState = function() {
    var view;
    view = this.getView();
    KD.getSingleton("windowController").addLayer(view);
    return view.unsetClass("dim");
  };

  JTreeViewController.prototype.setBlurState = function() {
    var view;
    view = this.getView();
    KD.getSingleton("windowController").removeLayer(view);
    return view.setClass("dim");
  };


  /*
  CRUD OPERATIONS FOR NODES
   */

  JTreeViewController.prototype.addNode = function(nodeData, index) {
    var list, node, parentId;
    if (this.nodes[this.getNodeId(nodeData)]) {
      return;
    }
    nodeData = this.repairIds(nodeData);
    if (!nodeData) {
      return;
    }
    if (indexOf.call(this.getData(), nodeData) < 0) {
      this.getData().push(nodeData);
    }
    this.registerListData(nodeData);
    parentId = this.getNodePId(nodeData);
    if (this.listControllers[parentId] != null) {
      list = this.listControllers[parentId].getListView();
    } else {
      list = this.createList(parentId).getListView();
      this.addSubList(this.nodes[parentId], parentId);
    }
    node = list.addItem(nodeData, index);
    this.emit("NodeWasAdded", node);
    this.addIndexedNode(nodeData);
    return node;
  };

  JTreeViewController.prototype.addNodes = function(nodes) {
    var i, len, node, results;
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      results.push(this.addNode(node));
    }
    return results;
  };

  JTreeViewController.prototype.removeNode = function(id) {
    var i, index, len, nodeData, nodeIndexToRemove, nodeToRemove, parentId, ref;
    nodeIndexToRemove = null;
    ref = this.getData();
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      nodeData = ref[index];
      if (this.getNodeId(nodeData) === id) {
        this.removeIndexedNode(nodeData);
        nodeIndexToRemove = index;
      }
    }
    if (nodeIndexToRemove != null) {
      nodeToRemove = this.getData().splice(nodeIndexToRemove, 1)[0];
      this.removeChildNodes(id);
      parentId = this.getNodePId(nodeToRemove);
      this.listControllers[parentId].getListView().removeItem(this.nodes[id]);
      return delete this.nodes[id];
    }
  };

  JTreeViewController.prototype.removeNodeView = function(nodeView) {
    return this.removeNode(this.getNodeId(nodeView.getData()));
  };

  JTreeViewController.prototype.removeAllNodes = function() {
    var id, listController, ref;
    ref = this.listControllers;
    for (id in ref) {
      if (!hasProp.call(ref, id)) continue;
      listController = ref[id];
      listController.getListItems().forEach(this.bound('removeNodeView'));
      if (listController != null) {
        listController.getView().destroy();
      }
      delete this.listControllers[id];
      delete this.listData[id];
    }
    this.nodes = {};
    this.listData = {};
    this.indexedNodes = [];
    this.selectedNodes = [];
    return this.listControllers = {};
  };

  JTreeViewController.prototype.removeChildNodes = function(id) {
    var childNodeId, childNodeIdsToRemove, i, index, j, len, len1, nodeData, ref, ref1;
    childNodeIdsToRemove = [];
    ref = this.getData();
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      nodeData = ref[index];
      if (this.getNodePId(nodeData) === id) {
        childNodeIdsToRemove.push(this.getNodeId(nodeData));
      }
    }
    for (j = 0, len1 = childNodeIdsToRemove.length; j < len1; j++) {
      childNodeId = childNodeIdsToRemove[j];
      this.removeNode(childNodeId);
    }
    if ((ref1 = this.listControllers[id]) != null) {
      ref1.getView().destroy();
    }
    delete this.listControllers[id];
    return delete this.listData[id];
  };

  JTreeViewController.prototype.nodeWasAdded = function(nodeView) {
    var id, nodeData, parentId;
    nodeData = nodeView.getData();
    if (this.getOptions().dragdrop) {
      nodeView.$().attr("draggable", "true");
    }
    id = nodeData.id, parentId = nodeData.parentId;
    this.nodes[this.getNodeId(nodeData)] = nodeView;
    if (this.nodes[this.getNodePId(nodeData)]) {
      if (!this.getOptions().addListsCollapsed) {
        this.expand(this.nodes[this.getNodePId(nodeData)]);
      }
      this.nodes[this.getNodePId(nodeData)].decorateSubItemsState();
    }
    if (!this.listControllers[id]) {
      return;
    }
    return this.addSubList(nodeView, id);
  };

  JTreeViewController.prototype.getChildNodes = function(aParentNode) {
    var children;
    children = [];
    this.indexedNodes.forEach((function(_this) {
      return function(node, index) {
        if (_this.getNodePId(node) === _this.getNodeId(aParentNode)) {
          return children.push({
            node: node,
            index: index
          });
        }
      };
    })(this));
    if (children.length) {
      return children;
    } else {
      return false;
    }
  };

  JTreeViewController.prototype.getPreviousNeighbor = function(aParentNode) {
    var children, lastChild, neighbor;
    neighbor = aParentNode;
    children = this.getChildNodes(aParentNode);
    if (children) {
      lastChild = children.last;
      neighbor = this.getPreviousNeighbor(lastChild.node);
    }
    return neighbor;
  };

  JTreeViewController.prototype.addIndexedNode = function(nodeData, index) {
    var neighborIndex, parentNodeView, prevNeighbor;
    if (index >= 0) {
      this.indexedNodes.splice(index + 1, 0, nodeData);
      return;
    }
    parentNodeView = this.nodes[this.getNodePId(nodeData)];
    if (parentNodeView) {
      prevNeighbor = this.getPreviousNeighbor(parentNodeView.getData());
      neighborIndex = this.indexedNodes.indexOf(prevNeighbor);
      return this.indexedNodes.splice(neighborIndex + 1, 0, nodeData);
    } else {
      return this.indexedNodes.push(nodeData);
    }
  };

  JTreeViewController.prototype.removeIndexedNode = function(nodeData) {
    var index;
    if (indexOf.call(this.indexedNodes, nodeData) >= 0) {
      index = this.indexedNodes.indexOf(nodeData);
      this.indexedNodes.splice(index, 1);
      if (this.nodes[this.getNodePId(nodeData)] && !this.getChildNodes(this.nodes[this.getNodePId(nodeData)].getData())) {
        return this.nodes[this.getNodePId(nodeData)].decorateSubItemsState(false);
      }
    }
  };


  /*
  CREATING LISTS
   */

  JTreeViewController.prototype.registerListData = function(node) {
    var base, parentId;
    parentId = this.getNodePId(node);
    (base = this.listData)[parentId] || (base[parentId] = []);
    return this.listData[parentId].push(node);
  };

  JTreeViewController.prototype.createList = function(listId, listItems) {
    var options, ref, ref1;
    options = this.getOptions();
    this.listControllers[listId] = new options.listViewControllerClass({
      id: (this.getId()) + "_" + listId,
      wrapper: false,
      scrollView: false,
      selection: (ref = options.selection) != null ? ref : false,
      multipleSelection: (ref1 = options.multipleSelection) != null ? ref1 : false,
      view: new options.listViewClass({
        tagName: "ul",
        type: options.type,
        itemClass: options.treeItemClass,
        itemChildClass: options.itemChildClass,
        itemChildOptions: options.itemChildOptions
      })
    }, {
      items: listItems
    });
    this.setListenersForList(listId);
    return this.listControllers[listId];
  };

  JTreeViewController.prototype.addSubList = function(nodeView, id) {
    var listToBeAdded, o;
    o = this.getOptions();
    listToBeAdded = this.listControllers[id].getView();
    if (nodeView) {
      nodeView.$().after(listToBeAdded.$());
      listToBeAdded.parentIsInDom = true;
      listToBeAdded.emit('viewAppended');
      if (o.addListsCollapsed) {
        return this.collapse(nodeView);
      } else {
        return this.expand(nodeView);
      }
    } else {
      return this.getView().addSubView(listToBeAdded);
    }
  };


  /*
  REGISTERING LISTENERS
   */

  JTreeViewController.prototype.setMainListeners = function() {
    KD.getSingleton("windowController").on("ReceivedMouseUpElsewhere", (function(_this) {
      return function(event) {
        return _this.mouseUp(event);
      };
    })(this));
    return this.getView().on("ReceivedClickElsewhere", (function(_this) {
      return function() {
        return _this.setBlurState();
      };
    })(this));
  };

  JTreeViewController.prototype.setListenersForList = function(listId) {
    this.listControllers[listId].getView().on('ItemWasAdded', (function(_this) {
      return function(view, index) {
        return _this.setItemListeners(view, index);
      };
    })(this));
    this.listControllers[listId].on("ItemSelectionPerformed", (function(_this) {
      return function(listController, arg) {
        var event, items;
        event = arg.event, items = arg.items;
        return _this.organizeSelectedNodes(listController, items, event);
      };
    })(this));
    this.listControllers[listId].on("ItemDeselectionPerformed", (function(_this) {
      return function(listController, arg) {
        var event, items;
        event = arg.event, items = arg.items;
        return _this.deselectNodes(listController, items, event);
      };
    })(this));
    return this.listControllers[listId].getListView().on('KeyDownOnTreeView', (function(_this) {
      return function(event) {
        return _this.keyEventHappened(event);
      };
    })(this));
  };

  JTreeViewController.prototype.setItemListeners = function(view, index) {
    var mouseEvents;
    view.on("viewAppended", this.nodeWasAdded.bind(this, view));
    mouseEvents = ["dblclick", "click", "mousedown", "mouseup", "mouseenter", "mousemove"];
    if (this.getOptions().contextMenu) {
      mouseEvents.push("contextmenu");
    }
    if (this.getOptions().dragdrop) {
      mouseEvents = mouseEvents.concat(["dragstart", "dragenter", "dragleave", "dragend", "dragover", "drop"]);
    }
    return view.on(mouseEvents, (function(_this) {
      return function(event) {
        return _this.mouseEventHappened(view, event);
      };
    })(this));
  };


  /*
  NODE SELECTION
   */

  JTreeViewController.prototype.organizeSelectedNodes = function(listController, nodes, event) {
    var i, len, node, results;
    if (event == null) {
      event = {};
    }
    if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
      this.deselectAllNodes(listController);
    }
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      if (indexOf.call(this.selectedNodes, node) < 0) {
        results.push(this.selectedNodes.push(node));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  JTreeViewController.prototype.deselectNodes = function(listController, nodes, event) {
    var i, len, node, results;
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      if (indexOf.call(this.selectedNodes, node) >= 0) {
        results.push(this.selectedNodes.splice(this.selectedNodes.indexOf(node), 1));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  JTreeViewController.prototype.deselectAllNodes = function(exceptThisController) {
    var id, listController, ref;
    ref = this.listControllers;
    for (id in ref) {
      if (!hasProp.call(ref, id)) continue;
      listController = ref[id];
      if (listController !== exceptThisController) {
        listController.deselectAllItems();
      }
    }
    return this.selectedNodes = [];
  };

  JTreeViewController.prototype.selectNode = function(nodeView, event, setFocus) {
    var controller;
    if (setFocus == null) {
      setFocus = true;
    }
    if (!nodeView) {
      return;
    }
    if (setFocus) {
      this.setFocusState();
    }
    controller = this.listControllers[this.getNodePId(nodeView.getData())];
    if (controller) {
      return controller.selectItem(nodeView, event);
    }
  };

  JTreeViewController.prototype.deselectNode = function(nodeView, event) {
    return this.listControllers[this.getNodePId(nodeView.getData())].deselectSingleItem(nodeView, event);
  };

  JTreeViewController.prototype.selectFirstNode = function() {
    return this.selectNode(this.nodes[this.getNodeId(this.indexedNodes[0])]);
  };

  JTreeViewController.prototype.selectNodesByRange = function(node1, node2) {
    var i, indicesToBeSliced, itemsToBeSelected, len, node, results;
    indicesToBeSliced = [this.indexedNodes.indexOf(node1.getData()), this.indexedNodes.indexOf(node2.getData())];
    indicesToBeSliced.sort(function(a, b) {
      return a - b;
    });
    itemsToBeSelected = this.indexedNodes.slice(indicesToBeSliced[0], indicesToBeSliced[1] + 1);
    results = [];
    for (i = 0, len = itemsToBeSelected.length; i < len; i++) {
      node = itemsToBeSelected[i];
      results.push(this.selectNode(this.nodes[this.getNodeId(node)], {
        shiftKey: true
      }));
    }
    return results;
  };


  /*
  COLLAPSE / EXPAND
   */

  JTreeViewController.prototype.toggle = function(nodeView) {
    if (nodeView.expanded) {
      return this.collapse(nodeView);
    } else {
      return this.expand(nodeView);
    }
  };

  JTreeViewController.prototype.expand = function(nodeView) {
    var nodeData, ref;
    nodeData = nodeView.getData();
    nodeView.expand();
    return (ref = this.listControllers[this.getNodeId(nodeData)]) != null ? ref.getView().expand() : void 0;
  };

  JTreeViewController.prototype.collapse = function(nodeView) {
    var nodeData, ref;
    nodeData = nodeView.getData();
    return (ref = this.listControllers[this.getNodeId(nodeData)]) != null ? ref.getView().collapse((function(_this) {
      return function() {
        return nodeView.collapse();
      };
    })(this)) : void 0;
  };


  /*
  DND UI FEEDBACKS
   */

  JTreeViewController.prototype.showDragOverFeedback = (function() {
    return KD.utils.throttle(function(nodeView, event) {
      var nodeData, ref, ref1;
      nodeData = nodeView.getData();
      if (nodeData.type !== "file") {
        nodeView.setClass("drop-target");
      } else {
        if ((ref = this.nodes[nodeData.parentPath]) != null) {
          ref.setClass("drop-target");
        }
        if ((ref1 = this.listControllers[nodeData.parentPath]) != null) {
          ref1.getListView().setClass("drop-target");
        }
      }
      return nodeView.setClass("items-hovering");
    }, 100);
  })();

  JTreeViewController.prototype.clearDragOverFeedback = (function() {
    return KD.utils.throttle(function(nodeView, event) {
      var nodeData, ref, ref1;
      nodeData = nodeView.getData();
      if (nodeData.type !== "file") {
        nodeView.unsetClass("drop-target");
      } else {
        if ((ref = this.nodes[nodeData.parentPath]) != null) {
          ref.unsetClass("drop-target");
        }
        if ((ref1 = this.listControllers[nodeData.parentPath]) != null) {
          ref1.getListView().unsetClass("drop-target");
        }
      }
      return nodeView.unsetClass("items-hovering");
    }, 100);
  })();

  JTreeViewController.prototype.clearAllDragFeedback = function() {
    return this.utils.wait(101, (function(_this) {
      return function() {
        var listController, nodeView, path, ref, ref1, results;
        _this.getView().$('.drop-target').removeClass("drop-target");
        _this.getView().$('.items-hovering').removeClass("items-hovering");
        ref = _this.listControllers;
        for (path in ref) {
          if (!hasProp.call(ref, path)) continue;
          listController = ref[path];
          listController.getListView().unsetClass("drop-target");
        }
        ref1 = _this.nodes;
        results = [];
        for (path in ref1) {
          if (!hasProp.call(ref1, path)) continue;
          nodeView = ref1[path];
          results.push(nodeView.unsetClass("items-hovering drop-target"));
        }
        return results;
      };
    })(this));
  };


  /*
  HANDLING MOUSE EVENTS
   */

  JTreeViewController.prototype.mouseEventHappened = function(nodeView, event) {
    switch (event.type) {
      case "mouseenter":
        return this.mouseEnter(nodeView, event);
      case "dblclick":
        return this.dblClick(nodeView, event);
      case "click":
        return this.click(nodeView, event);
      case "mousedown":
        return this.mouseDown(nodeView, event);
      case "mouseup":
        return this.mouseUp(nodeView, event);
      case "mousemove":
        return this.mouseMove(nodeView, event);
      case "contextmenu":
        return this.contextMenu(nodeView, event);
      case "dragstart":
        return this.dragStart(nodeView, event);
      case "dragenter":
        return this.dragEnter(nodeView, event);
      case "dragleave":
        return this.dragLeave(nodeView, event);
      case "dragover":
        return this.dragOver(nodeView, event);
      case "dragend":
        return this.dragEnd(nodeView, event);
      case "drop":
        return this.drop(nodeView, event);
    }
  };

  JTreeViewController.prototype.dblClick = function(nodeView, event) {
    return this.toggle(nodeView);
  };

  JTreeViewController.prototype.click = function(nodeView, event) {
    if (/arrow/.test(event.target.className)) {
      this.toggle(nodeView);
      return this.selectedItems;
    }
    this.lastEvent = event;
    if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
      this.deselectAllNodes();
    }
    if (nodeView != null) {
      if (event.shiftKey && this.selectedNodes.length > 0 && this.getOptions().multipleSelection) {
        this.selectNodesByRange(this.selectedNodes[0], nodeView);
      } else {
        this.selectNode(nodeView, event);
      }
    }
    return this.selectedItems;
  };

  JTreeViewController.prototype.contextMenu = function(nodeView, event) {};

  JTreeViewController.prototype.mouseDown = function(nodeView, event) {
    this.lastEvent = event;
    if (indexOf.call(this.selectedNodes, nodeView) < 0) {
      this.mouseIsDown = true;
      this.cancelDrag = true;
      this.mouseDownTempItem = nodeView;
      return this.mouseDownTimer = setTimeout((function(_this) {
        return function() {
          _this.mouseIsDown = false;
          _this.cancelDrag = false;
          _this.mouseDownTempItem = null;
          return _this.selectNode(nodeView, event);
        };
      })(this), 1000);
    } else {
      this.mouseIsDown = false;
      return this.mouseDownTempItem = null;
    }
  };

  JTreeViewController.prototype.mouseUp = function(event) {
    clearTimeout(this.mouseDownTimer);
    this.mouseIsDown = false;
    this.cancelDrag = false;
    return this.mouseDownTempItem = null;
  };

  JTreeViewController.prototype.mouseEnter = function(nodeView, event) {
    clearTimeout(this.mouseDownTimer);
    if (this.mouseIsDown && this.getOptions().multipleSelection) {
      this.cancelDrag = true;
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
      }
      return this.selectNodesByRange(this.mouseDownTempItem, nodeView);
    }
  };


  /*
  HANDLING DND
   */

  JTreeViewController.prototype.dragStart = function(nodeView, event) {
    var e, node, transferredData;
    if (this.cancelDrag) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    this.dragIsActive = true;
    e = event.originalEvent;
    e.dataTransfer.effectAllowed = 'copyMove';
    transferredData = (function() {
      var i, len, ref, results;
      ref = this.selectedNodes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        results.push(this.getNodeId(node.getData()));
      }
      return results;
    }).call(this);
    e.dataTransfer.setData('Text', transferredData.join());
    if (this.selectedNodes.length > 1) {
      e.dataTransfer.setDragImage(dragHelper, -10, 0);
    }
    return nodeView.setClass("drag-started");
  };

  JTreeViewController.prototype.dragEnter = function(nodeView, event) {
    return this.emit("dragEnter", nodeView, event);
  };

  JTreeViewController.prototype.dragLeave = function(nodeView, event) {
    this.clearAllDragFeedback();
    return this.emit("dragLeave", nodeView, event);
  };

  JTreeViewController.prototype.dragOver = function(nodeView, event) {
    return this.emit("dragOver", nodeView, event);
  };

  JTreeViewController.prototype.dragEnd = function(nodeView, event) {
    this.dragIsActive = false;
    nodeView.unsetClass("drag-started");
    this.clearAllDragFeedback();
    return this.emit("dragEnd", nodeView, event);
  };

  JTreeViewController.prototype.drop = function(nodeView, event) {
    this.dragIsActive = false;
    event.preventDefault();
    event.stopPropagation();
    this.emit("drop", nodeView, event);
    return false;
  };


  /*
  HANDLING KEY EVENTS
   */

  JTreeViewController.prototype.setKeyView = function() {
    if (this.listControllers[0]) {
      return KD.getSingleton("windowController").setKeyView(this.listControllers[0].getListView());
    }
  };

  JTreeViewController.prototype.keyEventHappened = function(event) {
    var base, key, nextNode, nodeView;
    key = keyMap()[event.which];
    nodeView = this.selectedNodes[0];
    this.emit("keyEventPerformedOnTreeView", event);
    if (!nodeView) {
      return;
    }
    switch (key) {
      case "down":
      case "up":
        event.preventDefault();
        nextNode = this["perform" + (key.capitalize()) + "Key"](nodeView, event);
        if (nextNode) {
          return typeof (base = this.getView()).scrollToSubView === "function" ? base.scrollToSubView(nextNode) : void 0;
        }
        break;
      case "left":
        return this.performLeftKey(nodeView, event);
      case "right":
        return this.performRightKey(nodeView, event);
      case "backspace":
        return this.performBackspaceKey(nodeView, event);
      case "enter":
        return this.performEnterKey(nodeView, event);
      case "escape":
        return this.performEscapeKey(nodeView, event);
      case "tab":
        return false;
    }
  };

  JTreeViewController.prototype.performDownKey = function(nodeView, event) {
    var nextIndex, nextNode, nodeData;
    if (this.selectedNodes.length > 1) {
      nodeView = this.selectedNodes[this.selectedNodes.length - 1];
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
        this.selectNode(nodeView);
      }
    }
    nodeData = nodeView.getData();
    nextIndex = this.indexedNodes.indexOf(nodeData) + 1;
    if (this.indexedNodes[nextIndex]) {
      nextNode = this.nodes[this.getNodeId(this.indexedNodes[nextIndex])];
      if (this.isNodeVisible(nextNode)) {
        if (indexOf.call(this.selectedNodes, nextNode) >= 0) {
          return this.deselectNode(this.nodes[this.getNodeId(nodeData)]);
        } else {
          this.selectNode(nextNode, event);
          return nextNode;
        }
      } else {
        return this.performDownKey(nextNode, event);
      }
    }
  };

  JTreeViewController.prototype.performUpKey = function(nodeView, event) {
    var nextIndex, nextNode, nodeData;
    if (this.selectedNodes.length > 1) {
      nodeView = this.selectedNodes[this.selectedNodes.length - 1];
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
        this.selectNode(nodeView);
      }
    }
    nodeData = nodeView.getData();
    nextIndex = this.indexedNodes.indexOf(nodeData) - 1;
    if (this.indexedNodes[nextIndex]) {
      nextNode = this.nodes[this.getNodeId(this.indexedNodes[nextIndex])];
      if (this.isNodeVisible(nextNode)) {
        if (indexOf.call(this.selectedNodes, nextNode) >= 0) {
          this.deselectNode(this.nodes[this.getNodeId(nodeData)]);
        } else {
          this.selectNode(nextNode, event);
        }
      } else {
        this.performUpKey(nextNode, event);
      }
    }
    return nextNode;
  };

  JTreeViewController.prototype.performRightKey = function(nodeView, event) {
    return this.expand(nodeView);
  };

  JTreeViewController.prototype.performLeftKey = function(nodeView, event) {
    var nodeData, parentNode;
    nodeData = nodeView.getData();
    if (this.nodes[this.getNodePId(nodeData)]) {
      parentNode = this.nodes[this.getNodePId(nodeData)];
      this.selectNode(parentNode);
    }
    return parentNode;
  };

  JTreeViewController.prototype.performBackspaceKey = function(nodeView, event) {};

  JTreeViewController.prototype.performEnterKey = function(nodeView, event) {};

  JTreeViewController.prototype.performEscapeKey = function(nodeView, event) {};

  return JTreeViewController;

})(KDViewController);

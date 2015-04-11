var $, KD, KDScrollView, KDTabHandleContainer, KDTabHandleMoveNav, KDTabHandleView, KDTabPaneView, KDTabView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDTabHandleView = require('./tabhandleview');

KDTabPaneView = require('./tabpaneview');

KDScrollView = require('../scrollview/scrollview');

KDTabHandleContainer = require('./tabhandlecontainer');

KDTabHandleMoveNav = require('./tabhandlemovenav');

module.exports = KDTabView = (function(superClass) {
  extend(KDTabView, superClass);

  function KDTabView(options, data) {
    var ref;
    if (options == null) {
      options = {};
    }
    if (options.resizeTabHandles == null) {
      options.resizeTabHandles = false;
    }
    if (options.maxHandleWidth == null) {
      options.maxHandleWidth = 128;
    }
    if (options.minHandleWidth == null) {
      options.minHandleWidth = 30;
    }
    if (options.lastTabHandleMargin == null) {
      options.lastTabHandleMargin = 0;
    }
    if (options.sortable == null) {
      options.sortable = false;
    }
    if (options.hideHandleContainer == null) {
      options.hideHandleContainer = false;
    }
    if (options.hideHandleCloseIcons == null) {
      options.hideHandleCloseIcons = false;
    }
    if (options.enableMoveTabHandle == null) {
      options.enableMoveTabHandle = false;
    }
    if (options.detachPanes == null) {
      options.detachPanes = true;
    }
    if (options.tabHandleContainer == null) {
      options.tabHandleContainer = null;
    }
    options.tabHandleClass || (options.tabHandleClass = KDTabHandleView);
    options.paneData || (options.paneData = []);
    options.cssClass = KD.utils.curry("kdtabview", options.cssClass);
    this.handles = [];
    this.panes = [];
    this.selectedIndex = [];
    this.tabConstructor = (ref = options.tabClass) != null ? ref : KDTabPaneView;
    this.lastOpenPaneIndex = 0;
    KDTabView.__super__.constructor.call(this, options, data);
    this.activePane = null;
    this.handlesHidden = false;
    this.blockTabHandleResize = false;
    this.setTabHandleContainer(options.tabHandleContainer);
    if (options.enableMoveTabHandle) {
      this.setTabHandleMoveNav();
    }
    if (options.hideHandleCloseIcons) {
      this.hideHandleCloseIcons();
    }
    if (options.hideHandleContainer) {
      this.hideHandleContainer();
    }
    this.on("PaneRemoved", (function(_this) {
      return function() {
        return _this.resizeTabHandles();
      };
    })(this));
    this.on("PaneAdded", (function(_this) {
      return function() {
        _this.blockTabHandleResize = false;
        return _this.resizeTabHandles();
      };
    })(this));
    this.on("PaneDidShow", this.bound("setActivePane"));
    if (options.paneData.length > 0) {
      this.on("viewAppended", (function(_this) {
        return function() {
          return _this.createPanes(options.paneData);
        };
      })(this));
    }
    this.tabHandleContainer.on("mouseleave", (function(_this) {
      return function() {
        if (_this.blockTabHandleResize) {
          _this.blockTabHandleResize = false;
          return _this.resizeTabHandles();
        }
      };
    })(this));
  }

  KDTabView.prototype.createPanes = function(paneData) {
    var i, len, paneOptions, results;
    if (paneData == null) {
      paneData = this.getOptions().paneData;
    }
    results = [];
    for (i = 0, len = paneData.length; i < len; i++) {
      paneOptions = paneData[i];
      results.push(this.addPane(new this.tabConstructor(paneOptions, null)));
    }
    return results;
  };

  KDTabView.prototype.addPane = function(paneInstance, shouldShow) {
    var closable, detachPanes, hiddenHandle, lazy, maxHandleWidth, minHandleWidth, name, newTabHandle, ref, ref1, ref2, ref3, sortable, tabHandleClass, tabHandleView, title;
    if (shouldShow == null) {
      shouldShow = (ref = paneInstance.getOptions().shouldShow) != null ? ref : true;
    }
    if (!(paneInstance instanceof KDTabPaneView)) {
      name = ((paneInstance != null ? paneInstance.constructor : void 0) != null).name;
      KD.warn("You can't add " + (name ? name : void 0) + " as a pane, use KDTabPaneView instead");
      return false;
    }
    ref1 = this.getOptions(), tabHandleClass = ref1.tabHandleClass, sortable = ref1.sortable, detachPanes = ref1.detachPanes;
    paneInstance.setOption('detachable', detachPanes);
    this.panes.push(paneInstance);
    ref2 = paneInstance.getOptions(), name = ref2.name, title = ref2.title, hiddenHandle = ref2.hiddenHandle, tabHandleView = ref2.tabHandleView, closable = ref2.closable, lazy = ref2.lazy;
    newTabHandle = paneInstance.tabHandle || new tabHandleClass({
      pane: paneInstance,
      title: name || title,
      hidden: hiddenHandle,
      cssClass: KD.utils.slugify(name.toLowerCase()),
      view: tabHandleView,
      closable: closable,
      sortable: sortable,
      mousedown: function(event) {
        var pane, tabView;
        pane = this.getOptions().pane;
        tabView = pane.getDelegate();
        return tabView.handleClicked(event, this);
      }
    });
    this.addHandle(newTabHandle);
    paneInstance.tabHandle = newTabHandle;
    this.appendPane(paneInstance);
    if (shouldShow && !lazy) {
      this.showPane(paneInstance);
    }
    this.emit('PaneAdded', paneInstance);
    ref3 = this.getOptions(), minHandleWidth = ref3.minHandleWidth, maxHandleWidth = ref3.maxHandleWidth;
    newTabHandle.getDomElement().css({
      maxWidth: maxHandleWidth,
      minWidth: minHandleWidth
    });
    newTabHandle.on('HandleIndexHasChanged', this.bound('resortTabHandles'));
    return paneInstance;
  };

  KDTabView.prototype.resortTabHandles = function(index, dir) {
    var methodName, newIndex, splicedHandle, splicedPane, targetIndex;
    if ((index === 0 && dir === 'left') || (index === this.handles.length - 1 && dir === 'right') || (index >= this.handles.length) || (index < 0)) {
      return;
    }
    this.handles[0].unsetClass('first');
    if (dir === 'right') {
      methodName = 'insertAfter';
      targetIndex = index + 1;
    } else {
      methodName = 'insertBefore';
      targetIndex = index - 1;
    }
    this.handles[index].$()[methodName](this.handles[targetIndex].$());
    newIndex = dir === 'left' ? index - 1 : index + 1;
    splicedHandle = this.handles.splice(index, 1);
    splicedPane = this.panes.splice(index, 1);
    this.handles.splice(newIndex, 0, splicedHandle[0]);
    this.panes.splice(newIndex, 0, splicedPane[0]);
    this.handles[0].setClass('first');
    return this.emit('TabsSorted');
  };

  KDTabView.prototype.removePane = function(pane, shouldDetach) {
    var firstPane, handle, index, isActivePane, prevPane;
    if (shouldDetach == null) {
      shouldDetach = false;
    }
    pane.emit("KDTabPaneDestroy");
    index = this.getPaneIndex(pane);
    isActivePane = this.getActivePane() === pane;
    this.panes.splice(index, 1);
    handle = this.getHandleByIndex(index);
    this.handles.splice(index, 1);
    if (shouldDetach) {
      this.panes = this.panes.filter(function(p) {
        return p !== pane;
      });
      this.handles = this.handles.filter(function(h) {
        return h !== handle;
      });
      pane.detach();
      handle.detach();
    } else {
      pane.destroy();
      handle.destroy();
    }
    if (isActivePane) {
      if (prevPane = this.getPaneByIndex(this.lastOpenPaneIndex)) {
        this.showPane(prevPane);
      } else if (firstPane = this.getPaneByIndex(0)) {
        this.showPane(firstPane);
      }
    }
    this.emit("PaneRemoved", {
      pane: pane,
      handle: handle
    });
    return {
      pane: pane,
      handle: handle
    };
  };

  KDTabView.prototype.removePaneByName = function(name) {
    var i, len, pane, ref, results;
    ref = this.panes;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane.name === name) {
        this.removePane(pane);
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  KDTabView.prototype.appendHandleContainer = function() {
    return this.addSubView(this.tabHandleContainer);
  };

  KDTabView.prototype.appendPane = function(pane) {
    pane.setDelegate(this);
    return this.addSubView(pane);
  };

  KDTabView.prototype.appendHandle = function(tabHandle) {
    var enableMoveTabHandle, maxHandleWidth, ref;
    this.handleHeight || (this.handleHeight = this.tabHandleContainer.getHeight());
    tabHandle.setDelegate(this);
    this.tabHandleContainer.tabs.addSubView(tabHandle);
    ref = this.getOptions(), enableMoveTabHandle = ref.enableMoveTabHandle, maxHandleWidth = ref.maxHandleWidth;
    if (enableMoveTabHandle) {
      return this._tabsWidth = this.handles.length * maxHandleWidth;
    }
  };

  KDTabView.prototype.addHandle = function(handle) {
    var name;
    if (!(handle instanceof KDTabHandleView)) {
      name = ((handle != null ? handle.constructor : void 0) != null).name;
      KD.warn("You can't add " + (name != null ? name : void 0) + " as a pane, use KDTabHandleView instead");
      return false;
    }
    this.handles.push(handle);
    this.appendHandle(handle);
    if (handle.getOptions().hidden) {
      handle.setClass('hidden');
    }
    return handle;
  };

  KDTabView.prototype.removeHandle = function() {};

  KDTabView.prototype.showPane = function(pane) {
    var activePane, handle, index;
    if (!pane) {
      return;
    }
    activePane = this.getActivePane();
    if (pane === activePane) {
      return;
    }
    if (activePane) {
      this.lastOpenPaneIndex = this.getPaneIndex(activePane);
    }
    this.hideAllPanes();
    pane.show();
    index = this.getPaneIndex(pane);
    handle = this.getHandleByIndex(index);
    handle.makeActive();
    pane.emit("PaneDidShow");
    this.emit("PaneDidShow", pane, index);
    return pane;
  };

  KDTabView.prototype.hideAllPanes = function() {
    var handle, i, j, len, len1, pane, ref, ref1, results;
    ref = this.panes;
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane) {
        pane.hide();
      }
    }
    ref1 = this.handles;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      handle = ref1[j];
      if (handle) {
        results.push(handle.makeInactive());
      }
    }
    return results;
  };

  KDTabView.prototype.hideHandleContainer = function() {
    this.tabHandleContainer.hide();
    return this.handlesHidden = true;
  };

  KDTabView.prototype.showHandleContainer = function() {
    this.tabHandleContainer.show();
    return this.handlesHidden = false;
  };

  KDTabView.prototype.toggleHandleContainer = function(duration) {
    if (duration == null) {
      duration = 0;
    }
    return this.tabHandleContainer.$().toggle(duration);
  };

  KDTabView.prototype.hideHandleCloseIcons = function() {
    return this.tabHandleContainer.$().addClass("hide-close-icons");
  };

  KDTabView.prototype.showHandleCloseIcons = function() {
    return this.tabHandleContainer.$().removeClass("hide-close-icons");
  };

  KDTabView.prototype.handleMouseDownDefaultAction = function(clickedTabHandle, event) {
    var handle, i, index, len, ref, results;
    ref = this.handles;
    results = [];
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      handle = ref[index];
      if (clickedTabHandle === handle) {
        results.push(this.handleClicked(index, event));
      }
    }
    return results;
  };

  KDTabView.prototype.handleClicked = function(event, handle) {
    var pane;
    pane = handle.getOptions().pane;
    if ($(event.target).hasClass('close-tab')) {
      this.blockTabHandleResize = true;
      this.removePane(pane);
      return false;
    }
    return this.showPane(pane);
  };

  KDTabView.prototype.setTabHandleContainer = function(aViewInstance) {
    if (aViewInstance != null) {
      if (this.tabHandleContainer != null) {
        this.tabHandleContainer.destroy();
      }
      this.tabHandleContainer = aViewInstance;
    } else {
      this.tabHandleContainer = new KDTabHandleContainer;
      this.appendHandleContainer();
    }
    return this.tabHandleContainer.setClass("kdtabhandlecontainer");
  };

  KDTabView.prototype.getTabHandleContainer = function() {
    return this.tabHandleContainer;
  };

  KDTabView.prototype.setTabHandleMoveNav = function() {
    return this.tabHandleContainer.addSubView(new KDTabHandleMoveNav({
      delegate: this
    }));
  };

  KDTabView.prototype.checkPaneExistenceById = function(id) {
    var i, len, pane, ref, result;
    result = false;
    ref = this.panes;
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane.id === id) {
        result = true;
      }
    }
    return result;
  };

  KDTabView.prototype.getPaneByName = function(name) {
    var i, len, pane, ref, result;
    result = false;
    ref = this.panes;
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane.name === name) {
        result = pane;
      }
    }
    return result;
  };

  KDTabView.prototype.getPaneById = function(id) {
    var i, len, pane, paneInstance, ref;
    paneInstance = null;
    ref = this.panes;
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane.id === id) {
        paneInstance = pane;
      }
    }
    return paneInstance;
  };

  KDTabView.prototype.getActivePane = function() {
    return this.activePane;
  };

  KDTabView.prototype.getActivePaneIndex = function() {
    return this.getPaneIndex(this.getActivePane());
  };

  KDTabView.prototype.setActivePane = function(activePane1) {
    this.activePane = activePane1;
  };

  KDTabView.prototype.getPaneByIndex = function(index) {
    return this.panes[index];
  };

  KDTabView.prototype.getHandleByIndex = function(index) {
    return this.handles[index];
  };

  KDTabView.prototype.getPaneIndex = function(aPane) {
    if (!aPane) {
      throw new Error("no pane provided!");
    }
    return this.panes.indexOf(aPane);
  };

  KDTabView.prototype.showPaneByIndex = function(index) {
    return this.showPane(this.getPaneByIndex(index));
  };

  KDTabView.prototype.showPaneByName = function(name) {
    return this.showPane(this.getPaneByName(name));
  };

  KDTabView.prototype.showNextPane = function() {
    var activeIndex, activePane;
    activePane = this.getActivePane();
    activeIndex = this.getPaneIndex(activePane);
    return this.showPane(this.getPaneByIndex(activeIndex + 1));
  };

  KDTabView.prototype.showPreviousPane = function() {
    var activeIndex, activePane;
    activePane = this.getActivePane();
    activeIndex = this.getPaneIndex(activePane);
    return this.showPane(this.getPaneByIndex(activeIndex - 1));
  };

  KDTabView.prototype.setPaneTitle = function(pane, title) {
    var handle;
    handle = this.getHandleByPane(pane);
    handle.getDomElement().find("b").text(title);
    return handle.setAttribute("title", title);
  };

  KDTabView.prototype.getHandleByPane = function(pane) {
    var handle, index;
    index = this.getPaneIndex(pane);
    return handle = this.getHandleByIndex(index);
  };

  KDTabView.prototype.hideCloseIcon = function(pane) {
    var handle, index;
    index = this.getPaneIndex(pane);
    handle = this.getHandleByIndex(index);
    return handle.getDomElement().addClass("hide-close-icon");
  };

  KDTabView.prototype.getVisibleHandles = function() {
    return this.handles.filter(function(handle) {
      return handle.isHidden() === false;
    });
  };

  KDTabView.prototype.getVisibleTabs = function() {
    return this.panes.filter(function(pane) {
      return pane.tabHandle.isHidden() === false;
    });
  };

  KDTabView.prototype.resizeTabHandles = function() {
    var containerMargin, containerSize, handle, i, j, lastTabHandleMargin, len, len1, outerWidth, possiblePercent, ref, results, visibleHandles, visibleTotalSize;
    if (!this.getOptions().resizeTabHandles || this._tabHandleContainerHidden || this.blockTabHandleResize) {
      return;
    }
    lastTabHandleMargin = this.getOptions().lastTabHandleMargin;
    visibleHandles = [];
    visibleTotalSize = 0;
    outerWidth = this.tabHandleContainer.tabs.getElement().offsetWidth;
    if (outerWidth <= 0) {
      return;
    }
    containerSize = outerWidth - lastTabHandleMargin;
    containerMargin = 100 - (100 * lastTabHandleMargin / containerSize);
    ref = this.handles;
    for (i = 0, len = ref.length; i < len; i++) {
      handle = ref[i];
      if (!(!handle.isHidden())) {
        continue;
      }
      visibleHandles.push(handle);
      visibleTotalSize += handle.getElement().offsetWidth;
    }
    possiblePercent = (containerMargin / visibleHandles.length).toFixed(2);
    results = [];
    for (j = 0, len1 = visibleHandles.length; j < len1; j++) {
      handle = visibleHandles[j];
      results.push(handle.setWidth(possiblePercent, "%"));
    }
    return results;
  };

  return KDTabView;

})(KDScrollView);

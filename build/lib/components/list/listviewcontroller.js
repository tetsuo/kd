var KD, KDCustomHTMLView, KDCustomScrollView, KDListView, KDListViewController, KDLoaderView, KDScrollView, KDView, KDViewController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KD = require('../../core/kd');

KDView = require('../../core/view');

KDViewController = require('../../core/viewcontroller');

KDCustomHTMLView = require('../../core/customhtmlview');

KDScrollView = require('../scrollview/scrollview');

KDCustomScrollView = require('../scrollview/customscrollview');

KDListView = require('../list/listview');

KDLoaderView = require('../loader/loaderview');

module.exports = KDListViewController = (function(superClass) {
  extend(KDListViewController, superClass);

  function KDListViewController(options, data) {
    var listView, noItemFoundWidget, viewOptions;
    if (options == null) {
      options = {};
    }
    if (options.wrapper == null) {
      options.wrapper = true;
    }
    if (options.scrollView == null) {
      options.scrollView = true;
    }
    if (options.keyNav == null) {
      options.keyNav = false;
    }
    if (options.multipleSelection == null) {
      options.multipleSelection = false;
    }
    if (options.selection == null) {
      options.selection = false;
    }
    if (options.startWithLazyLoader == null) {
      options.startWithLazyLoader = false;
    }
    options.itemChildClass || (options.itemChildClass = null);
    options.itemChildOptions || (options.itemChildOptions = {});
    if (options.useCustomScrollView == null) {
      options.useCustomScrollView = false;
    }
    options.noItemFoundWidget || (options.noItemFoundWidget = null);
    options.noMoreItemFoundWidget || (options.noMoreItemFoundWidget = null);
    if (options.lastToFirst == null) {
      options.lastToFirst = false;
    }
    Object.defineProperty(this, "itemsOrdered", {
      get: (function(_this) {
        return function() {
          KD.warn("KDListViewController::itemsOrdered is deprecated.");
          return _this.getListItems();
        };
      })(this)
    });
    this.itemsIndexed = {};
    this.selectedItems = [];
    this.lazyLoader = null;
    if (options.view) {
      this.setListView(listView = options.view);
    } else {
      viewOptions = options.viewOptions || {};
      viewOptions.lastToFirst || (viewOptions.lastToFirst = options.lastToFirst);
      viewOptions.itemClass || (viewOptions.itemClass = options.itemClass);
      viewOptions.itemOptions || (viewOptions.itemOptions = options.itemOptions);
      viewOptions.itemChildClass || (viewOptions.itemChildClass = options.itemChildClass);
      viewOptions.itemChildOptions || (viewOptions.itemChildOptions = options.itemChildOptions);
      if (viewOptions.boxed == null) {
        viewOptions.boxed = options.boxed;
      }
      if (viewOptions.itemsPerBox == null) {
        viewOptions.itemsPerBox = options.itemsPerBox;
      }
      this.setListView(listView = new KDListView(viewOptions));
    }
    if (options.scrollView) {
      if (options.useCustomScrollView) {
        this.customScrollView = new KDCustomScrollView({
          lazyLoadThreshold: options.lazyLoadThreshold
        });
        this.scrollView = this.customScrollView.wrapper;
      } else {
        this.scrollView = new KDScrollView({
          lazyLoadThreshold: options.lazyLoadThreshold
        });
      }
    }
    options.view = options.wrapper ? new KDView({
      cssClass: "listview-wrapper"
    }) : listView;
    KDListViewController.__super__.constructor.call(this, options, data);
    noItemFoundWidget = this.getOptions().noItemFoundWidget;
    listView.on('ItemWasAdded', (function(_this) {
      return function(view, index) {
        _this.registerItem(view, index);
        if (noItemFoundWidget) {
          return _this.hideNoItemWidget();
        }
      };
    })(this));
    listView.on('ItemWasRemoved', (function(_this) {
      return function(view, index) {
        _this.unregisterItem(view, index);
        if (noItemFoundWidget) {
          return _this.showNoItemWidget();
        }
      };
    })(this));
    if (options.keyNav) {
      listView.on('KeyDownOnList', (function(_this) {
        return function(event) {
          return _this.keyDownPerformed(listView, event);
        };
      })(this));
    }
  }

  KDListViewController.prototype.loadView = function(mainView) {
    var noItemFoundWidget, ref, ref1, scrollView, startWithLazyLoader, windowController;
    ref = this.getOptions(), scrollView = ref.scrollView, startWithLazyLoader = ref.startWithLazyLoader, noItemFoundWidget = ref.noItemFoundWidget;
    windowController = KD.getSingleton('windowController');
    if (scrollView) {
      mainView.addSubView(this.customScrollView || this.scrollView);
      this.scrollView.addSubView(this.getListView());
      this.scrollView.on('LazyLoadThresholdReached', this.bound("showLazyLoader"));
    }
    if (startWithLazyLoader) {
      this.showLazyLoader(false);
    }
    if (noItemFoundWidget) {
      this.putNoItemView();
    }
    this.instantiateListItems(((ref1 = this.getData()) != null ? ref1.items : void 0) || []);
    return windowController.on("ReceivedMouseUpElsewhere", this.bound('mouseUpHappened'));
  };

  KDListViewController.prototype.instantiateListItems = function(items) {
    var itemData, newItems;
    newItems = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        itemData = items[i];
        results.push(this.addItem(itemData));
      }
      return results;
    }).call(this);
    this.emit('AllItemsAddedToList');
    return newItems;
  };


  /*
  HELPERS
   */

  KDListViewController.prototype.getIndex = function(index) {
    if (this.getOptions().lastToFirst) {
      return this.getItemCount() - index - 1;
    } else {
      return index;
    }
  };

  KDListViewController.prototype.itemForId = function(id) {
    return this.itemsIndexed[id];
  };

  KDListViewController.prototype.getItemsOrdered = function() {
    return this.itemsOrdered;
  };

  KDListViewController.prototype.getListItems = function() {
    return this.getListView().items;
  };

  KDListViewController.prototype.getItemCount = function() {
    return this.getListItems().length;
  };

  KDListViewController.prototype.setListView = function(listView) {
    return this.listView = listView;
  };

  KDListViewController.prototype.getListView = function() {
    return this.listView;
  };

  KDListViewController.prototype.forEachItemByIndex = function(ids, callback) {
    var ref;
    if (!callback) {
      ref = [ids, callback], callback = ref[0], ids = ref[1];
    }
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    return ids.forEach((function(_this) {
      return function(id) {
        var item;
        item = _this.itemsIndexed[id];
        if (item != null) {
          return callback(item);
        }
      };
    })(this));
  };

  KDListViewController.prototype.putNoItemView = function() {
    var noItemFoundWidget;
    noItemFoundWidget = this.getOptions().noItemFoundWidget;
    return this.getListView().addSubView(this.noItemView = noItemFoundWidget);
  };

  KDListViewController.prototype.showNoItemWidget = function() {
    var ref;
    if (this.getListItems().length === 0) {
      this.emit('ListIsEmptied');
      return (ref = this.noItemView) != null ? ref.show() : void 0;
    }
  };

  KDListViewController.prototype.hideNoItemWidget = function() {
    var ref;
    if ((ref = this.noItemView) != null) {
      ref.hide();
    }
    return this.emit('ListIsNoMoreEmpty');
  };

  KDListViewController.prototype.showNoMoreItemWidget = function() {
    var noMoreItemFoundWidget;
    noMoreItemFoundWidget = this.getOptions().noMoreItemFoundWidget;
    if (noMoreItemFoundWidget) {
      return this.scrollView.addSubView(noMoreItemFoundWidget);
    }
  };


  /*
  ITEM OPERATIONS
   */

  KDListViewController.prototype.addItem = function(itemData, index) {
    if (!(itemData || (index != null))) {
      return;
    }
    return this.getListView().addItem(itemData, index);
  };

  KDListViewController.prototype.removeItem = function(itemInstance, itemData, index) {
    if (!(itemInstance || itemData || (index != null))) {
      return;
    }
    return this.getListView().removeItem(itemInstance, itemData, index);
  };

  KDListViewController.prototype.registerItem = function(itemInstance, index) {
    var id, keyNav, multipleSelection, ref, selection;
    if (itemInstance.getItemDataId() != null) {
      id = itemInstance.getItemDataId();
      this.itemsIndexed[id] = itemInstance;
    }
    ref = this.getOptions(), selection = ref.selection, keyNav = ref.keyNav, multipleSelection = ref.multipleSelection;
    if (selection) {
      itemInstance.on('click', (function(_this) {
        return function(event) {
          return _this.selectItem(itemInstance, event);
        };
      })(this));
    }
    if (keyNav || multipleSelection) {
      itemInstance.on('mousedown', (function(_this) {
        return function(event) {
          return _this.mouseDownHappenedOnItem(itemInstance, event);
        };
      })(this));
      return itemInstance.on('mouseenter', (function(_this) {
        return function(event) {
          return _this.mouseEnterHappenedOnItem(itemInstance, event);
        };
      })(this));
    }
  };

  KDListViewController.prototype.unregisterItem = function(itemInstance, index) {
    this.emit('UnregisteringItem', itemInstance, index);
    if (itemInstance.getData() != null) {
      return delete this.itemsIndexed[itemInstance.getItemDataId()];
    }
  };

  KDListViewController.prototype.replaceAllItems = function(items) {
    this.removeAllItems();
    return this.instantiateListItems(items);
  };

  KDListViewController.prototype.removeAllItems = function() {
    var listView;
    this.itemsIndexed = {};
    listView = this.getListView();
    if (listView.items.length) {
      listView.empty();
    }
    return this.getListItems();
  };

  KDListViewController.prototype.moveItemToIndex = function(item, newIndex) {
    newIndex = Math.max(0, Math.min(this.getListItems().length - 1, newIndex));
    return this.getListView().moveItemToIndex(item, newIndex).slice();
  };


  /*
  HANDLING MOUSE EVENTS
   */

  KDListViewController.prototype.mouseDownHappenedOnItem = function(item, event) {
    if (this.getOptions().keyNav) {
      KD.getSingleton("windowController").setKeyView(this.getListView());
    }
    this.lastEvent = event;
    if (indexOf.call(this.selectedItems, item) < 0) {
      this.mouseDown = true;
      this.mouseDownTempItem = item;
      return this.mouseDownTimer = setTimeout((function(_this) {
        return function() {
          _this.mouseDown = false;
          _this.mouseDownTempItem = null;
          return _this.selectItem(item, event);
        };
      })(this), 300);
    } else {
      this.mouseDown = false;
      return this.mouseDownTempItem = null;
    }
  };

  KDListViewController.prototype.mouseUpHappened = function(event) {
    clearTimeout(this.mouseDownTimer);
    this.mouseDown = false;
    return this.mouseDownTempItem = null;
  };

  KDListViewController.prototype.mouseEnterHappenedOnItem = function(item, event) {
    clearTimeout(this.mouseDownTimer);
    if (this.mouseDown) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        this.deselectAllItems();
      }
      return this.selectItemsByRange(this.mouseDownTempItem, item);
    } else {
      return this.emit("MouseEnterHappenedOnItem", item);
    }
  };


  /*
  HANDLING KEY EVENTS
   */

  KDListViewController.prototype.keyDownPerformed = function(mainView, event) {
    switch (event.which) {
      case 40:
      case 38:
        this.selectItemBelowOrAbove(event);
        return this.emit("KeyDownOnListHandled", this.selectedItems);
    }
  };


  /*
  ITEM SELECTION
   */

  KDListViewController.prototype.selectItem = function(item, event) {
    var ctrlKey, metaKey, multipleSelection, selectable, shiftKey;
    if (event == null) {
      event = {};
    }
    if (item == null) {
      return;
    }
    this.lastEvent = event;
    selectable = item.getOptions().selectable;
    multipleSelection = this.getOptions().multipleSelection;
    metaKey = event.metaKey, ctrlKey = event.ctrlKey, shiftKey = event.shiftKey;
    if (!multipleSelection) {
      this.deselectAllItems();
    }
    if (selectable && !(metaKey || ctrlKey || shiftKey)) {
      this.deselectAllItems();
    }
    if (event.shiftKey && this.selectedItems.length > 0) {
      this.selectItemsByRange(this.selectedItems[0], item);
    } else {
      if (indexOf.call(this.selectedItems, item) < 0) {
        this.selectSingleItem(item);
      } else {
        this.deselectSingleItem(item);
      }
    }
    return this.selectedItems;
  };

  KDListViewController.prototype.selectItemBelowOrAbove = function(event) {
    var addend, direction, items, lastSelectedIndex, selectedIndex;
    direction = event.which === 40 ? "down" : "up";
    addend = event.which === 40 ? 1 : -1;
    items = this.getListItems();
    selectedIndex = items.indexOf(this.selectedItems[0]);
    lastSelectedIndex = items.indexOf(this.selectedItems[this.selectedItems.length - 1]);
    if (items[selectedIndex + addend]) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        return this.selectItem(items[selectedIndex + addend]);
      } else {
        if (this.selectedItems.indexOf(items[lastSelectedIndex + addend]) !== -1) {
          if (items[lastSelectedIndex]) {
            return this.deselectSingleItem(items[lastSelectedIndex]);
          }
        } else {
          if (items[lastSelectedIndex + addend]) {
            return this.selectSingleItem(items[lastSelectedIndex + addend]);
          }
        }
      }
    }
  };

  KDListViewController.prototype.selectNextItem = function(item, event) {
    var items, selectedIndex;
    items = this.getListItems();
    if (!item) {
      item = this.selectedItems[0];
    }
    selectedIndex = items.indexOf(item);
    return this.selectItem(items[selectedIndex + 1]);
  };

  KDListViewController.prototype.selectPrevItem = function(item, event) {
    var items, selectedIndex;
    items = this.getListItems();
    if (!item) {
      item = this.selectedItems[0];
    }
    selectedIndex = items.indexOf(item);
    return this.selectItem(items[selectedIndex + -1]);
  };

  KDListViewController.prototype.deselectAllItems = function() {
    var deselectedItems, i, len, ref, results, selectedItem;
    ref = this.selectedItems;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      selectedItem = ref[i];
      selectedItem.removeHighlight();
      deselectedItems = this.selectedItems.concat([]);
      this.selectedItems = [];
      this.getListView().unsetClass("last-item-selected");
      results.push(this.itemDeselectionPerformed(deselectedItems));
    }
    return results;
  };

  KDListViewController.prototype.deselectSingleItem = function(item) {
    var items;
    item.removeHighlight();
    items = this.getListItems();
    this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    if (item === items[items.length - 1]) {
      this.getListView().unsetClass("last-item-selected");
    }
    return this.itemDeselectionPerformed([item]);
  };

  KDListViewController.prototype.selectSingleItem = function(item) {
    var items;
    items = this.getListItems();
    if (item.getOption("selectable") && !(indexOf.call(this.selectedItems, item) >= 0)) {
      item.highlight();
      this.selectedItems.push(item);
      if (item === items[items.length - 1]) {
        this.getListView().setClass("last-item-selected");
      }
      return this.itemSelectionPerformed();
    }
  };

  KDListViewController.prototype.selectAllItems = function() {
    var i, item, len, ref, results;
    ref = this.getListItems();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(this.selectSingleItem(item));
    }
    return results;
  };

  KDListViewController.prototype.selectItemsByRange = function(item1, item2) {
    var i, indicesToBeSliced, item, items, itemsToBeSelected, len;
    items = this.getListItems();
    indicesToBeSliced = [items.indexOf(item1), items.indexOf(item2)];
    indicesToBeSliced.sort(function(a, b) {
      return a - b;
    });
    itemsToBeSelected = items.slice(indicesToBeSliced[0], indicesToBeSliced[1] + 1);
    for (i = 0, len = itemsToBeSelected.length; i < len; i++) {
      item = itemsToBeSelected[i];
      this.selectSingleItem(item);
    }
    return this.itemSelectionPerformed();
  };

  KDListViewController.prototype.itemSelectionPerformed = function() {
    return this.emit("ItemSelectionPerformed", this, {
      event: this.lastEvent,
      items: this.selectedItems
    });
  };

  KDListViewController.prototype.itemDeselectionPerformed = function(deselectedItems) {
    return this.emit("ItemDeselectionPerformed", this, {
      event: this.lastEvent,
      items: deselectedItems
    });
  };


  /*
  LAZY LOADER
   */

  KDListViewController.prototype.createLazyLoader = function() {
    var itemClass, lazyLoaderOptions, spinnerOptions, wrapper;
    lazyLoaderOptions = this.getOptions().lazyLoaderOptions;
    lazyLoaderOptions || (lazyLoaderOptions = {});
    lazyLoaderOptions.itemClass || (lazyLoaderOptions.itemClass = KDCustomHTMLView);
    if (lazyLoaderOptions.partial == null) {
      lazyLoaderOptions.partial = '';
    }
    lazyLoaderOptions.cssClass = KD.utils.curry('lazy-loader', lazyLoaderOptions.cssClass);
    lazyLoaderOptions.spinnerOptions || (lazyLoaderOptions.spinnerOptions = {
      size: {
        width: 32
      }
    });
    itemClass = lazyLoaderOptions.itemClass, spinnerOptions = lazyLoaderOptions.spinnerOptions;
    delete lazyLoaderOptions.itemClass;
    wrapper = this.scrollView || this.getView();
    wrapper.addSubView(this.lazyLoader = new itemClass(lazyLoaderOptions));
    return this.lazyLoader.addSubView(this.lazyLoader.spinner = new KDLoaderView(spinnerOptions));
  };

  KDListViewController.prototype.showLazyLoader = function(emitWhenReached) {
    if (emitWhenReached == null) {
      emitWhenReached = true;
    }
    if (this.noItemView && this.getOptions().noItemFoundWidget) {
      this.hideNoItemWidget();
    }
    if (!this.lazyLoader) {
      this.createLazyLoader();
    }
    this.lazyLoader.show();
    this.lazyLoader.spinner.show();
    if (emitWhenReached) {
      return this.emit('LazyLoadThresholdReached');
    }
  };

  KDListViewController.prototype.hideLazyLoader = function() {
    if (!this.lazyLoader) {
      return;
    }
    if (this.noItemView && this.getOptions().noItemFoundWidget) {
      this.showNoItemWidget();
    }
    this.lazyLoader.spinner.hide();
    return this.lazyLoader.hide();
  };

  return KDListViewController;

})(KDViewController);

var KD, KDListItemView, KDListView, KDListViewBox, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDListItemView = require('./listitemview');

KDView = require('../../core/view');

KDListViewBox = require('./listviewbox');

module.exports = KDListView = (function(superClass) {
  extend(KDListView, superClass);

  function KDListView(options, data) {
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "default");
    if (options.lastToFirst == null) {
      options.lastToFirst = false;
    }
    if (options.boxed == null) {
      options.boxed = false;
    }
    if (options.itemsPerBox == null) {
      options.itemsPerBox = 10;
    }
    options.cssClass = options.cssClass != null ? "kdlistview kdlistview-" + options.type + " " + options.cssClass : "kdlistview kdlistview-" + options.type;
    KDListView.__super__.constructor.call(this, options, data);
    this.items = [];
    this.boxes = [];
  }

  KDListView.prototype.empty = function() {
    var i, item, j, len, ref;
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      if (item) {
        item.destroy();
      }
    }
    return this.items = [];
  };

  KDListView.prototype.keyDown = function(event) {
    KD.utils.stopDOMEvent(event);
    return this.emit("KeyDownOnList", event);
  };

  KDListView.prototype.sanitizeIndex = function(index) {
    var lastToFirst, length, sanitizedIndex;
    lastToFirst = this.getOptions().lastToFirst;
    length = this.items.length;
    if (lastToFirst) {
      if (index == null) {
        index = 0;
      }
      sanitizedIndex = Math.max(0, length - index - 1);
    } else {
      if (index == null) {
        index = length;
      }
      sanitizedIndex = Math.min(length, index);
    }
    return sanitizedIndex;
  };

  KDListView.prototype.addItemView = function(itemInstance, index) {
    index = this.sanitizeIndex(index);
    this.insertItemAtIndex(itemInstance, index);
    return itemInstance;
  };

  KDListView.prototype.addItem = function(itemData, index) {
    var itemChildClass, itemChildOptions, itemClass, itemInstance, itemOptions, ref;
    index = this.sanitizeIndex(index);
    ref = this.getOptions(), itemOptions = ref.itemOptions, itemClass = ref.itemClass, itemChildClass = ref.itemChildClass, itemChildOptions = ref.itemChildOptions;
    if (itemClass == null) {
      itemClass = KDListItemView;
    }
    if (itemOptions == null) {
      itemOptions = {};
    }
    itemOptions = (typeof this.customizeItemOptions === "function" ? this.customizeItemOptions(itemOptions, itemData) : void 0) || itemOptions;
    itemOptions.delegate || (itemOptions.delegate = this);
    itemOptions.childClass || (itemOptions.childClass = itemChildClass);
    itemOptions.childOptions || (itemOptions.childOptions = itemChildOptions);
    itemInstance = new itemClass(itemOptions, itemData);
    this.insertItemAtIndex(itemInstance, index);
    return itemInstance;
  };

  KDListView.prototype.removeItem = function(item) {
    var index;
    index = this.items.indexOf(item);
    if (index < 0) {
      return false;
    }
    this.emit('ItemWasRemoved', item, index);
    item.destroy();
    this.items.splice(index, 1);
    return true;
  };

  KDListView.prototype.destroy = function() {
    var item, j, len, ref;
    ref = this.items;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      item.destroy();
    }
    return KDListView.__super__.destroy.apply(this, arguments);
  };

  KDListView.prototype.insertItemAtIndex = function(item, index) {
    var addNeighborItem, box, boxed, endIndex, isFirstIndex, isInBetween, isLastIndex, itemsPerBox, lastToFirst, ref, which;
    ref = this.getOptions(), boxed = ref.boxed, lastToFirst = ref.lastToFirst;
    endIndex = this.items.length - 1;
    isLastIndex = index > endIndex;
    isFirstIndex = index === 0;
    isInBetween = (0 < index && index <= endIndex);
    if (isFirstIndex) {
      this.items.unshift(item);
    } else if (isLastIndex) {
      this.items.push(item);
    } else {
      this.items.splice(index, 0, item);
    }
    this.emit('ItemWasAdded', item, index);
    addNeighborItem = (function(_this) {
      return function(item, index) {
        var element, neighborIndex, neighborItem;
        element = item.getElement();
        neighborIndex = _this.items.length - 1 === index ? index : index + 1;
        neighborItem = _this.items[neighborIndex].getElement();
        neighborItem.parentNode.insertBefore(element, neighborItem);
        if (_this.parentIsInDom) {
          return item.emit('viewAppended');
        }
      };
    })(this);
    if (!boxed) {
      if (isFirstIndex) {
        this.addSubView(item, null, true);
      } else if (isLastIndex) {
        this.addSubView(item);
      } else {
        addNeighborItem(item, index);
      }
    } else {
      itemsPerBox = this.getOptions().itemsPerBox;
      if (this.boxes.length === 0) {
        box = this.createBox();
        box.addSubView(item);
      } else if (isFirstIndex || isLastIndex) {
        box = null;
        which = isFirstIndex ? 'first' : 'last';
        if (this.boxes[which].getItems().length >= itemsPerBox) {
          box = this.createBox(isFirstIndex);
        } else {
          box = this.boxes[which];
        }
        box.addSubView(item, null, isFirstIndex);
      } else if (isInBetween) {
        addNeighborItem(item, index);
      }
    }
    if (this.doIHaveToScroll()) {
      return this.scrollDown();
    }
  };

  KDListView.prototype.packageItem = function(itemInstance, prepend) {
    var items, itemsPerBox, lastToFirst, newBox, potentialBox, ref;
    ref = this.getOptions(), itemsPerBox = ref.itemsPerBox, lastToFirst = ref.lastToFirst;
    newBox = (function(_this) {
      return function() {
        var box;
        box = _this.createBox(prepend);
        return box.addSubView(itemInstance);
      };
    })(this);
    potentialBox = prepend ? this.boxes.first : this.boxes.last;
    if (!potentialBox) {
      return newBox();
    }
    items = potentialBox.getItems();
    if (items.length < itemsPerBox) {
      return potentialBox.addSubView(itemInstance, null, lastToFirst);
    } else {
      return newBox();
    }
  };

  KDListView.prototype.createBox = function(prepend) {
    var box;
    box = new KDListViewBox;
    if (prepend) {
      this.boxes.unshift(box);
    } else {
      this.boxes.push(box);
    }
    this.addSubView(box, null, prepend);
    box.on('BoxIsEmptied', (function(_this) {
      return function(id) {
        var _box, i, index, j, len, ref;
        index = null;
        ref = _this.boxes;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          _box = ref[i];
          if (!(_box.getId() === id)) {
            continue;
          }
          index = i;
          break;
        }
        if (index != null) {
          return _this.boxes.splice(index, 1)[0].destroy();
        }
      };
    })(this));
    return box;
  };

  KDListView.prototype.handleScroll = function() {};

  KDListView.prototype.getItemIndex = function(item) {
    return this.items.indexOf(item);
  };

  KDListView.prototype.moveItemToIndex = function(item, newIndex) {
    var currentIndex, diff, targetItem;
    currentIndex = this.getItemIndex(item);
    if (currentIndex < 0) {
      KD.warn("Item doesn't exists", item);
      return this.items;
    }
    newIndex = Math.max(0, Math.min(this.items.length - 1, newIndex));
    if (newIndex >= this.items.length - 1) {
      targetItem = this.items.last;
      targetItem.$().after(item.$());
    } else {
      diff = newIndex > currentIndex ? 1 : 0;
      targetItem = this.items[newIndex + diff];
      targetItem.$().before(item.$());
    }
    this.items.splice(currentIndex, 1);
    this.items.splice(newIndex, 0, item);
    return this.items;
  };

  KDListView.prototype.scrollDown = function() {
    clearTimeout(this._scrollDownTimeout);
    return this._scrollDownTimeout = KD.utils.wait(50, (function(_this) {
      return function() {
        var scrollView, slidingHeight, slidingView;
        scrollView = _this.$().closest(".kdscrollview");
        slidingView = scrollView.find('> .kdview');
        slidingHeight = slidingView.height();
        return scrollView.animate({
          scrollTop: slidingHeight
        }, {
          duration: 200,
          queue: false
        });
      };
    })(this));
  };

  KDListView.prototype.doIHaveToScroll = function() {
    var scrollView;
    if (this.getOptions().autoScroll) {
      scrollView = this.$().closest(".kdscrollview")[0];
      if (scrollView.length && scrollView.scrollHeight > scrollView.outerHeight()) {
        return true;
      } else {
        return this.isScrollAtBottom(scrollView);
      }
    } else {
      return false;
    }
  };

  KDListView.prototype.isScrollAtBottom = function(scrollView) {
    var scrollTop, scrollViewheight, slidingHeight, slidingView;
    slidingView = scrollView.find('> .kdview')[0];
    scrollTop = scrollView.scrollTop;
    slidingHeight = slidingView.clientHeight;
    scrollViewheight = scrollView.clientHeight;
    return slidingHeight - scrollViewheight === scrollTop;
  };

  return KDListView;

})(KDView);

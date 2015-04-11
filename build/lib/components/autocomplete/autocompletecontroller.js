var $, Inflector, JsPath, KD, KDAutoComplete, KDAutoCompleteController, KDAutoCompleteFetchingItem, KDAutoCompleteListItemView, KDAutoCompleteListView, KDAutoCompleteNothingFoundItem, KDAutoCompletedItem, KDInputView, KDLabelView, KDListViewController, KDNotificationView, KDView, KDViewController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

$ = require('jquery');

KD = require('../../core/kd');

KDAutoCompleteListItemView = require('./autocompletelistitem');

KDAutoCompleteNothingFoundItem = require('./autocompletenothingfounditem');

KDAutoCompletedItem = require('./autocompleteditems');

KDInputView = require('../inputs/inputview');

KDView = require('../../core/view');

JsPath = require('jspath');

Inflector = require('inflector');

KDViewController = require('../../core/viewcontroller');

KDListViewController = require('../list/listviewcontroller');

KDLabelView = require('../inputs/labelview');

KDNotificationView = require('../notifications/notificationview');

KDAutoComplete = require('./autocomplete');

KDAutoCompleteListView = require('./autocompletelist');

KDAutoCompleteFetchingItem = require('./autocompletefetchingitem');

module.exports = KDAutoCompleteController = (function(superClass) {
  extend(KDAutoCompleteController, superClass);

  function KDAutoCompleteController(options, data) {
    var mainView, ref;
    if (options == null) {
      options = {};
    }
    options = $.extend({
      view: mainView = options.view || new KDAutoComplete({
        name: options.name,
        placeholder: options.placeholder || "",
        label: options.label || new KDLabelView({
          title: options.name
        })
      }),
      itemClass: KDAutoCompleteListItemView,
      selectedItemClass: KDAutoCompletedItem,
      nothingFoundItemClass: KDAutoCompleteNothingFoundItem,
      fetchingItemClass: KDAutoCompleteFetchingItem,
      fetchInterval: (ref = options.fetchInterval) != null ? ref : 300,
      listWrapperCssClass: '',
      minSuggestionLength: 2,
      selectedItemsLimit: null,
      itemDataPath: '',
      separator: ',',
      wrapper: 'parent',
      submitValuesAsText: false,
      defaultValue: []
    }, options);
    KDAutoCompleteController.__super__.constructor.call(this, options, data);
    mainView.on('focus', this.bound('updateDropdownContents'));
    this.lastPrefix = null;
    this.selectedItemData = [];
    this.hiddenInputs = {};
    this.selectedItemCounter = 0;
    this.readyToShowDropDown = true;
    this.createDropDown();
    this.getAutoCompletedItemParent();
  }

  KDAutoCompleteController.prototype.reset = function() {
    var item, j, len, results, subViews;
    subViews = this.itemWrapper.getSubViews().slice();
    results = [];
    for (j = 0, len = subViews.length; j < len; j++) {
      item = subViews[j];
      results.push(this.removeFromSubmitQueue(item));
    }
    return results;
  };

  KDAutoCompleteController.prototype.loadView = function(mainView) {
    this.setDefaultValue();
    mainView.on('keyup', this.bound('keyUpOnInputView'));
    return mainView.on('keydown', (function(_this) {
      return function(event) {
        return _this.keyDownOnInputView(event);
      };
    })(this));
  };

  KDAutoCompleteController.prototype.setDefaultValue = function(defaultItems) {
    var defaultValue, item, itemDataPath, j, len, ref, results;
    ref = this.getOptions(), defaultValue = ref.defaultValue, itemDataPath = ref.itemDataPath;
    defaultItems || (defaultItems = defaultValue);
    results = [];
    for (j = 0, len = defaultItems.length; j < len; j++) {
      item = defaultItems[j];
      results.push(this.addItemToSubmitQueue(this.getView(), item));
    }
    return results;
  };

  KDAutoCompleteController.prototype.keyDownOnInputView = function(event) {
    var autoCompleteView, list;
    autoCompleteView = this.getView();
    list = this.dropdown.getListView();
    switch (event.which) {
      case 13:
      case 9:
        if (autoCompleteView.getValue() !== "" && event.shiftKey !== true) {
          this.submitAutoComplete(autoCompleteView.getValue());
          this.readyToShowDropDown = false;
        } else {
          true;
        }
        break;
      case 27:
        this.hideDropdown();
        break;
      case 38:
        if (this.active) {
          list.goUp();
          return KD.utils.stopDOMEvent(event);
        }
        break;
      case 40:
        if (this.active) {
          list.goDown();
          return KD.utils.stopDOMEvent(event);
        }
        break;
      default:
        this.readyToShowDropDown = true;
    }
    return false;
  };

  KDAutoCompleteController.prototype.getPrefix = function() {
    var items, prefix, separator;
    separator = this.getOptions().separator;
    items = this.getView().getValue().split(separator);
    prefix = items[items.length - 1];
    return prefix;
  };

  KDAutoCompleteController.prototype.createDropDown = function(data) {
    var dropdownListView, dropdownWrapper, windowController;
    if (data == null) {
      data = [];
    }
    this.dropdownPrefix = "";
    this.dropdownListView = dropdownListView = new KDAutoCompleteListView({
      itemClass: this.getOptions().itemClass
    }, {
      items: data
    });
    dropdownListView.on('ItemsDeselected', (function(_this) {
      return function() {
        var view;
        view = _this.getView();
        return view.$input().trigger('focus');
      };
    })(this));
    dropdownListView.on('KDAutoCompleteSubmit', this.bound('submitAutoComplete'));
    windowController = KD.getSingleton('windowController');
    this.dropdown = new KDListViewController({
      view: dropdownListView
    });
    dropdownWrapper = this.dropdown.getView();
    dropdownWrapper.on('ReceivedClickElsewhere', (function(_this) {
      return function() {
        return _this.hideDropdown();
      };
    })(this));
    dropdownWrapper.setClass("kdautocomplete hidden " + (this.getOptions().listWrapperCssClass));
    return dropdownWrapper.appendToDomBody();
  };

  KDAutoCompleteController.prototype.hideDropdown = function() {
    var dropdownWrapper;
    dropdownWrapper = this.dropdown.getView();
    this.active = false;
    return dropdownWrapper.hide();
  };

  KDAutoCompleteController.prototype.showDropdown = function() {
    var dropdownWrapper, input, offset, windowController;
    if (!this.readyToShowDropDown) {
      return;
    }
    this.active = true;
    windowController = KD.getSingleton('windowController');
    dropdownWrapper = this.dropdown.getView();
    dropdownWrapper.unsetClass("hidden");
    input = this.getView();
    offset = input.$().offset();
    offset.top += input.getHeight();
    dropdownWrapper.$().css(offset);
    dropdownWrapper.show();
    return windowController.addLayer(dropdownWrapper);
  };

  KDAutoCompleteController.prototype.refreshDropDown = function(data) {
    var allowNewSuggestions, exactMatches, exactPattern, inexactMatches, itemDataPath, listView, minSuggestionLength, ref;
    if (data == null) {
      data = [];
    }
    listView = this.dropdown.getListView();
    this.dropdown.removeAllItems();
    listView.userInput = this.dropdownPrefix;
    exactPattern = RegExp('^' + this.dropdownPrefix.replace(/[^\s\w]/, '') + '$', 'i');
    exactMatches = [];
    inexactMatches = [];
    ref = this.getOptions(), itemDataPath = ref.itemDataPath, allowNewSuggestions = ref.allowNewSuggestions, minSuggestionLength = ref.minSuggestionLength;
    data.forEach((function(_this) {
      return function(datum) {
        var match;
        if (!_this.isItemAlreadySelected(datum)) {
          match = JsPath.getAt(datum, itemDataPath);
          if (exactPattern.test(match)) {
            return exactMatches.push(datum);
          } else {
            return inexactMatches.push(datum);
          }
        }
      };
    })(this));
    if ((this.dropdownPrefix.length >= minSuggestionLength) && allowNewSuggestions && !exactMatches.length) {
      this.dropdown.getListView().addItemView(this.getNoItemFoundView());
    }
    data = exactMatches.concat(inexactMatches);
    this.dropdown.instantiateListItems(data);
    return this.dropdown.getListView().goDown();
  };

  KDAutoCompleteController.prototype.submitAutoComplete = function(item, data) {
    var activeItem, inputView, listView;
    inputView = this.getView();
    if (this.getOptions().selectedItemsLimit === null || this.getOptions().selectedItemsLimit > this.selectedItemCounter) {
      listView = this.dropdown.getListView();
      activeItem = listView.getActiveItem();
      listView.setActiveItem(null);
      if (activeItem.item) {
        this.appendAutoCompletedItem();
      }
      this.addItemToSubmitQueue(activeItem.item);
      this.emit('ItemListChanged', this.selectedItemCounter);
    } else {
      inputView.setValue('');
      KD.getSingleton("windowController").setKeyView(null);
      new KDNotificationView({
        type: "mini",
        title: "You can add up to " + (this.getOptions().selectedItemsLimit) + " items!",
        duration: 4000
      });
    }
    return this.hideDropdown();
  };

  KDAutoCompleteController.prototype.getAutoCompletedItemParent = function() {
    var outputWrapper;
    outputWrapper = this.getOptions().outputWrapper;
    this.itemWrapper = outputWrapper instanceof KDView ? outputWrapper : this.getView();
    return this.itemWrapper;
  };

  KDAutoCompleteController.prototype.isItemAlreadySelected = function(data) {
    var alreadySelected, customCompare, isCaseSensitive, itemDataPath, j, len, ref, ref1, selected, selectedData, suggested;
    ref = this.getOptions(), itemDataPath = ref.itemDataPath, customCompare = ref.customCompare, isCaseSensitive = ref.isCaseSensitive;
    suggested = JsPath.getAt(data, itemDataPath);
    ref1 = this.getSelectedItemData();
    for (j = 0, len = ref1.length; j < len; j++) {
      selectedData = ref1[j];
      if (customCompare != null) {
        alreadySelected = customCompare(data, selectedData);
        if (alreadySelected) {
          return true;
        }
      } else {
        selected = JsPath.getAt(selectedData, itemDataPath);
        if (!isCaseSensitive) {
          suggested = suggested.toLowerCase();
          selected = selected.toLowerCase();
        }
        if (suggested === selected) {
          return true;
        }
      }
    }
    return false;
  };

  KDAutoCompleteController.prototype.addHiddenInputItem = function(name, value) {
    return this.itemWrapper.addSubView(this.hiddenInputs[name] = new KDInputView({
      type: "hidden",
      name: name,
      defaultValue: value
    }));
  };

  KDAutoCompleteController.prototype.removeHiddenInputItem = function(name) {
    return delete this.hiddenInputs[name];
  };

  KDAutoCompleteController.prototype.addSelectedItem = function(name, data) {
    var itemView, selectedItemClass;
    selectedItemClass = this.getOptions().selectedItemClass;
    this.itemWrapper.addSubView(itemView = new selectedItemClass({
      cssClass: "kdautocompletedlistitem",
      delegate: this,
      name: name
    }, data));
    return itemView.setPartial("<span class='close-icon'></span>");
  };

  KDAutoCompleteController.prototype.getSelectedItemData = function() {
    return this.selectedItemData;
  };

  KDAutoCompleteController.prototype.addSelectedItemData = function(data) {
    return this.getSelectedItemData().push(data);
  };

  KDAutoCompleteController.prototype.removeSelectedItemData = function(data) {
    var i, j, len, selectedData, selectedItemData;
    selectedItemData = this.getSelectedItemData();
    for (i = j = 0, len = selectedItemData.length; j < len; i = ++j) {
      selectedData = selectedItemData[i];
      if (selectedData === data) {
        selectedItemData.splice(i, 1);
        return;
      }
    }
  };

  KDAutoCompleteController.prototype.getCollectionPath = function() {
    var collectionName, j, leaf, name, path, ref;
    name = this.getOptions().name;
    if (!name) {
      throw new Error('No name!');
    }
    ref = name.split('.'), path = 2 <= ref.length ? slice.call(ref, 0, j = ref.length - 1) : (j = 0, []), leaf = ref[j++];
    collectionName = Inflector.pluralize(leaf);
    path.push(collectionName);
    return path.join('.');
  };

  KDAutoCompleteController.prototype.addSuggestion = function(title) {
    return this.emit('AutocompleteSuggestionWasAdded', title);
  };

  KDAutoCompleteController.prototype.addItemToSubmitQueue = function(item, data) {
    var collection, form, itemDataPath, itemName, itemValue, name, path, ref, submitValuesAsText;
    data || (data = item != null ? item.getData() : void 0);
    if (!(data || (item != null ? item.getOptions().userInput : void 0))) {
      return;
    }
    ref = this.getOptions(), name = ref.name, itemDataPath = ref.itemDataPath, form = ref.form, submitValuesAsText = ref.submitValuesAsText;
    if (data) {
      itemValue = submitValuesAsText ? JsPath.getAt(data, itemDataPath) : data;
    } else {
      itemValue = item.getOptions().userInput;
      data = JsPath(itemDataPath, itemValue);
    }
    if (this.isItemAlreadySelected(data)) {
      return false;
    }
    path = this.getCollectionPath();
    itemName = name + "-" + (this.selectedItemCounter++);
    if (form) {
      collection = form.getCustomData(path) || [];
      collection.push(submitValuesAsText ? itemValue : (typeof itemValue.getId === "function" ? itemValue.getId() : void 0) ? {
        constructorName: itemValue.constructor.name,
        id: itemValue.getId(),
        title: itemValue.title
      } : {
        $suggest: itemValue
      });
      form.addCustomData(path, collection);
      if (item.getOptions().userInput === !"") {
        this.selectedItemCounter++;
      }
    } else {
      this.addHiddenInputItem(path, itemValue);
    }
    this.addSelectedItemData(data);
    this.addSelectedItem(itemName, data);
    return this.getView().setValue(this.dropdownPrefix = "");
  };

  KDAutoCompleteController.prototype.removeFromSubmitQueue = function(item, data) {
    var collection, form, itemDataPath, path, ref;
    ref = this.getOptions(), itemDataPath = ref.itemDataPath, form = ref.form;
    data || (data = item.getData());
    path = this.getCollectionPath();
    if (form) {
      collection = JsPath.getAt(form.getCustomData(), path);
      collection = collection.filter(function(sibling) {
        var id;
        id = typeof data.getId === "function" ? data.getId() : void 0;
        if (id == null) {
          return sibling.$suggest !== data.title;
        } else {
          return sibling.id !== id;
        }
      });
      JsPath.setAt(form.getCustomData(), path, collection);
    } else {
      this.removeHiddenInputItem(path);
    }
    this.removeSelectedItemData(data);
    this.selectedItemCounter--;
    item.destroy();
    return this.emit('ItemListChanged', this.selectedItemCounter);
  };

  KDAutoCompleteController.prototype.appendAutoCompletedItem = function() {
    this.getView().setValue("");
    return this.getView().$input().trigger("focus");
  };

  KDAutoCompleteController.prototype.updateDropdownContents = function() {
    var fetchInterval, inputView, value;
    inputView = this.getView();
    value = inputView.getValue().trim();
    if (value === '') {
      return this.hideDropdown();
    }
    if (this.active && value === this.dropdownPrefix) {
      return;
    }
    this.dropdownPrefix = value;
    this.showFetching();
    fetchInterval = this.getOptions().fetchInterval;
    return this.fetch(KD.utils.debounce(fetchInterval, (function(_this) {
      return function(data) {
        if (data.length > 0) {
          _this.refreshDropDown(data);
          return _this.showDropdown();
        } else {
          KD.log('no data found');
          return _this.showNoDataFound();
        }
      };
    })(this)));
  };

  KDAutoCompleteController.prototype.keyUpOnInputView = function(event) {
    var ref;
    if ((ref = event.keyCode) === 9 || ref === 38 || ref === 40) {
      return;
    }
    this.updateDropdownContents();
    return false;
  };

  KDAutoCompleteController.prototype.fetch = function(callback) {
    var dataSource, fetchInputName, options, ref, value;
    ref = this.getOptions(), fetchInputName = ref.fetchInputName, dataSource = ref.dataSource;
    value = this.getView().getValue();
    options = {};
    if (fetchInputName) {
      options[fetchInputName] = value;
    } else {
      options = {
        inputValue: value
      };
    }
    this.dropdownPrefix = value;
    return dataSource(options, callback);
  };

  KDAutoCompleteController.prototype.showFetching = function() {
    var fetchingItemClass, list;
    fetchingItemClass = this.getOptions().fetchingItemClass;
    list = this.dropdown.getListView();
    this.dropdown.removeAllItems();
    list.addItemView(new fetchingItemClass({}, {}));
    return this.showDropdown();
  };

  KDAutoCompleteController.prototype.getNoItemFoundView = function(suggestion) {
    var nothingFoundItemClass, view;
    nothingFoundItemClass = this.getOptions().nothingFoundItemClass;
    view = new nothingFoundItemClass({
      delegate: this.dropdown.getListView(),
      userInput: suggestion || this.getView().getValue()
    }, {});
    return view;
  };

  KDAutoCompleteController.prototype.showNoDataFound = function() {
    var noItemFoundView;
    noItemFoundView = this.getNoItemFoundView();
    this.dropdown.removeAllItems();
    this.dropdown.getListView().addItemView(noItemFoundView);
    return this.showDropdown();
  };

  KDAutoCompleteController.prototype.destroy = function() {
    this.dropdown.getView().destroy();
    return KDAutoCompleteController.__super__.destroy.apply(this, arguments);
  };

  return KDAutoCompleteController;

})(KDViewController);

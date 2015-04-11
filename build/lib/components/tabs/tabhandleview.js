var $, KDTabHandleView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KDView = require('../../core/view');

module.exports = KDTabHandleView = (function(superClass) {
  extend(KDTabHandleView, superClass);

  function KDTabHandleView(options, data) {
    if (options == null) {
      options = {};
    }
    if (options.hidden == null) {
      options.hidden = false;
    }
    options.title || (options.title = "Title");
    if (options.pane == null) {
      options.pane = null;
    }
    if (options.view == null) {
      options.view = null;
    }
    if (options.sortable == null) {
      options.sortable = false;
    }
    if (options.closable == null) {
      options.closable = true;
    }
    if (options.addTitleAttribute == null) {
      options.addTitleAttribute = true;
    }
    if (options.sortable) {
      options.draggable = {
        axis: "x"
      };
      this.dragStartPosX = null;
    }
    KDTabHandleView.__super__.constructor.call(this, options, data);
    this.on("DragStarted", (function(_this) {
      return function(event, dragState) {
        _this.startedDragFromCloseElement = $(event.target).hasClass("close-tab");
        return _this.handleDragStart(event, dragState);
      };
    })(this));
    this.on("DragInAction", (function(_this) {
      return function(x, y) {
        if (_this.startedDragFromCloseElement) {
          _this.dragIsAllowed = false;
        }
        return _this.handleDragInAction(x, y);
      };
    })(this));
    this.on("DragFinished", (function(_this) {
      return function(event) {
        _this.handleDragFinished(event);
        return _this.getDelegate().showPaneByIndex(_this.index);
      };
    })(this));
  }

  KDTabHandleView.prototype.setDomElement = function(cssClass) {
    var addTitleAttribute, closable, closeHandle, hidden, ref, tagName, title;
    if (cssClass == null) {
      cssClass = "";
    }
    ref = this.getOptions(), hidden = ref.hidden, closable = ref.closable, tagName = ref.tagName, title = ref.title, addTitleAttribute = ref.addTitleAttribute;
    cssClass = hidden ? cssClass + " hidden" : cssClass;
    closeHandle = closable ? "<span class='close-tab'></span>" : "";
    title = addTitleAttribute ? "title='" + title + "'" : "";
    return this.domElement = $("<" + tagName + " " + title + " class='kdtabhandle " + cssClass + "'>" + closeHandle + "</" + tagName + ">");
  };

  KDTabHandleView.prototype.viewAppended = function() {
    var view;
    view = this.getOptions().view;
    if (view && view instanceof KDView) {
      return this.addSubView(view);
    } else {
      return this.setPartial(this.partial());
    }
  };

  KDTabHandleView.prototype.partial = function() {
    return "<b>" + (this.getOptions().title || 'Default Title') + "</b>";
  };

  KDTabHandleView.prototype.makeActive = function() {
    return this.getDomElement().addClass("active");
  };

  KDTabHandleView.prototype.makeInactive = function() {
    return this.getDomElement().removeClass("active");
  };

  KDTabHandleView.prototype.setTitle = function(title) {
    return this.setAttribute("title", title);
  };

  KDTabHandleView.prototype.isHidden = function() {
    return this.getOptions().hidden;
  };

  KDTabHandleView.prototype.getWidth = function() {
    return this.$().outerWidth(false) || 0;
  };

  KDTabHandleView.prototype.cloneElement = function(x) {
    var holder, pane, tabView;
    pane = this.getOptions().pane;
    tabView = pane.getDelegate();
    holder = tabView.tabHandleContainer.tabs;
    this.$cloned = this.$().clone();
    holder.$().append(this.$cloned);
    return this.$cloned.css({
      marginLeft: -(tabView.handles.length - this.index) * this.getWidth()
    });
  };

  KDTabHandleView.prototype.reorderTabHandles = function(x) {
    var dragDir, targetDiff, targetIndex, width;
    dragDir = this.dragState.direction;
    width = this.getWidth();
    if (dragDir.current.x === 'left') {
      targetIndex = this.index - 1;
      targetDiff = -(width * this.draggedItemIndex - width * targetIndex - width / 2);
      if (x < targetDiff) {
        this.emit("HandleIndexHasChanged", this.index, 'left');
        return this.index--;
      }
    } else {
      targetIndex = this.index + 1;
      targetDiff = width * targetIndex - width * this.draggedItemIndex - width / 2;
      if (x > targetDiff) {
        this.emit("HandleIndexHasChanged", this.index, 'right');
        return this.index++;
      }
    }
  };

  KDTabHandleView.prototype.handleDragStart = function(event, dragState) {
    var handles, pane, tabView;
    pane = this.getOptions().pane;
    tabView = pane.getDelegate();
    handles = tabView.handles;
    this.index = handles.indexOf(this);
    return this.draggedItemIndex = this.index;
  };

  KDTabHandleView.prototype.handleDragInAction = function(x, y) {
    if (!this.dragIsAllowed) {
      return;
    }
    if (-(this.draggedItemIndex * this.getWidth()) > x) {
      return this.$().css({
        'left': 0
      });
    }
    if (!this.$cloned) {
      this.cloneElement(x);
    }
    this.$().css({
      opacity: 0
    });
    this.$cloned.css({
      left: x
    });
    return this.reorderTabHandles(x);
  };

  KDTabHandleView.prototype.handleDragFinished = function(event) {
    if (!this.$cloned) {
      return;
    }
    this.$cloned.remove();
    this.$().css({
      left: '',
      opacity: 1,
      marginLeft: ''
    });
    if (!this.targetTabHandle && this.draggedItemIndex === 0) {
      this.$().css({
        left: 0
      });
    }
    this.targetTabHandle = null;
    return this.$cloned = null;
  };

  return KDTabHandleView;

})(KDView);

var KD, KDCustomHTMLView, KDTabHandleMoveNav,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDCustomHTMLView = require('../../core/customhtmlview');

module.exports = KDTabHandleMoveNav = (function(superClass) {
  extend(KDTabHandleMoveNav, superClass);

  function KDTabHandleMoveNav(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kdtabhandle-movenav', options.cssClass);
    KDTabHandleMoveNav.__super__.constructor.call(this, options, data);
    this._current = 0;
  }

  KDTabHandleMoveNav.prototype.viewAppended = function() {
    this.addSubView(this.left = new KDCustomHTMLView({
      cssClass: 'leftButton',
      click: (function(_this) {
        return function() {
          return _this.move('right');
        };
      })(this)
    }));
    this.addSubView(this.right = new KDCustomHTMLView({
      cssClass: 'rightButton',
      click: (function(_this) {
        return function() {
          return _this.move('left');
        };
      })(this)
    }));
    return this.listenWindowResize();
  };

  KDTabHandleMoveNav.prototype._windowDidResize = function() {
    var delegate;
    delegate = this.getDelegate();
    if (!(delegate.getWidth() > delegate._tabsWidth + 50)) {
      return this.show();
    } else {
      this.move('initial');
      return this.hide();
    }
  };

  KDTabHandleMoveNav.prototype.move = function(direction) {
    var delegate, handleWidth, tabHandleContainer;
    tabHandleContainer = (delegate = this.getDelegate()).tabHandleContainer;
    handleWidth = delegate.getOption('maxHandleWidth');
    switch (direction) {
      case 'left':
        if (handleWidth * delegate.handles.length + 100 < tabHandleContainer.getWidth() - this._current) {
          return;
        }
        this._current -= handleWidth;
        break;
      case 'right':
        if (this._current === 0) {
          return;
        }
        this._current += handleWidth;
        break;
      case 'initial':
        this._current = 0;
    }
    return tabHandleContainer.tabs.setCss('marginLeft', this._current + "px");
  };

  return KDTabHandleMoveNav;

})(KDCustomHTMLView);

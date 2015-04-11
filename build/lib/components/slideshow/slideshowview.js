var Hammer, KD, KDSlideShowView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

Hammer = require('hammerjs');

KDView = require('../../core/view');

module.exports = KDSlideShowView = (function(superClass) {
  var X_COORD, Y_COORD, ref;

  extend(KDSlideShowView, superClass);

  ref = [1, 2], X_COORD = ref[0], Y_COORD = ref[1];

  function KDSlideShowView(options, data) {
    var animation, direction, hammer, leftToRight, ref1, topToBottom, touchCallbacks, touchEnabled;
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kd-slide', options.cssClass);
    if (options.animation == null) {
      options.animation = 'move';
    }
    if (options.direction == null) {
      options.direction = 'leftToRight';
    }
    if (options.touchEnabled == null) {
      options.touchEnabled = true;
    }
    KDSlideShowView.__super__.constructor.call(this, options, data);
    this.pages = [];
    this._coordsY = [];
    this._currentX = 0;
    ref1 = this.getOptions(), animation = ref1.animation, direction = ref1.direction, touchEnabled = ref1.touchEnabled;
    topToBottom = [[animation + "FromTop", animation + "FromBottom"], [animation + "ToBottom", animation + "ToTop"]];
    leftToRight = [[animation + "FromLeft", animation + "FromRight"], [animation + "ToRight", animation + "ToLeft"]];
    if (direction === 'topToBottom') {
      this.xcoordAnimations = topToBottom;
      this.ycoordAnimations = leftToRight;
      touchCallbacks = ['nextSubPage', 'previousSubPage', 'nextPage', 'previousPage'];
    } else {
      this.xcoordAnimations = leftToRight;
      this.ycoordAnimations = topToBottom;
      touchCallbacks = ['nextPage', 'previousPage', 'nextSubPage', 'previousSubPage'];
    }
    if (touchEnabled) {
      hammer = Hammer(this.getElement());
      hammer.on("swipeleft", this.bound(touchCallbacks[0]));
      hammer.on("swiperight", this.bound(touchCallbacks[1]));
      hammer.on("swipeup", this.bound(touchCallbacks[2]));
      hammer.on("swipedown", this.bound(touchCallbacks[3]));
      hammer.on("touchmove", function(e) {
        return e.preventDefault();
      });
    }
  }

  KDSlideShowView.prototype.addPage = function(page) {
    this.addSubView(page);
    if (this.pages.length === 0) {
      page.setClass('current');
      this.currentPage = page;
    }
    this.pages.push([page]);
    return this._coordsY.push(0);
  };

  KDSlideShowView.prototype.addSubPage = function(page) {
    var lastAddedPage;
    this.addSubView(page);
    lastAddedPage = this.pages.last;
    return lastAddedPage.push(page);
  };

  KDSlideShowView.prototype.nextPage = function() {
    return this.jump(this._currentX + 1, X_COORD);
  };

  KDSlideShowView.prototype.previousPage = function() {
    return this.jump(this._currentX - 1, X_COORD);
  };

  KDSlideShowView.prototype.nextSubPage = function() {
    return this.jump(this._coordsY[this._currentX] + 1, Y_COORD);
  };

  KDSlideShowView.prototype.previousSubPage = function() {
    return this.jump(this._coordsY[this._currentX] - 1, Y_COORD);
  };

  KDSlideShowView.prototype.jump = function(pageIndex, coord, callback) {
    var current, currentPage, direction, index, newPage, pages, ref1, ref2;
    if (coord == null) {
      coord = 1;
    }
    if (callback == null) {
      callback = KD.noop;
    }
    if (coord === X_COORD) {
      ref1 = [this.pages, this._currentX], pages = ref1[0], current = ref1[1];
    } else {
      ref2 = [this.pages[this._currentX], this._coordsY[this._currentX]], pages = ref2[0], current = ref2[1];
    }
    if (pages.length <= 1) {
      return;
    }
    index = Math.min(pages.length - 1, Math.max(0, pageIndex));
    if (current === index) {
      return;
    }
    direction = index < current ? 0 : 1;
    if (coord === X_COORD) {
      currentPage = pages[current][this._coordsY[current]];
      newPage = pages[index][this._coordsY[index]];
      this._currentX = index;
      newPage.move(this.xcoordAnimations[0][direction]);
      currentPage.move(this.xcoordAnimations[1][direction]);
    } else {
      currentPage = pages[current];
      newPage = pages[index];
      this._coordsY[this._currentX] = index;
      newPage.move(this.ycoordAnimations[0][direction]);
      currentPage.move(this.ycoordAnimations[1][direction]);
    }
    this.emit('CurrentPageChanged', {
      x: this._currentX,
      y: this._coordsY[this._currentX]
    });
    newPage.setClass('current');
    this.currentPage = newPage;
    return this.utils.wait(600, function() {
      currentPage.unsetClass('current');
      return callback();
    });
  };

  return KDSlideShowView;

})(KDView);

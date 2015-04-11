var KD, KDController, KDView, KDViewController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('./kd');

KDView = require('./view');

KDController = require('./controller');

module.exports = KDViewController = (function(superClass) {
  extend(KDViewController, superClass);

  function KDViewController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view || (options.view = new KDView);
    KDViewController.__super__.constructor.call(this, options, data);
    if (this.getOptions().view) {
      this.setView(this.getOptions().view);
    }
  }

  KDViewController.prototype.loadView = function(mainView) {};

  KDViewController.prototype.getView = function() {
    return this.mainView;
  };

  KDViewController.prototype.setView = function(aViewInstance) {
    var cb;
    this.mainView = aViewInstance;
    this.emit("ControllerHasSetItsView");
    cb = this.loadView.bind(this, aViewInstance);
    if (aViewInstance.isViewReady()) {
      return cb();
    } else {
      aViewInstance.once('viewAppended', cb);
      return aViewInstance.once('KDObjectWillBeDestroyed', (function(_this) {
        return function() {
          return KD.utils.defer(_this.bound("destroy"));
        };
      })(this));
    }
  };

  return KDViewController;

})(KDController);

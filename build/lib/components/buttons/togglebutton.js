var $, KD, KDButtonView, KDToggleButton,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

KD = require('../../core/kd');

KDButtonView = require('./buttonview');

module.exports = KDToggleButton = (function(superClass) {
  extend(KDToggleButton, superClass);

  function KDToggleButton(options, data) {
    if (options == null) {
      options = {};
    }
    options = $.extend({
      dataPath: null,
      defaultState: null,
      states: []
    }, options);
    KDToggleButton.__super__.constructor.call(this, options, data);
    this.setState(options.defaultState);
  }

  KDToggleButton.prototype.getStateIndex = function(name) {
    var i, index, len, state, states;
    states = this.getOptions().states;
    if (!name) {
      return 0;
    } else {
      for (index = i = 0, len = states.length; i < len; index = ++i) {
        state = states[index];
        if (name === state.title) {
          return index;
        }
      }
    }
  };

  KDToggleButton.prototype.decorateState = function(name) {
    this.setTitle(this.state.title);
    if (this.state.iconClass != null) {
      this.setIconClass(this.state.iconClass);
    }
    if ((this.state.cssClass != null) || (this.lastUsedCssClass != null)) {
      if (this.lastUsedCssClass != null) {
        this.unsetClass(this.lastUsedCssClass);
      }
      this.setClass(this.state.cssClass);
      return this.lastUsedCssClass = this.state.cssClass;
    } else {
      return delete this.lastUsedCssClass;
    }
  };

  KDToggleButton.prototype.getState = function() {
    return this.state;
  };

  KDToggleButton.prototype.setState = function(name) {
    var index, states;
    states = this.getOptions().states;
    this.stateIndex = index = this.getStateIndex(name);
    this.state = states[index];
    this.decorateState(name);
    return this.setCallback(states[index].callback.bind(this, this.toggleState.bind(this)));
  };

  KDToggleButton.prototype.toggleState = function(err) {
    var nextState, states;
    states = this.getOptions().states;
    nextState = states[this.stateIndex + 1] || states[0];
    if (!err) {
      this.setState(nextState.title);
    } else {
      if (err.name !== 'AccessDenied') {
        KD.warn(err.message || ("There was an error, couldn't switch to " + nextState.title + " state!"));
      }
    }
    return typeof this.hideLoader === "function" ? this.hideLoader() : void 0;
  };

  return KDToggleButton;

})(KDButtonView);

var KDHeaderView, KDView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KDView = require('../../core/view');


/**
 * # KDHeaderView
 *
 * KDHeaderView is a basic KDView to implement the
 * `<h1>`/`<h2>`/`<h3>`/etc DOM elements.
 *
 * ## Usage
 *
 * ```coffee
 * header = new KDHeaderView
 *   title: 'Header title!'
 *   type: 'big'
 *
 * appView.addSubView header
 * ```
 */

module.exports = KDHeaderView = (function(superClass) {
  extend(KDHeaderView, superClass);


  /**
   * Options supports the following keys:
   * - **options.title**: The contents for your header view.
   * - **options.type**: The level of your `H` element, represented in three
   *  options: `"big"`, `"medium"`, `"small"` which translates to `"h1"`,
   *  `"h2"`, ` "h3"` respectively.
   *
   * @param {Object} options
   * @param {Object} data
   */

  function KDHeaderView(options, data) {
    var ref;
    options = options != null ? options : {};
    options.type = (ref = options.type) != null ? ref : "default";
    KDHeaderView.__super__.constructor.call(this, options, data);
    if (options.title != null) {
      if (this.lazy) {
        this.updateTitle(options.title);
      } else {
        this.setTitle(options.title);
      }
    }
  }


  /**
   * Set the title of this heaer element.
   *
   * @param {String} title The title you want to set your header to
   */

  KDHeaderView.prototype.setTitle = function(title) {
    return this.getDomElement().append("<span>" + title + "</span>");
  };


  /**
   * Update the title for this header option. This can be used after you have
   * already set the title, to change it to another title.
   *
   * @param {String} title The title you want to update your header to
   */

  KDHeaderView.prototype.updateTitle = function(title) {
    return this.$().find('span').html(title);
  };

  KDHeaderView.prototype.setDomElement = function(cssClass) {
    var type;
    if (cssClass == null) {
      cssClass = "";
    }
    type = this.getOptions().type;
    this.setOption("tagName", (function() {
      switch (type) {
        case "big":
          return "h1";
        case "medium":
          return "h2";
        case "small":
          return "h3";
        default:
          return "h4";
      }
    })());
    return KDHeaderView.__super__.setDomElement.call(this, this.utils.curry("kdheaderview", cssClass));
  };

  return KDHeaderView;

})(KDView);

var Encoder, KD, KDContentEditableView, KDContextMenu, KDTokenizedInput,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KD = require('../../core/kd');

KDContentEditableView = require('./contenteditableview');

KDContextMenu = require('../contextmenu/contextmenu');

Encoder = require('htmlencode');

module.exports = KDTokenizedInput = (function(superClass) {
  extend(KDTokenizedInput, superClass);

  function KDTokenizedInput(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = KD.utils.curry('kdtokenizedinputview', options.cssClass);
    options.bind = KD.utils.curry('keyup', options.bind);
    options.rules || (options.rules = {});
    options.layer || (options.layer = {});
    KDTokenizedInput.__super__.constructor.call(this, options, data);
    this.tokenViews = {};
  }

  KDTokenizedInput.prototype.getValue = function(options) {
    var i, len, node, nodeValue, ref, ref1, value;
    if (options == null) {
      options = {};
    }
    value = "";
    ref = this.getEditableElement().childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      if (((ref1 = node.tagName) != null ? ref1.toLowerCase() : void 0) === "div") {
        value += "\n";
      }
      nodeValue = this.getValueOfNode(node);
      if (nodeValue !== "\n") {
        value += nodeValue;
      }
    }
    if (value === Encoder.htmlDecode(this.getOptions().placeholder)) {
      return "";
    } else {
      return value;
    }
  };

  KDTokenizedInput.prototype.getValueOfNode = function(node) {
    var value;
    value = "";
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        if (node.textContent !== "") {
          value += node.textContent;
        }
        break;
      case Node.ELEMENT_NODE:
        value += this.getValueOfElement(node);
    }
    return value;
  };

  KDTokenizedInput.prototype.getValueOfElement = function(element) {
    var child, i, key, len, ref, ref1, tagName, value;
    key = (ref = element.dataset) != null ? ref.key : void 0;
    if (key) {
      value = this.getValueOfTokenElement(key);
    }
    if (value) {
      return value;
    }
    tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case "br":
        return "\n";
      default:
        value = "";
        ref1 = element.childNodes;
        for (i = 0, len = ref1.length; i < len; i++) {
          child = ref1[i];
          value += this.getValueOfNode(child);
        }
        return value || "";
    }
  };

  KDTokenizedInput.prototype.getValueOfTokenElement = function(key) {
    var view;
    view = this.getTokenView(key);
    if (key && view) {
      return view.encodeValue();
    }
  };

  KDTokenizedInput.prototype.getTokens = function() {
    return this.findTokensInElement(this.getEditableElement());
  };

  KDTokenizedInput.prototype.findTokensInElement = function(element) {
    var child, data, i, key, len, ref, ref1, tokens, type, view;
    tokens = [];
    ref = element.childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      switch (child.nodeType) {
        case Node.ELEMENT_NODE:
          if (key = (ref1 = child.dataset) != null ? ref1.key : void 0) {
            view = this.getTokenView(key);
            type = view.getOptions().type;
            data = view.getData();
            tokens.push({
              type: type,
              data: data
            });
          } else {
            tokens = tokens.concat(this.findTokensInElement(child));
          }
      }
    }
    return tokens;
  };

  KDTokenizedInput.prototype.getTokenView = function(key) {
    return this.tokenViews[key];
  };

  KDTokenizedInput.prototype.matchPrefix = function() {
    var char, name, node, range, ref, ref1, results, rule, start;
    if (this.tokenInput) {
      return;
    }
    if (!(range = this.utils.getSelectionRange())) {
      return;
    }
    node = range.commonAncestorContainer;
    if (((ref = node.children) != null ? ref.length : void 0) === 1) {
      return node.textContent === node.children[0].textContent;
    }
    start = range.startOffset - 1;
    char = node.textContent[start];
    ref1 = this.getOptions().rules;
    results = [];
    for (name in ref1) {
      rule = ref1[name];
      if (char === rule.prefix) {
        this.activeRule = rule;
        this.tokenInput = document.createElement("span");
        this.tokenInput.textContent = rule.prefix;
        this.utils.replaceRange(node, this.tokenInput, start, start + rule.prefix.length);
        results.push(this.utils.selectText(this.tokenInput, rule.prefix.length));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  KDTokenizedInput.prototype.matchToken = function() {
    var dataSource, token;
    if (!this.tokenInput.parentNode) {
      return this.cancel();
    }
    this.sanitizeInput();
    token = this.tokenInput.textContent.substring(this.activeRule.prefix.length);
    if (/\s/.test(token)) {
      return this.cancel();
    }
    if (token === this.lastToken) {
      return;
    }
    this.lastToken = token;
    if (token.trim()) {
      dataSource = this.activeRule.dataSource;
      return dataSource(token, this.bound('showMenu'));
    } else if (token.length !== 0) {
      return this.cancel();
    }
  };

  KDTokenizedInput.prototype.sanitizeInput = function() {};

  KDTokenizedInput.prototype.showMenu = function(options, data) {
    var pos, ref;
    if (options == null) {
      options = {};
    }
    if ((ref = this.menu) != null) {
      ref.destroy();
    }
    this.menu = null;
    if (!(this.tokenInput && data.length)) {
      return;
    }
    pos = this.tokenInput.getBoundingClientRect();
    if (options.x == null) {
      options.x = pos.left;
    }
    if (options.y == null) {
      options.y = pos.top + parseInt(window.getComputedStyle(this.tokenInput).lineHeight, 10);
    }
    this.menu = new KDContextMenu(options, data);
    return this.menu.on('ContextMenuItemReceivedClick', this.bound('menuItemClicked'));
  };

  KDTokenizedInput.prototype.hideMenu = function() {
    var ref;
    if ((ref = this.menu) != null) {
      ref.destroy();
    }
    this.menu = null;
    this.activeRule = null;
    return this.tokenInput = null;
  };

  KDTokenizedInput.prototype.menuItemClicked = function(item, tokenViewClass) {
    this.addToken(item.data, tokenViewClass);
    return this.hideMenu();
  };

  KDTokenizedInput.prototype.addToken = function(item, tokenViewClass) {
    var pistachio, prefix, ref, tokenElement, tokenKey, tokenView, type;
    if (tokenViewClass == null) {
      tokenViewClass = this.getOptions().tokenViewClass;
    }
    ref = this.activeRule, type = ref.type, prefix = ref.prefix, pistachio = ref.pistachio;
    tokenView = new tokenViewClass({
      type: type,
      prefix: prefix,
      pistachio: pistachio
    }, item);
    tokenElement = tokenView.getElement();
    tokenKey = (tokenView.getId()) + "-" + (tokenView.getKey());
    this.tokenViews[tokenKey] = tokenView;
    tokenView.setAttributes({
      "data-key": tokenKey
    });
    this.tokenInput.parentElement.insertBefore(tokenElement, this.tokenInput);
    tokenView.emit("viewAppended");
    this.tokenInput.nextSibling.textContent = "\u00a0";
    this.utils.selectText(this.tokenInput.nextSibling, 1);
    this.tokenInput.remove();
    return this.emit("TokenAdded", type, item);
  };

  KDTokenizedInput.prototype.keyDown = function(event) {
    switch (event.which) {
      case 9:
      case 13:
      case 27:
      case 38:
      case 40:
        if (this.menu) {
          this.menu.treeController.keyEventHappened(event);
          KD.utils.stopDOMEvent(event);
        }
        break;
      default:
        KDTokenizedInput.__super__.keyDown.call(this, event);
    }
    switch (event.which) {
      case 27:
        if (this.tokenInput) {
          return this.cancel();
        }
    }
  };

  KDTokenizedInput.prototype.keyUp = function(event) {
    KDTokenizedInput.__super__.keyUp.apply(this, arguments);
    switch (event.which) {
      case 9:
      case 13:
      case 27:
      case 38:
      case 40:
        break;
      default:
        if (event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (this.activeRule) {
          return this.matchToken();
        } else {
          return this.matchPrefix();
        }
    }
  };

  KDTokenizedInput.prototype.cancel = function() {
    var text;
    if (this.tokenInput.parentNode) {
      text = document.createTextNode(this.tokenInput.textContent);
      this.tokenInput.parentElement.insertBefore(text, this.tokenInput);
      this.tokenInput.nextSibling.remove();
      this.tokenInput.remove();
      this.utils.selectEnd(text);
    }
    return this.hideMenu();
  };

  KDTokenizedInput.prototype.reset = function() {
    var id, ref, results, view;
    this.setPlaceholder();
    this.blur();
    ref = this.tokenViews;
    results = [];
    for (id in ref) {
      if (!hasProp.call(ref, id)) continue;
      view = ref[id];
      view.destroy();
      results.push(delete this.tokenViews[id]);
    }
    return results;
  };

  KDTokenizedInput.prototype.viewAppended = function() {
    KDTokenizedInput.__super__.viewAppended.apply(this, arguments);
    return this.setEditingMode(true);
  };

  return KDTokenizedInput;

})(KDContentEditableView);

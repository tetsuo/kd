var $, KD, KDInputValidator;

$ = require('jquery');

KD = require('../../core/kd');

module.exports = KDInputValidator = (function() {
  function KDInputValidator() {}

  KDInputValidator.ruleRequired = function(input, event) {
    var doesValidate, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = value.length > 0;
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.required : void 0) || "Field is required";
    }
  };

  KDInputValidator.ruleEmail = function(input, event) {
    var doesValidate, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.email : void 0) || "Please enter a valid email address";
    }
  };

  KDInputValidator.ruleMinLength = function(input, event) {
    var doesValidate, minLength, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    minLength = ruleSet.rules.minLength;
    doesValidate = value.length >= minLength;
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.minLength : void 0) || ("Please enter a value that has " + minLength + " characters or more");
    }
  };

  KDInputValidator.ruleMaxLength = function(input, event) {
    var doesValidate, maxLength, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    maxLength = ruleSet.rules.maxLength;
    doesValidate = value.length <= maxLength;
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.maxLength : void 0) || ("Please enter a value that has " + maxLength + " characters or less");
    }
  };

  KDInputValidator.ruleRangeLength = function(input, event) {
    var doesValidate, rangeLength, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    rangeLength = ruleSet.rules.rangeLength;
    doesValidate = value.length <= rangeLength[1] && value.length >= rangeLength[0];
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.rangeLength : void 0) || ("Please enter a value that has more than " + rangeLength[0] + " and less than " + rangeLength[1] + " characters");
    }
  };

  KDInputValidator.ruleMatch = function(input, event) {
    var doesValidate, match, matchView, matchViewVal, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    match = ruleSet.rules.match;
    matchView = 'function' === typeof match ? match() : match;
    matchViewVal = $.trim(matchView.getValue());
    doesValidate = value === matchViewVal;
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.match : void 0) || "Values do not match";
    }
  };

  KDInputValidator.ruleCreditCard = function(input, event) {

    /*
    Visa:             start with a 4. New cards have 16 digits. Old cards have 13.
    MasterCard:       start with the numbers 51 through 55. All have 16 digits.
    American Express: start with 34 or 37 and have 15 digits.
    Diners Club:      start with 300 through 305, 36 or 38. All have 14 digits. There are Diners Club cards that begin with 5 and have 16 digits. These are a joint venture between Diners Club and MasterCard, and should be processed like a MasterCard.
    Discover:         start with 6011 or 65. All have 16 digits.
    JCB:              start with 2131 or 1800 have 15 digits. JCB cards beginning with 35 have 16 digits.
     */
    var doesValidate, ref, ruleSet, type, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue().replace(/-|\s/g, ""));
    ruleSet = input.getOptions().validate;
    doesValidate = /(^4[0-9]{12}(?:[0-9]{3})?$)|(^5[1-5][0-9]{14}$)|(^3[47][0-9]{13}$)|(^3(?:0[0-5]|[68][0-9])[0-9]{11}$)|(^6(?:011|5[0-9]{2})[0-9]{12}$)|(^(?:2131|1800|35\d{3})\d{11}$)/.test(value);
    if (doesValidate) {
      type = /^4[0-9]{12}(?:[0-9]{3})?$/.test(value) ? "Visa" : /^5[1-5][0-9]{14}$/.test(value) ? "MasterCard" : /^3[47][0-9]{13}$/.test(value) ? "Amex" : /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(value) ? "Diners" : /^6(?:011|5[0-9]{2})[0-9]{12}$/.test(value) ? "Discover" : /^(?:2131|1800|35\d{3})\d{11}$/.test(value) ? "JCB" : false;
      input.emit("CreditCardTypeIdentified", type);
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.creditCard : void 0) || "Please enter a valid credit card number";
    }
  };

  KDInputValidator.ruleJSON = function(input, event) {
    var doesValidate, err, ref, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = true;
    try {
      if (value) {
        JSON.parse(value);
      }
    } catch (_error) {
      err = _error;
      KD.error(err, doesValidate);
      doesValidate = false;
    }
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.JSON : void 0) || "a valid JSON is required";
    }
  };

  KDInputValidator.ruleRegExp = function(input, event) {
    var doesValidate, ref, regExp, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    regExp = ruleSet.rules.regExp;
    doesValidate = regExp.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.regExp : void 0) || "Validation failed";
    }
  };

  KDInputValidator.ruleUri = function(input, event) {
    var doesValidate, ref, regExp, ruleSet, value;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    regExp = /^([a-z0-9+.-]+):(?:\/\/(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:)?$/i;
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = regExp.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((ref = ruleSet.messages) != null ? ref.uri : void 0) || "Not a valid URI";
    }
  };

  return KDInputValidator;

})();


/*
Credits
  email check regex:
  by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
 */

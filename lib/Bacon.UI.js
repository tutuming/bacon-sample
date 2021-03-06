// Generated by CoffeeScript 1.6.1
(function() {
  var isChrome, nonEmpty,
    __slice = [].slice;

  nonEmpty = function(x) {
    return x && x.length > 0;
  };

  isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;

  Bacon.UI = {};

  Bacon.UI.textFieldValue = function(textfield, initValue) {
    var autofillPoller, getValue;
    getValue = function() {
      return textfield.val();
    };
    autofillPoller = function() {
      if (textfield.attr("type") === "password") {
        return Bacon.interval(100);
      } else if (isChrome) {
        return Bacon.interval(100).take(20).map(getValue).filter(nonEmpty).take(1);
      } else {
        return Bacon.never();
      }
    };
    if (initValue !== null) {
      textfield.val(initValue);
    }
    return textfield.asEventStream("keyup input").merge(textfield.asEventStream("cut paste").delay(1)).merge(autofillPoller()).map(getValue).toProperty(getValue()).skipDuplicates();
  };

  Bacon.UI.optionValue = function(option, initVal) {
    var getValue;
    if (initVal != null) {
      option.val(initVal);
    }
    getValue = function() {
      return option.val();
    };
    return option.asEventStream("change").map(getValue).toProperty(getValue());
  };

  Bacon.UI.checkBoxGroupValue = function(checkboxes, initValue) {
    var selectedValues;
    selectedValues = function() {
      return checkboxes.filter(":checked").map(function(i, elem) {
        return $(elem).val();
      }).toArray();
    };
    if (initValue) {
      checkboxes.each(function(i, elem) {
        return $(elem).attr("checked", initValue.indexOf($(elem).val()) >= 0);
      });
    }
    return checkboxes.asEventStream("click").map(selectedValues).toProperty(selectedValues());
  };

  Bacon.UI.ajax = function(params) {
    return Bacon.fromPromise($.ajax(params));
  };

  Bacon.UI.ajaxGet = function(url, data, dataType) {
    return Bacon.UI.ajax({
      url: url,
      dataType: dataType,
      data: data
    });
  };

  Bacon.UI.ajaxGetJSON = function(url, data) {
    return Bacon.UI.ajax({
      url: url,
      dataType: "json",
      data: data
    });
  };

  Bacon.UI.ajaxPost = function(url, data, dataType) {
    return Bacon.UI.ajax({
      url: url,
      dataType: dataType,
      data: data,
      type: "POST"
    });
  };

  Bacon.UI.ajaxGetScript = function(url) {
    return Bacon.UI.ajax({
      url: url,
      dataType: "script"
    });
  };

  Bacon.Observable.prototype.awaiting = function(response) {
    return this.map(true).merge(response.map(false)).toProperty(false).skipDuplicates();
  };

  Bacon.EventStream.prototype.ajax = function() {
    return this.flatMapLatest(Bacon.UI.ajax);
  };

  Bacon.UI.radioGroupValue = function(radioButtons, init) {
    if (init != null) {
      radioButtons.each(function(i, elem) {
        if (elem.value === init) {
          return $(elem).attr("checked", true);
        }
      });
    } else {
      init = radioButtons.filter(":checked").first().val();
    }
    return radioButtons.asEventStream("change").map(function(e) {
      return e.target.value;
    }).toProperty(init);
  };

  Bacon.UI.checkBoxValue = function(checkbox, initValue) {
    var isChecked;
    isChecked = function() {
      return !!checkbox.attr("checked");
    };
    if (initValue !== null) {
      checkbox.attr("checked", initValue);
    }
    return checkbox.asEventStream("change").map(isChecked).toProperty(isChecked()).skipDuplicates();
  };

  Bacon.UI.hash = function(defaultValue) {
    var getHash;
    getHash = function() {
      if (!!document.location.hash) {
        return document.location.hash;
      } else {
        return defaultValue;
      }
    };
    if (defaultValue === undefined) {
      defaultValue = "";
    }
    return $(window).asEventStream("hashchange").map(getHash).toProperty(getHash()).skipDuplicates();
  };

  $.fn.extend({
    animateE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.animate.apply(this, args).promise());
    },
    showE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.show.apply(this, args).promise());
    },
    hideE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.hide.apply(this, args).promise());
    },
    toggleE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.toggle.apply(this, args).promise());
    },
    fadeInE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.fadeIn.apply(this, args).promise());
    },
    fadeOutE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.fadeOut.apply(this, args).promise());
    },
    fadeToE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.fadeTo.apply(this, args).promise());
    },
    fadeToggleE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.fadeToggle.apply(this, args).promise());
    },
    slideDownE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.slideDown.apply(this, args).promise());
    },
    slideUpE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.slideUp.apply(this, args).promise());
    },
    slideToggleE: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Bacon.fromPromise(this.slideToggle.apply(this, args).promise());
    }
  });

}).call(this);

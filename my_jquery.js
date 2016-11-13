(function() {
  $ = function(selector) {
    // if 'this' isn't "correct"
    // call new $(selector)
    // otherwise continue as normal
    if ( !(this instanceof $) ) {
      return new $(selector);
    }

    var elements;
    // if selector is a string
    if (typeof selector === 'string'){
      // get elements from the page using selector
      // (using document.querySelectorAll)
      elements = document.querySelectorAll(selector);  
    } else {
      // else if selector is an array (assuming it's an array)
      elements = selector;
    }
    

    // go through each element and copy to 'this' as a
    // numeric property
    // also set a length property

    // for (var i = 0; i < elements.length; i++){
    //   this[i] = elements[i];
    // }
    // this.length = elements.length;

    Array.prototype.push.apply(this, elements);

  };

  $.extend = function(target, object) {
    for (var prop in object){
      // to prevent going up through the proto chain
      if (object.hasOwnProperty(prop)){
        target[prop] = object[prop];
      }
    }
    return target;
  };

  // Static methods
  var isArrayLike = function(obj) {
    if (typeof obj.length === "number"){
      if (obj.length === 0){
        // empty-array-like
        return true;
      } else if (obj.length > 0){
        // make sure it at least has a property at the end
        return (obj.length - 1) in obj;
      }
    }
    return false;
  };

  var getText = function(el){
    var txt = "";
    $.each(el.childNodes, function(i, childNode){
      // using nodetype can help us distinguish between 
      // a normal node and a text node
      if (childNode.nodeType == 3) {
        // this is a text node
        txt += childNode.nodeValue;
      } else if (childNode.nodeType == 1) {
        // a normal node
        // find if there's any childNode of that node,
        // hopefully we can find some text nodes
        txt += getText(childNode);
      }
    });
    return txt;
  };

  var makeTraverser = function(cb){
    return function(){
      // create a accumulator
      var elements = [], args = arguments;;

      // for each element in the collection
      $.each(this, function(i, el){
        // do the real work
        var returnVal = cb.apply(el, args);

        if (returnVal && isArrayLike(returnVal)){
          [].push.apply(elements, returnVal);
        } else if (returnVal) {
          elements.push(returnVal);
        }
      });
      // return the accumulator, but an $ instance
      return $(elements);
    }
  };

  $.extend($, {
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },
    each: function(collection, cb) {
      if (isArrayLike(collection)){
        for (var i = 0; i < collection.length; i++){
          var value = collection[i];
          cb.call(value, i, value);
        }
      } else {
        for (var prop in collection){
          if(collection.hasOwnProperty(prop)){
            var value = collection[prop];
            cb.call(value, prop, value);
          }
        }
      }
      return collection;
    },
    makeArray: function(arr) {
      var array = [];
      $.each(arr, function(i, value){
        array.push(value);
      });
      return array;
    },
    proxy: function(fn, context) {
      return function(){
        return fn.apply(context, arguments);
      };
    }
  });

  $.extend($.prototype, {
    html: function(newHtml) {
      if (arguments.length){
        // setting
        // go through each element in 'this'
        // set innerHTML to newHTML
        return $.each(this, function(i, el){
          el.innerHTML = newHtml;
        });
      } else {
        // get this[0]'s innerHTML
        return this[0] && this[0].innerHTML;
      }
    },
    val: function(newVal) {
      if (arguments.length){
        // setting
        // go through each element in 'this'
        // set innerHTML to newHTML
        $.each(this, function(i, el){
          el.value = newVal;
        });
      } else {
        // get this[0]'s innerHTML
        return this[0].value;
      }
    },
    text: function(newText) {
      if (arguments.length){
        // setter
        // loop through each element
        return $.each(this, function(i, el){
          // set innerHTML to ""
          el.innerHTML = "";
          // document.createTextNode() with newText
          var textNode = document.createTextNode(newText);
          // and append to the element.
          el.appendChild(textNode);
        })
      } else {
        return this[0] && getText(this[0]);
      }
    },
    find: function(selector) {
      // create accumulator
      var elements = [];

      // for each item in collection
      $.each(this, function(i, el){
        // get element that are within element that match 
        // the selector,
        var els = el.querySelectorAll(selector);
        // then add them to the accumulator
        [].push.apply(elements, els);
      });
      return $(elements);
    },
    next: makeTraverser(function(){
      var currentNode = this.nextSibling;
        
      while (currentNode && currentNode.nodeType !== 1){
        // if currentNode exists 
        // and currentNode is a text node
        // get next sibling until we find a normal node
        currentNode = currentNode.nextSibling;
      }

      if (currentNode){
        // normal node is found
        return currentNode;
      }
    }),
    prev: makeTraverser(function(){
      var currentNode = this.previousSibling;
        
      while (currentNode && currentNode.nodeType !== 1){
        // if currentNode exists 
        // and currentNode is a text node
        // get previous sibling until we find a normal node
        currentNode = currentNode.previousSibling;
      }

      if (currentNode){
        // normal node is found
        return currentNode;
      }
    }),
    parent: makeTraverser(function(){
      return this.parentNode;
    }),
    children: makeTraverser(function(){
      return this.children;
    }),
    attr: function(attrName, value) {
      if (arguments.length > 1){
        // setter
        return $.each(this, function(i, el){
          el.setAttribute(attrName, value);
        });  
      } else {
        // getter
        return this[0] && this[0].getAttribute(attrName);
      }
    },
    css: function(cssPropName, value) {
      if (arguments.length > 1){
        // setter
        return $.each(this, function(i, el){
          el.style[cssPropName]=value;
        });
      } else {
        // getter
        return this[0] && 
              document.defaultView.getComputedStyle( this[0])
                      .getPropertyValue( cssPropName);
      }
    },
    width: function() {
      var clientWidth = this[0].clientWidth;
      var leftPadding = this.css("padding-left"),
          rightPadding = this.css("padding-right");

      return clientWidth - parseInt(leftPadding) - parseInt(rightPadding);
    },
    offset: function() {
      var offset = this[0].getBoundingClientRect();
      return {
        top: offset.top + window.pageYOffset,
        left: offset.left + window.pageXOffset
      };
    },
    hide: function() {
      return this.css("display", "none");
    },
    show: function() {
      return this.css("display", "");
    },

    // Events
    bind: function(eventName, handler) {
      return $.each(this, function(i, el){
        el.addEventListener(eventName, handler, false);
      });
    },
    unbind: function(eventName, handler) {
      return $.each(this, function(i, el){
        el.removeEventListener(eventName, handler, false);
      });
    },
    has: function(selector) {
      var elements = [];
	
      $.each(this, function(i, el) {
        if(el.matches(selector)) {
          elements.push(el);
        }
      });
    
      return $( elements );
    },
    on: function(eventType, selector, handler) {
      var delegator = function(ev) {
        var cur = ev.target;
        do {
          if ($([ cur ]).has(selector).length) {
            handler.call(cur, ev);
          }
          cur = cur.parentNode;
        } while (cur && cur !== ev.currentTarget);
      };
      return $.each(this, function(i, element) {
        var events = $([ element ]).data("events"), eventTypeEvents;
        if (!events) {
          $([ element ]).data("events", events = {});
        }
        if (!(eventTypeEvents = events[eventType])) {
          eventTypeEvents = events[eventType] = {};
        }
        if (!eventTypeEvents[selector]) {
          eventTypeEvents[selector] = [];
        }
        eventTypeEvents[selector].push({
          handler: handler,
          delegator: delegator
        });
        element.addEventListener(eventType, delegator, false);
      });
    },
    off: function(eventType, selector, handler) {
      return $.each(this, function(i, element) {
        var events = $([ element ]).data("events");
        if (events[eventType] && events[eventType][selector]) {
          var delegates = events[eventType][selector], i = 0;
          while (i < delegates.length) {
            if (delegates[i].handler === handler) {
              element.removeEventListener(eventType, delegates[i].delegator, false);
              delegates.splice(i, 1);
            } else {
              i++;
            }
          }
        }
      });
    },
    data: function(propName, data) {
      if (arguments.length == 2) {
        // setter
        return $.each(this, function(i, el) {
          var id = el[expando];
          if (!id) {
            id = ids++;
            el[expando] = id;
            elementIdDataMap[id] = {};
          }
          elementIdDataMap[id][propName] = data;
        });
      } else {
        // getter
        var el = this[0], id = el[expando];
        return id && elementIdDataMap[id][propName];
      }
    },

    // Extra
    addClass: function(className) {
      var classTest = new RegExp("(^| )" + className + "($| )");
      return $.each(this, function(i, element) {
        if (!classTest.test(element.className)) {
          element.className = element.className + " " + className;
        }
      });
    },
    removeClass: function(className) {
      var classTest = new RegExp("(^| )" + className + "($| )");
      return $.each(this, function(i, element) {
        element.className = element.className.replace(classTest, "");
      });
    },
    append: function(element) {
      this[0].appendChild($.buildFragment(element));
    }
  });
  var elementIdDataMap = {}, ids = 1, expando = "my$" + Math.random();
  $.buildFragment = function(html) {
    if (typeof html === "string") {
      var matchData = html.match(/<(\w+)/), firstTag = matchData ? matchData[1] : "div", parentNodes = {
        li: "ul",
        tr: "table"
      }, parentTag = parentNodes[firstTag] || "div", parentNode = document.createElement(parentTag), frag = document.createDocumentFragment();
      parentNode.innerHTML = html;
      $.each($.makeArray(parentNode.childNodes), function(i, node) {
        frag.appendChild(node);
      });
      return frag;
    } else {
      return html;
    }
  };
  $.fn = $.prototype;
})();
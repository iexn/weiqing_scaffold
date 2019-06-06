/*!
* jQuery UI 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI
*/
(function($, undefined) {
    $.ui = $.ui || {};
    if ($.ui.version) {
        return;
    }
    $.extend($.ui, {
        version: "1.8.21",
        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91,
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91
        }
    });
    $.fn.extend({
        propAttr: $.fn.prop || $.fn.attr,
        _focus: $.fn.focus,
        focus: function(delay, fn) {
            return typeof delay === "number" ? this.each(function() {
                var elem = this;
                setTimeout(function() {
                    $(elem).focus();
                    if (fn) {
                        fn.call(elem);
                    }
                }, delay);
            }) : this._focus.apply(this, arguments);
        },
        scrollParent: function() {
            var scrollParent;
            if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function() {
                    return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            } else {
                scrollParent = this.parents().filter(function() {
                    return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            }
            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        },
        zIndex: function(zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }
            if (this.length) {
                var elem = $(this[0]), position, value;
                while (elem.length && elem[0] !== document) {
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }
            return 0;
        },
        disableSelection: function() {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(event) {
                event.preventDefault();
            });
        },
        enableSelection: function() {
            return this.unbind(".ui-disableSelection");
        }
    });
    $.each(["Width", "Height"], function(i, name) {
        var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
          , type = name.toLowerCase()
          , orig = {
            innerWidth: $.fn.innerWidth,
            innerHeight: $.fn.innerHeight,
            outerWidth: $.fn.outerWidth,
            outerHeight: $.fn.outerHeight
        };
        function reduce(elem, size, border, margin) {
            $.each(side, function() {
                size -= parseFloat($.curCSS(elem, "padding" + this, true)) || 0;
                if (border) {
                    size -= parseFloat($.curCSS(elem, "border" + this + "Width", true)) || 0;
                }
                if (margin) {
                    size -= parseFloat($.curCSS(elem, "margin" + this, true)) || 0;
                }
            });
            return size;
        }
        $.fn["inner" + name] = function(size) {
            if (size === undefined) {
                return orig["inner" + name].call(this);
            }
            return this.each(function() {
                $(this).css(type, reduce(this, size) + "px");
            });
        }
        ;
        $.fn["outer" + name] = function(size, margin) {
            if (typeof size !== "number") {
                return orig["outer" + name].call(this, size);
            }
            return this.each(function() {
                $(this).css(type, reduce(this, size, true, margin) + "px");
            });
        }
        ;
    });
    function focusable(element, isTabIndexNotNaN) {
        var nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            var map = element.parentNode, mapName = map.name, img;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : "a" == nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && visible(element);
    }
    function visible(element) {
        return !$(element).parents().andSelf().filter(function() {
            return $.curCSS(this, "visibility") === "hidden" || $.expr.filters.hidden(this);
        }).length;
    }
    $.extend($.expr[":"], {
        data: function(elem, i, match) {
            return !!$.data(elem, match[3]);
        },
        focusable: function(element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },
        tabbable: function(element) {
            var tabIndex = $.attr(element, "tabindex")
              , isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
    $(function() {
        var body = document.body
          , div = body.appendChild(div = document.createElement("div"));
        div.offsetHeight;
        $.extend(div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        });
        $.support.minHeight = div.offsetHeight === 100;
        $.support.selectstart = "onselectstart"in div;
        body.removeChild(div).style.display = "none";
    });
    $.extend($.ui, {
        plugin: {
            add: function(module, option, set) {
                var proto = $.ui[module].prototype;
                for (var i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([option, set[i]]);
                }
            },
            call: function(instance, name, args) {
                var set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode) {
                    return;
                }
                for (var i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args);
                    }
                }
            }
        },
        contains: function(a, b) {
            return document.compareDocumentPosition ? a.compareDocumentPosition(b) & 16 : a !== b && a.contains(b);
        },
        hasScroll: function(el, a) {
            if ($(el).css("overflow") === "hidden") {
                return false;
            }
            var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop"
              , has = false;
            if (el[scroll] > 0) {
                return true;
            }
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has;
        },
        isOverAxis: function(x, reference, size) {
            return (x > reference) && (x < (reference + size));
        },
        isOver: function(y, x, top, left, height, width) {
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
        }
    });
}
)(jQuery);
/*!
* jQuery UI Widget 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Widget
*/
(function($, undefined) {
    if ($.cleanData) {
        var _cleanData = $.cleanData;
        $.cleanData = function(elems) {
            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                try {
                    $(elem).triggerHandler("remove");
                } catch (e) {}
            }
            _cleanData(elems);
        }
        ;
    } else {
        var _remove = $.fn.remove;
        $.fn.remove = function(selector, keepData) {
            return this.each(function() {
                if (!keepData) {
                    if (!selector || $.filter(selector, [this]).length) {
                        $("*", this).add([this]).each(function() {
                            try {
                                $(this).triggerHandler("remove");
                            } catch (e) {}
                        });
                    }
                }
                return _remove.call($(this), selector, keepData);
            });
        }
        ;
    }
    $.widget = function(name, base, prototype) {
        var namespace = name.split(".")[0], fullName;
        name = name.split(".")[1];
        fullName = namespace + "-" + name;
        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }
        $.expr[":"][fullName] = function(elem) {
            return !!$.data(elem, name);
        }
        ;
        $[namespace] = $[namespace] || {};
        $[namespace][name] = function(options, element) {
            if (arguments.length) {
                this._createWidget(options, element);
            }
        }
        ;
        var basePrototype = new base();
        basePrototype.options = $.extend(true, {}, basePrototype.options);
        $[namespace][name].prototype = $.extend(true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype);
        $.widget.bridge(name, $[namespace][name]);
    }
    ;
    $.widget.bridge = function(name, object) {
        $.fn[name] = function(options) {
            var isMethodCall = typeof options === "string"
              , args = Array.prototype.slice.call(arguments, 1)
              , returnValue = this;
            options = !isMethodCall && args.length ? $.extend.apply(null, [true, options].concat(args)) : options;
            if (isMethodCall && options.charAt(0) === "_") {
                return returnValue;
            }
            if (isMethodCall) {
                this.each(function() {
                    var instance = $.data(this, name)
                      , methodValue = instance && $.isFunction(instance[options]) ? instance[options].apply(instance, args) : instance;
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function() {
                    var instance = $.data(this, name);
                    if (instance) {
                        instance.option(options || {})._init();
                    } else {
                        $.data(this, name, new object(options,this));
                    }
                });
            }
            return returnValue;
        }
        ;
    }
    ;
    $.Widget = function(options, element) {
        if (arguments.length) {
            this._createWidget(options, element);
        }
    }
    ;
    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: false
        },
        _createWidget: function(options, element) {
            $.data(element, this.widgetName, this);
            this.element = $(element);
            this.options = $.extend(true, {}, this.options, this._getCreateOptions(), options);
            var self = this;
            this.element.bind("remove." + this.widgetName, function() {
                self.destroy();
            });
            this._create();
            this._trigger("create");
            this._init();
        },
        _getCreateOptions: function() {
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
        },
        _create: function() {},
        _init: function() {},
        destroy: function() {
            this.element.unbind("." + this.widgetName).removeData(this.widgetName);
            this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled " + "ui-state-disabled");
        },
        widget: function() {
            return this.element;
        },
        option: function(key, value) {
            var options = key;
            if (arguments.length === 0) {
                return $.extend({}, this.options);
            }
            if (typeof key === "string") {
                if (value === undefined) {
                    return this.options[key];
                }
                options = {};
                options[key] = value;
            }
            this._setOptions(options);
            return this;
        },
        _setOptions: function(options) {
            var self = this;
            $.each(options, function(key, value) {
                self._setOption(key, value);
            });
            return this;
        },
        _setOption: function(key, value) {
            this.options[key] = value;
            if (key === "disabled") {
                this.widget()[value ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled" + " " + "ui-state-disabled").attr("aria-disabled", value);
            }
            return this;
        },
        enable: function() {
            return this._setOption("disabled", false);
        },
        disable: function() {
            return this._setOption("disabled", true);
        },
        _trigger: function(type, event, data) {
            var prop, orig, callback = this.options[type];
            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
            event.target = this.element[0];
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }
            this.element.trigger(event, data);
            return !($.isFunction(callback) && callback.call(this.element[0], event, data) === false || event.isDefaultPrevented());
        }
    };
}
)(jQuery);
/*!
* jQuery UI Mouse 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Mouse
*
* Depends:
* jquery.ui.widget.js
*/
(function($, undefined) {
    var mouseHandled = false;
    $(document).mouseup(function(e) {
        mouseHandled = false;
    });
    $.widget("ui.mouse", {
        options: {
            cancel: ':input,option',
            distance: 1,
            delay: 0
        },
        _mouseInit: function() {
            var self = this;
            this.element.bind('mousedown.' + this.widgetName, function(event) {
                return self._mouseDown(event);
            }).bind('click.' + this.widgetName, function(event) {
                if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
                    $.removeData(event.target, self.widgetName + '.preventClickEvent');
                    event.stopImmediatePropagation();
                    return false;
                }
            });
            this.started = false;
        },
        _mouseDestroy: function() {
            this.element.unbind('.' + this.widgetName);
            $(document).unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate).unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);
        },
        _mouseDown: function(event) {
            if (mouseHandled) {
                return
            }
            ;(this._mouseStarted && this._mouseUp(event));
            this._mouseDownEvent = event;
            var self = this
              , btnIsLeft = (event.which == 1)
              , elIsCancel = (typeof this.options.cancel == "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }
            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function() {
                    self.mouseDelayMet = true;
                }, this.options.delay);
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }
            if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
                $.removeData(event.target, this.widgetName + '.preventClickEvent');
            }
            this._mouseMoveDelegate = function(event) {
                return self._mouseMove(event);
            }
            ;
            this._mouseUpDelegate = function(event) {
                return self._mouseUp(event);
            }
            ;
            $(document).bind('mousemove.' + this.widgetName, this._mouseMoveDelegate).bind('mouseup.' + this.widgetName, this._mouseUpDelegate);
            event.preventDefault();
            mouseHandled = true;
            return true;
        },
        _mouseMove: function(event) {
            if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
                return this._mouseUp(event);
            }
            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault();
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
            }
            return !this._mouseStarted;
        },
        _mouseUp: function(event) {
            $(document).unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate).unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);
            if (this._mouseStarted) {
                this._mouseStarted = false;
                if (event.target == this._mouseDownEvent.target) {
                    $.data(event.target, this.widgetName + '.preventClickEvent', true);
                }
                this._mouseStop(event);
            }
            return false;
        },
        _mouseDistanceMet: function(event) {
            return (Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance);
        },
        _mouseDelayMet: function(event) {
            return this.mouseDelayMet;
        },
        _mouseStart: function(event) {},
        _mouseDrag: function(event) {},
        _mouseStop: function(event) {},
        _mouseCapture: function(event) {
            return true;
        }
    });
}
)(jQuery);
/*!
* jQuery UI Position 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Position
*/
(function($, undefined) {
    $.ui = $.ui || {};
    var horizontalPositions = /left|center|right/
      , verticalPositions = /top|center|bottom/
      , center = "center"
      , support = {}
      , _position = $.fn.position
      , _offset = $.fn.offset;
    $.fn.position = function(options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }
        options = $.extend({}, options);
        var target = $(options.of), targetElem = target[0], collision = (options.collision || "flip").split(" "), offset = options.offset ? options.offset.split(" ") : [0, 0], targetWidth, targetHeight, basePosition;
        if (targetElem.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = {
                top: 0,
                left: 0
            };
        } else if (targetElem.setTimeout) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = {
                top: target.scrollTop(),
                left: target.scrollLeft()
            };
        } else if (targetElem.preventDefault) {
            options.at = "left top";
            targetWidth = targetHeight = 0;
            basePosition = {
                top: options.of.pageY,
                left: options.of.pageX
            };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            basePosition = target.offset();
        }
        $.each(["my", "at"], function() {
            var pos = (options[this] || "").split(" ");
            if (pos.length === 1) {
                pos = horizontalPositions.test(pos[0]) ? pos.concat([center]) : verticalPositions.test(pos[0]) ? [center].concat(pos) : [center, center];
            }
            pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : center;
            pos[1] = verticalPositions.test(pos[1]) ? pos[1] : center;
            options[this] = pos;
        });
        if (collision.length === 1) {
            collision[1] = collision[0];
        }
        offset[0] = parseInt(offset[0], 10) || 0;
        if (offset.length === 1) {
            offset[1] = offset[0];
        }
        offset[1] = parseInt(offset[1], 10) || 0;
        if (options.at[0] === "right") {
            basePosition.left += targetWidth;
        } else if (options.at[0] === center) {
            basePosition.left += targetWidth / 2;
        }
        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
        } else if (options.at[1] === center) {
            basePosition.top += targetHeight / 2;
        }
        basePosition.left += offset[0];
        basePosition.top += offset[1];
        return this.each(function() {
            var elem = $(this), elemWidth = elem.outerWidth(), elemHeight = elem.outerHeight(), marginLeft = parseInt($.curCSS(this, "marginLeft", true)) || 0, marginTop = parseInt($.curCSS(this, "marginTop", true)) || 0, collisionWidth = elemWidth + marginLeft + (parseInt($.curCSS(this, "marginRight", true)) || 0), collisionHeight = elemHeight + marginTop + (parseInt($.curCSS(this, "marginBottom", true)) || 0), position = $.extend({}, basePosition), collisionPosition;
            if (options.my[0] === "right") {
                position.left -= elemWidth;
            } else if (options.my[0] === center) {
                position.left -= elemWidth / 2;
            }
            if (options.my[1] === "bottom") {
                position.top -= elemHeight;
            } else if (options.my[1] === center) {
                position.top -= elemHeight / 2;
            }
            if (!support.fractions) {
                position.left = Math.round(position.left);
                position.top = Math.round(position.top);
            }
            collisionPosition = {
                left: position.left - marginLeft,
                top: position.top - marginTop
            };
            $.each(["left", "top"], function(i, dir) {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth: targetWidth,
                        targetHeight: targetHeight,
                        elemWidth: elemWidth,
                        elemHeight: elemHeight,
                        collisionPosition: collisionPosition,
                        collisionWidth: collisionWidth,
                        collisionHeight: collisionHeight,
                        offset: offset,
                        my: options.my,
                        at: options.at
                    });
                }
            });
            if ($.fn.bgiframe) {
                elem.bgiframe();
            }
            elem.offset($.extend(position, {
                using: options.using
            }));
        });
    }
    ;
    $.ui.position = {
        fit: {
            left: function(position, data) {
                var win = $(window)
                  , over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
                position.left = over > 0 ? position.left - over : Math.max(position.left - data.collisionPosition.left, position.left);
            },
            top: function(position, data) {
                var win = $(window)
                  , over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
                position.top = over > 0 ? position.top - over : Math.max(position.top - data.collisionPosition.top, position.top);
            }
        },
        flip: {
            left: function(position, data) {
                if (data.at[0] === center) {
                    return;
                }
                var win = $(window)
                  , over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft()
                  , myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0
                  , atOffset = data.at[0] === "left" ? data.targetWidth : -data.targetWidth
                  , offset = -2 * data.offset[0];
                position.left += data.collisionPosition.left < 0 ? myOffset + atOffset + offset : over > 0 ? myOffset + atOffset + offset : 0;
            },
            top: function(position, data) {
                if (data.at[1] === center) {
                    return;
                }
                var win = $(window)
                  , over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop()
                  , myOffset = data.my[1] === "top" ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0
                  , atOffset = data.at[1] === "top" ? data.targetHeight : -data.targetHeight
                  , offset = -2 * data.offset[1];
                position.top += data.collisionPosition.top < 0 ? myOffset + atOffset + offset : over > 0 ? myOffset + atOffset + offset : 0;
            }
        }
    };
    if (!$.offset.setOffset) {
        $.offset.setOffset = function(elem, options) {
            if (/static/.test($.curCSS(elem, "position"))) {
                elem.style.position = "relative";
            }
            var curElem = $(elem)
              , curOffset = curElem.offset()
              , curTop = parseInt($.curCSS(elem, "top", true), 10) || 0
              , curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0
              , props = {
                top: (options.top - curOffset.top) + curTop,
                left: (options.left - curOffset.left) + curLeft
            };
            if ('using'in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        }
        ;
        $.fn.offset = function(options) {
            var elem = this[0];
            if (!elem || !elem.ownerDocument) {
                return null;
            }
            if (options) {
                if ($.isFunction(options)) {
                    return this.each(function(i) {
                        $(this).offset(options.call(this, i, $(this).offset()));
                    });
                }
                return this.each(function() {
                    $.offset.setOffset(this, options);
                });
            }
            return _offset.call(this);
        }
        ;
    }
    (function() {
        var body = document.getElementsByTagName("body")[0], div = document.createElement("div"), testElement, testElementParent, testElementStyle, offset, offsetTotal;
        testElement = document.createElement(body ? "div" : "body");
        testElementStyle = {
            visibility: "hidden",
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: "none"
        };
        if (body) {
            $.extend(testElementStyle, {
                position: "absolute",
                left: "-1000px",
                top: "-1000px"
            });
        }
        for (var i in testElementStyle) {
            testElement.style[i] = testElementStyle[i];
        }
        testElement.appendChild(div);
        testElementParent = body || document.documentElement;
        testElementParent.insertBefore(testElement, testElementParent.firstChild);
        div.style.cssText = "position: absolute; left: 10.7432222px; top: 10.432325px; height: 30px; width: 201px;";
        offset = $(div).offset(function(_, offset) {
            return offset;
        }).offset();
        testElement.innerHTML = "";
        testElementParent.removeChild(testElement);
        offsetTotal = offset.top + offset.left + (body ? 2000 : 0);
        support.fractions = offsetTotal > 21 && offsetTotal < 22;
    }
    )();
}(jQuery));
/*!
* jQuery UI Draggable 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Draggables
*
* Depends:
* jquery.ui.core.js
* jquery.ui.mouse.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    $.widget("ui.draggable", $.ui.mouse, {
        widgetEventPrefix: "drag",
        options: {
            addClasses: true,
            appendTo: "parent",
            axis: false,
            connectToSortable: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            grid: false,
            handle: false,
            helper: "original",
            iframeFix: false,
            opacity: false,
            refreshPositions: false,
            revert: false,
            revertDuration: 500,
            scope: "default",
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            snap: false,
            snapMode: "both",
            snapTolerance: 20,
            stack: false,
            zIndex: false
        },
        _create: function() {
            if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
                this.element[0].style.position = 'relative';
            (this.options.addClasses && this.element.addClass("ui-draggable"));
            (this.options.disabled && this.element.addClass("ui-draggable-disabled"));
            this._mouseInit();
        },
        destroy: function() {
            if (!this.element.data('draggable'))
                return;
            this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable" + " ui-draggable-dragging" + " ui-draggable-disabled");
            this._mouseDestroy();
            return this;
        },
        _mouseCapture: function(event) {
            var o = this.options;
            if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
                return false;
            this.handle = this._getHandle(event);
            if (!this.handle)
                return false;
            if (o.iframeFix) {
                $(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
                    $('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({
                        width: this.offsetWidth + "px",
                        height: this.offsetHeight + "px",
                        position: "absolute",
                        opacity: "0.001",
                        zIndex: 1000
                    }).css($(this).offset()).appendTo("body");
                });
            }
            return true;
        },
        _mouseStart: function(event) {
            var o = this.options;
            this.helper = this._createHelper(event);
            this.helper.addClass("ui-draggable-dragging");
            this._cacheHelperProportions();
            if ($.ui.ddmanager)
                $.ui.ddmanager.current = this;
            this._cacheMargins();
            this.cssPosition = this.helper.css("position");
            this.scrollParent = this.helper.scrollParent();
            this.offset = this.positionAbs = this.element.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };
            $.extend(this.offset, {
                click: {
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            });
            this.originalPosition = this.position = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
            if (o.containment)
                this._setContainment();
            if (this._trigger("start", event) === false) {
                this._clear();
                return false;
            }
            this._cacheHelperProportions();
            if ($.ui.ddmanager && !o.dropBehaviour)
                $.ui.ddmanager.prepareOffsets(this, event);
            this._mouseDrag(event, true);
            if ($.ui.ddmanager)
                $.ui.ddmanager.dragStart(this, event);
            return true;
        },
        _mouseDrag: function(event, noPropagation) {
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo("absolute");
            if (!noPropagation) {
                var ui = this._uiHash();
                if (this._trigger('drag', event, ui) === false) {
                    this._mouseUp({});
                    return false;
                }
                this.position = ui.position;
            }
            if (!this.options.axis || this.options.axis != "y")
                this.helper[0].style.left = this.position.left + 'px';
            if (!this.options.axis || this.options.axis != "x")
                this.helper[0].style.top = this.position.top + 'px';
            if ($.ui.ddmanager)
                $.ui.ddmanager.drag(this, event);
            return false;
        },
        _mouseStop: function(event) {
            var dropped = false;
            if ($.ui.ddmanager && !this.options.dropBehaviour)
                dropped = $.ui.ddmanager.drop(this, event);
            if (this.dropped) {
                dropped = this.dropped;
                this.dropped = false;
            }
            var element = this.element[0]
              , elementInDom = false;
            while (element && (element = element.parentNode)) {
                if (element == document) {
                    elementInDom = true;
                }
            }
            if (!elementInDom && this.options.helper === "original")
                return false;
            if ((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
                var self = this;
                $(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
                    if (self._trigger("stop", event) !== false) {
                        self._clear();
                    }
                });
            } else {
                if (this._trigger("stop", event) !== false) {
                    this._clear();
                }
            }
            return false;
        },
        _mouseUp: function(event) {
            if (this.options.iframeFix === true) {
                $("div.ui-draggable-iframeFix").each(function() {
                    this.parentNode.removeChild(this);
                });
            }
            if ($.ui.ddmanager)
                $.ui.ddmanager.dragStop(this, event);
            return $.ui.mouse.prototype._mouseUp.call(this, event);
        },
        cancel: function() {
            if (this.helper.is(".ui-draggable-dragging")) {
                this._mouseUp({});
            } else {
                this._clear();
            }
            return this;
        },
        _getHandle: function(event) {
            var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
            $(this.options.handle, this.element).find("*").andSelf().each(function() {
                if (this == event.target)
                    handle = true;
            });
            return handle;
        },
        _createHelper: function(event) {
            var o = this.options;
            var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);
            if (!helper.parents('body').length)
                helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));
            if (helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
                helper.css("position", "absolute");
            return helper;
        },
        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj == 'string') {
                obj = obj.split(' ');
            }
            if ($.isArray(obj)) {
                obj = {
                    left: +obj[0],
                    top: +obj[1] || 0
                };
            }
            if ('left'in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ('right'in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ('top'in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ('bottom'in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },
        _getParentOffset: function() {
            this.offsetParent = this.helper.offsetParent();
            var po = this.offsetParent.offset();
            if (this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }
            if ((this.offsetParent[0] == document.body) || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie))
                po = {
                    top: 0,
                    left: 0
                };
            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            };
        },
        _getRelativeOffset: function() {
            if (this.cssPosition == "relative") {
                var p = this.element.position();
                return {
                    top: p.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
                    left: p.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
                };
            } else {
                return {
                    top: 0,
                    left: 0
                };
            }
        },
        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.element.css("marginLeft"), 10) || 0),
                top: (parseInt(this.element.css("marginTop"), 10) || 0),
                right: (parseInt(this.element.css("marginRight"), 10) || 0),
                bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
            };
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },
        _setContainment: function() {
            var o = this.options;
            if (o.containment == 'parent')
                o.containment = this.helper[0].parentNode;
            if (o.containment == 'document' || o.containment == 'window')
                this.containment = [o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, (o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left, (o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
            if (!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
                var c = $(o.containment);
                var ce = c[0];
                if (!ce)
                    return;
                var co = c.offset();
                var over = ($(ce).css("overflow") != 'hidden');
                this.containment = [(parseInt($(ce).css("borderLeftWidth"), 10) || 0) + (parseInt($(ce).css("paddingLeft"), 10) || 0), (parseInt($(ce).css("borderTopWidth"), 10) || 0) + (parseInt($(ce).css("paddingTop"), 10) || 0), (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"), 10) || 0) - (parseInt($(ce).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"), 10) || 0) - (parseInt($(ce).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom];
                this.relative_container = c;
            } else if (o.containment.constructor == Array) {
                this.containment = o.containment;
            }
        },
        _convertPositionTo: function(d, pos) {
            if (!pos)
                pos = this.position;
            var mod = d == "absolute" ? 1 : -1;
            var o = this.options
              , scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent
              , scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            return {
                top: (pos.top + this.offset.relative.top * mod + this.offset.parent.top * mod - ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)),
                left: (pos.left + this.offset.relative.left * mod + this.offset.parent.left * mod - ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod))
            };
        },
        _generatePosition: function(event) {
            var o = this.options
              , scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent
              , scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            var pageX = event.pageX;
            var pageY = event.pageY;
            if (this.originalPosition) {
                var containment;
                if (this.containment) {
                    if (this.relative_container) {
                        var co = this.relative_container.offset();
                        containment = [this.containment[0] + co.left, this.containment[1] + co.top, this.containment[2] + co.left, this.containment[3] + co.top];
                    } else {
                        containment = this.containment;
                    }
                    if (event.pageX - this.offset.click.left < containment[0])
                        pageX = containment[0] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top < containment[1])
                        pageY = containment[1] + this.offset.click.top;
                    if (event.pageX - this.offset.click.left > containment[2])
                        pageX = containment[2] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top > containment[3])
                        pageY = containment[3] + this.offset.click.top;
                }
                if (o.grid) {
                    var top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
                    pageY = containment ? (!(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : (!(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
                    var left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
                    pageX = containment ? (!(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : (!(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }
            }
            return {
                top: (pageY - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())))),
                left: (pageX - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft())))
            };
        },
        _clear: function() {
            this.helper.removeClass("ui-draggable-dragging");
            if (this.helper[0] != this.element[0] && !this.cancelHelperRemoval)
                this.helper.remove();
            this.helper = null;
            this.cancelHelperRemoval = false;
        },
        _trigger: function(type, event, ui) {
            ui = ui || this._uiHash();
            $.ui.plugin.call(this, type, [event, ui]);
            if (type == "drag")
                this.positionAbs = this._convertPositionTo("absolute");
            return $.Widget.prototype._trigger.call(this, type, event, ui);
        },
        plugins: {},
        _uiHash: function(event) {
            return {
                helper: this.helper,
                position: this.position,
                originalPosition: this.originalPosition,
                offset: this.positionAbs
            };
        }
    });
    $.extend($.ui.draggable, {
        version: "1.8.21"
    });
    $.ui.plugin.add("draggable", "connectToSortable", {
        start: function(event, ui) {
            var inst = $(this).data("draggable")
              , o = inst.options
              , uiSortable = $.extend({}, ui, {
                item: inst.element
            });
            inst.sortables = [];
            $(o.connectToSortable).each(function() {
                var sortable = $.data(this, 'sortable');
                if (sortable && !sortable.options.disabled) {
                    inst.sortables.push({
                        instance: sortable,
                        shouldRevert: sortable.options.revert
                    });
                    sortable.refreshPositions();
                    sortable._trigger("activate", event, uiSortable);
                }
            });
        },
        stop: function(event, ui) {
            var inst = $(this).data("draggable")
              , uiSortable = $.extend({}, ui, {
                item: inst.element
            });
            $.each(inst.sortables, function() {
                if (this.instance.isOver) {
                    this.instance.isOver = 0;
                    inst.cancelHelperRemoval = true;
                    this.instance.cancelHelperRemoval = false;
                    if (this.shouldRevert)
                        this.instance.options.revert = true;
                    this.instance._mouseStop(event);
                    this.instance.options.helper = this.instance.options._helper;
                    if (inst.options.helper == 'original')
                        this.instance.currentItem.css({
                            top: 'auto',
                            left: 'auto'
                        });
                } else {
                    this.instance.cancelHelperRemoval = false;
                    this.instance._trigger("deactivate", event, uiSortable);
                }
            });
        },
        drag: function(event, ui) {
            var inst = $(this).data("draggable")
              , self = this;
            var checkPos = function(o) {
                var dyClick = this.offset.click.top
                  , dxClick = this.offset.click.left;
                var helperTop = this.positionAbs.top
                  , helperLeft = this.positionAbs.left;
                var itemHeight = o.height
                  , itemWidth = o.width;
                var itemTop = o.top
                  , itemLeft = o.left;
                return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
            };
            $.each(inst.sortables, function(i) {
                this.instance.positionAbs = inst.positionAbs;
                this.instance.helperProportions = inst.helperProportions;
                this.instance.offset.click = inst.offset.click;
                if (this.instance._intersectsWith(this.instance.containerCache)) {
                    if (!this.instance.isOver) {
                        this.instance.isOver = 1;
                        this.instance.currentItem = $(self).clone().removeAttr('id').appendTo(this.instance.element).data("sortable-item", true);
                        this.instance.options._helper = this.instance.options.helper;
                        this.instance.options.helper = function() {
                            return ui.helper[0];
                        }
                        ;
                        event.target = this.instance.currentItem[0];
                        this.instance._mouseCapture(event, true);
                        this.instance._mouseStart(event, true, true);
                        this.instance.offset.click.top = inst.offset.click.top;
                        this.instance.offset.click.left = inst.offset.click.left;
                        this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                        this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;
                        inst._trigger("toSortable", event);
                        inst.dropped = this.instance.element;
                        inst.currentItem = inst.element;
                        this.instance.fromOutside = inst;
                    }
                    if (this.instance.currentItem)
                        this.instance._mouseDrag(event);
                } else {
                    if (this.instance.isOver) {
                        this.instance.isOver = 0;
                        this.instance.cancelHelperRemoval = true;
                        this.instance.options.revert = false;
                        this.instance._trigger('out', event, this.instance._uiHash(this.instance));
                        this.instance._mouseStop(event, true);
                        this.instance.options.helper = this.instance.options._helper;
                        this.instance.currentItem.remove();
                        if (this.instance.placeholder)
                            this.instance.placeholder.remove();
                        inst._trigger("fromSortable", event);
                        inst.dropped = false;
                    }
                }
                ;
            });
        }
    });
    $.ui.plugin.add("draggable", "cursor", {
        start: function(event, ui) {
            var t = $('body')
              , o = $(this).data('draggable').options;
            if (t.css("cursor"))
                o._cursor = t.css("cursor");
            t.css("cursor", o.cursor);
        },
        stop: function(event, ui) {
            var o = $(this).data('draggable').options;
            if (o._cursor)
                $('body').css("cursor", o._cursor);
        }
    });
    $.ui.plugin.add("draggable", "opacity", {
        start: function(event, ui) {
            var t = $(ui.helper)
              , o = $(this).data('draggable').options;
            if (t.css("opacity"))
                o._opacity = t.css("opacity");
            t.css('opacity', o.opacity);
        },
        stop: function(event, ui) {
            var o = $(this).data('draggable').options;
            if (o._opacity)
                $(ui.helper).css('opacity', o._opacity);
        }
    });
    $.ui.plugin.add("draggable", "scroll", {
        start: function(event, ui) {
            var i = $(this).data("draggable");
            if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML')
                i.overflowOffset = i.scrollParent.offset();
        },
        drag: function(event, ui) {
            var i = $(this).data("draggable")
              , o = i.options
              , scrolled = false;
            if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {
                if (!o.axis || o.axis != 'x') {
                    if ((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
                        i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
                    else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity)
                        i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
                }
                if (!o.axis || o.axis != 'y') {
                    if ((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
                        i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
                    else if (event.pageX - i.overflowOffset.left < o.scrollSensitivity)
                        i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
                }
            } else {
                if (!o.axis || o.axis != 'x') {
                    if (event.pageY - $(document).scrollTop() < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                }
                if (!o.axis || o.axis != 'y') {
                    if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                }
            }
            if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
                $.ui.ddmanager.prepareOffsets(i, event);
        }
    });
    $.ui.plugin.add("draggable", "snap", {
        start: function(event, ui) {
            var i = $(this).data("draggable")
              , o = i.options;
            i.snapElements = [];
            $(o.snap.constructor != String ? (o.snap.items || ':data(draggable)') : o.snap).each(function() {
                var $t = $(this);
                var $o = $t.offset();
                if (this != i.element[0])
                    i.snapElements.push({
                        item: this,
                        width: $t.outerWidth(),
                        height: $t.outerHeight(),
                        top: $o.top,
                        left: $o.left
                    });
            });
        },
        drag: function(event, ui) {
            var inst = $(this).data("draggable")
              , o = inst.options;
            var d = o.snapTolerance;
            var x1 = ui.offset.left
              , x2 = x1 + inst.helperProportions.width
              , y1 = ui.offset.top
              , y2 = y1 + inst.helperProportions.height;
            for (var i = inst.snapElements.length - 1; i >= 0; i--) {
                var l = inst.snapElements[i].left
                  , r = l + inst.snapElements[i].width
                  , t = inst.snapElements[i].top
                  , b = t + inst.snapElements[i].height;
                if (!((l - d < x1 && x1 < r + d && t - d < y1 && y1 < b + d) || (l - d < x1 && x1 < r + d && t - d < y2 && y2 < b + d) || (l - d < x2 && x2 < r + d && t - d < y1 && y1 < b + d) || (l - d < x2 && x2 < r + d && t - d < y2 && y2 < b + d))) {
                    if (inst.snapElements[i].snapping)
                        (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), {
                            snapItem: inst.snapElements[i].item
                        })));
                    inst.snapElements[i].snapping = false;
                    continue;
                }
                if (o.snapMode != 'inner') {
                    var ts = Math.abs(t - y2) <= d;
                    var bs = Math.abs(b - y1) <= d;
                    var ls = Math.abs(l - x2) <= d;
                    var rs = Math.abs(r - x1) <= d;
                    if (ts)
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: t - inst.helperProportions.height,
                            left: 0
                        }).top - inst.margins.top;
                    if (bs)
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: b,
                            left: 0
                        }).top - inst.margins.top;
                    if (ls)
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: l - inst.helperProportions.width
                        }).left - inst.margins.left;
                    if (rs)
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: r
                        }).left - inst.margins.left;
                }
                var first = (ts || bs || ls || rs);
                if (o.snapMode != 'outer') {
                    var ts = Math.abs(t - y1) <= d;
                    var bs = Math.abs(b - y2) <= d;
                    var ls = Math.abs(l - x1) <= d;
                    var rs = Math.abs(r - x2) <= d;
                    if (ts)
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: t,
                            left: 0
                        }).top - inst.margins.top;
                    if (bs)
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: b - inst.helperProportions.height,
                            left: 0
                        }).top - inst.margins.top;
                    if (ls)
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: l
                        }).left - inst.margins.left;
                    if (rs)
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: r - inst.helperProportions.width
                        }).left - inst.margins.left;
                }
                if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
                    (inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), {
                        snapItem: inst.snapElements[i].item
                    })));
                inst.snapElements[i].snapping = (ts || bs || ls || rs || first);
            }
            ;
        }
    });
    $.ui.plugin.add("draggable", "stack", {
        start: function(event, ui) {
            var o = $(this).data("draggable").options;
            var group = $.makeArray($(o.stack)).sort(function(a, b) {
                return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
            });
            if (!group.length) {
                return;
            }
            var min = parseInt(group[0].style.zIndex) || 0;
            $(group).each(function(i) {
                this.style.zIndex = min + i;
            });
            this[0].style.zIndex = min + group.length;
        }
    });
    $.ui.plugin.add("draggable", "zIndex", {
        start: function(event, ui) {
            var t = $(ui.helper)
              , o = $(this).data("draggable").options;
            if (t.css("zIndex"))
                o._zIndex = t.css("zIndex");
            t.css('zIndex', o.zIndex);
        },
        stop: function(event, ui) {
            var o = $(this).data("draggable").options;
            if (o._zIndex)
                $(ui.helper).css('zIndex', o._zIndex);
        }
    });
}
)(jQuery);
/*!
* jQuery UI Droppable 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Droppables
*
* Depends:
* jquery.ui.core.js
* jquery.ui.widget.js
* jquery.ui.mouse.js
* jquery.ui.draggable.js
*/
(function($, undefined) {
    $.widget("ui.droppable", {
        widgetEventPrefix: "drop",
        options: {
            accept: '*',
            activeClass: false,
            addClasses: true,
            greedy: false,
            hoverClass: false,
            scope: 'default',
            tolerance: 'intersect'
        },
        _create: function() {
            var o = this.options
              , accept = o.accept;
            this.isover = 0;
            this.isout = 1;
            this.accept = $.isFunction(accept) ? accept : function(d) {
                return d.is(accept);
            }
            ;
            this.proportions = {
                width: this.element[0].offsetWidth,
                height: this.element[0].offsetHeight
            };
            $.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
            $.ui.ddmanager.droppables[o.scope].push(this);
            (o.addClasses && this.element.addClass("ui-droppable"));
        },
        destroy: function() {
            var drop = $.ui.ddmanager.droppables[this.options.scope];
            for (var i = 0; i < drop.length; i++)
                if (drop[i] == this)
                    drop.splice(i, 1);
            this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");
            return this;
        },
        _setOption: function(key, value) {
            if (key == 'accept') {
                this.accept = $.isFunction(value) ? value : function(d) {
                    return d.is(value);
                }
                ;
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _activate: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (this.options.activeClass)
                this.element.addClass(this.options.activeClass);
            (draggable && this._trigger('activate', event, this.ui(draggable)));
        },
        _deactivate: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (this.options.activeClass)
                this.element.removeClass(this.options.activeClass);
            (draggable && this._trigger('deactivate', event, this.ui(draggable)));
        },
        _over: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0])
                return;
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.hoverClass)
                    this.element.addClass(this.options.hoverClass);
                this._trigger('over', event, this.ui(draggable));
            }
        },
        _out: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0])
                return;
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.hoverClass)
                    this.element.removeClass(this.options.hoverClass);
                this._trigger('out', event, this.ui(draggable));
            }
        },
        _drop: function(event, custom) {
            var draggable = custom || $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0])
                return false;
            var childrenIntersection = false;
            this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function() {
                var inst = $.data(this, 'droppable');
                if (inst.options.greedy && !inst.options.disabled && inst.options.scope == draggable.options.scope && inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element)) && $.ui.intersect(draggable, $.extend(inst, {
                    offset: inst.element.offset()
                }), inst.options.tolerance)) {
                    childrenIntersection = true;
                    return false;
                }
            });
            if (childrenIntersection)
                return false;
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.activeClass)
                    this.element.removeClass(this.options.activeClass);
                if (this.options.hoverClass)
                    this.element.removeClass(this.options.hoverClass);
                this._trigger('drop', event, this.ui(draggable));
                return this.element;
            }
            return false;
        },
        ui: function(c) {
            return {
                draggable: (c.currentItem || c.element),
                helper: c.helper,
                position: c.position,
                offset: c.positionAbs
            };
        }
    });
    $.extend($.ui.droppable, {
        version: "1.8.21"
    });
    $.ui.intersect = function(draggable, droppable, toleranceMode) {
        if (!droppable.offset)
            return false;
        var x1 = (draggable.positionAbs || draggable.position.absolute).left
          , x2 = x1 + draggable.helperProportions.width
          , y1 = (draggable.positionAbs || draggable.position.absolute).top
          , y2 = y1 + draggable.helperProportions.height;
        var l = droppable.offset.left
          , r = l + droppable.proportions.width
          , t = droppable.offset.top
          , b = t + droppable.proportions.height;
        switch (toleranceMode) {
        case 'fit':
            return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
            break;
        case 'intersect':
            return (l < x1 + (draggable.helperProportions.width / 2) && x2 - (draggable.helperProportions.width / 2) < r && t < y1 + (draggable.helperProportions.height / 2) && y2 - (draggable.helperProportions.height / 2) < b);
            break;
        case 'pointer':
            var draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left)
              , draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top)
              , isOver = $.ui.isOver(draggableTop, draggableLeft, t, l, droppable.proportions.height, droppable.proportions.width);
            return isOver;
            break;
        case 'touch':
            return ((y1 >= t && y1 <= b) || (y2 >= t && y2 <= b) || (y1 < t && y2 > b)) && ((x1 >= l && x1 <= r) || (x2 >= l && x2 <= r) || (x1 < l && x2 > r));
            break;
        default:
            return false;
            break;
        }
    }
    ;
    $.ui.ddmanager = {
        current: null,
        droppables: {
            'default': []
        },
        prepareOffsets: function(t, event) {
            var m = $.ui.ddmanager.droppables[t.options.scope] || [];
            var type = event ? event.type : null;
            var list = (t.currentItem || t.element).find(":data(droppable)").andSelf();
            droppablesLoop: for (var i = 0; i < m.length; i++) {
                if (m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0], (t.currentItem || t.element))))
                    continue;
                for (var j = 0; j < list.length; j++) {
                    if (list[j] == m[i].element[0]) {
                        m[i].proportions.height = 0;
                        continue droppablesLoop;
                    }
                }
                ;m[i].visible = m[i].element.css("display") != "none";
                if (!m[i].visible)
                    continue;
                if (type == "mousedown")
                    m[i]._activate.call(m[i], event);
                m[i].offset = m[i].element.offset();
                m[i].proportions = {
                    width: m[i].element[0].offsetWidth,
                    height: m[i].element[0].offsetHeight
                };
            }
        },
        drop: function(draggable, event) {
            var dropped = false;
            $.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {
                if (!this.options)
                    return;
                if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance))
                    dropped = this._drop.call(this, event) || dropped;
                if (!this.options.disabled && this.visible && this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                    this.isout = 1;
                    this.isover = 0;
                    this._deactivate.call(this, event);
                }
            });
            return dropped;
        },
        dragStart: function(draggable, event) {
            draggable.element.parents(":not(body,html)").bind("scroll.droppable", function() {
                if (!draggable.options.refreshPositions)
                    $.ui.ddmanager.prepareOffsets(draggable, event);
            });
        },
        drag: function(draggable, event) {
            if (draggable.options.refreshPositions)
                $.ui.ddmanager.prepareOffsets(draggable, event);
            $.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {
                if (this.options.disabled || this.greedyChild || !this.visible)
                    return;
                var intersects = $.ui.intersect(draggable, this, this.options.tolerance);
                var c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
                if (!c)
                    return;
                var parentInstance;
                if (this.options.greedy) {
                    var parent = this.element.parents(':data(droppable):eq(0)');
                    if (parent.length) {
                        parentInstance = $.data(parent[0], 'droppable');
                        parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
                    }
                }
                if (parentInstance && c == 'isover') {
                    parentInstance['isover'] = 0;
                    parentInstance['isout'] = 1;
                    parentInstance._out.call(parentInstance, event);
                }
                this[c] = 1;
                this[c == 'isout' ? 'isover' : 'isout'] = 0;
                this[c == "isover" ? "_over" : "_out"].call(this, event);
                if (parentInstance && c == 'isout') {
                    parentInstance['isout'] = 0;
                    parentInstance['isover'] = 1;
                    parentInstance._over.call(parentInstance, event);
                }
            });
        },
        dragStop: function(draggable, event) {
            draggable.element.parents(":not(body,html)").unbind("scroll.droppable");
            if (!draggable.options.refreshPositions)
                $.ui.ddmanager.prepareOffsets(draggable, event);
        }
    };
}
)(jQuery);
/*!
* jQuery UI Resizable 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Resizables
*
* Depends:
* jquery.ui.core.js
* jquery.ui.mouse.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    $.widget("ui.resizable", $.ui.mouse, {
        widgetEventPrefix: "resize",
        options: {
            alsoResize: false,
            animate: false,
            animateDuration: "slow",
            animateEasing: "swing",
            aspectRatio: false,
            autoHide: false,
            containment: false,
            ghost: false,
            grid: false,
            handles: "e,s,se",
            helper: false,
            maxHeight: null,
            maxWidth: null,
            minHeight: 10,
            minWidth: 10,
            zIndex: 1000
        },
        _create: function() {
            var self = this
              , o = this.options;
            this.element.addClass("ui-resizable");
            $.extend(this, {
                _aspectRatio: !!(o.aspectRatio),
                aspectRatio: o.aspectRatio,
                originalElement: this.element,
                _proportionallyResizeElements: [],
                _helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
            });
            if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {
                this.element.wrap($('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
                    position: this.element.css('position'),
                    width: this.element.outerWidth(),
                    height: this.element.outerHeight(),
                    top: this.element.css('top'),
                    left: this.element.css('left')
                }));
                this.element = this.element.parent().data("resizable", this.element.data('resizable'));
                this.elementIsWrapper = true;
                this.element.css({
                    marginLeft: this.originalElement.css("marginLeft"),
                    marginTop: this.originalElement.css("marginTop"),
                    marginRight: this.originalElement.css("marginRight"),
                    marginBottom: this.originalElement.css("marginBottom")
                });
                this.originalElement.css({
                    marginLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0
                });
                this.originalResizeStyle = this.originalElement.css('resize');
                this.originalElement.css('resize', 'none');
                this._proportionallyResizeElements.push(this.originalElement.css({
                    position: 'static',
                    zoom: 1,
                    display: 'block'
                }));
                this.originalElement.css({
                    margin: this.originalElement.css('margin')
                });
                this._proportionallyResize();
            }
            this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? "e,s,se" : {
                n: '.ui-resizable-n',
                e: '.ui-resizable-e',
                s: '.ui-resizable-s',
                w: '.ui-resizable-w',
                se: '.ui-resizable-se',
                sw: '.ui-resizable-sw',
                ne: '.ui-resizable-ne',
                nw: '.ui-resizable-nw'
            });
            if (this.handles.constructor == String) {
                if (this.handles == 'all')
                    this.handles = 'n,e,s,w,se,sw,ne,nw';
                var n = this.handles.split(",");
                this.handles = {};
                for (var i = 0; i < n.length; i++) {
                    var handle = $.trim(n[i])
                      , hname = 'ui-resizable-' + handle;
                    var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');
                    axis.css({
                        zIndex: o.zIndex
                    });
                    if ('se' == handle) {
                        axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
                    }
                    ;this.handles[handle] = '.ui-resizable-' + handle;
                    this.element.append(axis);
                }
            }
            this._renderAxis = function(target) {
                target = target || this.element;
                for (var i in this.handles) {
                    if (this.handles[i].constructor == String)
                        this.handles[i] = $(this.handles[i], this.element).show();
                    if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {
                        var axis = $(this.handles[i], this.element)
                          , padWrapper = 0;
                        padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();
                        var padPos = ['padding', /ne|nw|n/.test(i) ? 'Top' : /se|sw|s/.test(i) ? 'Bottom' : /^e$/.test(i) ? 'Right' : 'Left'].join("");
                        target.css(padPos, padWrapper);
                        this._proportionallyResize();
                    }
                    if (!$(this.handles[i]).length)
                        continue;
                }
            }
            ;
            this._renderAxis(this.element);
            this._handles = $('.ui-resizable-handle', this.element).disableSelection();
            this._handles.mouseover(function() {
                if (!self.resizing) {
                    if (this.className)
                        var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                    self.axis = axis && axis[1] ? axis[1] : 'se';
                }
            });
            if (o.autoHide) {
                this._handles.hide();
                $(this.element).addClass("ui-resizable-autohide").hover(function() {
                    if (o.disabled)
                        return;
                    $(this).removeClass("ui-resizable-autohide");
                    self._handles.show();
                }, function() {
                    if (o.disabled)
                        return;
                    if (!self.resizing) {
                        $(this).addClass("ui-resizable-autohide");
                        self._handles.hide();
                    }
                });
            }
            this._mouseInit();
        },
        destroy: function() {
            this._mouseDestroy();
            var _destroy = function(exp) {
                $(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find('.ui-resizable-handle').remove();
            };
            if (this.elementIsWrapper) {
                _destroy(this.element);
                var wrapper = this.element;
                wrapper.after(this.originalElement.css({
                    position: wrapper.css('position'),
                    width: wrapper.outerWidth(),
                    height: wrapper.outerHeight(),
                    top: wrapper.css('top'),
                    left: wrapper.css('left')
                })).remove();
            }
            this.originalElement.css('resize', this.originalResizeStyle);
            _destroy(this.originalElement);
            return this;
        },
        _mouseCapture: function(event) {
            var handle = false;
            for (var i in this.handles) {
                if ($(this.handles[i])[0] == event.target) {
                    handle = true;
                }
            }
            return !this.options.disabled && handle;
        },
        _mouseStart: function(event) {
            var o = this.options
              , iniPos = this.element.position()
              , el = this.element;
            this.resizing = true;
            this.documentScroll = {
                top: $(document).scrollTop(),
                left: $(document).scrollLeft()
            };
            if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
                el.css({
                    position: 'absolute',
                    top: iniPos.top,
                    left: iniPos.left
                });
            }
            this._renderProxy();
            var curleft = num(this.helper.css('left'))
              , curtop = num(this.helper.css('top'));
            if (o.containment) {
                curleft += $(o.containment).scrollLeft() || 0;
                curtop += $(o.containment).scrollTop() || 0;
            }
            this.offset = this.helper.offset();
            this.position = {
                left: curleft,
                top: curtop
            };
            this.size = this._helper ? {
                width: el.outerWidth(),
                height: el.outerHeight()
            } : {
                width: el.width(),
                height: el.height()
            };
            this.originalSize = this._helper ? {
                width: el.outerWidth(),
                height: el.outerHeight()
            } : {
                width: el.width(),
                height: el.height()
            };
            this.originalPosition = {
                left: curleft,
                top: curtop
            };
            this.sizeDiff = {
                width: el.outerWidth() - el.width(),
                height: el.outerHeight() - el.height()
            };
            this.originalMousePosition = {
                left: event.pageX,
                top: event.pageY
            };
            this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);
            var cursor = $('.ui-resizable-' + this.axis).css('cursor');
            $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);
            el.addClass("ui-resizable-resizing");
            this._propagate("start", event);
            return true;
        },
        _mouseDrag: function(event) {
            var el = this.helper
              , o = this.options
              , props = {}
              , self = this
              , smp = this.originalMousePosition
              , a = this.axis;
            var dx = (event.pageX - smp.left) || 0
              , dy = (event.pageY - smp.top) || 0;
            var trigger = this._change[a];
            if (!trigger)
                return false;
            var data = trigger.apply(this, [event, dx, dy])
              , ie6 = $.browser.msie && $.browser.version < 7
              , csdif = this.sizeDiff;
            this._updateVirtualBoundaries(event.shiftKey);
            if (this._aspectRatio || event.shiftKey)
                data = this._updateRatio(data, event);
            data = this._respectSize(data, event);
            this._propagate("resize", event);
            el.css({
                top: this.position.top + "px",
                left: this.position.left + "px",
                width: this.size.width + "px",
                height: this.size.height + "px"
            });
            if (!this._helper && this._proportionallyResizeElements.length)
                this._proportionallyResize();
            this._updateCache(data);
            this._trigger('resize', event, this.ui());
            return false;
        },
        _mouseStop: function(event) {
            this.resizing = false;
            var o = this.options
              , self = this;
            if (this._helper) {
                var pr = this._proportionallyResizeElements
                  , ista = pr.length && (/textarea/i).test(pr[0].nodeName)
                  , soffseth = ista && $.ui.hasScroll(pr[0], 'left') ? 0 : self.sizeDiff.height
                  , soffsetw = ista ? 0 : self.sizeDiff.width;
                var s = {
                    width: (self.helper.width() - soffsetw),
                    height: (self.helper.height() - soffseth)
                }
                  , left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null
                  , top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;
                if (!o.animate)
                    this.element.css($.extend(s, {
                        top: top,
                        left: left
                    }));
                self.helper.height(self.size.height);
                self.helper.width(self.size.width);
                if (this._helper && !o.animate)
                    this._proportionallyResize();
            }
            $('body').css('cursor', 'auto');
            this.element.removeClass("ui-resizable-resizing");
            this._propagate("stop", event);
            if (this._helper)
                this.helper.remove();
            return false;
        },
        _updateVirtualBoundaries: function(forceAspectRatio) {
            var o = this.options, pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b;
            b = {
                minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
                maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
                minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
                maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
            };
            if (this._aspectRatio || forceAspectRatio) {
                pMinWidth = b.minHeight * this.aspectRatio;
                pMinHeight = b.minWidth / this.aspectRatio;
                pMaxWidth = b.maxHeight * this.aspectRatio;
                pMaxHeight = b.maxWidth / this.aspectRatio;
                if (pMinWidth > b.minWidth)
                    b.minWidth = pMinWidth;
                if (pMinHeight > b.minHeight)
                    b.minHeight = pMinHeight;
                if (pMaxWidth < b.maxWidth)
                    b.maxWidth = pMaxWidth;
                if (pMaxHeight < b.maxHeight)
                    b.maxHeight = pMaxHeight;
            }
            this._vBoundaries = b;
        },
        _updateCache: function(data) {
            var o = this.options;
            this.offset = this.helper.offset();
            if (isNumber(data.left))
                this.position.left = data.left;
            if (isNumber(data.top))
                this.position.top = data.top;
            if (isNumber(data.height))
                this.size.height = data.height;
            if (isNumber(data.width))
                this.size.width = data.width;
        },
        _updateRatio: function(data, event) {
            var o = this.options
              , cpos = this.position
              , csize = this.size
              , a = this.axis;
            if (isNumber(data.height))
                data.width = (data.height * this.aspectRatio);
            else if (isNumber(data.width))
                data.height = (data.width / this.aspectRatio);
            if (a == 'sw') {
                data.left = cpos.left + (csize.width - data.width);
                data.top = null;
            }
            if (a == 'nw') {
                data.top = cpos.top + (csize.height - data.height);
                data.left = cpos.left + (csize.width - data.width);
            }
            return data;
        },
        _respectSize: function(data, event) {
            var el = this.helper
              , o = this._vBoundaries
              , pRatio = this._aspectRatio || event.shiftKey
              , a = this.axis
              , ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width)
              , ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height)
              , isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width)
              , isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);
            if (isminw)
                data.width = o.minWidth;
            if (isminh)
                data.height = o.minHeight;
            if (ismaxw)
                data.width = o.maxWidth;
            if (ismaxh)
                data.height = o.maxHeight;
            var dw = this.originalPosition.left + this.originalSize.width
              , dh = this.position.top + this.size.height;
            var cw = /sw|nw|w/.test(a)
              , ch = /nw|ne|n/.test(a);
            if (isminw && cw)
                data.left = dw - o.minWidth;
            if (ismaxw && cw)
                data.left = dw - o.maxWidth;
            if (isminh && ch)
                data.top = dh - o.minHeight;
            if (ismaxh && ch)
                data.top = dh - o.maxHeight;
            var isNotwh = !data.width && !data.height;
            if (isNotwh && !data.left && data.top)
                data.top = null;
            else if (isNotwh && !data.top && data.left)
                data.left = null;
            return data;
        },
        _proportionallyResize: function() {
            var o = this.options;
            if (!this._proportionallyResizeElements.length)
                return;
            var element = this.helper || this.element;
            for (var i = 0; i < this._proportionallyResizeElements.length; i++) {
                var prel = this._proportionallyResizeElements[i];
                if (!this.borderDif) {
                    var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')]
                      , p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];
                    this.borderDif = $.map(b, function(v, i) {
                        var border = parseInt(v, 10) || 0
                          , padding = parseInt(p[i], 10) || 0;
                        return border + padding;
                    });
                }
                if ($.browser.msie && !(!($(element).is(':hidden') || $(element).parents(':hidden').length)))
                    continue;
                prel.css({
                    height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
                    width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
                });
            }
            ;
        },
        _renderProxy: function() {
            var el = this.element
              , o = this.options;
            this.elementOffset = el.offset();
            if (this._helper) {
                this.helper = this.helper || $('<div style="overflow:hidden;"></div>');
                var ie6 = $.browser.msie && $.browser.version < 7
                  , ie6offset = (ie6 ? 1 : 0)
                  , pxyoffset = (ie6 ? 2 : -1);
                this.helper.addClass(this._helper).css({
                    width: this.element.outerWidth() + pxyoffset,
                    height: this.element.outerHeight() + pxyoffset,
                    position: 'absolute',
                    left: this.elementOffset.left - ie6offset + 'px',
                    top: this.elementOffset.top - ie6offset + 'px',
                    zIndex: ++o.zIndex
                });
                this.helper.appendTo("body").disableSelection();
            } else {
                this.helper = this.element;
            }
        },
        _change: {
            e: function(event, dx, dy) {
                return {
                    width: this.originalSize.width + dx
                };
            },
            w: function(event, dx, dy) {
                var o = this.options
                  , cs = this.originalSize
                  , sp = this.originalPosition;
                return {
                    left: sp.left + dx,
                    width: cs.width - dx
                };
            },
            n: function(event, dx, dy) {
                var o = this.options
                  , cs = this.originalSize
                  , sp = this.originalPosition;
                return {
                    top: sp.top + dy,
                    height: cs.height - dy
                };
            },
            s: function(event, dx, dy) {
                return {
                    height: this.originalSize.height + dy
                };
            },
            se: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
            },
            sw: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
            },
            ne: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
            },
            nw: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
            }
        },
        _propagate: function(n, event) {
            $.ui.plugin.call(this, n, [event, this.ui()]);
            (n != "resize" && this._trigger(n, event, this.ui()));
        },
        plugins: {},
        ui: function() {
            return {
                originalElement: this.originalElement,
                element: this.element,
                helper: this.helper,
                position: this.position,
                size: this.size,
                originalSize: this.originalSize,
                originalPosition: this.originalPosition
            };
        }
    });
    $.extend($.ui.resizable, {
        version: "1.8.21"
    });
    $.ui.plugin.add("resizable", "alsoResize", {
        start: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options;
            var _store = function(exp) {
                $(exp).each(function() {
                    var el = $(this);
                    el.data("resizable-alsoresize", {
                        width: parseInt(el.width(), 10),
                        height: parseInt(el.height(), 10),
                        left: parseInt(el.css('left'), 10),
                        top: parseInt(el.css('top'), 10)
                    });
                });
            };
            if (typeof (o.alsoResize) == 'object' && !o.alsoResize.parentNode) {
                if (o.alsoResize.length) {
                    o.alsoResize = o.alsoResize[0];
                    _store(o.alsoResize);
                } else {
                    $.each(o.alsoResize, function(exp) {
                        _store(exp);
                    });
                }
            } else {
                _store(o.alsoResize);
            }
        },
        resize: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , os = self.originalSize
              , op = self.originalPosition;
            var delta = {
                height: (self.size.height - os.height) || 0,
                width: (self.size.width - os.width) || 0,
                top: (self.position.top - op.top) || 0,
                left: (self.position.left - op.left) || 0
            }
              , _alsoResize = function(exp, c) {
                $(exp).each(function() {
                    var el = $(this)
                      , start = $(this).data("resizable-alsoresize")
                      , style = {}
                      , css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ['width', 'height'] : ['width', 'height', 'top', 'left'];
                    $.each(css, function(i, prop) {
                        var sum = (start[prop] || 0) + (delta[prop] || 0);
                        if (sum && sum >= 0)
                            style[prop] = sum || null;
                    });
                    el.css(style);
                });
            };
            if (typeof (o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
                $.each(o.alsoResize, function(exp, c) {
                    _alsoResize(exp, c);
                });
            } else {
                _alsoResize(o.alsoResize);
            }
        },
        stop: function(event, ui) {
            $(this).removeData("resizable-alsoresize");
        }
    });
    $.ui.plugin.add("resizable", "animate", {
        stop: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options;
            var pr = self._proportionallyResizeElements
              , ista = pr.length && (/textarea/i).test(pr[0].nodeName)
              , soffseth = ista && $.ui.hasScroll(pr[0], 'left') ? 0 : self.sizeDiff.height
              , soffsetw = ista ? 0 : self.sizeDiff.width;
            var style = {
                width: (self.size.width - soffsetw),
                height: (self.size.height - soffseth)
            }
              , left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null
              , top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;
            self.element.animate($.extend(style, top && left ? {
                top: top,
                left: left
            } : {}), {
                duration: o.animateDuration,
                easing: o.animateEasing,
                step: function() {
                    var data = {
                        width: parseInt(self.element.css('width'), 10),
                        height: parseInt(self.element.css('height'), 10),
                        top: parseInt(self.element.css('top'), 10),
                        left: parseInt(self.element.css('left'), 10)
                    };
                    if (pr && pr.length)
                        $(pr[0]).css({
                            width: data.width,
                            height: data.height
                        });
                    self._updateCache(data);
                    self._propagate("resize", event);
                }
            });
        }
    });
    $.ui.plugin.add("resizable", "containment", {
        start: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , el = self.element;
            var oc = o.containment
              , ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
            if (!ce)
                return;
            self.containerElement = $(ce);
            if (/document/.test(oc) || oc == document) {
                self.containerOffset = {
                    left: 0,
                    top: 0
                };
                self.containerPosition = {
                    left: 0,
                    top: 0
                };
                self.parentData = {
                    element: $(document),
                    left: 0,
                    top: 0,
                    width: $(document).width(),
                    height: $(document).height() || document.body.parentNode.scrollHeight
                };
            } else {
                var element = $(ce)
                  , p = [];
                $(["Top", "Right", "Left", "Bottom"]).each(function(i, name) {
                    p[i] = num(element.css("padding" + name));
                });
                self.containerOffset = element.offset();
                self.containerPosition = element.position();
                self.containerSize = {
                    height: (element.innerHeight() - p[3]),
                    width: (element.innerWidth() - p[1])
                };
                var co = self.containerOffset
                  , ch = self.containerSize.height
                  , cw = self.containerSize.width
                  , width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw)
                  , height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);
                self.parentData = {
                    element: ce,
                    left: co.left,
                    top: co.top,
                    width: width,
                    height: height
                };
            }
        },
        resize: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , ps = self.containerSize
              , co = self.containerOffset
              , cs = self.size
              , cp = self.position
              , pRatio = self._aspectRatio || event.shiftKey
              , cop = {
                top: 0,
                left: 0
            }
              , ce = self.containerElement;
            if (ce[0] != document && (/static/).test(ce.css('position')))
                cop = co;
            if (cp.left < (self._helper ? co.left : 0)) {
                self.size.width = self.size.width + (self._helper ? (self.position.left - co.left) : (self.position.left - cop.left));
                if (pRatio)
                    self.size.height = self.size.width / self.aspectRatio;
                self.position.left = o.helper ? co.left : 0;
            }
            if (cp.top < (self._helper ? co.top : 0)) {
                self.size.height = self.size.height + (self._helper ? (self.position.top - co.top) : self.position.top);
                if (pRatio)
                    self.size.width = self.size.height * self.aspectRatio;
                self.position.top = self._helper ? co.top : 0;
            }
            self.offset.left = self.parentData.left + self.position.left;
            self.offset.top = self.parentData.top + self.position.top;
            var woset = Math.abs((self._helper ? self.offset.left - cop.left : (self.offset.left - cop.left)) + self.sizeDiff.width)
              , hoset = Math.abs((self._helper ? self.offset.top - cop.top : (self.offset.top - co.top)) + self.sizeDiff.height);
            var isParent = self.containerElement.get(0) == self.element.parent().get(0)
              , isOffsetRelative = /relative|absolute/.test(self.containerElement.css('position'));
            if (isParent && isOffsetRelative)
                woset -= self.parentData.left;
            if (woset + self.size.width >= self.parentData.width) {
                self.size.width = self.parentData.width - woset;
                if (pRatio)
                    self.size.height = self.size.width / self.aspectRatio;
            }
            if (hoset + self.size.height >= self.parentData.height) {
                self.size.height = self.parentData.height - hoset;
                if (pRatio)
                    self.size.width = self.size.height * self.aspectRatio;
            }
        },
        stop: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , cp = self.position
              , co = self.containerOffset
              , cop = self.containerPosition
              , ce = self.containerElement;
            var helper = $(self.helper)
              , ho = helper.offset()
              , w = helper.outerWidth() - self.sizeDiff.width
              , h = helper.outerHeight() - self.sizeDiff.height;
            if (self._helper && !o.animate && (/relative/).test(ce.css('position')))
                $(this).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
            if (self._helper && !o.animate && (/static/).test(ce.css('position')))
                $(this).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
        }
    });
    $.ui.plugin.add("resizable", "ghost", {
        start: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , cs = self.size;
            self.ghost = self.originalElement.clone();
            self.ghost.css({
                opacity: .25,
                display: 'block',
                position: 'relative',
                height: cs.height,
                width: cs.width,
                margin: 0,
                left: 0,
                top: 0
            }).addClass('ui-resizable-ghost').addClass(typeof o.ghost == 'string' ? o.ghost : '');
            self.ghost.appendTo(self.helper);
        },
        resize: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options;
            if (self.ghost)
                self.ghost.css({
                    position: 'relative',
                    height: self.size.height,
                    width: self.size.width
                });
        },
        stop: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options;
            if (self.ghost && self.helper)
                self.helper.get(0).removeChild(self.ghost.get(0));
        }
    });
    $.ui.plugin.add("resizable", "grid", {
        resize: function(event, ui) {
            var self = $(this).data("resizable")
              , o = self.options
              , cs = self.size
              , os = self.originalSize
              , op = self.originalPosition
              , a = self.axis
              , ratio = o._aspectRatio || event.shiftKey;
            o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
            var ox = Math.round((cs.width - os.width) / (o.grid[0] || 1)) * (o.grid[0] || 1)
              , oy = Math.round((cs.height - os.height) / (o.grid[1] || 1)) * (o.grid[1] || 1);
            if (/^(se|s|e)$/.test(a)) {
                self.size.width = os.width + ox;
                self.size.height = os.height + oy;
            } else if (/^(ne)$/.test(a)) {
                self.size.width = os.width + ox;
                self.size.height = os.height + oy;
                self.position.top = op.top - oy;
            } else if (/^(sw)$/.test(a)) {
                self.size.width = os.width + ox;
                self.size.height = os.height + oy;
                self.position.left = op.left - ox;
            } else {
                self.size.width = os.width + ox;
                self.size.height = os.height + oy;
                self.position.top = op.top - oy;
                self.position.left = op.left - ox;
            }
        }
    });
    var num = function(v) {
        return parseInt(v, 10) || 0;
    };
    var isNumber = function(value) {
        return !isNaN(parseInt(value, 10));
    };
}
)(jQuery);
/*!
* jQuery UI Selectable 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Selectables
*
* Depends:
* jquery.ui.core.js
* jquery.ui.mouse.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    $.widget("ui.selectable", $.ui.mouse, {
        options: {
            appendTo: 'body',
            autoRefresh: true,
            distance: 0,
            filter: '*',
            tolerance: 'touch'
        },
        _create: function() {
            var self = this;
            this.element.addClass("ui-selectable");
            this.dragged = false;
            var selectees;
            this.refresh = function() {
                selectees = $(self.options.filter, self.element[0]);
                selectees.addClass("ui-selectee");
                selectees.each(function() {
                    var $this = $(this);
                    var pos = $this.offset();
                    $.data(this, "selectable-item", {
                        element: this,
                        $element: $this,
                        left: pos.left,
                        top: pos.top,
                        right: pos.left + $this.outerWidth(),
                        bottom: pos.top + $this.outerHeight(),
                        startselected: false,
                        selected: $this.hasClass('ui-selected'),
                        selecting: $this.hasClass('ui-selecting'),
                        unselecting: $this.hasClass('ui-unselecting')
                    });
                });
            }
            ;
            this.refresh();
            this.selectees = selectees.addClass("ui-selectee");
            this._mouseInit();
            this.helper = $("<div class='ui-selectable-helper'></div>");
        },
        destroy: function() {
            this.selectees.removeClass("ui-selectee").removeData("selectable-item");
            this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");
            this._mouseDestroy();
            return this;
        },
        _mouseStart: function(event) {
            var self = this;
            this.opos = [event.pageX, event.pageY];
            if (this.options.disabled)
                return;
            var options = this.options;
            this.selectees = $(options.filter, this.element[0]);
            this._trigger("start", event);
            $(options.appendTo).append(this.helper);
            this.helper.css({
                "left": event.clientX,
                "top": event.clientY,
                "width": 0,
                "height": 0
            });
            if (options.autoRefresh) {
                this.refresh();
            }
            this.selectees.filter('.ui-selected').each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.startselected = true;
                if (!event.metaKey && !event.ctrlKey) {
                    selectee.$element.removeClass('ui-selected');
                    selectee.selected = false;
                    selectee.$element.addClass('ui-unselecting');
                    selectee.unselecting = true;
                    self._trigger("unselecting", event, {
                        unselecting: selectee.element
                    });
                }
            });
            $(event.target).parents().andSelf().each(function() {
                var selectee = $.data(this, "selectable-item");
                if (selectee) {
                    var doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass('ui-selected');
                    selectee.$element.removeClass(doSelect ? "ui-unselecting" : "ui-selected").addClass(doSelect ? "ui-selecting" : "ui-unselecting");
                    selectee.unselecting = !doSelect;
                    selectee.selecting = doSelect;
                    selectee.selected = doSelect;
                    if (doSelect) {
                        self._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    } else {
                        self._trigger("unselecting", event, {
                            unselecting: selectee.element
                        });
                    }
                    return false;
                }
            });
        },
        _mouseDrag: function(event) {
            var self = this;
            this.dragged = true;
            if (this.options.disabled)
                return;
            var options = this.options;
            var x1 = this.opos[0]
              , y1 = this.opos[1]
              , x2 = event.pageX
              , y2 = event.pageY;
            if (x1 > x2) {
                var tmp = x2;
                x2 = x1;
                x1 = tmp;
            }
            if (y1 > y2) {
                var tmp = y2;
                y2 = y1;
                y1 = tmp;
            }
            this.helper.css({
                left: x1,
                top: y1,
                width: x2 - x1,
                height: y2 - y1
            });
            this.selectees.each(function() {
                var selectee = $.data(this, "selectable-item");
                if (!selectee || selectee.element == self.element[0])
                    return;
                var hit = false;
                if (options.tolerance == 'touch') {
                    hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));
                } else if (options.tolerance == 'fit') {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }
                if (hit) {
                    if (selectee.selected) {
                        selectee.$element.removeClass('ui-selected');
                        selectee.selected = false;
                    }
                    if (selectee.unselecting) {
                        selectee.$element.removeClass('ui-unselecting');
                        selectee.unselecting = false;
                    }
                    if (!selectee.selecting) {
                        selectee.$element.addClass('ui-selecting');
                        selectee.selecting = true;
                        self._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    }
                } else {
                    if (selectee.selecting) {
                        if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
                            selectee.$element.removeClass('ui-selecting');
                            selectee.selecting = false;
                            selectee.$element.addClass('ui-selected');
                            selectee.selected = true;
                        } else {
                            selectee.$element.removeClass('ui-selecting');
                            selectee.selecting = false;
                            if (selectee.startselected) {
                                selectee.$element.addClass('ui-unselecting');
                                selectee.unselecting = true;
                            }
                            self._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                    if (selectee.selected) {
                        if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
                            selectee.$element.removeClass('ui-selected');
                            selectee.selected = false;
                            selectee.$element.addClass('ui-unselecting');
                            selectee.unselecting = true;
                            self._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                }
            });
            return false;
        },
        _mouseStop: function(event) {
            var self = this;
            this.dragged = false;
            var options = this.options;
            $('.ui-unselecting', this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.$element.removeClass('ui-unselecting');
                selectee.unselecting = false;
                selectee.startselected = false;
                self._trigger("unselected", event, {
                    unselected: selectee.element
                });
            });
            $('.ui-selecting', this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.$element.removeClass('ui-selecting').addClass('ui-selected');
                selectee.selecting = false;
                selectee.selected = true;
                selectee.startselected = true;
                self._trigger("selected", event, {
                    selected: selectee.element
                });
            });
            this._trigger("stop", event);
            this.helper.remove();
            return false;
        }
    });
    $.extend($.ui.selectable, {
        version: "1.8.21"
    });
}
)(jQuery);
/*!
* jQuery UI Sortable 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Sortables
*
* Depends:
* jquery.ui.core.js
* jquery.ui.mouse.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    $.widget("ui.sortable", $.ui.mouse, {
        widgetEventPrefix: "sort",
        ready: false,
        options: {
            appendTo: "parent",
            axis: false,
            connectWith: false,
            containment: false,
            cursor: 'auto',
            cursorAt: false,
            dropOnEmpty: true,
            forcePlaceholderSize: false,
            forceHelperSize: false,
            grid: false,
            handle: false,
            helper: "original",
            items: '> *',
            opacity: false,
            placeholder: false,
            revert: false,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1000
        },
        _create: function() {
            var o = this.options;
            this.containerCache = {};
            this.element.addClass("ui-sortable");
            this.refresh();
            this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;
            this.offset = this.element.offset();
            this._mouseInit();
            this.ready = true
        },
        destroy: function() {
            $.Widget.prototype.destroy.call(this);
            this.element.removeClass("ui-sortable ui-sortable-disabled");
            this._mouseDestroy();
            for (var i = this.items.length - 1; i >= 0; i--)
                this.items[i].item.removeData(this.widgetName + "-item");
            return this;
        },
        _setOption: function(key, value) {
            if (key === "disabled") {
                this.options[key] = value;
                this.widget()[value ? "addClass" : "removeClass"]("ui-sortable-disabled");
            } else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        },
        _mouseCapture: function(event, overrideHandle) {
            var that = this;
            if (this.reverting) {
                return false;
            }
            if (this.options.disabled || this.options.type == 'static')
                return false;
            this._refreshItems(event);
            var currentItem = null
              , self = this
              , nodes = $(event.target).parents().each(function() {
                if ($.data(this, that.widgetName + '-item') == self) {
                    currentItem = $(this);
                    return false;
                }
            });
            if ($.data(event.target, that.widgetName + '-item') == self)
                currentItem = $(event.target);
            if (!currentItem)
                return false;
            if (this.options.handle && !overrideHandle) {
                var validHandle = false;
                $(this.options.handle, currentItem).find("*").andSelf().each(function() {
                    if (this == event.target)
                        validHandle = true;
                });
                if (!validHandle)
                    return false;
            }
            this.currentItem = currentItem;
            this._removeCurrentsFromItems();
            return true;
        },
        _mouseStart: function(event, overrideHandle, noActivation) {
            var o = this.options
              , self = this;
            this.currentContainer = this;
            this.refreshPositions();
            this.helper = this._createHelper(event);
            this._cacheHelperProportions();
            this._cacheMargins();
            this.scrollParent = this.helper.scrollParent();
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };
            $.extend(this.offset, {
                click: {
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            });
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");
            this.originalPosition = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
            this.domPosition = {
                prev: this.currentItem.prev()[0],
                parent: this.currentItem.parent()[0]
            };
            if (this.helper[0] != this.currentItem[0]) {
                this.currentItem.hide();
            }
            this._createPlaceholder();
            if (o.containment)
                this._setContainment();
            if (o.cursor) {
                if ($('body').css("cursor"))
                    this._storedCursor = $('body').css("cursor");
                $('body').css("cursor", o.cursor);
            }
            if (o.opacity) {
                if (this.helper.css("opacity"))
                    this._storedOpacity = this.helper.css("opacity");
                this.helper.css("opacity", o.opacity);
            }
            if (o.zIndex) {
                if (this.helper.css("zIndex"))
                    this._storedZIndex = this.helper.css("zIndex");
                this.helper.css("zIndex", o.zIndex);
            }
            if (this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
                this.overflowOffset = this.scrollParent.offset();
            this._trigger("start", event, this._uiHash());
            if (!this._preserveHelperProportions)
                this._cacheHelperProportions();
            if (!noActivation) {
                for (var i = this.containers.length - 1; i >= 0; i--) {
                    this.containers[i]._trigger("activate", event, self._uiHash(this));
                }
            }
            if ($.ui.ddmanager)
                $.ui.ddmanager.current = this;
            if ($.ui.ddmanager && !o.dropBehaviour)
                $.ui.ddmanager.prepareOffsets(this, event);
            this.dragging = true;
            this.helper.addClass("ui-sortable-helper");
            this._mouseDrag(event);
            return true;
        },
        _mouseDrag: function(event) {
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.lastPositionAbs) {
                this.lastPositionAbs = this.positionAbs;
            }
            if (this.options.scroll) {
                var o = this.options
                  , scrolled = false;
                if (this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {
                    if ((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
                    else if (event.pageY - this.overflowOffset.top < o.scrollSensitivity)
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
                    if ((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
                    else if (event.pageX - this.overflowOffset.left < o.scrollSensitivity)
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
                } else {
                    if (event.pageY - $(document).scrollTop() < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                    if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                }
                if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
                    $.ui.ddmanager.prepareOffsets(this, event);
            }
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.options.axis || this.options.axis != "y")
                this.helper[0].style.left = this.position.left + 'px';
            if (!this.options.axis || this.options.axis != "x")
                this.helper[0].style.top = this.position.top + 'px';
            for (var i = this.items.length - 1; i >= 0; i--) {
                var item = this.items[i]
                  , itemElement = item.item[0]
                  , intersection = this._intersectsWithPointer(item);
                if (!intersection)
                    continue;
                if (itemElement != this.currentItem[0] && this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement && !$.ui.contains(this.placeholder[0], itemElement) && (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)) {
                    this.direction = intersection == 1 ? "down" : "up";
                    if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
                        this._rearrange(event, item);
                    } else {
                        break;
                    }
                    this._trigger("change", event, this._uiHash());
                    break;
                }
            }
            this._contactContainers(event);
            if ($.ui.ddmanager)
                $.ui.ddmanager.drag(this, event);
            this._trigger('sort', event, this._uiHash());
            this.lastPositionAbs = this.positionAbs;
            return false;
        },
        _mouseStop: function(event, noPropagation) {
            if (!event)
                return;
            if ($.ui.ddmanager && !this.options.dropBehaviour)
                $.ui.ddmanager.drop(this, event);
            if (this.options.revert) {
                var self = this;
                var cur = self.placeholder.offset();
                self.reverting = true;
                $(this.helper).animate({
                    left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
                    top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
                }, parseInt(this.options.revert, 10) || 500, function() {
                    self._clear(event);
                });
            } else {
                this._clear(event, noPropagation);
            }
            return false;
        },
        cancel: function() {
            var self = this;
            if (this.dragging) {
                this._mouseUp({
                    target: null
                });
                if (this.options.helper == "original")
                    this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
                else
                    this.currentItem.show();
                for (var i = this.containers.length - 1; i >= 0; i--) {
                    this.containers[i]._trigger("deactivate", null, self._uiHash(this));
                    if (this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", null, self._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }
            }
            if (this.placeholder) {
                if (this.placeholder[0].parentNode)
                    this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
                if (this.options.helper != "original" && this.helper && this.helper[0].parentNode)
                    this.helper.remove();
                $.extend(this, {
                    helper: null,
                    dragging: false,
                    reverting: false,
                    _noFinalSort: null
                });
                if (this.domPosition.prev) {
                    $(this.domPosition.prev).after(this.currentItem);
                } else {
                    $(this.domPosition.parent).prepend(this.currentItem);
                }
            }
            return this;
        },
        serialize: function(o) {
            var items = this._getItemsAsjQuery(o && o.connected);
            var str = [];
            o = o || {};
            $(items).each(function() {
                var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
                if (res)
                    str.push((o.key || res[1] + '[]') + '=' + (o.key && o.expression ? res[1] : res[2]));
            });
            if (!str.length && o.key) {
                str.push(o.key + '=');
            }
            return str.join('&');
        },
        toArray: function(o) {
            var items = this._getItemsAsjQuery(o && o.connected);
            var ret = [];
            o = o || {};
            items.each(function() {
                ret.push($(o.item || this).attr(o.attribute || 'id') || '');
            });
            return ret;
        },
        _intersectsWith: function(item) {
            var x1 = this.positionAbs.left
              , x2 = x1 + this.helperProportions.width
              , y1 = this.positionAbs.top
              , y2 = y1 + this.helperProportions.height;
            var l = item.left
              , r = l + item.width
              , t = item.top
              , b = t + item.height;
            var dyClick = this.offset.click.top
              , dxClick = this.offset.click.left;
            var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;
            if (this.options.tolerance == "pointer" || this.options.forcePointerForContainers || (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])) {
                return isOverElement;
            } else {
                return (l < x1 + (this.helperProportions.width / 2) && x2 - (this.helperProportions.width / 2) < r && t < y1 + (this.helperProportions.height / 2) && y2 - (this.helperProportions.height / 2) < b);
            }
        },
        _intersectsWithPointer: function(item) {
            var isOverElementHeight = (this.options.axis === 'x') || $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height)
              , isOverElementWidth = (this.options.axis === 'y') || $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width)
              , isOverElement = isOverElementHeight && isOverElementWidth
              , verticalDirection = this._getDragVerticalDirection()
              , horizontalDirection = this._getDragHorizontalDirection();
            if (!isOverElement)
                return false;
            return this.floating ? (((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1) : (verticalDirection && (verticalDirection == "down" ? 2 : 1));
        },
        _intersectsWithSides: function(item) {
            var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height / 2), item.height)
              , isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width / 2), item.width)
              , verticalDirection = this._getDragVerticalDirection()
              , horizontalDirection = this._getDragHorizontalDirection();
            if (this.floating && horizontalDirection) {
                return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
            } else {
                return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
            }
        },
        _getDragVerticalDirection: function() {
            var delta = this.positionAbs.top - this.lastPositionAbs.top;
            return delta != 0 && (delta > 0 ? "down" : "up");
        },
        _getDragHorizontalDirection: function() {
            var delta = this.positionAbs.left - this.lastPositionAbs.left;
            return delta != 0 && (delta > 0 ? "right" : "left");
        },
        refresh: function(event) {
            this._refreshItems(event);
            this.refreshPositions();
            return this;
        },
        _connectWith: function() {
            var options = this.options;
            return options.connectWith.constructor == String ? [options.connectWith] : options.connectWith;
        },
        _getItemsAsjQuery: function(connected) {
            var self = this;
            var items = [];
            var queries = [];
            var connectWith = this._connectWith();
            if (connectWith && connected) {
                for (var i = connectWith.length - 1; i >= 0; i--) {
                    var cur = $(connectWith[i]);
                    for (var j = cur.length - 1; j >= 0; j--) {
                        var inst = $.data(cur[j], this.widgetName);
                        if (inst && inst != this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
                        }
                    }
                    ;
                }
                ;
            }
            queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
                options: this.options,
                item: this.currentItem
            }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);
            for (var i = queries.length - 1; i >= 0; i--) {
                queries[i][0].each(function() {
                    items.push(this);
                });
            }
            ;return $(items);
        },
        _removeCurrentsFromItems: function() {
            var list = this.currentItem.find(":data(" + this.widgetName + "-item)");
            for (var i = 0; i < this.items.length; i++) {
                for (var j = 0; j < list.length; j++) {
                    if (list[j] == this.items[i].item[0])
                        this.items.splice(i, 1);
                }
                ;
            }
            ;
        },
        _refreshItems: function(event) {
            this.items = [];
            this.containers = [this];
            var items = this.items;
            var self = this;
            var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, {
                item: this.currentItem
            }) : $(this.options.items, this.element), this]];
            var connectWith = this._connectWith();
            if (connectWith && this.ready) {
                for (var i = connectWith.length - 1; i >= 0; i--) {
                    var cur = $(connectWith[i]);
                    for (var j = cur.length - 1; j >= 0; j--) {
                        var inst = $.data(cur[j], this.widgetName);
                        if (inst && inst != this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, {
                                item: this.currentItem
                            }) : $(inst.options.items, inst.element), inst]);
                            this.containers.push(inst);
                        }
                    }
                    ;
                }
                ;
            }
            for (var i = queries.length - 1; i >= 0; i--) {
                var targetData = queries[i][1];
                var _queries = queries[i][0];
                for (var j = 0, queriesLength = _queries.length; j < queriesLength; j++) {
                    var item = $(_queries[j]);
                    item.data(this.widgetName + '-item', targetData);
                    items.push({
                        item: item,
                        instance: targetData,
                        width: 0,
                        height: 0,
                        left: 0,
                        top: 0
                    });
                }
                ;
            }
            ;
        },
        refreshPositions: function(fast) {
            if (this.offsetParent && this.helper) {
                this.offset.parent = this._getParentOffset();
            }
            for (var i = this.items.length - 1; i >= 0; i--) {
                var item = this.items[i];
                if (item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
                    continue;
                var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
                if (!fast) {
                    item.width = t.outerWidth();
                    item.height = t.outerHeight();
                }
                var p = t.offset();
                item.left = p.left;
                item.top = p.top;
            }
            ;if (this.options.custom && this.options.custom.refreshContainers) {
                this.options.custom.refreshContainers.call(this);
            } else {
                for (var i = this.containers.length - 1; i >= 0; i--) {
                    var p = this.containers[i].element.offset();
                    this.containers[i].containerCache.left = p.left;
                    this.containers[i].containerCache.top = p.top;
                    this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
                    this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
                }
                ;
            }
            return this;
        },
        _createPlaceholder: function(that) {
            var self = that || this
              , o = self.options;
            if (!o.placeholder || o.placeholder.constructor == String) {
                var className = o.placeholder;
                o.placeholder = {
                    element: function() {
                        var el = $(document.createElement(self.currentItem[0].nodeName)).addClass(className || self.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];
                        if (!className)
                            el.style.visibility = "hidden";
                        return el;
                    },
                    update: function(container, p) {
                        if (className && !o.forcePlaceholderSize)
                            return;
                        if (!p.height()) {
                            p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop') || 0, 10) - parseInt(self.currentItem.css('paddingBottom') || 0, 10));
                        }
                        ;if (!p.width()) {
                            p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft') || 0, 10) - parseInt(self.currentItem.css('paddingRight') || 0, 10));
                        }
                        ;
                    }
                };
            }
            self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));
            self.currentItem.after(self.placeholder);
            o.placeholder.update(self, self.placeholder);
        },
        _contactContainers: function(event) {
            var innermostContainer = null
              , innermostIndex = null;
            for (var i = this.containers.length - 1; i >= 0; i--) {
                if ($.ui.contains(this.currentItem[0], this.containers[i].element[0]))
                    continue;
                if (this._intersectsWith(this.containers[i].containerCache)) {
                    if (innermostContainer && $.ui.contains(this.containers[i].element[0], innermostContainer.element[0]))
                        continue;
                    innermostContainer = this.containers[i];
                    innermostIndex = i;
                } else {
                    if (this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", event, this._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }
            }
            if (!innermostContainer)
                return;
            if (this.containers.length === 1) {
                this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                this.containers[innermostIndex].containerCache.over = 1;
            } else if (this.currentContainer != this.containers[innermostIndex]) {
                var dist = 10000;
                var itemWithLeastDistance = null;
                var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top'];
                for (var j = this.items.length - 1; j >= 0; j--) {
                    if (!$.ui.contains(this.containers[innermostIndex].element[0], this.items[j].item[0]))
                        continue;
                    var cur = this.containers[innermostIndex].floating ? this.items[j].item.offset().left : this.items[j].item.offset().top;
                    if (Math.abs(cur - base) < dist) {
                        dist = Math.abs(cur - base);
                        itemWithLeastDistance = this.items[j];
                        this.direction = (cur - base > 0) ? 'down' : 'up';
                    }
                }
                if (!itemWithLeastDistance && !this.options.dropOnEmpty)
                    return;
                this.currentContainer = this.containers[innermostIndex];
                itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
                this._trigger("change", event, this._uiHash());
                this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
                this.options.placeholder.update(this.currentContainer, this.placeholder);
                this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                this.containers[innermostIndex].containerCache.over = 1;
            }
        },
        _createHelper: function(event) {
            var o = this.options;
            var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);
            if (!helper.parents('body').length)
                $(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
            if (helper[0] == this.currentItem[0])
                this._storedCSS = {
                    width: this.currentItem[0].style.width,
                    height: this.currentItem[0].style.height,
                    position: this.currentItem.css("position"),
                    top: this.currentItem.css("top"),
                    left: this.currentItem.css("left")
                };
            if (helper[0].style.width == '' || o.forceHelperSize)
                helper.width(this.currentItem.width());
            if (helper[0].style.height == '' || o.forceHelperSize)
                helper.height(this.currentItem.height());
            return helper;
        },
        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj == 'string') {
                obj = obj.split(' ');
            }
            if ($.isArray(obj)) {
                obj = {
                    left: +obj[0],
                    top: +obj[1] || 0
                };
            }
            if ('left'in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ('right'in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ('top'in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ('bottom'in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },
        _getParentOffset: function() {
            this.offsetParent = this.helper.offsetParent();
            var po = this.offsetParent.offset();
            if (this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }
            if ((this.offsetParent[0] == document.body) || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie))
                po = {
                    top: 0,
                    left: 0
                };
            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            };
        },
        _getRelativeOffset: function() {
            if (this.cssPosition == "relative") {
                var p = this.currentItem.position();
                return {
                    top: p.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
                    left: p.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
                };
            } else {
                return {
                    top: 0,
                    left: 0
                };
            }
        },
        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.currentItem.css("marginLeft"), 10) || 0),
                top: (parseInt(this.currentItem.css("marginTop"), 10) || 0)
            };
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },
        _setContainment: function() {
            var o = this.options;
            if (o.containment == 'parent')
                o.containment = this.helper[0].parentNode;
            if (o.containment == 'document' || o.containment == 'window')
                this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left, ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
            if (!(/^(document|window|parent)$/).test(o.containment)) {
                var ce = $(o.containment)[0];
                var co = $(o.containment).offset();
                var over = ($(ce).css("overflow") != 'hidden');
                this.containment = [co.left + (parseInt($(ce).css("borderLeftWidth"), 10) || 0) + (parseInt($(ce).css("paddingLeft"), 10) || 0) - this.margins.left, co.top + (parseInt($(ce).css("borderTopWidth"), 10) || 0) + (parseInt($(ce).css("paddingTop"), 10) || 0) - this.margins.top, co.left + (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"), 10) || 0) - (parseInt($(ce).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, co.top + (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"), 10) || 0) - (parseInt($(ce).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top];
            }
        },
        _convertPositionTo: function(d, pos) {
            if (!pos)
                pos = this.position;
            var mod = d == "absolute" ? 1 : -1;
            var o = this.options
              , scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent
              , scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            return {
                top: (pos.top + this.offset.relative.top * mod + this.offset.parent.top * mod - ($.browser.safari && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)),
                left: (pos.left + this.offset.relative.left * mod + this.offset.parent.left * mod - ($.browser.safari && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod))
            };
        },
        _generatePosition: function(event) {
            var o = this.options
              , scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent
              , scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            if (this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
                this.offset.relative = this._getRelativeOffset();
            }
            var pageX = event.pageX;
            var pageY = event.pageY;
            if (this.originalPosition) {
                if (this.containment) {
                    if (event.pageX - this.offset.click.left < this.containment[0])
                        pageX = this.containment[0] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top < this.containment[1])
                        pageY = this.containment[1] + this.offset.click.top;
                    if (event.pageX - this.offset.click.left > this.containment[2])
                        pageX = this.containment[2] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top > this.containment[3])
                        pageY = this.containment[3] + this.offset.click.top;
                }
                if (o.grid) {
                    var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
                    pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
                    var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
                    pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }
            }
            return {
                top: (pageY - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ($.browser.safari && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())))),
                left: (pageX - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ($.browser.safari && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft())))
            };
        },
        _rearrange: function(event, i, a, hardRefresh) {
            a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));
            this.counter = this.counter ? ++this.counter : 1;
            var self = this
              , counter = this.counter;
            window.setTimeout(function() {
                if (counter == self.counter)
                    self.refreshPositions(!hardRefresh);
            }, 0);
        },
        _clear: function(event, noPropagation) {
            this.reverting = false;
            var delayedTriggers = []
              , self = this;
            if (!this._noFinalSort && this.currentItem.parent().length)
                this.placeholder.before(this.currentItem);
            this._noFinalSort = null;
            if (this.helper[0] == this.currentItem[0]) {
                for (var i in this._storedCSS) {
                    if (this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static')
                        this._storedCSS[i] = '';
                }
                this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
            } else {
                this.currentItem.show();
            }
            if (this.fromOutside && !noPropagation)
                delayedTriggers.push(function(event) {
                    this._trigger("receive", event, this._uiHash(this.fromOutside));
                });
            if ((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation)
                delayedTriggers.push(function(event) {
                    this._trigger("update", event, this._uiHash());
                });
            if (!$.ui.contains(this.element[0], this.currentItem[0])) {
                if (!noPropagation)
                    delayedTriggers.push(function(event) {
                        this._trigger("remove", event, this._uiHash());
                    });
                for (var i = this.containers.length - 1; i >= 0; i--) {
                    if ($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
                        delayedTriggers.push((function(c) {
                            return function(event) {
                                c._trigger("receive", event, this._uiHash(this));
                            }
                            ;
                        }
                        ).call(this, this.containers[i]));
                        delayedTriggers.push((function(c) {
                            return function(event) {
                                c._trigger("update", event, this._uiHash(this));
                            }
                            ;
                        }
                        ).call(this, this.containers[i]));
                    }
                }
                ;
            }
            ;for (var i = this.containers.length - 1; i >= 0; i--) {
                if (!noPropagation)
                    delayedTriggers.push((function(c) {
                        return function(event) {
                            c._trigger("deactivate", event, this._uiHash(this));
                        }
                        ;
                    }
                    ).call(this, this.containers[i]));
                if (this.containers[i].containerCache.over) {
                    delayedTriggers.push((function(c) {
                        return function(event) {
                            c._trigger("out", event, this._uiHash(this));
                        }
                        ;
                    }
                    ).call(this, this.containers[i]));
                    this.containers[i].containerCache.over = 0;
                }
            }
            if (this._storedCursor)
                $('body').css("cursor", this._storedCursor);
            if (this._storedOpacity)
                this.helper.css("opacity", this._storedOpacity);
            if (this._storedZIndex)
                this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex);
            this.dragging = false;
            if (this.cancelHelperRemoval) {
                if (!noPropagation) {
                    this._trigger("beforeStop", event, this._uiHash());
                    for (var i = 0; i < delayedTriggers.length; i++) {
                        delayedTriggers[i].call(this, event);
                    }
                    ;this._trigger("stop", event, this._uiHash());
                }
                return false;
            }
            if (!noPropagation)
                this._trigger("beforeStop", event, this._uiHash());
            this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            if (this.helper[0] != this.currentItem[0])
                this.helper.remove();
            this.helper = null;
            if (!noPropagation) {
                for (var i = 0; i < delayedTriggers.length; i++) {
                    delayedTriggers[i].call(this, event);
                }
                ;this._trigger("stop", event, this._uiHash());
            }
            this.fromOutside = false;
            return true;
        },
        _trigger: function() {
            if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
                this.cancel();
            }
        },
        _uiHash: function(inst) {
            var self = inst || this;
            return {
                helper: self.helper,
                placeholder: self.placeholder || $([]),
                position: self.position,
                originalPosition: self.originalPosition,
                offset: self.positionAbs,
                item: self.currentItem,
                sender: inst ? inst.element : null
            };
        }
    });
    $.extend($.ui.sortable, {
        version: "1.8.21"
    });
}
)(jQuery);
/*!
* jQuery UI Autocomplete 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Autocomplete
*
* Depends:
* jquery.ui.core.js
* jquery.ui.widget.js
* jquery.ui.position.js
*/
(function($, undefined) {
    var requestIndex = 0;
    $.widget("ui.autocomplete", {
        options: {
            appendTo: "body",
            autoFocus: false,
            delay: 300,
            minLength: 1,
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            source: null
        },
        pending: 0,
        _create: function() {
            var self = this, doc = this.element[0].ownerDocument, suppressKeyPress;
            this.isMultiLine = this.element.is("textarea");
            this.element.addClass("ui-autocomplete-input").attr("autocomplete", "off").attr({
                role: "textbox",
                "aria-autocomplete": "list",
                "aria-haspopup": "true"
            }).bind("keydown.autocomplete", function(event) {
                if (self.options.disabled || self.element.propAttr("readOnly")) {
                    return;
                }
                suppressKeyPress = false;
                var keyCode = $.ui.keyCode;
                switch (event.keyCode) {
                case keyCode.PAGE_UP:
                    self._move("previousPage", event);
                    break;
                case keyCode.PAGE_DOWN:
                    self._move("nextPage", event);
                    break;
                case keyCode.UP:
                    self._keyEvent("previous", event);
                    break;
                case keyCode.DOWN:
                    self._keyEvent("next", event);
                    break;
                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                    if (self.menu.active) {
                        suppressKeyPress = true;
                        event.preventDefault();
                    }
                case keyCode.TAB:
                    if (!self.menu.active) {
                        return;
                    }
                    self.menu.select(event);
                    break;
                case keyCode.ESCAPE:
                    self.element.val(self.term);
                    self.close(event);
                    break;
                default:
                    clearTimeout(self.searching);
                    self.searching = setTimeout(function() {
                        if (self.term != self.element.val()) {
                            self.selectedItem = null;
                            self.search(null, event);
                        }
                    }, self.options.delay);
                    break;
                }
            }).bind("keypress.autocomplete", function(event) {
                if (suppressKeyPress) {
                    suppressKeyPress = false;
                    event.preventDefault();
                }
            }).bind("focus.autocomplete", function() {
                if (self.options.disabled) {
                    return;
                }
                self.selectedItem = null;
                self.previous = self.element.val();
            }).bind("blur.autocomplete", function(event) {
                if (self.options.disabled) {
                    return;
                }
                clearTimeout(self.searching);
                self.closing = setTimeout(function() {
                    self.close(event);
                    self._change(event);
                }, 150);
            });
            this._initSource();
            this.menu = $("<ul></ul>").addClass("ui-autocomplete").appendTo($(this.options.appendTo || "body", doc)[0]).mousedown(function(event) {
                var menuElement = self.menu.element[0];
                if (!$(event.target).closest(".ui-menu-item").length) {
                    setTimeout(function() {
                        $(document).one('mousedown', function(event) {
                            if (event.target !== self.element[0] && event.target !== menuElement && !$.ui.contains(menuElement, event.target)) {
                                self.close();
                            }
                        });
                    }, 1);
                }
                setTimeout(function() {
                    clearTimeout(self.closing);
                }, 13);
            }).menu({
                focus: function(event, ui) {
                    var item = ui.item.data("item.autocomplete");
                    if (false !== self._trigger("focus", event, {
                        item: item
                    })) {
                        if (/^key/.test(event.originalEvent.type)) {
                            self.element.val(item.value);
                        }
                    }
                },
                selected: function(event, ui) {
                    var item = ui.item.data("item.autocomplete")
                      , previous = self.previous;
                    if (self.element[0] !== doc.activeElement) {
                        self.element.focus();
                        self.previous = previous;
                        setTimeout(function() {
                            self.previous = previous;
                            self.selectedItem = item;
                        }, 1);
                    }
                    if (false !== self._trigger("select", event, {
                        item: item
                    })) {
                        self.element.val(item.value);
                    }
                    self.term = self.element.val();
                    self.close(event);
                    self.selectedItem = item;
                },
                blur: function(event, ui) {
                    if (self.menu.element.is(":visible") && (self.element.val() !== self.term)) {
                        self.element.val(self.term);
                    }
                }
            }).zIndex(this.element.zIndex() + 1).css({
                top: 0,
                left: 0
            }).hide().data("menu");
            if ($.fn.bgiframe) {
                this.menu.element.bgiframe();
            }
            self.beforeunloadHandler = function() {
                self.element.removeAttr("autocomplete");
            }
            ;
            $(window).bind("beforeunload", self.beforeunloadHandler);
        },
        destroy: function() {
            this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");
            this.menu.element.remove();
            $(window).unbind("beforeunload", this.beforeunloadHandler);
            $.Widget.prototype.destroy.call(this);
        },
        _setOption: function(key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === "source") {
                this._initSource();
            }
            if (key === "appendTo") {
                this.menu.element.appendTo($(value || "body", this.element[0].ownerDocument)[0])
            }
            if (key === "disabled" && value && this.xhr) {
                this.xhr.abort();
            }
        },
        _initSource: function() {
            var self = this, array, url;
            if ($.isArray(this.options.source)) {
                array = this.options.source;
                this.source = function(request, response) {
                    response($.ui.autocomplete.filter(array, request.term));
                }
                ;
            } else if (typeof this.options.source === "string") {
                url = this.options.source;
                this.source = function(request, response) {
                    if (self.xhr) {
                        self.xhr.abort();
                    }
                    self.xhr = $.ajax({
                        url: url,
                        data: request,
                        dataType: "json",
                        success: function(data, status) {
                            response(data);
                        },
                        error: function() {
                            response([]);
                        }
                    });
                }
                ;
            } else {
                this.source = this.options.source;
            }
        },
        search: function(value, event) {
            value = value != null ? value : this.element.val();
            this.term = this.element.val();
            if (value.length < this.options.minLength) {
                return this.close(event);
            }
            clearTimeout(this.closing);
            if (this._trigger("search", event) === false) {
                return;
            }
            return this._search(value);
        },
        _search: function(value) {
            this.pending++;
            this.element.addClass("ui-autocomplete-loading");
            this.source({
                term: value
            }, this._response());
        },
        _response: function() {
            var that = this
              , index = ++requestIndex;
            return function(content) {
                if (index === requestIndex) {
                    that.__response(content);
                }
                that.pending--;
                if (!that.pending) {
                    that.element.removeClass("ui-autocomplete-loading");
                }
            }
            ;
        },
        __response: function(content) {
            if (!this.options.disabled && content && content.length) {
                content = this._normalize(content);
                this._suggest(content);
                this._trigger("open");
            } else {
                this.close();
            }
        },
        close: function(event) {
            clearTimeout(this.closing);
            if (this.menu.element.is(":visible")) {
                this.menu.element.hide();
                this.menu.deactivate();
                this._trigger("close", event);
            }
        },
        _change: function(event) {
            if (this.previous !== this.element.val()) {
                this._trigger("change", event, {
                    item: this.selectedItem
                });
            }
        },
        _normalize: function(items) {
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            return $.map(items, function(item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({
                    label: item.label || item.value,
                    value: item.value || item.label
                }, item);
            });
        },
        _suggest: function(items) {
            var ul = this.menu.element.empty().zIndex(this.element.zIndex() + 1);
            this._renderMenu(ul, items);
            this.menu.deactivate();
            this.menu.refresh();
            ul.show();
            this._resizeMenu();
            ul.position($.extend({
                of: this.element
            }, this.options.position));
            if (this.options.autoFocus) {
                this.menu.next(new $.Event("mouseover"));
            }
        },
        _resizeMenu: function() {
            var ul = this.menu.element;
            ul.outerWidth(Math.max(ul.width("").outerWidth() + 1, this.element.outerWidth()));
        },
        _renderMenu: function(ul, items) {
            var self = this;
            $.each(items, function(index, item) {
                self._renderItem(ul, item);
            });
        },
        _renderItem: function(ul, item) {
            return $("<li></li>").data("item.autocomplete", item).append($("<a></a>").text(item.label)).appendTo(ul);
        },
        _move: function(direction, event) {
            if (!this.menu.element.is(":visible")) {
                this.search(null, event);
                return;
            }
            if (this.menu.first() && /^previous/.test(direction) || this.menu.last() && /^next/.test(direction)) {
                this.element.val(this.term);
                this.menu.deactivate();
                return;
            }
            this.menu[direction](event);
        },
        widget: function() {
            return this.menu.element;
        },
        _keyEvent: function(keyEvent, event) {
            if (!this.isMultiLine || this.menu.element.is(":visible")) {
                this._move(keyEvent, event);
                event.preventDefault();
            }
        }
    });
    $.extend($.ui.autocomplete, {
        escapeRegex: function(value) {
            return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        filter: function(array, term) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(term),"i");
            return $.grep(array, function(value) {
                return matcher.test(value.label || value.value || value);
            });
        }
    });
}(jQuery));
(function($) {
    $.widget("ui.menu", {
        _create: function() {
            var self = this;
            this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({
                role: "listbox",
                "aria-activedescendant": "ui-active-menuitem"
            }).click(function(event) {
                if (!$(event.target).closest(".ui-menu-item a").length) {
                    return;
                }
                event.preventDefault();
                self.select(event);
            });
            this.refresh();
        },
        refresh: function() {
            var self = this;
            var items = this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role", "menuitem");
            items.children("a").addClass("ui-corner-all").attr("tabindex", -1).mouseenter(function(event) {
                self.activate(event, $(this).parent());
            }).mouseleave(function() {
                self.deactivate();
            });
        },
        activate: function(event, item) {
            this.deactivate();
            if (this.hasScroll()) {
                var offset = item.offset().top - this.element.offset().top
                  , scroll = this.element.scrollTop()
                  , elementHeight = this.element.height();
                if (offset < 0) {
                    this.element.scrollTop(scroll + offset);
                } else if (offset >= elementHeight) {
                    this.element.scrollTop(scroll + offset - elementHeight + item.height());
                }
            }
            this.active = item.eq(0).children("a").addClass("ui-state-hover").attr("id", "ui-active-menuitem").end();
            this._trigger("focus", event, {
                item: item
            });
        },
        deactivate: function() {
            if (!this.active) {
                return;
            }
            this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
            this._trigger("blur");
            this.active = null;
        },
        next: function(event) {
            this.move("next", ".ui-menu-item:first", event);
        },
        previous: function(event) {
            this.move("prev", ".ui-menu-item:last", event);
        },
        first: function() {
            return this.active && !this.active.prevAll(".ui-menu-item").length;
        },
        last: function() {
            return this.active && !this.active.nextAll(".ui-menu-item").length;
        },
        move: function(direction, edge, event) {
            if (!this.active) {
                this.activate(event, this.element.children(edge));
                return;
            }
            var next = this.active[direction + "All"](".ui-menu-item").eq(0);
            if (next.length) {
                this.activate(event, next);
            } else {
                this.activate(event, this.element.children(edge));
            }
        },
        nextPage: function(event) {
            if (this.hasScroll()) {
                if (!this.active || this.last()) {
                    this.activate(event, this.element.children(".ui-menu-item:first"));
                    return;
                }
                var base = this.active.offset().top
                  , height = this.element.height()
                  , result = this.element.children(".ui-menu-item").filter(function() {
                    var close = $(this).offset().top - base - height + $(this).height();
                    return close < 10 && close > -10;
                });
                if (!result.length) {
                    result = this.element.children(".ui-menu-item:last");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(".ui-menu-item").filter(!this.active || this.last() ? ":first" : ":last"));
            }
        },
        previousPage: function(event) {
            if (this.hasScroll()) {
                if (!this.active || this.first()) {
                    this.activate(event, this.element.children(".ui-menu-item:last"));
                    return;
                }
                var base = this.active.offset().top
                  , height = this.element.height()
                  , result = this.element.children(".ui-menu-item").filter(function() {
                    var close = $(this).offset().top - base + height - $(this).height();
                    return close < 10 && close > -10;
                });
                if (!result.length) {
                    result = this.element.children(".ui-menu-item:first");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(".ui-menu-item").filter(!this.active || this.first() ? ":last" : ":first"));
            }
        },
        hasScroll: function() {
            return this.element.height() < this.element[$.fn.prop ? "prop" : "attr"]("scrollHeight");
        },
        select: function(event) {
            this._trigger("selected", event, {
                item: this.active
            });
        }
    });
}(jQuery));
/*!
* jQuery UI Button 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Button
*
* Depends:
* jquery.ui.core.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    var lastActive, startXPos, startYPos, clickDragged, baseClasses = "ui-button ui-widget ui-state-default ui-corner-all", stateClasses = "ui-state-hover ui-state-active ", typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only", formResetHandler = function() {
        var buttons = $(this).find(":ui-button");
        setTimeout(function() {
            buttons.button("refresh");
        }, 1);
    }, radioGroup = function(radio) {
        var name = radio.name
          , form = radio.form
          , radios = $([]);
        if (name) {
            if (form) {
                radios = $(form).find("[name='" + name + "']");
            } else {
                radios = $("[name='" + name + "']", radio.ownerDocument).filter(function() {
                    return !this.form;
                });
            }
        }
        return radios;
    };
    $.widget("ui.button", {
        options: {
            disabled: null,
            text: true,
            label: null,
            icons: {
                primary: null,
                secondary: null
            }
        },
        _create: function() {
            this.element.closest("form").unbind("reset.button").bind("reset.button", formResetHandler);
            if (typeof this.options.disabled !== "boolean") {
                this.options.disabled = !!this.element.propAttr("disabled");
            } else {
                this.element.propAttr("disabled", this.options.disabled);
            }
            this._determineButtonType();
            this.hasTitle = !!this.buttonElement.attr("title");
            var self = this
              , options = this.options
              , toggleButton = this.type === "checkbox" || this.type === "radio"
              , hoverClass = "ui-state-hover" + (!toggleButton ? " ui-state-active" : "")
              , focusClass = "ui-state-focus";
            if (options.label === null) {
                options.label = this.buttonElement.html();
            }
            this.buttonElement.addClass(baseClasses).attr("role", "button").bind("mouseenter.button", function() {
                if (options.disabled) {
                    return;
                }
                $(this).addClass("ui-state-hover");
                if (this === lastActive) {
                    $(this).addClass("ui-state-active");
                }
            }).bind("mouseleave.button", function() {
                if (options.disabled) {
                    return;
                }
                $(this).removeClass(hoverClass);
            }).bind("click.button", function(event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
            this.element.bind("focus.button", function() {
                self.buttonElement.addClass(focusClass);
            }).bind("blur.button", function() {
                self.buttonElement.removeClass(focusClass);
            });
            if (toggleButton) {
                this.element.bind("change.button", function() {
                    if (clickDragged) {
                        return;
                    }
                    self.refresh();
                });
                this.buttonElement.bind("mousedown.button", function(event) {
                    if (options.disabled) {
                        return;
                    }
                    clickDragged = false;
                    startXPos = event.pageX;
                    startYPos = event.pageY;
                }).bind("mouseup.button", function(event) {
                    if (options.disabled) {
                        return;
                    }
                    if (startXPos !== event.pageX || startYPos !== event.pageY) {
                        clickDragged = true;
                    }
                });
            }
            if (this.type === "checkbox") {
                this.buttonElement.bind("click.button", function() {
                    if (options.disabled || clickDragged) {
                        return false;
                    }
                    $(this).toggleClass("ui-state-active");
                    self.buttonElement.attr("aria-pressed", self.element[0].checked);
                });
            } else if (this.type === "radio") {
                this.buttonElement.bind("click.button", function() {
                    if (options.disabled || clickDragged) {
                        return false;
                    }
                    $(this).addClass("ui-state-active");
                    self.buttonElement.attr("aria-pressed", "true");
                    var radio = self.element[0];
                    radioGroup(radio).not(radio).map(function() {
                        return $(this).button("widget")[0];
                    }).removeClass("ui-state-active").attr("aria-pressed", "false");
                });
            } else {
                this.buttonElement.bind("mousedown.button", function() {
                    if (options.disabled) {
                        return false;
                    }
                    $(this).addClass("ui-state-active");
                    lastActive = this;
                    $(document).one("mouseup", function() {
                        lastActive = null;
                    });
                }).bind("mouseup.button", function() {
                    if (options.disabled) {
                        return false;
                    }
                    $(this).removeClass("ui-state-active");
                }).bind("keydown.button", function(event) {
                    if (options.disabled) {
                        return false;
                    }
                    if (event.keyCode == $.ui.keyCode.SPACE || event.keyCode == $.ui.keyCode.ENTER) {
                        $(this).addClass("ui-state-active");
                    }
                }).bind("keyup.button", function() {
                    $(this).removeClass("ui-state-active");
                });
                if (this.buttonElement.is("a")) {
                    this.buttonElement.keyup(function(event) {
                        if (event.keyCode === $.ui.keyCode.SPACE) {
                            $(this).click();
                        }
                    });
                }
            }
            this._setOption("disabled", options.disabled);
            this._resetButton();
        },
        _determineButtonType: function() {
            if (this.element.is(":checkbox")) {
                this.type = "checkbox";
            } else if (this.element.is(":radio")) {
                this.type = "radio";
            } else if (this.element.is("input")) {
                this.type = "input";
            } else {
                this.type = "button";
            }
            if (this.type === "checkbox" || this.type === "radio") {
                var ancestor = this.element.parents().filter(":last")
                  , labelSelector = "label[for='" + this.element.attr("id") + "']";
                this.buttonElement = ancestor.find(labelSelector);
                if (!this.buttonElement.length) {
                    ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
                    this.buttonElement = ancestor.filter(labelSelector);
                    if (!this.buttonElement.length) {
                        this.buttonElement = ancestor.find(labelSelector);
                    }
                }
                this.element.addClass("ui-helper-hidden-accessible");
                var checked = this.element.is(":checked");
                if (checked) {
                    this.buttonElement.addClass("ui-state-active");
                }
                this.buttonElement.attr("aria-pressed", checked);
            } else {
                this.buttonElement = this.element;
            }
        },
        widget: function() {
            return this.buttonElement;
        },
        destroy: function() {
            this.element.removeClass("ui-helper-hidden-accessible");
            this.buttonElement.removeClass(baseClasses + " " + stateClasses + " " + typeClasses).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());
            if (!this.hasTitle) {
                this.buttonElement.removeAttr("title");
            }
            $.Widget.prototype.destroy.call(this);
        },
        _setOption: function(key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === "disabled") {
                if (value) {
                    this.element.propAttr("disabled", true);
                } else {
                    this.element.propAttr("disabled", false);
                }
                return;
            }
            this._resetButton();
        },
        refresh: function() {
            var isDisabled = this.element.is(":disabled");
            if (isDisabled !== this.options.disabled) {
                this._setOption("disabled", isDisabled);
            }
            if (this.type === "radio") {
                radioGroup(this.element[0]).each(function() {
                    if ($(this).is(":checked")) {
                        $(this).button("widget").addClass("ui-state-active").attr("aria-pressed", "true");
                    } else {
                        $(this).button("widget").removeClass("ui-state-active").attr("aria-pressed", "false");
                    }
                });
            } else if (this.type === "checkbox") {
                if (this.element.is(":checked")) {
                    this.buttonElement.addClass("ui-state-active").attr("aria-pressed", "true");
                } else {
                    this.buttonElement.removeClass("ui-state-active").attr("aria-pressed", "false");
                }
            }
        },
        _resetButton: function() {
            if (this.type === "input") {
                if (this.options.label) {
                    this.element.val(this.options.label);
                }
                return;
            }
            var buttonElement = this.buttonElement.removeClass(typeClasses)
              , buttonText = $("<span></span>", this.element[0].ownerDocument).addClass("ui-button-text").html(this.options.label).appendTo(buttonElement.empty()).text()
              , icons = this.options.icons
              , multipleIcons = icons.primary && icons.secondary
              , buttonClasses = [];
            if (icons.primary || icons.secondary) {
                if (this.options.text) {
                    buttonClasses.push("ui-button-text-icon" + (multipleIcons ? "s" : (icons.primary ? "-primary" : "-secondary")));
                }
                if (icons.primary) {
                    buttonElement.prepend("<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>");
                }
                if (icons.secondary) {
                    buttonElement.append("<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>");
                }
                if (!this.options.text) {
                    buttonClasses.push(multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only");
                    if (!this.hasTitle) {
                        buttonElement.attr("title", buttonText);
                    }
                }
            } else {
                buttonClasses.push("ui-button-text-only");
            }
            buttonElement.addClass(buttonClasses.join(" "));
        }
    });
    $.widget("ui.buttonset", {
        options: {
            items: ":button, :submit, :reset, :checkbox, :radio, a, :data(button)"
        },
        _create: function() {
            this.element.addClass("ui-buttonset");
        },
        _init: function() {
            this.refresh();
        },
        _setOption: function(key, value) {
            if (key === "disabled") {
                this.buttons.button("option", key, value);
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        refresh: function() {
            var rtl = this.element.css("direction") === "rtl";
            this.buttons = this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function() {
                return $(this).button("widget")[0];
            }).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(rtl ? "ui-corner-right" : "ui-corner-left").end().filter(":last").addClass(rtl ? "ui-corner-left" : "ui-corner-right").end().end();
        },
        destroy: function() {
            this.element.removeClass("ui-buttonset");
            this.buttons.map(function() {
                return $(this).button("widget")[0];
            }).removeClass("ui-corner-left ui-corner-right").end().button("destroy");
            $.Widget.prototype.destroy.call(this);
        }
    });
}(jQuery));
/*!
* jQuery UI Slider 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Slider
*
* Depends:
* jquery.ui.core.js
* jquery.ui.mouse.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    var numPages = 5;
    $.widget("ui.slider", $.ui.mouse, {
        widgetEventPrefix: "slide",
        options: {
            animate: false,
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            range: false,
            step: 1,
            value: 0,
            values: null
        },
        _create: function() {
            var self = this
              , o = this.options
              , existingHandles = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all")
              , handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>"
              , handleCount = (o.values && o.values.length) || 1
              , handles = [];
            this._keySliding = false;
            this._mouseSliding = false;
            this._animateOff = true;
            this._handleIndex = null;
            this._detectOrientation();
            this._mouseInit();
            this.element.addClass("ui-slider" + " ui-slider-" + this.orientation + " ui-widget" + " ui-widget-content" + " ui-corner-all" + (o.disabled ? " ui-slider-disabled ui-disabled" : ""));
            this.range = $([]);
            if (o.range) {
                if (o.range === true) {
                    if (!o.values) {
                        o.values = [this._valueMin(), this._valueMin()];
                    }
                    if (o.values.length && o.values.length !== 2) {
                        o.values = [o.values[0], o.values[0]];
                    }
                }
                this.range = $("<div></div>").appendTo(this.element).addClass("ui-slider-range" + " ui-widget-header" + ((o.range === "min" || o.range === "max") ? " ui-slider-range-" + o.range : ""));
            }
            for (var i = existingHandles.length; i < handleCount; i += 1) {
                handles.push(handle);
            }
            this.handles = existingHandles.add($(handles.join("")).appendTo(self.element));
            this.handle = this.handles.eq(0);
            this.handles.add(this.range).filter("a").click(function(event) {
                event.preventDefault();
            }).hover(function() {
                if (!o.disabled) {
                    $(this).addClass("ui-state-hover");
                }
            }, function() {
                $(this).removeClass("ui-state-hover");
            }).focus(function() {
                if (!o.disabled) {
                    $(".ui-slider .ui-state-focus").removeClass("ui-state-focus");
                    $(this).addClass("ui-state-focus");
                } else {
                    $(this).blur();
                }
            }).blur(function() {
                $(this).removeClass("ui-state-focus");
            });
            this.handles.each(function(i) {
                $(this).data("index.ui-slider-handle", i);
            });
            this.handles.keydown(function(event) {
                var index = $(this).data("index.ui-slider-handle"), allowed, curVal, newVal, step;
                if (self.options.disabled) {
                    return;
                }
                switch (event.keyCode) {
                case $.ui.keyCode.HOME:
                case $.ui.keyCode.END:
                case $.ui.keyCode.PAGE_UP:
                case $.ui.keyCode.PAGE_DOWN:
                case $.ui.keyCode.UP:
                case $.ui.keyCode.RIGHT:
                case $.ui.keyCode.DOWN:
                case $.ui.keyCode.LEFT:
                    event.preventDefault();
                    if (!self._keySliding) {
                        self._keySliding = true;
                        $(this).addClass("ui-state-active");
                        allowed = self._start(event, index);
                        if (allowed === false) {
                            return;
                        }
                    }
                    break;
                }
                step = self.options.step;
                if (self.options.values && self.options.values.length) {
                    curVal = newVal = self.values(index);
                } else {
                    curVal = newVal = self.value();
                }
                switch (event.keyCode) {
                case $.ui.keyCode.HOME:
                    newVal = self._valueMin();
                    break;
                case $.ui.keyCode.END:
                    newVal = self._valueMax();
                    break;
                case $.ui.keyCode.PAGE_UP:
                    newVal = self._trimAlignValue(curVal + ((self._valueMax() - self._valueMin()) / numPages));
                    break;
                case $.ui.keyCode.PAGE_DOWN:
                    newVal = self._trimAlignValue(curVal - ((self._valueMax() - self._valueMin()) / numPages));
                    break;
                case $.ui.keyCode.UP:
                case $.ui.keyCode.RIGHT:
                    if (curVal === self._valueMax()) {
                        return;
                    }
                    newVal = self._trimAlignValue(curVal + step);
                    break;
                case $.ui.keyCode.DOWN:
                case $.ui.keyCode.LEFT:
                    if (curVal === self._valueMin()) {
                        return;
                    }
                    newVal = self._trimAlignValue(curVal - step);
                    break;
                }
                self._slide(event, index, newVal);
            }).keyup(function(event) {
                var index = $(this).data("index.ui-slider-handle");
                if (self._keySliding) {
                    self._keySliding = false;
                    self._stop(event, index);
                    self._change(event, index);
                    $(this).removeClass("ui-state-active");
                }
            });
            this._refreshValue();
            this._animateOff = false;
        },
        destroy: function() {
            this.handles.remove();
            this.range.remove();
            this.element.removeClass("ui-slider" + " ui-slider-horizontal" + " ui-slider-vertical" + " ui-slider-disabled" + " ui-widget" + " ui-widget-content" + " ui-corner-all").removeData("slider").unbind(".slider");
            this._mouseDestroy();
            return this;
        },
        _mouseCapture: function(event) {
            var o = this.options, position, normValue, distance, closestHandle, self, index, allowed, offset, mouseOverHandle;
            if (o.disabled) {
                return false;
            }
            this.elementSize = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };
            this.elementOffset = this.element.offset();
            position = {
                x: event.pageX,
                y: event.pageY
            };
            normValue = this._normValueFromMouse(position);
            distance = this._valueMax() - this._valueMin() + 1;
            self = this;
            this.handles.each(function(i) {
                var thisDistance = Math.abs(normValue - self.values(i));
                if (distance > thisDistance) {
                    distance = thisDistance;
                    closestHandle = $(this);
                    index = i;
                }
            });
            if (o.range === true && this.values(1) === o.min) {
                index += 1;
                closestHandle = $(this.handles[index]);
            }
            allowed = this._start(event, index);
            if (allowed === false) {
                return false;
            }
            this._mouseSliding = true;
            self._handleIndex = index;
            closestHandle.addClass("ui-state-active").focus();
            offset = closestHandle.offset();
            mouseOverHandle = !$(event.target).parents().andSelf().is(".ui-slider-handle");
            this._clickOffset = mouseOverHandle ? {
                left: 0,
                top: 0
            } : {
                left: event.pageX - offset.left - (closestHandle.width() / 2),
                top: event.pageY - offset.top - (closestHandle.height() / 2) - (parseInt(closestHandle.css("borderTopWidth"), 10) || 0) - (parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) + (parseInt(closestHandle.css("marginTop"), 10) || 0)
            };
            if (!this.handles.hasClass("ui-state-hover")) {
                this._slide(event, index, normValue);
            }
            this._animateOff = true;
            return true;
        },
        _mouseStart: function(event) {
            return true;
        },
        _mouseDrag: function(event) {
            var position = {
                x: event.pageX,
                y: event.pageY
            }
              , normValue = this._normValueFromMouse(position);
            this._slide(event, this._handleIndex, normValue);
            return false;
        },
        _mouseStop: function(event) {
            this.handles.removeClass("ui-state-active");
            this._mouseSliding = false;
            this._stop(event, this._handleIndex);
            this._change(event, this._handleIndex);
            this._handleIndex = null;
            this._clickOffset = null;
            this._animateOff = false;
            return false;
        },
        _detectOrientation: function() {
            this.orientation = (this.options.orientation === "vertical") ? "vertical" : "horizontal";
        },
        _normValueFromMouse: function(position) {
            var pixelTotal, pixelMouse, percentMouse, valueTotal, valueMouse;
            if (this.orientation === "horizontal") {
                pixelTotal = this.elementSize.width;
                pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
            } else {
                pixelTotal = this.elementSize.height;
                pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
            }
            percentMouse = (pixelMouse / pixelTotal);
            if (percentMouse > 1) {
                percentMouse = 1;
            }
            if (percentMouse < 0) {
                percentMouse = 0;
            }
            if (this.orientation === "vertical") {
                percentMouse = 1 - percentMouse;
            }
            valueTotal = this._valueMax() - this._valueMin();
            valueMouse = this._valueMin() + percentMouse * valueTotal;
            return this._trimAlignValue(valueMouse);
        },
        _start: function(event, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }
            return this._trigger("start", event, uiHash);
        },
        _slide: function(event, index, newVal) {
            var otherVal, newValues, allowed;
            if (this.options.values && this.options.values.length) {
                otherVal = this.values(index ? 0 : 1);
                if ((this.options.values.length === 2 && this.options.range === true) && ((index === 0 && newVal > otherVal) || (index === 1 && newVal < otherVal))) {
                    newVal = otherVal;
                }
                if (newVal !== this.values(index)) {
                    newValues = this.values();
                    newValues[index] = newVal;
                    allowed = this._trigger("slide", event, {
                        handle: this.handles[index],
                        value: newVal,
                        values: newValues
                    });
                    otherVal = this.values(index ? 0 : 1);
                    if (allowed !== false) {
                        this.values(index, newVal, true);
                    }
                }
            } else {
                if (newVal !== this.value()) {
                    allowed = this._trigger("slide", event, {
                        handle: this.handles[index],
                        value: newVal
                    });
                    if (allowed !== false) {
                        this.value(newVal);
                    }
                }
            }
        },
        _stop: function(event, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }
            this._trigger("stop", event, uiHash);
        },
        _change: function(event, index) {
            if (!this._keySliding && !this._mouseSliding) {
                var uiHash = {
                    handle: this.handles[index],
                    value: this.value()
                };
                if (this.options.values && this.options.values.length) {
                    uiHash.value = this.values(index);
                    uiHash.values = this.values();
                }
                this._trigger("change", event, uiHash);
            }
        },
        value: function(newValue) {
            if (arguments.length) {
                this.options.value = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, 0);
                return;
            }
            return this._value();
        },
        values: function(index, newValue) {
            var vals, newValues, i;
            if (arguments.length > 1) {
                this.options.values[index] = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, index);
                return;
            }
            if (arguments.length) {
                if ($.isArray(arguments[0])) {
                    vals = this.options.values;
                    newValues = arguments[0];
                    for (i = 0; i < vals.length; i += 1) {
                        vals[i] = this._trimAlignValue(newValues[i]);
                        this._change(null, i);
                    }
                    this._refreshValue();
                } else {
                    if (this.options.values && this.options.values.length) {
                        return this._values(index);
                    } else {
                        return this.value();
                    }
                }
            } else {
                return this._values();
            }
        },
        _setOption: function(key, value) {
            var i, valsLength = 0;
            if ($.isArray(this.options.values)) {
                valsLength = this.options.values.length;
            }
            $.Widget.prototype._setOption.apply(this, arguments);
            switch (key) {
            case "disabled":
                if (value) {
                    this.handles.filter(".ui-state-focus").blur();
                    this.handles.removeClass("ui-state-hover");
                    this.handles.propAttr("disabled", true);
                    this.element.addClass("ui-disabled");
                } else {
                    this.handles.propAttr("disabled", false);
                    this.element.removeClass("ui-disabled");
                }
                break;
            case "orientation":
                this._detectOrientation();
                this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation);
                this._refreshValue();
                break;
            case "value":
                this._animateOff = true;
                this._refreshValue();
                this._change(null, 0);
                this._animateOff = false;
                break;
            case "values":
                this._animateOff = true;
                this._refreshValue();
                for (i = 0; i < valsLength; i += 1) {
                    this._change(null, i);
                }
                this._animateOff = false;
                break;
            }
        },
        _value: function() {
            var val = this.options.value;
            val = this._trimAlignValue(val);
            return val;
        },
        _values: function(index) {
            var val, vals, i;
            if (arguments.length) {
                val = this.options.values[index];
                val = this._trimAlignValue(val);
                return val;
            } else {
                vals = this.options.values.slice();
                for (i = 0; i < vals.length; i += 1) {
                    vals[i] = this._trimAlignValue(vals[i]);
                }
                return vals;
            }
        },
        _trimAlignValue: function(val) {
            if (val <= this._valueMin()) {
                return this._valueMin();
            }
            if (val >= this._valueMax()) {
                return this._valueMax();
            }
            var step = (this.options.step > 0) ? this.options.step : 1
              , valModStep = (val - this._valueMin()) % step
              , alignValue = val - valModStep;
            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += (valModStep > 0) ? step : (-step);
            }
            return parseFloat(alignValue.toFixed(5));
        },
        _valueMin: function() {
            return this.options.min;
        },
        _valueMax: function() {
            return this.options.max;
        },
        _refreshValue: function() {
            var oRange = this.options.range, o = this.options, self = this, animate = (!this._animateOff) ? o.animate : false, valPercent, _set = {}, lastValPercent, value, valueMin, valueMax;
            if (this.options.values && this.options.values.length) {
                this.handles.each(function(i, j) {
                    valPercent = (self.values(i) - self._valueMin()) / (self._valueMax() - self._valueMin()) * 100;
                    _set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                    $(this).stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                    if (self.options.range === true) {
                        if (self.orientation === "horizontal") {
                            if (i === 0) {
                                self.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    left: valPercent + "%"
                                }, o.animate);
                            }
                            if (i === 1) {
                                self.range[animate ? "animate" : "css"]({
                                    width: (valPercent - lastValPercent) + "%"
                                }, {
                                    queue: false,
                                    duration: o.animate
                                });
                            }
                        } else {
                            if (i === 0) {
                                self.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    bottom: (valPercent) + "%"
                                }, o.animate);
                            }
                            if (i === 1) {
                                self.range[animate ? "animate" : "css"]({
                                    height: (valPercent - lastValPercent) + "%"
                                }, {
                                    queue: false,
                                    duration: o.animate
                                });
                            }
                        }
                    }
                    lastValPercent = valPercent;
                });
            } else {
                value = this.value();
                valueMin = this._valueMin();
                valueMax = this._valueMax();
                valPercent = (valueMax !== valueMin) ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
                _set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                if (oRange === "min" && this.orientation === "horizontal") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        width: valPercent + "%"
                    }, o.animate);
                }
                if (oRange === "max" && this.orientation === "horizontal") {
                    this.range[animate ? "animate" : "css"]({
                        width: (100 - valPercent) + "%"
                    }, {
                        queue: false,
                        duration: o.animate
                    });
                }
                if (oRange === "min" && this.orientation === "vertical") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        height: valPercent + "%"
                    }, o.animate);
                }
                if (oRange === "max" && this.orientation === "vertical") {
                    this.range[animate ? "animate" : "css"]({
                        height: (100 - valPercent) + "%"
                    }, {
                        queue: false,
                        duration: o.animate
                    });
                }
            }
        }
    });
    $.extend($.ui.slider, {
        version: "1.8.21"
    });
}(jQuery));
/*!
* jQuery UI Progressbar 1.8.21
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Progressbar
*
* Depends:
* jquery.ui.core.js
* jquery.ui.widget.js
*/
(function($, undefined) {
    $.widget("ui.progressbar", {
        options: {
            value: 0,
            max: 100
        },
        min: 0,
        _create: function() {
            this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({
                role: "progressbar",
                "aria-valuemin": this.min,
                "aria-valuemax": this.options.max,
                "aria-valuenow": this._value()
            });
            this.valueDiv = $("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);
            this.oldValue = this._value();
            this._refreshValue();
        },
        destroy: function() {
            this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
            this.valueDiv.remove();
            $.Widget.prototype.destroy.apply(this, arguments);
        },
        value: function(newValue) {
            if (newValue === undefined) {
                return this._value();
            }
            this._setOption("value", newValue);
            return this;
        },
        _setOption: function(key, value) {
            if (key === "value") {
                this.options.value = value;
                this._refreshValue();
                if (this._value() === this.options.max) {
                    this._trigger("complete");
                }
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _value: function() {
            var val = this.options.value;
            if (typeof val !== "number") {
                val = 0;
            }
            return Math.min(this.options.max, Math.max(this.min, val));
        },
        _percentage: function() {
            return 100 * this._value() / this.options.max;
        },
        _refreshValue: function() {
            var value = this.value();
            var percentage = this._percentage();
            if (this.oldValue !== value) {
                this.oldValue = value;
                this._trigger("change");
            }
            this.valueDiv.toggle(value > this.min).toggleClass("ui-corner-right", value === this.options.max).width(percentage.toFixed(0) + "%");
            this.element.attr("aria-valuenow", value);
        }
    });
    $.extend($.ui.progressbar, {
        version: "1.8.21"
    });
}
)(jQuery);

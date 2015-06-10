var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.SidebarPanel = (function (_WebInspector$Object) {
    function SidebarPanel(identifier, displayName, element, role, label) {
        _classCallCheck(this, SidebarPanel);

        _get(Object.getPrototypeOf(SidebarPanel.prototype), "constructor", this).call(this);

        this._identifier = identifier;

        this._element = element || document.createElement("div");
        this._element.classList.add("panel", identifier);

        this._element.setAttribute("role", role || "group");
        this._element.setAttribute("aria-label", label || displayName);

        this._contentElement = document.createElement("div");
        this._contentElement.className = "content";
        this._element.appendChild(this._contentElement);
    }

    _inherits(SidebarPanel, _WebInspector$Object);

    _createClass(SidebarPanel, [{
        key: "show",
        value: function show() {
            if (!this._parentSidebar) return;

            this._parentSidebar.collapsed = false;
            this._parentSidebar.selectedSidebarPanel = this;
        }
    }, {
        key: "hide",
        value: function hide() {
            if (!this._parentSidebar) return;

            this._parentSidebar.collapsed = true;
            this._parentSidebar.selectedSidebarPanel = null;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (this.visible) this.hide();else this.show();
        }
    }, {
        key: "added",
        value: function added() {
            console.assert(this._parentSidebar);

            // Implemented by subclasses.
        }
    }, {
        key: "removed",
        value: function removed() {
            console.assert(!this._parentSidebar);

            // Implemented by subclasses.
        }
    }, {
        key: "willRemove",
        value: function willRemove() {}
    }, {
        key: "shown",
        value: function shown() {}
    }, {
        key: "hidden",
        value: function hidden() {}
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {}
    }, {
        key: "visibilityDidChange",
        value: function visibilityDidChange() {}
    }, {
        key: "identifier",

        // Public

        get: function () {
            return this._identifier;
        }
    }, {
        key: "element",
        get: function () {
            return this._element;
        }
    }, {
        key: "contentElement",
        get: function () {
            return this._contentElement;
        }
    }, {
        key: "visible",
        get: function () {
            return this.selected && this._parentSidebar && !this._parentSidebar.collapsed;
        }
    }, {
        key: "selected",
        get: function () {
            return this._element.classList.contains(WebInspector.SidebarPanel.SelectedStyleClassName);
        },
        set: function (flag) {
            if (flag) this._element.classList.add(WebInspector.SidebarPanel.SelectedStyleClassName);else this._element.classList.remove(WebInspector.SidebarPanel.SelectedStyleClassName);
        }
    }, {
        key: "parentSidebar",
        get: function () {
            return this._parentSidebar;
        }
    }]);

    return SidebarPanel;
})(WebInspector.Object);

WebInspector.SidebarPanel.SelectedStyleClassName = "selected";

// Implemented by subclasses.

// Implemented by subclasses.

// Implemented by subclasses.

// Implemented by subclasses.

// Implemented by subclasses.
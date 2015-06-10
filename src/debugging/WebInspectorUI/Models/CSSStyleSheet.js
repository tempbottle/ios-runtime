var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.CSSStyleSheet = (function (_WebInspector$SourceCode) {
    function CSSStyleSheet(id) {
        _classCallCheck(this, CSSStyleSheet);

        _get(Object.getPrototypeOf(CSSStyleSheet.prototype), "constructor", this).call(this);

        console.assert(id);

        this._id = id || null;
        this._url = null;
        this._parentFrame = null;
    }

    _inherits(CSSStyleSheet, _WebInspector$SourceCode);

    _createClass(CSSStyleSheet, [{
        key: "isInlineStyle",
        value: function isInlineStyle() {
            return !!this._inlineStyle;
        }
    }, {
        key: "markAsInlineStyle",
        value: function markAsInlineStyle() {
            this._inlineStyle = true;
        }
    }, {
        key: "updateInfo",

        // Protected

        value: function updateInfo(url, parentFrame) {
            this._url = url || null;
            delete this._urlComponents;

            this._parentFrame = parentFrame || null;
        }
    }, {
        key: "handleCurrentRevisionContentChange",
        value: function handleCurrentRevisionContentChange() {
            if (!this._id) return;

            function contentDidChange(error) {
                if (error) return;

                DOMAgent.markUndoableState();

                this.dispatchEventToListeners(WebInspector.CSSStyleSheet.Event.ContentDidChange);
            }

            this._ignoreNextContentDidChangeNotification = true;

            CSSAgent.setStyleSheetText(this._id, this.currentRevision.content, contentDidChange.bind(this));
        }
    }, {
        key: "requestContentFromBackend",
        value: function requestContentFromBackend() {
            if (!this._id) {
                // There is no identifier to request content with. Reject the promise to cause the
                // pending callbacks to get null content.
                return Promise.reject(new Error("There is no identifier to request content with."));
            }

            return CSSAgent.getStyleSheetText(this._id);
        }
    }, {
        key: "noteContentDidChange",
        value: function noteContentDidChange() {
            if (this._ignoreNextContentDidChangeNotification) {
                delete this._ignoreNextContentDidChangeNotification;
                return false;
            }

            this.markContentAsStale();
            this.dispatchEventToListeners(WebInspector.CSSStyleSheet.Event.ContentDidChange);
            return true;
        }
    }, {
        key: "id",

        // Public

        get: function () {
            return this._id;
        }
    }, {
        key: "parentFrame",
        get: function () {
            return this._parentFrame;
        }
    }, {
        key: "url",
        get: function () {
            return this._url;
        }
    }, {
        key: "urlComponents",
        get: function () {
            if (!this._urlComponents) this._urlComponents = parseURL(this._url);
            return this._urlComponents;
        }
    }, {
        key: "mimeType",
        get: function () {
            return "text/css";
        }
    }, {
        key: "displayName",
        get: function () {
            if (this._url) return WebInspector.displayNameForURL(this._url, this.urlComponents);

            // Assign a unique number to the StyleSheet object so it will stay the same.
            if (!this._uniqueDisplayNameNumber) this._uniqueDisplayNameNumber = this.constructor._nextUniqueDisplayNameNumber++;

            return WebInspector.UIString("Anonymous StyleSheet %d").format(this._uniqueDisplayNameNumber);
        }
    }, {
        key: "revisionForRequestedContent",
        get: function () {
            return this.currentRevision;
        }
    }], [{
        key: "resetUniqueDisplayNameNumbers",

        // Static

        value: function resetUniqueDisplayNameNumbers() {
            WebInspector.CSSStyleSheet._nextUniqueDisplayNameNumber = 1;
        }
    }]);

    return CSSStyleSheet;
})(WebInspector.SourceCode);

WebInspector.CSSStyleSheet._nextUniqueDisplayNameNumber = 1;

WebInspector.CSSStyleSheet.Event = {
    ContentDidChange: "stylesheet-content-did-change"
};
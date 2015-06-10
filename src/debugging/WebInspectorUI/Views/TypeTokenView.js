var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
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

WebInspector.TypeTokenView = (function (_WebInspector$Object) {
    function TypeTokenView(tokenAnnotator, shouldHaveRightMargin, shouldHaveLeftMargin, titleType, functionOrVariableName) {
        _classCallCheck(this, TypeTokenView);

        console.assert(titleType === WebInspector.TypeTokenView.TitleType.Variable || titleType === WebInspector.TypeTokenView.TitleType.ReturnStatement);

        _get(Object.getPrototypeOf(TypeTokenView.prototype), "constructor", this).call(this);

        var span = document.createElement("span");
        span.classList.add("type-token");
        if (shouldHaveRightMargin) span.classList.add("type-token-right-spacing");
        if (shouldHaveLeftMargin) span.classList.add("type-token-left-spacing");

        this.element = span;
        this._tokenAnnotator = tokenAnnotator;
        this._types = null;
        this._typeSet = null;
        this._colorClass = null;

        this._popoverTitle = WebInspector.TypeTokenView.titleForPopover(titleType, functionOrVariableName);

        this._setUpMouseoverHandlers();
    }

    _inherits(TypeTokenView, _WebInspector$Object);

    _createClass(TypeTokenView, [{
        key: "update",

        // Public

        value: function update(types) {
            this._types = types;
            this._typeSet = WebInspector.TypeSet.fromPayload(this._types);

            var title = this._displayTypeName();
            if (title === this.element.textContent) return;

            this.element.textContent = title;
            var hashString = title[title.length - 1] === "?" ? title.slice(0, title.length - 1) : title;

            if (this._colorClass) this.element.classList.remove(this._colorClass);

            this._colorClass = WebInspector.TypeTokenView.ColorClassForType[hashString] || "type-token-default";
            this.element.classList.add(this._colorClass);
        }
    }, {
        key: "_setUpMouseoverHandlers",

        // Private

        value: function _setUpMouseoverHandlers() {
            var timeoutID = null;

            this.element.addEventListener("mouseover", (function () {
                function showPopoverAfterDelay() {
                    timeoutID = null;

                    var domRect = this.element.getBoundingClientRect();
                    var bounds = new WebInspector.Rect(domRect.left, domRect.top, domRect.width, domRect.height);
                    this._tokenAnnotator.sourceCodeTextEditor.showPopoverForTypes(this._types, bounds, this._popoverTitle);
                }

                if (this._shouldShowPopover()) timeoutID = setTimeout(showPopoverAfterDelay.bind(this), WebInspector.TypeTokenView.DelayHoverTime);
            }).bind(this));

            this.element.addEventListener("mouseout", function () {
                if (timeoutID) clearTimeout(timeoutID);
            });
        }
    }, {
        key: "_shouldShowPopover",
        value: function _shouldShowPopover() {
            if (!this._types.isValid) return false;

            if (this._typeSet.primitiveTypeNames.length > 1) return true;

            if (this._types.structures && this._types.structures.length) return true;

            return false;
        }
    }, {
        key: "_displayTypeName",
        value: function _displayTypeName() {
            if (!this._types.isValid) return "";

            var typeSet = this._typeSet;

            if (this._types.leastCommonAncestor && !this._typeSet.primitiveTypeNames.length) {
                if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Object)) return this._types.leastCommonAncestor;
                if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Object | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return this._types.leastCommonAncestor + "?";
            }

            // The order of these checks are important.
            // For example, if a value is only a function, it is contained in TypeFunction, but it is also contained in (TypeFunction | TypeNull).
            // Therefore, more specific types must be checked first.

            // The strings returned here should match those in TypeTokenView.ColorClassForType
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Function)) return "Function";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Undefined)) return "Undefined";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Null)) return "Null";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Boolean)) return "Boolean";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Integer)) return "Integer";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Number | WebInspector.TypeSet.TypeBit.Integer)) return "Number";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.String)) return "String";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Symbol)) return "Symbol";

            if (typeSet.isContainedIn(WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "(?)";

            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Function | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Function?";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Boolean | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Boolean?";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Integer | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Integer?";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Number | WebInspector.TypeSet.TypeBit.Integer | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Number?";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.String | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "String?";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Symbol | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Symbol?";

            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Object | WebInspector.TypeSet.TypeBit.Function | WebInspector.TypeSet.TypeBit.String)) return "Object";
            if (typeSet.isContainedIn(WebInspector.TypeSet.TypeBit.Object | WebInspector.TypeSet.TypeBit.Function | WebInspector.TypeSet.TypeBit.String | WebInspector.TypeSet.NullOrUndefinedTypeBits)) return "Object?";

            return WebInspector.UIString("(many)");
        }
    }], [{
        key: "titleForPopover",

        // Static

        value: function titleForPopover(titleType, functionOrVariableName) {
            var titleString = null;
            if (titleType === WebInspector.TypeTokenView.TitleType.Variable) titleString = WebInspector.UIString("Type information for variable: %s").format(functionOrVariableName);else {
                if (functionOrVariableName) titleString = WebInspector.UIString("Return type for function: %s").format(functionOrVariableName);else titleString = WebInspector.UIString("Return type for anonymous function");
            }

            return titleString;
        }
    }]);

    return TypeTokenView;
})(WebInspector.Object);

WebInspector.TypeTokenView.TitleType = {
    Variable: Symbol("title-type-variable"),
    ReturnStatement: Symbol("title-type-return-statement")
};

WebInspector.TypeTokenView.ColorClassForType = {
    "String": "type-token-string",
    "Symbol": "type-token-symbol",
    "Function": "type-token-function",
    "Number": "type-token-number",
    "Integer": "type-token-number",
    "Undefined": "type-token-empty",
    "Null": "type-token-empty",
    "(?)": "type-token-empty",
    "Boolean": "type-token-boolean",
    "(many)": "type-token-many"
};

WebInspector.TypeTokenView.DelayHoverTime = 350;
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

WebInspector.BreakpointActionView = (function (_WebInspector$Object) {
    function BreakpointActionView(action, delegate, omitFocus) {
        _classCallCheck(this, BreakpointActionView);

        _get(Object.getPrototypeOf(BreakpointActionView.prototype), "constructor", this).call(this);

        console.assert(action);
        console.assert(delegate);
        console.assert(DebuggerAgent.BreakpointActionType);

        this._action = action;
        this._delegate = delegate;

        this._element = document.createElement("div");
        this._element.className = "breakpoint-action-block";

        var header = this._element.appendChild(document.createElement("div"));
        header.className = "breakpoint-action-block-header";

        var picker = header.appendChild(document.createElement("select"));
        picker.addEventListener("change", this._pickerChanged.bind(this));

        for (var key in WebInspector.BreakpointAction.Type) {
            var type = WebInspector.BreakpointAction.Type[key];
            var option = document.createElement("option");
            option.textContent = WebInspector.BreakpointActionView.displayStringForType(type);
            option.selected = this._action.type === type;
            option.value = type;
            picker.add(option);
        }

        var appendActionButton = header.appendChild(document.createElement("button"));
        appendActionButton.className = "breakpoint-action-append-button";
        appendActionButton.addEventListener("click", this._appendActionButtonClicked.bind(this));
        appendActionButton.title = WebInspector.UIString("Add new breakpoint action after this action");

        var removeActionButton = header.appendChild(document.createElement("button"));
        removeActionButton.className = "breakpoint-action-remove-button";
        removeActionButton.addEventListener("click", this._removeAction.bind(this));
        removeActionButton.title = WebInspector.UIString("Remove this breakpoint action");

        this._bodyElement = this._element.appendChild(document.createElement("div"));
        this._bodyElement.className = "breakpoint-action-block-body";

        this._updateBody(omitFocus);
    }

    _inherits(BreakpointActionView, _WebInspector$Object);

    _createClass(BreakpointActionView, [{
        key: "_pickerChanged",

        // Private

        value: function _pickerChanged(event) {
            var newType = event.target.value;
            this._action = this._action.breakpoint.recreateAction(newType, this._action);
            this._updateBody();
            this._delegate.breakpointActionViewResized(this);
        }
    }, {
        key: "_appendActionButtonClicked",
        value: function _appendActionButtonClicked(event) {
            var newAction = this._action.breakpoint.createAction(WebInspector.Breakpoint.DefaultBreakpointActionType, this._action);
            this._delegate.breakpointActionViewAppendActionView(this, newAction);
        }
    }, {
        key: "_removeAction",
        value: function _removeAction() {
            this._action.breakpoint.removeAction(this._action);
            this._delegate.breakpointActionViewRemoveActionView(this);
        }
    }, {
        key: "_updateBody",
        value: function _updateBody(omitFocus) {
            this._bodyElement.removeChildren();

            switch (this._action.type) {
                case WebInspector.BreakpointAction.Type.Log:
                    this._bodyElement.hidden = false;

                    var input = this._bodyElement.appendChild(document.createElement("input"));
                    input.placeholder = WebInspector.UIString("Message");
                    input.addEventListener("change", this._logInputChanged.bind(this));
                    input.value = this._action.data || "";
                    input.spellcheck = false;
                    if (!omitFocus) setTimeout(function () {
                        input.focus();
                    }, 0);

                    break;

                case WebInspector.BreakpointAction.Type.Evaluate:
                case WebInspector.BreakpointAction.Type.Probe:
                    this._bodyElement.hidden = false;

                    var editorElement = this._bodyElement.appendChild(document.createElement("div"));
                    editorElement.classList.add("breakpoint-action-eval-editor");
                    editorElement.classList.add(WebInspector.SyntaxHighlightedStyleClassName);

                    this._codeMirror = CodeMirror(editorElement, {
                        lineWrapping: true,
                        mode: "text/javascript",
                        indentWithTabs: true,
                        indentUnit: 4,
                        matchBrackets: true,
                        value: this._action.data || ""
                    });

                    this._codeMirror.on("viewportChange", this._codeMirrorViewportChanged.bind(this));
                    this._codeMirror.on("blur", this._codeMirrorBlurred.bind(this));

                    var completionController = new WebInspector.CodeMirrorCompletionController(this._codeMirror);
                    completionController.addExtendedCompletionProvider("javascript", WebInspector.javaScriptRuntimeCompletionProvider);

                    // CodeMirror needs a refresh after the popover displays, to layout, otherwise it doesn't appear.
                    setTimeout((function () {
                        this._codeMirror.refresh();
                        if (!omitFocus) this._codeMirror.focus();
                    }).bind(this), 0);

                    break;

                case WebInspector.BreakpointAction.Type.Sound:
                    this._bodyElement.hidden = true;
                    break;

                default:
                    console.assert(false);
                    this._bodyElement.hidden = true;
                    break;
            }
        }
    }, {
        key: "_logInputChanged",
        value: function _logInputChanged(event) {
            this._action.data = event.target.value;
        }
    }, {
        key: "_codeMirrorBlurred",
        value: function _codeMirrorBlurred(event) {
            // Throw away the expression if it's just whitespace.
            var data = (this._codeMirror.getValue() || "").trim();

            if (!data.length) this._removeAction();else this._action.data = data;
        }
    }, {
        key: "_codeMirrorViewportChanged",
        value: function _codeMirrorViewportChanged(event) {
            this._delegate.breakpointActionViewResized(this);
        }
    }, {
        key: "action",

        // Public

        get: function () {
            return this._action;
        }
    }, {
        key: "element",
        get: function () {
            return this._element;
        }
    }], [{
        key: "displayStringForType",

        // Static

        value: function displayStringForType(type) {
            switch (type) {
                case WebInspector.BreakpointAction.Type.Log:
                    return WebInspector.UIString("Log Message");
                case WebInspector.BreakpointAction.Type.Evaluate:
                    return WebInspector.UIString("Evaluate JavaScript");
                case WebInspector.BreakpointAction.Type.Sound:
                    return WebInspector.UIString("Play Sound");
                case WebInspector.BreakpointAction.Type.Probe:
                    return WebInspector.UIString("Probe Expression");
                default:
                    console.assert(false);
                    return "";
            }
        }
    }]);

    return BreakpointActionView;
})(WebInspector.Object);
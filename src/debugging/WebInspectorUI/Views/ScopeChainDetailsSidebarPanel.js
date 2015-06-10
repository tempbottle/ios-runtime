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

WebInspector.ScopeChainDetailsSidebarPanel = (function (_WebInspector$DetailsSidebarPanel) {
    function ScopeChainDetailsSidebarPanel() {
        _classCallCheck(this, ScopeChainDetailsSidebarPanel);

        _get(Object.getPrototypeOf(ScopeChainDetailsSidebarPanel.prototype), "constructor", this).call(this, "scope-chain", WebInspector.UIString("Scope Chain"), WebInspector.UIString("Scope Chain"));

        this._callFrame = null;

        // Update on console prompt eval as objects in the scope chain may have changed.
        WebInspector.runtimeManager.addEventListener(WebInspector.RuntimeManager.Event.DidEvaluate, this.needsRefresh, this);
    }

    _inherits(ScopeChainDetailsSidebarPanel, _WebInspector$DetailsSidebarPanel);

    _createClass(ScopeChainDetailsSidebarPanel, [{
        key: "inspect",

        // Public

        value: function inspect(objects) {
            // Convert to a single item array if needed.
            if (!(objects instanceof Array)) objects = [objects];

            var callFrameToInspect = null;

            // Iterate over the objects to find a WebInspector.CallFrame to inspect.
            for (var i = 0; i < objects.length; ++i) {
                if (!(objects[i] instanceof WebInspector.CallFrame)) continue;
                callFrameToInspect = objects[i];
                break;
            }

            this.callFrame = callFrameToInspect;

            return !!this.callFrame;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var callFrame = this.callFrame;
            if (!callFrame) return;

            var detailsSections = [];
            var foundLocalScope = false;

            var sectionCountByType = {};
            for (var type in WebInspector.ScopeChainNode.Type) sectionCountByType[WebInspector.ScopeChainNode.Type[type]] = 0;

            var scopeChain = callFrame.scopeChain;
            for (var i = 0; i < scopeChain.length; ++i) {
                var scope = scopeChain[i];

                var title = null;
                var extraPropertyDescriptor = null;
                var collapsedByDefault = false;

                ++sectionCountByType[scope.type];

                switch (scope.type) {
                    case WebInspector.ScopeChainNode.Type.Local:
                        foundLocalScope = true;
                        collapsedByDefault = false;

                        title = WebInspector.UIString("Local Variables");

                        if (callFrame.thisObject) extraPropertyDescriptor = new WebInspector.PropertyDescriptor({ name: "this", value: callFrame.thisObject });
                        break;

                    case WebInspector.ScopeChainNode.Type.Closure:
                        title = WebInspector.UIString("Closure Variables");
                        collapsedByDefault = false;
                        break;

                    case WebInspector.ScopeChainNode.Type.Catch:
                        title = WebInspector.UIString("Catch Variables");
                        collapsedByDefault = false;
                        break;

                    case WebInspector.ScopeChainNode.Type.FunctionName:
                        title = WebInspector.UIString("Function Name Variable");
                        collapsedByDefault = true;
                        break;

                    case WebInspector.ScopeChainNode.Type.With:
                        title = WebInspector.UIString("With Object Properties");
                        collapsedByDefault = foundLocalScope;
                        break;

                    case WebInspector.ScopeChainNode.Type.Global:
                        title = WebInspector.UIString("Global Variables");
                        collapsedByDefault = true;
                        break;
                }

                var detailsSectionIdentifier = scope.type + "-" + sectionCountByType[scope.type];

                var scopePropertyPath = WebInspector.PropertyPath.emptyPropertyPathForScope(scope.object);
                var objectTree = new WebInspector.ObjectTreeView(scope.object, WebInspector.ObjectTreeView.Mode.Properties, scopePropertyPath);

                objectTree.showOnlyProperties();

                if (extraPropertyDescriptor) objectTree.appendExtraPropertyDescriptor(extraPropertyDescriptor);

                var treeOutline = objectTree.treeOutline;
                treeOutline.onadd = this._objectTreeAddHandler.bind(this, detailsSectionIdentifier);
                treeOutline.onexpand = this._objectTreeExpandHandler.bind(this, detailsSectionIdentifier);
                treeOutline.oncollapse = this._objectTreeCollapseHandler.bind(this, detailsSectionIdentifier);

                var detailsSection = new WebInspector.DetailsSection(detailsSectionIdentifier, title, null, null, collapsedByDefault);
                detailsSection.groups[0].rows = [new WebInspector.DetailsSectionPropertiesRow(objectTree)];
                detailsSections.push(detailsSection);
            }

            function delayedWork() {
                // Clear the timeout so we don't update the interface twice.
                clearTimeout(timeout);

                // Bail if the call frame changed while we were waiting for the async response.
                if (this.callFrame !== callFrame) return;

                this.contentElement.removeChildren();
                for (var i = 0; i < detailsSections.length; ++i) this.contentElement.appendChild(detailsSections[i].element);
            }

            // We need a timeout in place in case there are long running, pending backend dispatches. This can happen
            // if the debugger is paused in code that was executed from the console. The console will be waiting for
            // the result of the execution and without a timeout we would never update the scope variables.
            var delay = WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.size === 0 ? 50 : 250;
            var timeout = setTimeout(delayedWork.bind(this), delay);

            // Since ObjectTreeView populates asynchronously, we want to wait to replace the existing content
            // until after all the pending asynchronous requests are completed. This prevents severe flashing while stepping.
            InspectorBackend.runAfterPendingDispatches(delayedWork.bind(this));
        }
    }, {
        key: "_propertyPathIdentifierForTreeElement",
        value: function _propertyPathIdentifierForTreeElement(identifier, objectPropertyTreeElement) {
            if (!objectPropertyTreeElement.property) return null;

            var propertyPath = objectPropertyTreeElement.thisPropertyPath();
            if (propertyPath.isFullPathImpossible()) return null;

            return identifier + "-" + propertyPath.fullPath;
        }
    }, {
        key: "_objectTreeAddHandler",
        value: function _objectTreeAddHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            if (WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.has(propertyPathIdentifier)) treeElement.expand();
        }
    }, {
        key: "_objectTreeExpandHandler",
        value: function _objectTreeExpandHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.add(propertyPathIdentifier);
        }
    }, {
        key: "_objectTreeCollapseHandler",
        value: function _objectTreeCollapseHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties["delete"](propertyPathIdentifier);
        }
    }, {
        key: "callFrame",
        get: function () {
            return this._callFrame;
        },
        set: function (callFrame) {
            if (callFrame === this._callFrame) return;

            this._callFrame = callFrame;

            this.needsRefresh();
        }
    }]);

    return ScopeChainDetailsSidebarPanel;
})(WebInspector.DetailsSidebarPanel);

WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties = new Set();
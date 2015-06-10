var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2007, 2008, 2013, 2015 Apple Inc.  All rights reserved.
 * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DOMTreeOutline = (function (_WebInspector$TreeOutline) {
    function DOMTreeOutline(omitRootDOMNode, selectEnabled, excludeRevealElementContextMenu) {
        _classCallCheck(this, DOMTreeOutline);

        var element = document.createElement("ol");

        _get(Object.getPrototypeOf(DOMTreeOutline.prototype), "constructor", this).call(this, element);

        element.addEventListener("mousedown", this._onmousedown.bind(this), false);
        element.addEventListener("mousemove", this._onmousemove.bind(this), false);
        element.addEventListener("mouseout", this._onmouseout.bind(this), false);
        element.addEventListener("dragstart", this._ondragstart.bind(this), false);
        element.addEventListener("dragover", this._ondragover.bind(this), false);
        element.addEventListener("dragleave", this._ondragleave.bind(this), false);
        element.addEventListener("drop", this._ondrop.bind(this), false);
        element.addEventListener("dragend", this._ondragend.bind(this), false);

        element.classList.add("dom-tree-outline", WebInspector.SyntaxHighlightedStyleClassName);

        this._includeRootDOMNode = !omitRootDOMNode;
        this._selectEnabled = selectEnabled;
        this._excludeRevealElementContextMenu = excludeRevealElementContextMenu;
        this._rootDOMNode = null;
        this._selectedDOMNode = null;

        this._editable = false;
        this._editing = false;
        this._visible = false;

        this.element.addEventListener("contextmenu", this._contextMenuEventFired.bind(this));

        this._hideElementKeyboardShortcut = new WebInspector.KeyboardShortcut(null, "H", this._hideElement.bind(this), this.element);
        this._hideElementKeyboardShortcut.implicitlyPreventsDefault = false;

        WebInspector.showShadowDOMSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showShadowDOMSettingChanged, this);
    }

    _inherits(DOMTreeOutline, _WebInspector$TreeOutline);

    _createClass(DOMTreeOutline, [{
        key: "wireToDomAgent",

        // Public

        value: function wireToDomAgent() {
            this._elementsTreeUpdater = new WebInspector.DOMTreeUpdater(this);
        }
    }, {
        key: "close",
        value: function close() {
            WebInspector.showShadowDOMSetting.removeEventListener(null, null, this);

            if (this._elementsTreeUpdater) {
                this._elementsTreeUpdater.close();
                this._elementsTreeUpdater = null;
            }
        }
    }, {
        key: "setVisible",
        value: function setVisible(visible, omitFocus) {
            this._visible = visible;
            if (!this._visible) return;

            this._updateModifiedNodes();

            if (this._selectedDOMNode) this._revealAndSelectNode(this._selectedDOMNode, omitFocus);

            this.update();
        }
    }, {
        key: "selectedDOMNode",
        value: function selectedDOMNode() {
            return this._selectedDOMNode;
        }
    }, {
        key: "selectDOMNode",
        value: function selectDOMNode(node, focus) {
            if (this._selectedDOMNode === node) {
                this._revealAndSelectNode(node, !focus);
                return;
            }

            this._selectedDOMNode = node;
            this._revealAndSelectNode(node, !focus);

            // The _revealAndSelectNode() method might find a different element if there is inlined text,
            // and the select() call would change the selectedDOMNode and reenter this setter. So to
            // avoid calling _selectedNodeChanged() twice, first check if _selectedDOMNode is the same
            // node as the one passed in.
            // Note that _revealAndSelectNode will not do anything for a null node.
            if (!node || this._selectedDOMNode === node) this._selectedNodeChanged();
        }
    }, {
        key: "update",
        value: function update() {
            var selectedNode = this.selectedTreeElement ? this.selectedTreeElement.representedObject : null;

            this.removeChildren();

            if (!this.rootDOMNode) return;

            var treeElement;
            if (this._includeRootDOMNode) {
                treeElement = new WebInspector.DOMTreeElement(this.rootDOMNode);
                treeElement.selectable = this._selectEnabled;
                this.appendChild(treeElement);
            } else {
                // FIXME: this could use findTreeElement to reuse a tree element if it already exists
                var node = this.rootDOMNode.firstChild;
                while (node) {
                    treeElement = new WebInspector.DOMTreeElement(node);
                    treeElement.selectable = this._selectEnabled;
                    this.appendChild(treeElement);
                    node = node.nextSibling;

                    if (treeElement.hasChildren && !treeElement.expanded) treeElement.expand();
                }
            }

            if (selectedNode) this._revealAndSelectNode(selectedNode, true);
        }
    }, {
        key: "updateSelection",
        value: function updateSelection() {
            if (!this.selectedTreeElement) return;
            var element = this.treeOutline.selectedTreeElement;
            element.updateSelection();
        }
    }, {
        key: "_selectedNodeChanged",
        value: function _selectedNodeChanged() {
            this.dispatchEventToListeners(WebInspector.DOMTreeOutline.Event.SelectedNodeChanged);
        }
    }, {
        key: "findTreeElement",
        value: function findTreeElement(node) {
            function isAncestorNode(ancestor, node) {
                return ancestor.isAncestor(node);
            }

            function parentNode(node) {
                return node.parentNode;
            }

            var treeElement = _get(Object.getPrototypeOf(DOMTreeOutline.prototype), "findTreeElement", this).call(this, node, isAncestorNode, parentNode);
            if (!treeElement && node.nodeType() === Node.TEXT_NODE) {
                // The text node might have been inlined if it was short, so try to find the parent element.
                treeElement = _get(Object.getPrototypeOf(DOMTreeOutline.prototype), "findTreeElement", this).call(this, node.parentNode, isAncestorNode, parentNode);
            }

            return treeElement;
        }
    }, {
        key: "createTreeElementFor",
        value: function createTreeElementFor(node) {
            var treeElement = this.findTreeElement(node);
            if (treeElement) return treeElement;
            if (!node.parentNode) return null;

            treeElement = this.createTreeElementFor(node.parentNode);
            if (treeElement && treeElement.showChild(node.index)) return treeElement.children[node.index];

            return null;
        }
    }, {
        key: "populateContextMenu",
        value: function populateContextMenu(contextMenu, event, treeElement) {
            var tag = event.target.enclosingNodeOrSelfWithClass("html-tag");
            var textNode = event.target.enclosingNodeOrSelfWithClass("html-text-node");
            var commentNode = event.target.enclosingNodeOrSelfWithClass("html-comment");

            var populated = false;
            if (tag && treeElement._populateTagContextMenu) {
                if (populated) contextMenu.appendSeparator();
                treeElement._populateTagContextMenu(contextMenu, event);
                populated = true;
            } else if (textNode && treeElement._populateTextContextMenu) {
                if (populated) contextMenu.appendSeparator();
                treeElement._populateTextContextMenu(contextMenu, textNode);
                populated = true;
            } else if (commentNode && treeElement._populateNodeContextMenu) {
                if (populated) contextMenu.appendSeparator();
                treeElement._populateNodeContextMenu(contextMenu, textNode);
                populated = true;
            }

            return populated;
        }
    }, {
        key: "adjustCollapsedRange",
        value: function adjustCollapsedRange() {}
    }, {
        key: "_revealAndSelectNode",

        // Private

        value: function _revealAndSelectNode(node, omitFocus) {
            if (!node || this._suppressRevealAndSelect) return;

            var treeElement = this.createTreeElementFor(node);
            if (!treeElement) return;

            treeElement.revealAndSelect(omitFocus);
        }
    }, {
        key: "_treeElementFromEvent",
        value: function _treeElementFromEvent(event) {
            var scrollContainer = this.element.parentElement;

            // We choose this X coordinate based on the knowledge that our list
            // items extend at least to the right edge of the outer <ol> container.
            // In the no-word-wrap mode the outer <ol> may be wider than the tree container
            // (and partially hidden), in which case we are left to use only its right boundary.
            var x = scrollContainer.totalOffsetLeft + scrollContainer.offsetWidth - 36;

            var y = event.pageY;

            // Our list items have 1-pixel cracks between them vertically. We avoid
            // the cracks by checking slightly above and slightly below the mouse
            // and seeing if we hit the same element each time.
            var elementUnderMouse = this.treeElementFromPoint(x, y);
            var elementAboveMouse = this.treeElementFromPoint(x, y - 2);
            var element;
            if (elementUnderMouse === elementAboveMouse) element = elementUnderMouse;else element = this.treeElementFromPoint(x, y + 2);

            return element;
        }
    }, {
        key: "_onmousedown",
        value: function _onmousedown(event) {
            var element = this._treeElementFromEvent(event);
            if (!element || element.isEventWithinDisclosureTriangle(event)) {
                event.preventDefault();
                return;
            }

            element.select();
        }
    }, {
        key: "_onmousemove",
        value: function _onmousemove(event) {
            var element = this._treeElementFromEvent(event);
            if (element && this._previousHoveredElement === element) return;

            if (this._previousHoveredElement) {
                this._previousHoveredElement.hovered = false;
                delete this._previousHoveredElement;
            }

            if (element) {
                element.hovered = true;
                this._previousHoveredElement = element;

                // Lazily compute tag-specific tooltips.
                if (element.representedObject && !element.tooltip && element._createTooltipForNode) element._createTooltipForNode();
            }

            WebInspector.domTreeManager.highlightDOMNode(element ? element.representedObject.id : 0);
        }
    }, {
        key: "_onmouseout",
        value: function _onmouseout(event) {
            var nodeUnderMouse = document.elementFromPoint(event.pageX, event.pageY);
            if (nodeUnderMouse && nodeUnderMouse.isDescendant(this.element)) return;

            if (this._previousHoveredElement) {
                this._previousHoveredElement.hovered = false;
                delete this._previousHoveredElement;
            }

            WebInspector.domTreeManager.hideDOMNodeHighlight();
        }
    }, {
        key: "_ondragstart",
        value: function _ondragstart(event) {
            var treeElement = this._treeElementFromEvent(event);
            if (!treeElement) return false;

            if (!this._isValidDragSourceOrTarget(treeElement)) return false;

            if (treeElement.representedObject.nodeName() === "BODY" || treeElement.representedObject.nodeName() === "HEAD") return false;

            event.dataTransfer.setData("text/plain", treeElement.listItemElement.textContent);
            event.dataTransfer.effectAllowed = "copyMove";
            this._nodeBeingDragged = treeElement.representedObject;

            WebInspector.domTreeManager.hideDOMNodeHighlight();

            return true;
        }
    }, {
        key: "_ondragover",
        value: function _ondragover(event) {
            if (!this._nodeBeingDragged) return false;

            var treeElement = this._treeElementFromEvent(event);
            if (!this._isValidDragSourceOrTarget(treeElement)) return false;

            var node = treeElement.representedObject;
            while (node) {
                if (node === this._nodeBeingDragged) return false;
                node = node.parentNode;
            }

            treeElement.updateSelection();
            treeElement.listItemElement.classList.add("elements-drag-over");
            this._dragOverTreeElement = treeElement;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            return false;
        }
    }, {
        key: "_ondragleave",
        value: function _ondragleave(event) {
            this._clearDragOverTreeElementMarker();
            event.preventDefault();
            return false;
        }
    }, {
        key: "_isValidDragSourceOrTarget",
        value: function _isValidDragSourceOrTarget(treeElement) {
            if (!treeElement) return false;

            var node = treeElement.representedObject;
            if (!(node instanceof WebInspector.DOMNode)) return false;

            if (!node.parentNode || node.parentNode.nodeType() !== Node.ELEMENT_NODE) return false;

            return true;
        }
    }, {
        key: "_ondrop",
        value: function _ondrop(event) {
            event.preventDefault();

            function callback(error, newNodeId) {
                if (error) return;

                this._updateModifiedNodes();
                var newNode = WebInspector.domTreeManager.nodeForId(newNodeId);
                if (newNode) this.selectDOMNode(newNode, true);
            }

            var treeElement = this._treeElementFromEvent(event);
            if (this._nodeBeingDragged && treeElement) {
                var parentNode;
                var anchorNode;

                if (treeElement._elementCloseTag) {
                    // Drop onto closing tag -> insert as last child.
                    parentNode = treeElement.representedObject;
                } else {
                    var dragTargetNode = treeElement.representedObject;
                    parentNode = dragTargetNode.parentNode;
                    anchorNode = dragTargetNode;
                }

                this._nodeBeingDragged.moveTo(parentNode, anchorNode, callback.bind(this));
            }

            delete this._nodeBeingDragged;
        }
    }, {
        key: "_ondragend",
        value: function _ondragend(event) {
            event.preventDefault();
            this._clearDragOverTreeElementMarker();
            delete this._nodeBeingDragged;
        }
    }, {
        key: "_clearDragOverTreeElementMarker",
        value: function _clearDragOverTreeElementMarker() {
            if (this._dragOverTreeElement) {
                this._dragOverTreeElement.updateSelection();
                this._dragOverTreeElement.listItemElement.classList.remove("elements-drag-over");
                delete this._dragOverTreeElement;
            }
        }
    }, {
        key: "_contextMenuEventFired",
        value: function _contextMenuEventFired(event) {
            var treeElement = this._treeElementFromEvent(event);
            if (!treeElement) return;

            var contextMenu = new WebInspector.ContextMenu(event);
            this.populateContextMenu(contextMenu, event, treeElement);
            contextMenu.show();
        }
    }, {
        key: "_updateModifiedNodes",
        value: function _updateModifiedNodes() {
            if (this._elementsTreeUpdater) this._elementsTreeUpdater._updateModifiedNodes();
        }
    }, {
        key: "_populateContextMenu",
        value: function _populateContextMenu(contextMenu, domNode) {
            function revealElement() {
                WebInspector.domTreeManager.inspectElement(domNode.id);
            }

            function logElement() {
                WebInspector.RemoteObject.resolveNode(domNode, "console", function (remoteObject) {
                    if (!remoteObject) return;
                    var text = WebInspector.UIString("Selected Element");
                    WebInspector.consoleLogViewController.appendImmediateExecutionWithResult(text, remoteObject);
                });
            }

            contextMenu.appendSeparator();

            if (!this._excludeRevealElementContextMenu) contextMenu.appendItem(WebInspector.UIString("Reveal in DOM Tree"), revealElement);

            contextMenu.appendItem(WebInspector.UIString("Log Element"), logElement);
        }
    }, {
        key: "_showShadowDOMSettingChanged",
        value: function _showShadowDOMSettingChanged(event) {
            var nodeToSelect = this.selectedTreeElement ? this.selectedTreeElement.representedObject : null;
            while (nodeToSelect) {
                if (!nodeToSelect.isInShadowTree()) break;
                nodeToSelect = nodeToSelect.parentNode;
            }

            this.children.forEach(function (child) {
                child.updateChildren(true);
            });

            if (nodeToSelect) this.selectDOMNode(nodeToSelect);
        }
    }, {
        key: "_hideElement",
        value: function _hideElement(event, keyboardShortcut) {
            if (!this.selectedTreeElement || WebInspector.isEditingAnyField()) return;

            event.preventDefault();

            var selectedNode = this.selectedTreeElement.representedObject;
            console.assert(selectedNode);
            if (!selectedNode) return;

            if (selectedNode.nodeType() !== Node.ELEMENT_NODE) return;

            if (this._togglePending) return;
            this._togglePending = true;

            function toggleProperties() {
                nodeStyles.removeEventListener(WebInspector.DOMNodeStyles.Event.Refreshed, toggleProperties, this);

                var opacityProperty = nodeStyles.inlineStyle.propertyForName("opacity");
                opacityProperty.value = "0";
                opacityProperty.important = true;

                var pointerEventsProperty = nodeStyles.inlineStyle.propertyForName("pointer-events");
                pointerEventsProperty.value = "none";
                pointerEventsProperty.important = true;

                if (opacityProperty.enabled && pointerEventsProperty.enabled) {
                    opacityProperty.remove();
                    pointerEventsProperty.remove();
                } else {
                    opacityProperty.add();
                    pointerEventsProperty.add();
                }

                delete this._togglePending;
            }

            var nodeStyles = WebInspector.cssStyleManager.stylesForNode(selectedNode);
            if (nodeStyles.needsRefresh) {
                nodeStyles.addEventListener(WebInspector.DOMNodeStyles.Event.Refreshed, toggleProperties, this);
                nodeStyles.refresh();
            } else toggleProperties.call(this);
        }
    }, {
        key: "rootDOMNode",
        get: function () {
            return this._rootDOMNode;
        },
        set: function (x) {
            if (this._rootDOMNode === x) return;

            this._rootDOMNode = x;

            this._isXMLMimeType = x && x.isXMLNode();

            this.update();
        }
    }, {
        key: "isXMLMimeType",
        get: function () {
            return this._isXMLMimeType;
        }
    }, {
        key: "editable",
        get: function () {
            return this._editable;
        },
        set: function (x) {
            this._editable = x;
        }
    }, {
        key: "editing",
        get: function () {
            return this._editing;
        }
    }, {
        key: "suppressRevealAndSelect",
        set: function (x) {
            if (this._suppressRevealAndSelect === x) return;
            this._suppressRevealAndSelect = x;
        }
    }]);

    return DOMTreeOutline;
})(WebInspector.TreeOutline);

WebInspector.DOMTreeOutline.Event = {
    SelectedNodeChanged: "dom-tree-outline-selected-node-changed"
};
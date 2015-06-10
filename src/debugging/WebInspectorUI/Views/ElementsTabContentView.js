/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.ElementsTabContentView = function (identifier) {
    var tabBarItem = new WebInspector.TabBarItem("Images/Elements.svg", WebInspector.UIString("Elements"));
    var detailsSidebarPanels = [WebInspector.domNodeDetailsSidebarPanel, WebInspector.cssStyleDetailsSidebarPanel];

    if (WebInspector.layerTreeDetailsSidebarPanel) detailsSidebarPanels.push(WebInspector.layerTreeDetailsSidebarPanel);

    WebInspector.ContentBrowserTabContentView.call(this, identifier || "elements", "elements", tabBarItem, null, detailsSidebarPanels, true);

    WebInspector.frameResourceManager.addEventListener(WebInspector.FrameResourceManager.Event.MainFrameDidChange, this._mainFrameDidChange, this);
    WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);

    this._showDOMTreeContentView();
};

WebInspector.ElementsTabContentView.prototype = Object.defineProperties({
    constructor: WebInspector.ElementsTabContentView,
    __proto__: WebInspector.ContentBrowserTabContentView.prototype,

    canShowRepresentedObject: function canShowRepresentedObject(representedObject) {
        return representedObject instanceof WebInspector.DOMTree;
    },

    showRepresentedObject: function showRepresentedObject(representedObject, cookie) {
        var domTreeContentView = this.contentBrowser.currentContentView;
        console.assert(!domTreeContentView || domTreeContentView instanceof WebInspector.DOMTreeContentView);
        if (!domTreeContentView || !(domTreeContentView instanceof WebInspector.DOMTreeContentView)) {
            // FIXME: Remember inspected node for later when _mainFrameDidChange.
            return;
        }

        if (!cookie || !cookie.nodeToSelect) return;

        domTreeContentView.selectAndRevealDOMNode(cookie.nodeToSelect);

        // Because nodeToSelect is ephemeral, we don't want to keep
        // it around in the back-forward history entries.
        cookie.nodeToSelect = undefined;
    },

    closed: function closed() {
        WebInspector.ContentBrowserTabContentView.prototype.closed.call(this);

        WebInspector.frameResourceManager.removeEventListener(null, null, this);
        WebInspector.Frame.removeEventListener(null, null, this);
    },

    // Private

    _showDOMTreeContentView: function _showDOMTreeContentView() {
        this.contentBrowser.contentViewContainer.closeAllContentViews();

        var mainFrame = WebInspector.frameResourceManager.mainFrame;
        if (mainFrame) this.contentBrowser.showContentViewForRepresentedObject(mainFrame.domTree);
    },

    _mainFrameDidChange: function _mainFrameDidChange(event) {
        this._showDOMTreeContentView();
    },

    _mainResourceDidChange: function _mainResourceDidChange(event) {
        if (!event.target.isMainFrame()) return;

        this._showDOMTreeContentView();
    }
}, {
    type: { // Public

        get: function () {
            return WebInspector.ElementsTabContentView.Type;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ElementsTabContentView.Type = "elements";
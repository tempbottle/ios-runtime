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

WebInspector.LayoutTimelineRecord = (function (_WebInspector$TimelineRecord) {
    function LayoutTimelineRecord(eventType, startTime, endTime, callFrames, sourceCodeLocation, x, y, width, height, quad) {
        _classCallCheck(this, LayoutTimelineRecord);

        _get(Object.getPrototypeOf(LayoutTimelineRecord.prototype), "constructor", this).call(this, WebInspector.TimelineRecord.Type.Layout, startTime, endTime, callFrames, sourceCodeLocation);

        console.assert(eventType);

        if (eventType in WebInspector.LayoutTimelineRecord.EventType) eventType = WebInspector.LayoutTimelineRecord.EventType[eventType];

        this._eventType = eventType;
        this._x = typeof x === "number" ? x : NaN;
        this._y = typeof y === "number" ? y : NaN;
        this._width = typeof width === "number" ? width : NaN;
        this._height = typeof height === "number" ? height : NaN;
        this._quad = quad instanceof WebInspector.Quad ? quad : null;
    }

    _inherits(LayoutTimelineRecord, _WebInspector$TimelineRecord);

    _createClass(LayoutTimelineRecord, [{
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            _get(Object.getPrototypeOf(LayoutTimelineRecord.prototype), "saveIdentityToCookie", this).call(this, cookie);

            cookie[WebInspector.LayoutTimelineRecord.EventTypeCookieKey] = this._eventType;
        }
    }, {
        key: "eventType",

        // Public

        get: function () {
            return this._eventType;
        }
    }, {
        key: "x",
        get: function () {
            return this._x;
        }
    }, {
        key: "y",
        get: function () {
            return this._y;
        }
    }, {
        key: "width",
        get: function () {
            return this._width;
        }
    }, {
        key: "height",
        get: function () {
            return this._height;
        }
    }, {
        key: "area",
        get: function () {
            return this._width * this._height;
        }
    }, {
        key: "rect",
        get: function () {
            if (!isNaN(this._x) && !isNaN(this._y)) return new WebInspector.Rect(this._x, this._y, this._width, this._height);
            return null;
        }
    }, {
        key: "quad",
        get: function () {
            return this._quad;
        }
    }], [{
        key: "displayNameForEventType",

        // Static

        value: function displayNameForEventType(eventType) {
            switch (eventType) {
                case WebInspector.LayoutTimelineRecord.EventType.InvalidateStyles:
                    return WebInspector.UIString("Styles Invalidated");
                case WebInspector.LayoutTimelineRecord.EventType.RecalculateStyles:
                    return WebInspector.UIString("Styles Recalculated");
                case WebInspector.LayoutTimelineRecord.EventType.InvalidateLayout:
                    return WebInspector.UIString("Layout Invalidated");
                case WebInspector.LayoutTimelineRecord.EventType.ForcedLayout:
                    return WebInspector.UIString("Forced Layout");
                case WebInspector.LayoutTimelineRecord.EventType.Layout:
                    return WebInspector.UIString("Layout");
                case WebInspector.LayoutTimelineRecord.EventType.Paint:
                    return WebInspector.UIString("Paint");
            }
        }
    }]);

    return LayoutTimelineRecord;
})(WebInspector.TimelineRecord);

WebInspector.LayoutTimelineRecord.EventType = {
    InvalidateStyles: "layout-timeline-record-invalidate-styles",
    RecalculateStyles: "layout-timeline-record-recalculate-styles",
    InvalidateLayout: "layout-timeline-record-invalidate-layout",
    ForcedLayout: "layout-timeline-record-forced-layout",
    Layout: "layout-timeline-record-layout",
    Paint: "layout-timeline-record-paint"
};

WebInspector.LayoutTimelineRecord.TypeIdentifier = "layout-timeline-record";
WebInspector.LayoutTimelineRecord.EventTypeCookieKey = "layout-timeline-record-event-type";
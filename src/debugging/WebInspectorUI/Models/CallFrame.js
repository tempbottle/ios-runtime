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

WebInspector.CallFrame = (function (_WebInspector$Object) {
    function CallFrame(id, sourceCodeLocation, functionName, thisObject, scopeChain, nativeCode) {
        _classCallCheck(this, CallFrame);

        _get(Object.getPrototypeOf(CallFrame.prototype), "constructor", this).call(this);

        console.assert(!sourceCodeLocation || sourceCodeLocation instanceof WebInspector.SourceCodeLocation);
        console.assert(!thisObject || thisObject instanceof WebInspector.RemoteObject);
        console.assert(!scopeChain || scopeChain instanceof Array);

        this._id = id || null;
        this._sourceCodeLocation = sourceCodeLocation || null;
        this._functionName = functionName || null;
        this._thisObject = thisObject || null;
        this._scopeChain = scopeChain || [];
        this._nativeCode = nativeCode || false;
    }

    _inherits(CallFrame, _WebInspector$Object);

    _createClass(CallFrame, [{
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie() {}
    }, {
        key: "collectScopeChainVariableNames",
        value: function collectScopeChainVariableNames(callback) {
            var result = { "this": true, __proto__: null };

            var pendingRequests = this._scopeChain.length;

            function propertiesCollected(properties) {
                for (var i = 0; properties && i < properties.length; ++i) result[properties[i].name] = true;

                if (--pendingRequests) return;

                callback(result);
            }

            for (var i = 0; i < this._scopeChain.length; ++i) this._scopeChain[i].object.deprecatedGetAllProperties(propertiesCollected);
        }
    }, {
        key: "id",

        // Public

        get: function () {
            return this._id;
        }
    }, {
        key: "sourceCodeLocation",
        get: function () {
            return this._sourceCodeLocation;
        }
    }, {
        key: "functionName",
        get: function () {
            return this._functionName;
        }
    }, {
        key: "nativeCode",
        get: function () {
            return this._nativeCode;
        }
    }, {
        key: "thisObject",
        get: function () {
            return this._thisObject;
        }
    }, {
        key: "scopeChain",
        get: function () {
            return this._scopeChain;
        }
    }], [{
        key: "fromPayload",

        // Static

        value: function fromPayload(payload) {
            console.assert(payload);

            var url = payload.url;
            var nativeCode = false;
            var sourceCodeLocation = null;

            if (!url || url === "[native code]") {
                nativeCode = true;
                url = null;
            } else {
                var sourceCode = WebInspector.frameResourceManager.resourceForURL(url);
                if (!sourceCode) sourceCode = WebInspector.debuggerManager.scriptsForURL(url)[0];

                if (sourceCode) {
                    // The lineNumber is 1-based, but we expect 0-based.
                    var lineNumber = payload.lineNumber - 1;
                    sourceCodeLocation = sourceCode.createLazySourceCodeLocation(lineNumber, payload.columnNumber);
                }
            }

            var functionName = payload.functionName !== "global code" ? payload.functionName : null;

            return new WebInspector.CallFrame(null, sourceCodeLocation, functionName, null, null, nativeCode);
        }
    }]);

    return CallFrame;
})(WebInspector.Object);

// Do nothing. The call frame is torn down when the inspector closes, and
// we shouldn't restore call frame content views across debugger pauses.
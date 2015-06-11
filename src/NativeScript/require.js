(function (applicationPath, createModuleFunction) {
    'use strict';

    function ModuleError() {
        var tmp = Error.apply(this, arguments);
        this.message = tmp.message;
        Object.defineProperty(this, 'stack', { get: function() { return tmp.stack }});
    }
    ModuleError.prototype = Object.create(Error.prototype);
    ModuleError.prototype.constructor = ModuleError;
    global.ModuleError = ModuleError;

    var fileManager = NSFileManager.defaultManager();
    var nsstr = NSString.stringWithString.bind(NSString);

    applicationPath = nsstr(applicationPath).stringByStandardizingPath;

    var USER_MODULES_ROOT = nsstr('app');
    var CORE_MODULES_ROOT = nsstr('app/tns_modules');

    var isDirectory = new interop.Reference(interop.types.bool, false);
    var requireMap = JSON.parse(NSString.stringWithContentsOfFileEncodingError(NSString.pathWithComponents([applicationPath, USER_MODULES_ROOT, 'require-map.json']), NSUTF8StringEncoding, null));

    function __findModule(moduleIdentifier, previousPath) {
        previousPath = previousPath || USER_MODULES_ROOT + '/index.js';

        var absolutePath;
        if (/^\.{1,2}\//.test(moduleIdentifier)) { // moduleIdentifier starts with ./ or ../
            var moduleDir = nsstr(previousPath).stringByDeletingLastPathComponent;
            absolutePath = NSString.pathWithComponents([applicationPath, moduleDir, moduleIdentifier]);
        } else if (/^\//.test(moduleIdentifier)) { // moduleIdentifier starts with /
            absolutePath = NSString.pathWithComponents([moduleIdentifier]);
        } else {
            moduleDir = CORE_MODULES_ROOT;
            absolutePath = NSString.pathWithComponents([applicationPath, moduleDir, moduleIdentifier]);
        }

        absolutePath = nsstr(absolutePath).stringByStandardizingPath;

        // TODO
        var relativePath;
        if (absolutePath.indexOf(applicationPath) === 0) {
            relativePath = absolutePath.substring(applicationPath.length + 2 + USER_MODULES_ROOT.length);
        } else {
            relativePath = absolutePath;
        }
        var resolvedFile = requireMap[relativePath];

        if (!resolvedFile) {
            throw new ModuleError("Failed to find module '" + moduleIdentifier + "' relative to '" + previousPath + "'. Computed path: " + absolutePath);
        }

        absolutePath = NSString.pathWithComponents([applicationPath, USER_MODULES_ROOT, resolvedFile]).toString();

        return {
            name: nsstr(moduleIdentifier).lastPathComponent,
            path: absolutePath,
            bundlePath: absolutePath.substr(applicationPath.length)
        };
    }

    function __executeModule(moduleMetadata, module) {
        var modulePath = moduleMetadata.bundlePath;
        module.require = function require(moduleIdentifier) {
            return __loadModule(moduleIdentifier, modulePath).exports;
        };
        var moduleSource = NSString.stringWithContentsOfFileEncodingError(moduleMetadata.path, NSUTF8StringEncoding, null);
        var moduleFunction = createModuleFunction(moduleSource, moduleMetadata.bundlePath);
        var fileName = moduleMetadata.path;
        var dirName = nsstr(moduleMetadata.path).stringByDeletingLastPathComponent.toString();
        module.filename = fileName;
        moduleFunction(module.require, module, module.exports, dirName, fileName);
    }

    var modulesCache = new Map();
    function __loadModule(moduleIdentifier, previousPath) {
        if (/\.js$/.test(moduleIdentifier)) {
            moduleIdentifier = moduleIdentifier.replace(/\.js$/, '');
        }

        var moduleMetadata = __findModule(moduleIdentifier, previousPath);

        var key = moduleMetadata.bundlePath;
        if (modulesCache.has(key)) {
            return modulesCache.get(key);
        }

        var module = {};
        module.exports = {};
        module.id = moduleMetadata.bundlePath;

        modulesCache.set(key, module);

        __executeModule(moduleMetadata, module);

        return module;
    }

    return __loadModule;
});

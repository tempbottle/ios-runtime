//
//  ObjCMethodCall.mm
//  NativeScript
//
//  Created by Yavor Georgiev on 12.06.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#include "ObjCMethodCall.h"
#include <objc/message.h>
#include "ObjCTypes.h"
#include "ObjCClassBuilder.h"
#include "TypeFactory.h"
#include "Metadata.h"

namespace NativeScript {
using namespace JSC;
using namespace Metadata;

const ClassInfo ObjCMethodCall::s_info = { "ObjCMethodCall", &Base::s_info, 0, CREATE_METHOD_TABLE(ObjCMethodCall) };

void ObjCMethodCall::finishCreation(VM& vm, GlobalObject* globalObject, const MethodMeta* metadata, SEL aSelector) {
    Base::finishCreation(vm, metadata->jsName());
    const TypeEncoding* encodings = metadata->encodings()->first();

    JSCell* returnTypeCell = globalObject->typeFactory()->parseType(globalObject, encodings);
    const WTF::Vector<JSCell*> parameterTypesCells = globalObject->typeFactory()->parseTypes(globalObject, encodings, metadata->encodings()->count - 1);

    Base::initializeFFI(vm, returnTypeCell, parameterTypesCells, 2);
    this->_retainsReturnedCocoaObjects = metadata->ownsReturnedCocoaObject();

    this->_msgSend = reinterpret_cast<void*>(&objc_msgSend);
    this->_msgSendSuper = reinterpret_cast<void*>(&objc_msgSendSuper);

#if defined(__i386__)
    const ffi_type* returnFFIType = this->_returnType.ffiType;
    if (returnFFIType->type == FFI_TYPE_FLOAT || returnFFIType->type == FFI_TYPE_DOUBLE || returnFFIType->type == FFI_TYPE_LONGDOUBLE) {
        this->_msgSend = reinterpret_cast<void*>(&objc_msgSend_fpret);
    } else if (returnFFIType->type == FFI_TYPE_STRUCT && returnFFIType->size > 8) {
        this->_msgSend = reinterpret_cast<void*>(&objc_msgSend_stret);
        this->_msgSendSuper = reinterpret_cast<void*>(&objc_msgSendSuper_stret);
    }
#elif defined(__x86_64__)
    const ffi_type* returnFFIType = this->_returnType.ffiType;
    if (returnFFIType->type == FFI_TYPE_LONGDOUBLE) {
        this->_msgSend = reinterpret_cast<void*>(&objc_msgSend_fpret);
    } else if (returnFFIType->type == FFI_TYPE_STRUCT && returnFFIType->size >= 32) {
        this->_msgSend = reinterpret_cast<void*>(&objc_msgSend_stret);
        this->_msgSendSuper = reinterpret_cast<void*>(&objc_msgSendSuper_stret);
    }
#elif defined(__arm__) && !defined(__LP64__)
    const ffi_type* returnFFIType = this->_returnType.ffiType;
    if (returnFFIType->type == FFI_TYPE_STRUCT) {
        this->_msgSend = reinterpret_cast<void*>(&objc_msgSend_stret);
        this->_msgSendSuper = reinterpret_cast<void*>(&objc_msgSendSuper_stret);
    }
#endif

    this->setSelector(aSelector ?: metadata->selector());
}

JSC::EncodedJSValue JSC_HOST_CALL ObjCMethodCall::executeCall(JSC::ExecState* execState) {
    ObjCMethodCall* instance = jsCast<ObjCMethodCall*>(execState->callee());
    FFICallFrame frame(instance, execState);

    instance->preCall(frame);

    if (execState->hadException()) {
        return JSValue::encode(jsUndefined());
    }

    id target = NativeScript::toObject(execState, execState->thisValue());
    Class targetClass = object_getClass(target);

    if (class_conformsToProtocol(targetClass, @protocol(TNSDerivedClass))) {
        objc_super super = { target, class_getSuperclass(targetClass) };
#ifdef DEBUG_OBJC_INVOCATION
        bool isInstance = !class_isMetaClass(targetClass);
        NSLog(@"> %@[%@(%@) %@]", isInstance ? @"-" : @"+", NSStringFromClass(targetClass), NSStringFromClass(super.super_class), NSStringFromSelector(instance->_selector));
#endif
        frame.setArgument(0, &super);
        frame.setArgument(1, instance->_selector);
        instance->executeFFICall(frame, FFI_FN(instance->_msgSendSuper));
    } else {
#ifdef DEBUG_OBJC_INVOCATION
        bool isInstance = !class_isMetaClass(targetClass);
        NSLog(@"> %@[%@ %@]", isInstance ? @"-" : @"+", NSStringFromClass(targetClass), NSStringFromSelector(instance->_selector));
#endif
        frame.setArgument(0, target);
        frame.setArgument(1, instance->_selector);
        instance->executeFFICall(frame, FFI_FN(instance->_msgSend));
    }

    instance->postCall(frame);
    EncodedJSValue result = instance->encodedJSResult(frame);

    if (instance->retainsReturnedCocoaObjects()) {
        id returnValue = *static_cast<id*>(frame.result());
        [returnValue release];
    }

    return result;
}

CallType ObjCMethodCall::getCallData(JSCell* cell, CallData& callData) {
    callData.native.function = &ObjCMethodCall::executeCall;
    return CallTypeHost;
}
}

//
//  FFIFunctionCall.cpp
//  NativeScript
//
//  Created by Yavor Georgiev on 07.07.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#include "FFIFunctionCall.h"

namespace NativeScript {
using namespace JSC;
using namespace Metadata;

const ClassInfo FFIFunctionCall::s_info = { "FFIFunctionCall", &Base::s_info, 0, CREATE_METHOD_TABLE(FFIFunctionCall) };

void FFIFunctionCall::finishCreation(VM& vm, const void* functionPointer, const WTF::String& name, JSCell* returnType, const WTF::Vector<JSCell*>& parameterTypes, bool retainsReturnedCocoaObjects) {
    Base::finishCreation(vm, name);
    this->_functionPointer = functionPointer;
    this->_retainsReturnedCocoaObjects = retainsReturnedCocoaObjects;
    Base::initializeFFI(vm, returnType, parameterTypes);
}

EncodedJSValue JSC_HOST_CALL FFIFunctionCall::executeCall(ExecState* execState) {
    FFIFunctionCall* instance = jsCast<FFIFunctionCall*>(execState->callee());
    FFICallFrame frame(instance, execState);

    instance->preCall(frame);
    if (execState->hadException()) {
        return JSValue::encode(jsUndefined());
    }

    instance->executeFFICall(frame, FFI_FN(instance->_functionPointer));
    EncodedJSValue result = instance->encodedJSResult(frame);
    if (instance->retainsReturnedCocoaObjects()) {
        id returnValue = *static_cast<id*>(frame.result());
        [returnValue release];
    }
    return result;
}

CallType FFIFunctionCall::getCallData(JSCell* cell, CallData& callData) {
    callData.native.function = &executeCall;
    return CallTypeHost;
}
}
//
//  FFICall.cpp
//  NativeScript
//
//  Created by Yavor Georgiev on 12.06.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#include "FFICall.h"

namespace NativeScript {
using namespace JSC;

FFICall::FFICallFrame::FFICallFrame(FFICall* ffiCall, ExecState* execState)
    : _execState(execState)
    , _ffiCall(ffiCall) {
    this->_result = malloc(_ffiCall->_returnType.ffiType->size);
    this->_arguments = new void*[_ffiCall->_cif->nargs];

    for (size_t i = 0; i < _ffiCall->_initialArgumentIndex; ++i) {
        this->_arguments[i] = malloc(std::max(ffi_type_pointer.size, sizeof(ffi_arg)));
    }

    for (size_t i = 0; i < _ffiCall->_parameterTypes.size(); i++) {
        const FFITypeMethodTable& ffiTypeMethodTable = _ffiCall->_parameterTypes[i];
        this->_arguments[i + _ffiCall->_initialArgumentIndex] = malloc(std::max(ffiTypeMethodTable.ffiType->size, sizeof(ffi_arg)));
    }
}

FFICall::FFICallFrame::~FFICallFrame() {
    for (unsigned i = 0; i < _ffiCall->_cif->nargs; i++) {
        free(this->_arguments[i]);
    }

    free(this->_result);
    delete[] this->_arguments;
}

const ClassInfo FFICall::s_info = { "FFICall", &Base::s_info, 0, CREATE_METHOD_TABLE(FFICall) };

void FFICall::initializeFFI(VM& vm, JSCell* returnType, const Vector<JSCell*>& parameterTypes, size_t initialArgumentIndex) {
    ASSERT(this->methodTable()->destroy != FFICall::destroy);

    this->_initialArgumentIndex = initialArgumentIndex;

    this->_returnTypeCell.set(vm, this, returnType);
    this->_returnType = getFFITypeMethodTable(returnType);

    size_t parametersCount = parameterTypes.size();
    this->putDirect(vm, vm.propertyNames->length, jsNumber(parametersCount), ReadOnly | DontEnum | DontDelete);

    const ffi_type** parameterTypesFFITypes = new const ffi_type*[parametersCount + initialArgumentIndex];

    for (size_t i = 0; i < initialArgumentIndex; ++i) {
        parameterTypesFFITypes[i] = &ffi_type_pointer;
    }

    for (size_t i = 0; i < parametersCount; i++) {
        JSCell* parameterTypeCell = parameterTypes[i];
        this->_parameterTypesCells.append(WriteBarrier<JSCell>(vm, this, parameterTypeCell));

        const FFITypeMethodTable& ffiTypeMethodTable = getFFITypeMethodTable(parameterTypeCell);
        this->_parameterTypes.append(ffiTypeMethodTable);

        parameterTypesFFITypes[i + initialArgumentIndex] = ffiTypeMethodTable.ffiType;
    }

    this->_cif = new ffi_cif;
    ffi_prep_cif(this->_cif, FFI_DEFAULT_ABI, parametersCount + initialArgumentIndex, const_cast<ffi_type*>(this->_returnType.ffiType), const_cast<ffi_type**>(parameterTypesFFITypes));
}

FFICall::~FFICall() {
    delete[] this->_cif->arg_types;
    delete this->_cif;
}

void FFICall::visitChildren(JSCell* cell, SlotVisitor& visitor) {
    Base::visitChildren(cell, visitor);

    FFICall* ffiCall = jsCast<FFICall*>(cell);
    visitor.append(&ffiCall->_returnTypeCell);
    visitor.append(ffiCall->_parameterTypesCells.begin(), ffiCall->_parameterTypesCells.end());
}

void FFICall::preCall(FFICallFrame& callFrame) {
    ExecState* execState = callFrame.execState();
    const size_t parametersCount = this->_parameterTypes.size();
    if (parametersCount != execState->argumentCount()) {
        WTF::String message = WTF::String::format("Actual arguments count: \"%lu\". Expected: \"%lu\". ", execState->argumentCount(), parametersCount);
        execState->vm().throwException(execState, createError(execState, message));
        return;
    }

    // TODO: Check if arguments can be converted

    for (unsigned i = 0; i < parametersCount && !execState->hadException(); i++) {
        JSValue argument = execState->uncheckedArgument(i);
        void* argumentBuffer = callFrame.arguments()[i + this->_initialArgumentIndex];
        JSCell* parameterType = this->_parameterTypesCells[i].get();
        this->_parameterTypes[i].write(execState, argument, argumentBuffer, parameterType);
    }
}

void FFICall::postCall(FFICallFrame& callFrame) {
    ExecState* execState = callFrame.execState();
    for (unsigned i = 0; i < execState->argumentCount(); i++) {
        JSValue argument = execState->uncheckedArgument(i);
        void* argumentBuffer = callFrame.arguments()[i + this->_initialArgumentIndex];
        JSCell* parameterType = this->_parameterTypesCells[i].get();
        this->_parameterTypes[i].postCall(execState, argument, argumentBuffer, parameterType);
    }
}

JSC::EncodedJSValue FFICall::encodedJSResult(FFICallFrame& callFrame) {
    JSC::JSValue jsResult = _returnType.read(callFrame.execState(), callFrame.result(), _returnTypeCell.get());
    return JSC::JSValue::encode(jsResult);
}
}
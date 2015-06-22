//
//  FFICall.h
//  NativeScript
//
//  Created by Yavor Georgiev on 12.06.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#ifndef __NativeScript__FFICall__
#define __NativeScript__FFICall__

#include "FFIType.h"

namespace NativeScript {

class FFICall : public JSC::InternalFunction {
public:
    typedef JSC::InternalFunction Base;

    DECLARE_INFO;

protected:
    class FFICallFrame {
    public:
        friend class FFICall;

        FFICallFrame(FFICall* ffiCall, JSC::ExecState* execState);
        ~FFICallFrame();

        template <class T>
        void setArgument(unsigned index, T argumentValue) {
            *static_cast<T*>(this->_arguments[index]) = argumentValue;
        }

        template <class T>
        T getArgument(unsigned index) const {
            return *static_cast<T*>(this->_arguments[index]);
        }

        void* result() { return _result; }
        void** arguments() { return _arguments; }
        JSC::ExecState* execState() { return _execState; }

    private:
        JSC::ExecState* _execState;
        FFICall* _ffiCall;
        void* _result;
        void** _arguments;
    };

    FFICall(JSC::VM& vm, JSC::Structure* structure)
        : Base(vm, structure) {
    }

    ~FFICall();

    void initializeFFI(JSC::VM& vm, JSC::JSCell* returnType, const WTF::Vector<JSC::JSCell*>& parameterTypes, size_t initialArgumentIndex = 0);

    static void visitChildren(JSC::JSCell*, JSC::SlotVisitor&);

    void preCall(FFICallFrame& callFrame);

    void postCall(FFICallFrame& callFrame);

    void executeFFICall(FFICallFrame& frame, void (*function)(void)) {
        JSC::JSLock::DropAllLocks locksDropper(frame.execState());
        ffi_call(this->_cif, function, frame.result(), frame.arguments());
    }

    JSC::EncodedJSValue encodedJSResult(FFICallFrame& callFrame);

    JSC::WriteBarrier<JSC::JSCell> _returnTypeCell;
    FFITypeMethodTable _returnType;

    WTF::Vector<JSC::WriteBarrier<JSC::JSCell>> _parameterTypesCells;
    WTF::Vector<FFITypeMethodTable> _parameterTypes;

    size_t _initialArgumentIndex;

    ffi_cif* _cif;
};
}

#endif /* defined(__NativeScript__FFICall__) */

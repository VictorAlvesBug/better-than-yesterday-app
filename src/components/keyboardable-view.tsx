import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type KeyboardableViewProps = {
    children: React.ReactNode;
}

export default function KeyboardableView({ children }: KeyboardableViewProps) {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    //const [keyboardWidth, setKeyboardWidth] = useState(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    function onKeyboardShow(e: KeyboardEvent) {
        setIsKeyboardOpen(true);
        //setKeyboardWidth(e.endCoordinates.width);
        setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardHide() {
        setIsKeyboardOpen(false);
        //setKeyboardWidth(0);
        setKeyboardHeight(0);
    }

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        const hideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

        return () => {
            showSub.remove();
            hideSub.remove();
        }
    }, []);

    const contentPaddingBottom = isKeyboardOpen ? keyboardHeight - 220 : 15;

    return (
        <KeyboardAwareScrollView
            className="flex-1"
            style={{
                flex: 1
            }}
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
            enableOnAndroid
            keyboardShouldPersistTaps='handled'
        >
            {children}
        </KeyboardAwareScrollView>
    )
}

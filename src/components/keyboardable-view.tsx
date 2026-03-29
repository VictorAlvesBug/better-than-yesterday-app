import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { twMerge } from 'tailwind-merge';

type KeyboardableViewProps = {
    children: React.ReactNode;
    className?: string;
}

export default function KeyboardableView({ children, className }: KeyboardableViewProps) {
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

    const contentPaddingBottom = isKeyboardOpen ? keyboardHeight - 290 : 15;

    return (
        <KeyboardAwareScrollView
            className={twMerge("flex-1", className)}
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

import React, {PropsWithChildren, useRef} from "react";
interface Props {
    action: () => void;
    interval?: number; // milliseconds between actions
    initialWait?: number; // milliseconds before firing
}

const touchSupported = 'ontouchstart' in window;

export const ContinuousActionTrigger = ({
                                            action,
                                            interval = 120,
                                            initialWait = 150,
                                            children,
                                        }: PropsWithChildren<Props>) => {

    const over = useRef<boolean>(false);
    const firing = useRef<boolean>(false);

    const fire = () => {
        if (over.current) {
            firing.current = true;
            action();
            setTimeout(fire, interval);
        }
    }

    const handleTouchEnd = () => {
        if (touchSupported) {
            action();
        }
    }

    const handleMouseEnter = () => {
        over.current = true;
    }

    const handleMouseDown = () => {
        over.current = true;
        setTimeout(fire, initialWait);
    }

    const handleMouseUp = () => {
        over.current = false;
        firing.current = false;
    }

    const handleMouseClick = () => {
        action();
    }

    return (
        <div
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleMouseClick}
        >
            {children}
        </div>
    )
}
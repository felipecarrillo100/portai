import React, {useEffect, useRef, useState} from 'react';
import "./FormHolder.scss";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import {ToolBar} from "./tools/ToolBar";


interface Props {
    visible: boolean;
    onClose?: ()=>void;
}

const ToolsHolder: React.FC<Props> = ( props: Props ) => {
    const formRef = useRef(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: any) => {
            if (event.keyCode === 27) {
                event.stopPropagation();
                event.preventDefault();
                if (typeof props.onClose === "function") props.onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);


    const className = props.visible ? "FormHolder visible" : "FormHolder"
    return (<div className={className} id="tool-bar-id">
        <div className="header">
            <div className="title"></div>
            <div className="closeButton">
                <IconButton onClick={props.onClose}>
                    <CloseIcon style={{ color: 'white' }}/>
                </IconButton>
            </div>
        </div>
        <div className="body">
            <div className="content" ref={contentRef}>
                <ToolBar />
            </div>
        </div>
    </div>)
}


export {
    ToolsHolder,
}
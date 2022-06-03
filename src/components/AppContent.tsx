import React from 'react';
import "./AppContent.scss";

const AppContent = ( props: React.PropsWithChildren<any>) => {
    return (<div className="AppContent">
        {props.children}
    </div>)
}

export {
    AppContent
}
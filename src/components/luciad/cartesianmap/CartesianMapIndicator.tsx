import React from "react";

interface Props {
    id?:string;
    class?:string;
}
const CartesianMapIndicator: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    return (<div id={props.id}></div>)
}

export {
    CartesianMapIndicator
}
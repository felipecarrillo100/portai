import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {ReferenceType} from "@luciad/ria/reference/ReferenceType";
import {LonLatPointFormat} from "@luciad/ria/shape/format/LonLatPointFormat";
import {Point} from "@luciad/ria/shape/Point";
import {Map} from "@luciad/ria/view/Map";
import React from "react";
import {Formatter, useFormattedMouseCoordinate} from "./useMouseCoordinate";
import "./MouseCoordinateReadout.scss";
import {useMouseHeight} from "./useMouseHeight";

interface Props {
    map: Map | null;
    reference?: CoordinateReference;
    formatter?: Formatter;
    defaultReadout?: string;
    getHeight?: (wgs84MouseLocation: Point) => Promise<number>;
}

interface PropsInternal {
    map: Map ;
    reference?: CoordinateReference;
    formatter?: Formatter;
    defaultReadout?: string;
    getHeight?: (wgs84MouseLocation: Point) => Promise<number>;
}

const InternalMouseCoordinateReadout  = ({
                                           map,
                                           reference,
                                           formatter,
                                           defaultReadout,
                                           getHeight
                                       }: PropsInternal) => {
    formatter = formatter ?? new LonLatPointFormat();
    reference = reference ?? getReference("CRS:84");
    defaultReadout = defaultReadout ?? "---°--'--\",----°--'--\"";

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const formattedMouseLocation = useFormattedMouseCoordinate(map, formatter, reference) ?? defaultReadout;
        let heightText = "";
        if (reference.referenceType !== ReferenceType.CARTESIAN) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const height = useMouseHeight(map, getHeight);
            heightText = `${height.toFixed(1)}m`;
        }

        return (
            <div className="mouse-coordinate-readout">
                <div className="mouse-coordinates">
                    {formattedMouseLocation}
                </div>
                <div className="mouse-height">
                    {heightText}
                </div>
            </div>
        );
}

export const MouseCoordinateReadout= ({
                                          map,
                                          reference,
                                          formatter,
                                          defaultReadout,
                                          getHeight
                                      }: Props) => {
    return  <>
        {map !== null && <InternalMouseCoordinateReadout map={map} reference={reference} formatter={formatter} defaultReadout={defaultReadout} getHeight={getHeight}  />}
    </>
}

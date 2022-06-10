/*
 *
 * Copyright (c) 1999-2022 Luciad All Rights Reserved.
 *
 * Luciad grants you ("Licensee") a non-exclusive, royalty free, license to use,
 * modify and redistribute this software in source and binary code form,
 * provided that i) this copyright notice and license appear on all copies of
 * the software; and ii) Licensee does not utilize the software in a manner
 * which is disparaging to Luciad.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 * IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
 * NON-INFRINGEMENT, ARE HEREBY EXCLUDED. LUCIAD AND ITS LICENSORS SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING
 * OR DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES. IN NO EVENT WILL LUCIAD OR ITS
 * LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 * INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 * CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 * OR INABILITY TO USE SOFTWARE, EVEN IF LUCIAD HAS BEEN ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGES.
 */
import {OutOfBoundsError} from "@luciad/ria/error/OutOfBoundsError";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {Point} from "@luciad/ria/shape/Point";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {createTransformation} from "@luciad/ria/transformation/TransformationFactory";
import {Map} from "@luciad/ria/view/Map";
import {useEffect, useState} from "react";

// RIA-2048
export interface Formatter {
  format(point: Point): string;
}

export const useMouseCoordinate = (map: Map, targetReference: CoordinateReference): [Point | null, Point | null] => {

  const [[modelPoint, viewPoint], setValue] = useState<[Point | null, Point | null]>([null, null]);

  useEffect(() => {
    const tempViewPoint = createPoint(null, []);
    const tempMapPoint = createPoint(map.reference, []);
    const tempModelPoint = createPoint(targetReference, []);

    const map2Model = createTransformation(map.reference, targetReference);

    const mouseMoved = (event: MouseEvent): void => {
      try {
        const mapNodePosition = map.domNode.getBoundingClientRect();
        //#snippet transformations
        tempViewPoint.move2D(
            event.clientX - mapNodePosition.left,
            event.clientY - mapNodePosition.top
        );
        map.viewToMapTransformation.transform(tempViewPoint, tempMapPoint);
        map2Model.transform(tempMapPoint, tempModelPoint);
        //#endsnippet transformations
        setValue([tempModelPoint.copy(), tempViewPoint.copy()]);
      } catch (e) {
        if (!(e instanceof OutOfBoundsError)) {
          throw e;
        } else {
          setValue([null, null]);
        }
      }
    };

    map.domNode.addEventListener("mousemove", mouseMoved, false);

    return (): void => {
      map.domNode.removeEventListener("mousemove", mouseMoved);
    };
  }, [map, targetReference]);

  return [
    modelPoint,
    viewPoint
  ]
}

export const useFormattedMouseCoordinate = (map: Map, formatter: Formatter,
                                            reference: CoordinateReference): string | null => {
  const [modelPoint] = useMouseCoordinate(map, reference);

  if (modelPoint) {
    return formatter.format(modelPoint);
  }
  return null;
}
import {OutOfBoundsError} from "@luciad/ria/error/OutOfBoundsError";
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {ReferenceType} from "@luciad/ria/reference/ReferenceType";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {LocationMode} from "@luciad/ria/transformation/LocationMode";
import {createTransformation} from "@luciad/ria/transformation/TransformationFactory";
import {PerspectiveCamera} from "@luciad/ria/view/camera/PerspectiveCamera";
import {Map} from "@luciad/ria/view/Map";
import React, {useEffect, useRef} from "react";
import {clamp, RAD2DEG} from "./Math";
import compassIcon from "./compass.svg";
import "./CompassButton.scss";

const CRS84 = getReference("CRS:84");
const geodesy = createEllipsoidalGeodesy(CRS84);
const OFFSET_DISTANCE = 1000;

/**
 * Returns the rotation (in 2D) or yaw (in 3D) of the map's camera.
 */
function getCameraRotation(map: Map) {
  const camera = map.camera;
  if (camera instanceof PerspectiveCamera) {
    return camera.asLookFrom().yaw;
  } else {
    return camera.asLook2D().rotation;
  }
}

/**
 * Returns the azimuth (angle to north) at the center of the given map.
 * @param map
 */
function getAzimuthAtViewCenter(map: Map) {
  //if the map is unreferenced or 3D, we can just get the camera's rotation
  if (map.reference.referenceType === ReferenceType.CARTESIAN || map.reference.referenceType ===
      ReferenceType.GEOCENTRIC) {
    return getCameraRotation(map);
  }

  //In 2D there might not be a general north direction (eg. polar stereographic projection), we calculate the
  //azimuth by getting the angle between the point at the center of the view and another point north of that.
  try {
    const world2llh = createTransformation(map.reference, CRS84);
    const llh2world = createTransformation(CRS84, map.reference);

    const centerViewPoint = createPoint(null, [map.viewSize[0] / 2, map.viewSize[1] / 2]);

    const centerllhPoint = world2llh.transform(map.viewToMapTransformation.transform(centerViewPoint));
    const higherllhPoint = geodesy.interpolate(centerllhPoint, OFFSET_DISTANCE, 0);

    const higherViewPoint = map.mapToViewTransformation.transform(llh2world.transform(higherllhPoint));

    return Math.atan2(centerViewPoint.x - higherViewPoint.x, centerViewPoint.y - higherViewPoint.y) * RAD2DEG;
  } catch (e) {
    if (e instanceof OutOfBoundsError) {
      return getCameraRotation(map);
    } else {
      throw e;
    }
  }
}

/**
 * Returns the x & y rotations that can be applied to a HTML icon to make it align with the given map's north direction.
 */
function calculateCSSRotation(map: Map) {
  const z = -getAzimuthAtViewCenter(map);
  let x = 0;

  const camera = map.camera;
  if (camera instanceof PerspectiveCamera) {
    const {pitch: cameraPitch} = camera.asLookFrom();

    // most perpendicular pitch is -89 deg
    x = clamp(89 + cameraPitch, 0, 90);
    // icon rotation is damped to avoid reducing the compass image to a pixel-width line
    x *= 60 / 90;
  }

  return {x, z};
}

function rotateToNorth(map: Map) {
  //try to rotate around the center of the screen or fall back to a rotation on the camera itself.
  let center;
  try {
    center = map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE)
        .transform(createPoint(null, [map.viewSize[0] / 2, map.viewSize[1] / 2]))
  } catch (e) {
    if (!(e instanceof OutOfBoundsError)) {
      throw e;
    }
    center = map.camera.eyePoint;
  }

  const deltaRotation = -getAzimuthAtViewCenter(map);

  map.mapNavigator.rotate({animate: true, deltaRotation: deltaRotation, deltaYaw: deltaRotation, center});
}

interface Props {
  map: Map | null;
}

/**
 * Component that represents a compass pointing in the direction from the center of the screen to the geographical north.
 * Clicking on the compass animates the map such that the north direction is up.
 */
export const CompassButton = ({map}: Props) => {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (map) {
      const handle = map.on("MapChange", () => {
        if (!ref.current) {
          return;
        }

        const {x, z} = calculateCSSRotation(map);
        ref.current.style.transform = `rotateX(${x}deg) rotateZ(${z}deg)`;
      });
    }
  }, [map]);

  if (map) {
    return (
        <div className="compass-button">
          <img
              className="compass-icon"
              ref={ref}
              src={compassIcon}
              alt="compass"
              onClick={() => rotateToNorth(map)}
          />
        </div>
    );
  } else {
    return (<></>)
  }

};
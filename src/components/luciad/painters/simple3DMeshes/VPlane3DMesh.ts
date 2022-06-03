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
/**
 * A 3D cylinder mesh.
 **/
export class VPlane3DMesh {

  private readonly _radius: number;
  private readonly _height: number;
  private readonly _sliceCount: number;
  private readonly _indices: number[];
  private _zOffset: number;

  /**
   * Creates a 3D cylinder mesh
   *
   * @param radius the radius of the cylinder
   * @param height the height of the cylinder
   * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
   */
  constructor(radius: number, height: number, sliceCount: number) {
    this._radius = radius;
    this._height = height;
    this._sliceCount = sliceCount;

    this._indices = [];
    this._zOffset = 0;
  }

  get zOffset(): number {
    return this._zOffset;
  }

  set zOffset(value: number) {
    this._zOffset = value;
  }

  createVertices(): number[] {
   // fill in here
    const vertices: number[] = [0,0,0, 1,0,0, 0,1,0];
    return vertices;
  }

  createIndices(): number[] {
    // fill in here
    const triangles: number[] = [0,1,2];
    return triangles;
  }

  createNormals(): number[] {
    const normals: number[] = [0,0,0, 1,0,0, 0,1,0];
    return normals;
  }

  createTextureCoordinates(): number[] {
    const texCoords: number[] = [0,1,2];
    return texCoords;
  }
}
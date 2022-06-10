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
  private data: { indices: number[]; positions: number[]; texCoords: number[] };

  /**
   * Creates a 3D cylinder mesh
   *
   * @param radius the radius of the cylinder
   * @param height the height of the cylinder
   * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
   */
  constructor(width: number, height: number) {
      const positions = [
        0, -width / 2, height / 2, // vertex 0
        0, width / 2, -height / 2, // vertex 1
        0, -width / 2, -height / 2, // vertex 2
        0, width / 2, height / 2  // vertex 3
      ];
      const indices = [
        0, 1, 2, // triangle 0-1-2
        0, 3, 1, // triangle 0-3-1
      ];
      const texCoords = [
        1, 0, // mapped to vertex 0
        0, 1, // mapped to vertex 1
        1, 1, // mapped to vertex 2
        0, 0, // mapped to vertex 3
      ];
      this.data = {
        positions,
        indices,
        texCoords,
      };
  }

  createVertices(): number[] {
    return this.data.positions;
  }

  createIndices(): number[] {
    return this.data.indices;
  }

  createNormals(): number[] {
    const normals: number[] = [0,0,0, 1,0,0, 0,1,0];
    return normals;
  }

  createTextureCoordinates(): number[] {
    return this.data.texCoords;
  }
}
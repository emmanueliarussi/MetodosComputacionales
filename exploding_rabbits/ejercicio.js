export function pointInPolygon(point, polygon) {
    const v0 = [polygon[0].x, polygon[0].y];
    for (let i = 1; i < polygon.length - 1; i++) {
      const v1 = [polygon[i].x, polygon[i].y];
      const v2 = [polygon[i + 1].x, polygon[i + 1].y];
      const barycentric = getBarycentricCoordinates(point, v0, v1, v2);
      if (barycentric[0] >= 0 && barycentric[1] >= 0 && barycentric[2] >= 0) {
        return true;
      }
    }
    return false;
}

function getBarycentricCoordinates(point, v0, v1, v2) {
    const v0v1 = [v1[0] - v0[0], v1[1] - v0[1]];
    const v0v2 = [v2[0] - v0[0], v2[1] - v0[1]];
    const v0p = [point.x - v0[0], point.y - v0[1]];
    const d00 = dotProduct(v0v1, v0v1);
    const d01 = dotProduct(v0v1, v0v2);
    const d11 = dotProduct(v0v2, v0v2);
    const d20 = dotProduct(v0p, v0v1);
    const d21 = dotProduct(v0p, v0v2);
    const denominator = d00 * d11 - d01 * d01;
    const b1 = (d11 * d20 - d01 * d21) / denominator;
    const b2 = (d00 * d21 - d01 * d20) / denominator;
    const b0 = 1 - b1 - b2;
    return [b0, b1, b2];
}

function dotProduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

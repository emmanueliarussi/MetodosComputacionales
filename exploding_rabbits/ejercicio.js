export function pointInPolygon(point, polygon) {

    console.log(`X: ${point[0]}, Y: ${point[1]}`);

    const p0 = [polygon[0].x, polygon[0].y];
    for (let i = 1; i < polygon.length - 1; i+=1) {
      const p1 = [polygon[i].x, polygon[i].y];
      const p2 = [polygon[i + 1].x, polygon[i + 1].y];
      const barycentric = getBarycentricCoordinates(point, p0, p1, p2);
      if (barycentric[0] >= 0 && barycentric[1] >= 0 && barycentric[2] >= 0) {
        return true;
      }
    }
    return false;
}

function getBarycentricCoordinates(p, p0, p1, p2) {
    // Full triangle area
    const p1p0 = [p1[0] - p0[0], p1[1] - p0[1]];
    const p2p0 = [p2[0] - p0[0], p2[1] - p0[1]];
    const A    = Math.abs(p1p0[0] * p2p0[1] - p1p0[1] * p2p0[0])/2;

    // Subareas
    const p0p = [p0[0] - p[0], p0[1] - p[1]];
    const p2p = [p2[0] - p[0], p2[1] - p[1]];
    const A1    = Math.abs(p0p[0] * p2p[1] - p0p[1] * p2p[0])/2;

    const p1p = [p1[0] - p[0], p1[1] - p[1]];
    const A2    = Math.abs(p1p[0] * p0p[1] - p1p[1] * p0p[0])/2;

    // Coef.
    const beta  = A1 / A;
    const gamma = A2 / A;
    const alpha = 1 - beta - gamma;

    return [alpha, beta, gamma];
}

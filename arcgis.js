import fetch from "node-fetch";
import proj4 from "proj4";
import fs from "graceful-fs";

/**
 * Calculates the perimeter and area of a parcel geometry.
 *
 * @param {Object} parcelData - The parcel data containing geometry and spatial reference.
 * @param {Object} [options] - Optional configuration.
 * @param {string} [options.inputCRS='EPSG:4326'] - Input Coordinate Reference System.
 * @param {string} [options.outputCRS='EPSG:4326'] - Desired Coordinate Reference System for calculations.
 * @returns {Object} - An object containing perimeter and area in various units.
 *
 * @throws {Error} Throws error if input geometry is invalid or CRS is unsupported.
 *
 * @example
 * const parcel = {
 *   type: "Polygon",
 *   coordinates: [
 *     [
 *       [-122.4194, 37.7749],
 *       [-122.4194, 37.8049],
 *       [-122.3894, 37.8049],
 *       [-122.3894, 37.7749],
 *       [-122.4194, 37.7749]
 *     ]
 *   ]
 * };
 *
 * const result = calculateParcelGeometry(parcel, {
 *   inputCRS: 'EPSG:4326',
 *   outputCRS: 'EPSG:3857'
 * });
 *
 * console.log(result);
 */
/**
 * Calculates the perimeter, area, and individual segment lengths of a parcel geometry.
 *
 * @param {Object} parcelData - The parcel data containing geometry and spatial reference.
 * @param {Object} [options] - Optional configuration.
 * @param {string} [options.inputCRS='EPSG:4326'] - Input Coordinate Reference System.
 * @param {string} [options.outputCRS='EPSG:3857'] - Desired Coordinate Reference System for calculations.
 * @returns {Object} - An object containing total perimeter, area, and segment details.
 *
 * @throws {Error} Throws error if input geometry is invalid or CRS is unsupported.
 *
 * @example
 * const parcel = {
 *   type: "Polygon",
 *   coordinates: [
 *     [
 *       [-122.4194, 37.7749],
 *       [-122.4194, 37.8049],
 *       [-122.3894, 37.8049],
 *       [-122.3894, 37.7749],
 *       [-122.4194, 37.7749]
 *     ]
 *   ]
 * };
 *
 * const result = calculateParcelGeometry(parcel, {
 *   inputCRS: 'EPSG:4326',
 *   outputCRS: 'EPSG:3857'
 * });
 *
 * console.log(result);
 */
/**
 * Utility function to round a number to a specified number of decimal places.
 * @param {number} num - The number to round.
 * @param {number} decimals - Number of decimal places.
 * @returns {number} - Rounded number.
 */
function round(num, decimals) {
  return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
}

/**
 * Calculates the distance between two geographic points using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point in degrees.
 * @param {number} lon1 - Longitude of the first point in degrees.
 * @param {number} lat2 - Latitude of the second point in degrees.
 * @param {number} lon2 - Longitude of the second point in degrees.
 * @returns {number} - Distance in meters.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371000; // Radius of the Earth in meters

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Calculates the area of a polygon using the Spherical Excess formula.
 * @param {Array} coordinates - Array of [longitude, latitude] pairs.
 * @returns {number} - Area in square meters.
 */
function calculateSphericalPolygonArea(coordinates) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  let total = 0;
  const len = coordinates.length;

  if (len < 3) return 0;

  for (let i = 0; i < len; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[(i + 1) % len];
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const λ1 = toRadians(lon1);
    const λ2 = toRadians(lon2);
    total += (λ2 - λ1) * (2 + Math.sin(φ1) + Math.sin(φ2));
  }

  const area = Math.abs((total * 6378137 * 6378137) / 2);
  return area; // in square meters
}

/**
 * Generates segment identifiers like A0-A1, A1-A2, ..., An-A0.
 * @param {number} numSegments - Number of segments.
 * @returns {Array} - Array of segment identifier strings.
 */
function generateSegmentIds(numSegments) {
  const segments = [];
  for (let i = 0; i < numSegments; i++) {
    const start = `A${i}`;
    const end = `A${i + 1}`;
    segments.push(`${start}-${end}`);
  }
  return segments;
}

/**
 * Calculates parcel geometry including per-segment lengths, total perimeter, and area.
 * @param {Object} parcelData - GeoJSON Polygon or MultiPolygon.
 * @returns {Object} - Geometry information with perimeter, area, and segments.
 */
function calculateParcelGeometry(parcelData) {
  if (!parcelData || !["Polygon", "MultiPolygon"].includes(parcelData.type)) {
    throw new Error(
      "Invalid parcel geometry. Expected a GeoJSON Polygon or MultiPolygon."
    );
  }

  // Function to process a single polygon
  const processPolygon = (coordinates) => {
    // Assuming the first ring is the exterior ring; others are holes
    const exteriorRing = coordinates[0];
    const segments = [];
    const segmentIds = generateSegmentIds(exteriorRing.length - 1); // last point is same as first

    let totalPerimeter = 0;

    for (let i = 0; i < exteriorRing.length - 1; i++) {
      const [lon1, lat1] = exteriorRing[i];
      const [lon2, lat2] = exteriorRing[i + 1];
      const distanceMeters = haversineDistance(lat1, lon1, lat2, lon2);
      const distanceFeet = distanceMeters * 3.28084;

      segments.push({
        segment: segmentIds[i],
        start: `A${i}`,
        end: `A${i + 1}`,
        lengthMeters: round(distanceMeters, 2),
        lengthFeet: round(distanceFeet, 2),
      });

      totalPerimeter += distanceMeters;
    }

    const area = calculateSphericalPolygonArea(exteriorRing);

    return { perimeter: totalPerimeter, area, segments };
  };

  let totalPerimeterMeters = 0;
  let totalAreaMeters = 0;
  const allSegments = [];

  if (parcelData.type === "Polygon") {
    const { perimeter, area, segments } = processPolygon(
      parcelData.coordinates
    );
    totalPerimeterMeters += perimeter;
    totalAreaMeters += area;
    allSegments.push(...segments);
  } else if (parcelData.type === "MultiPolygon") {
    parcelData.coordinates.forEach((polygonCoords) => {
      const { perimeter, area, segments } = processPolygon(polygonCoords);
      totalPerimeterMeters += perimeter;
      totalAreaMeters += area;
      allSegments.push(...segments);
    });
  }

  // Convert total perimeter to feet
  const totalPerimeterFeet = totalPerimeterMeters * 3.28084;

  // Convert area to square feet and hectares
  const squareMetersToFeetSquared = (sqMeters) => round(sqMeters * 10.7639, 2);
  const squareMetersToHectares = (sqMeters) => round(sqMeters / 10000, 4);

  const result = {
    perimeter: {
      meters: round(totalPerimeterMeters, 2),
      feet: round(totalPerimeterFeet, 2),
    },
    area: {
      squareMeters: round(totalAreaMeters, 2),
      squareFeet: squareMetersToFeetSquared(totalAreaMeters),
      hectares: squareMetersToHectares(totalAreaMeters),
    },
    segments: allSegments,
  };

  return result;
}

// Define the projections
const WGS84 = "EPSG:4326"; // Geographic coordinates
const WebMercator = "EPSG:3857"; // Web Mercator projection

(async () => {
  const res = await fetch(
    "https://maps.ottawa.ca/proxy/proxy.ashx?https://maps.ottawa.ca/arcgis/rest/services/Property_Information/MapServer/3/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=1&geometry=%7B%22xmin%22%3A-8404943.70609311%2C%22ymin%22%3A5665738.21084869%2C%22xmax%22%3A-8404929.374150308%2C%22ymax%22%3A5665752.542791492%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=PIN%2CFULL_ADDRESS_EN%2CPARCEL_TYPE%2CMUNICIPAL_ADDRESS_ID%2COBJECTID%2CADDRESS_NUMBER&outSR=102100&wab_dv=2.5",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie: "isfirst_https%3A%2F%2Fmaps.ottawa.ca%2Fgeoottawa%2F=false",
        Referer: "https://maps.ottawa.ca/geoottawa/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  const rings = json.features[0].geometry.rings[0];
  const geographicCoords = rings.map((ring) => {
    const elem = proj4(WebMercator, WGS84, ring);
    elem[0] = +elem[0].toFixed(4);
    elem[1] = +elem[1].toFixed(4);
    return elem;
  });
  const parcel = {
    type: "Polygon",
    coordinates: [geographicCoords],
  };
  console.log(calculateParcelGeometry(parcel));
})();

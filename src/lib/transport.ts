export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface TransportEstimate {
  distanceKm: number;
  roadDistanceKm: number;
  vehicleNameBn: string;
  vehicleNameEn: string;
  ratePerKm: number;
  estimatedCost: number;
  minCharge: number;
  weightKg: number;
}

/**
 * Calculates Haversine great-circle distance in kilometers between two coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated road freight cost based on Haversine distance, road factor 1.3,
 * weight requirements, and vehicle rates.
 */
export function calculateTransportQuote(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  weightKg: number
): TransportEstimate {
  const straightDistance = calculateHaversineDistanceKm(fromLat, fromLon, toLat, toLon);
  const roadFactor = 1.3;

  // If in the same district/coordinates, assign minimum intra-district transit distance
  const roadDistanceKm =
    straightDistance < 5 ? 15 : Math.round(straightDistance * roadFactor * 10) / 10;

  // Determine vehicle category
  let vehicleNameBn = 'পিকআপ (১-২ টন)';
  let vehicleNameEn = 'Pickup Truck (1-2 Ton)';
  let ratePerKm = 25;
  let minCharge = 400;

  if (weightKg <= 200) {
    vehicleNameBn = 'লোকাল ভ্যান (২০০ কেজি)';
    vehicleNameEn = 'Local Small Van (200 kg)';
    ratePerKm = 12;
    minCharge = 200;
  } else if (weightKg <= 2000) {
    vehicleNameBn = 'ছোট পিকআপ (১-২ টন)';
    vehicleNameEn = 'Small Pickup (1-2 Ton)';
    ratePerKm = 25;
    minCharge = 400;
  } else if (weightKg <= 5000) {
    vehicleNameBn = 'কাভার্ড ভ্যান (৩-৫ টন)';
    vehicleNameEn = 'Covered Van (3-5 Ton)';
    ratePerKm = 42;
    minCharge = 800;
  } else if (weightKg <= 10000) {
    vehicleNameBn = 'মাঝারি ট্রাক (৭-১০ টন)';
    vehicleNameEn = 'Medium Truck (7-10 Ton)';
    ratePerKm = 68;
    minCharge = 1500;
  } else {
    vehicleNameBn = '১০ চাকার ভারী ট্রাক (১৫ টন)';
    vehicleNameEn = 'Heavy Freight Truck (15 Ton)';
    ratePerKm = 95;
    minCharge = 2500;
  }

  const rawCost = roadDistanceKm * ratePerKm;
  // Round up to nearest ৳10
  const estimatedCost = Math.max(minCharge, Math.ceil(rawCost / 10) * 10);

  return {
    distanceKm: Math.round(straightDistance * 10) / 10,
    roadDistanceKm,
    vehicleNameBn,
    vehicleNameEn,
    ratePerKm,
    minCharge,
    estimatedCost,
    weightKg,
  };
}

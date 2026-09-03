/**
 * Comprehensive Geographic Coordinates for Indian Railway Stations
 * [longitude, latitude] matching GeoJSON and Indian Railways standards.
 */
export interface StationCoord {
  lat: number;
  lng: number;
  name: string;
}

export const STATION_COORDINATES: Record<string, StationCoord> = {
  // Northern & NCR
  NDLS: { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
  DLI:  { lat: 28.6606, lng: 77.2307, name: 'Old Delhi' },
  NZM:  { lat: 28.5888, lng: 77.2534, name: 'Hazrat Nizamuddin' },
  ANVT: { lat: 28.6508, lng: 77.3153, name: 'Anand Vihar Terminal' },
  GZB:  { lat: 28.6678, lng: 77.4338, name: 'Ghaziabad' },
  ALJN: { lat: 27.8974, lng: 78.0880, name: 'Aligarh Junction' },
  TDL:  { lat: 27.2057, lng: 78.2435, name: 'Tundla Junction' },
  ETW:  { lat: 26.7797, lng: 79.0277, name: 'Etawah Junction' },
  CNB:  { lat: 26.4499, lng: 80.3319, name: 'Kanpur Central' },
  PRYJ: { lat: 25.4358, lng: 81.8463, name: 'Prayagraj Junction' },
  MZP:  { lat: 25.1460, lng: 82.5690, name: 'Mirzapur' },
  DDU:  { lat: 25.2819, lng: 83.1147, name: 'Pt DD Upadhyaya Junction' },
  BSB:  { lat: 25.3176, lng: 82.9972, name: 'Varanasi Junction' },
  LKO:  { lat: 26.8322, lng: 80.9238, name: 'Lucknow NR' },
  BBK:  { lat: 26.9325, lng: 81.2014, name: 'Barabanki Junction' },
  GD:   { lat: 27.1332, lng: 81.9619, name: 'Gonda Junction' },
  BST:  { lat: 26.8016, lng: 82.7562, name: 'Basti' },
  GKP:  { lat: 26.7606, lng: 83.3732, name: 'Gorakhpur Junction' },
  MB:   { lat: 28.8386, lng: 78.7733, name: 'Moradabad Junction' },
  BE:   { lat: 28.3470, lng: 79.4204, name: 'Bareilly' },
  HSR:  { lat: 29.1539, lng: 75.7229, name: 'Hisar' },
  ROK:  { lat: 28.8909, lng: 76.5796, name: 'Rohtak Junction' },
  BNW:  { lat: 28.7830, lng: 76.1360, name: 'Bhiwani Junction' },
  AGC:  { lat: 27.1593, lng: 77.9946, name: 'Agra Cantt' },
  GWL:  { lat: 26.2183, lng: 78.1828, name: 'Gwalior Junction' },
  VGLJ: { lat: 25.4484, lng: 78.5685, name: 'Virangana Lakshmibai Jhansi' },
  BPL:  { lat: 23.2599, lng: 77.4126, name: 'Bhopal Junction' },
  RKMP: { lat: 23.2294, lng: 77.4262, name: 'Rani Kamlapati' },

  // Eastern & East Central
  GAYA: { lat: 24.7955, lng: 84.9994, name: 'Gaya Junction' },
  DHN:  { lat: 23.7957, lng: 86.4304, name: 'Dhanbad Junction' },
  GMO:  { lat: 23.8700, lng: 86.1500, name: 'NSC Bose Gomoh' },
  CRP:  { lat: 23.7500, lng: 86.1200, name: 'Chandrapura' },
  BKSC: { lat: 23.6500, lng: 86.1500, name: 'Bokaro Steel City' },
  MURI: { lat: 23.3800, lng: 85.8500, name: 'Muri Junction' },
  RNC:  { lat: 23.3441, lng: 85.3096, name: 'Ranchi' },
  ASN:  { lat: 23.6889, lng: 86.9661, name: 'Asansol Junction' },
  RNG:  { lat: 23.6200, lng: 87.1200, name: 'Raniganj' },
  DGR:  { lat: 23.5300, lng: 87.3100, name: 'Durgapur' },
  BWN:  { lat: 23.2324, lng: 87.8615, name: 'Barddhaman Junction' },
  HWH:  { lat: 22.5851, lng: 88.3426, name: 'Howrah Junction' },
  SDAH: { lat: 22.5675, lng: 88.3712, name: 'Sealdah' },
  KOAA: { lat: 22.6019, lng: 88.3768, name: 'Kolkata Chitpur' },
  KGP:  { lat: 22.3460, lng: 87.2320, name: 'Kharagpur Junction' },
  BLS:  { lat: 21.4934, lng: 86.9328, name: 'Balasore' },
  BHK:  { lat: 21.0574, lng: 86.4950, name: 'Bhadrak' },
  BBS:  { lat: 20.2706, lng: 85.8334, name: 'Bhubaneswar' },
  CTC:  { lat: 20.4625, lng: 85.8830, name: 'Cuttack' },
  PURI: { lat: 19.8135, lng: 85.8312, name: 'Puri' },
  RJPB: { lat: 25.6022, lng: 85.1764, name: 'Rajendra Nagar Terminal' },
  PNBE: { lat: 25.6022, lng: 85.1376, name: 'Patna Junction' },
  DNR:  { lat: 25.5900, lng: 85.0400, name: 'Danapur' },
  ARA:  { lat: 25.5560, lng: 84.6603, name: 'Ara Junction' },
  BXR:  { lat: 25.5647, lng: 83.9777, name: 'Buxar' },

  // Western & Central
  MMCT: { lat: 18.9696, lng: 72.8194, name: 'Mumbai Central' },
  CSMT: { lat: 18.9401, lng: 72.8353, name: 'Chhatrapati Shivaji Maharaj Terminus' },
  BVI:  { lat: 19.2288, lng: 72.8541, name: 'Borivali' },
  ST:   { lat: 21.2049, lng: 72.8311, name: 'Surat' },
  BRC:  { lat: 22.3107, lng: 73.1812, name: 'Vadodara Junction' },
  RTM:  { lat: 23.3315, lng: 75.0367, name: 'Ratlam Junction' },
  KOTA: { lat: 25.2138, lng: 75.8648, name: 'Kota Junction' },
  SWM:  { lat: 25.9928, lng: 76.3685, name: 'Sawai Madhopur' },
  JP:   { lat: 26.9221, lng: 75.7927, name: 'Jaipur Junction' },
  ADI:  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad Junction' },
  NGP:  { lat: 21.1458, lng: 79.0882, name: 'Nagpur Junction' },
  PUNE: { lat: 18.5204, lng: 73.8567, name: 'Pune Junction' },
  MAO:  { lat: 15.2736, lng: 73.9582, name: 'Madgaon Junction' },
  BKN:  { lat: 28.0229, lng: 73.3119, name: 'Bikaner Junction' },

  // Southern & South Central
  MAS:  { lat: 13.0827, lng: 80.2707, name: 'Chennai Central' },
  MS:   { lat: 13.0827, lng: 80.2800, name: 'Chennai Egmore' },
  SBC:  { lat: 12.9774, lng: 77.5708, name: 'KSR Bengaluru' },
  YPR:  { lat: 13.0238, lng: 77.5503, name: 'Yesvantpur Junction' },
  BZA:  { lat: 16.5062, lng: 80.6480, name: 'Vijayawada Junction' },
  VSKP: { lat: 17.7231, lng: 83.2986, name: 'Visakhapatnam Junction' },
  SC:   { lat: 17.4399, lng: 78.5017, name: 'Secunderabad Junction' },
  HYB:  { lat: 17.3924, lng: 78.4739, name: 'Hyderabad Deccan' },
  TVC:  { lat: 8.4875,  lng: 76.9525, name: 'Thiruvananthapuram Central' },
  ED:   { lat: 11.3410, lng: 77.7172, name: 'Erode Junction' },
  SA:   { lat: 11.6643, lng: 78.1460, name: 'Salem Junction' },
  CBE:  { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Junction' },
  ERS:  { lat: 9.9678,  lng: 76.2940, name: 'Ernakulam Junction' }
};

/**
 * Get station coordinates with fallback interpolation
 */
export function getStationCoordinate(stationCode: string): StationCoord | null {
  if (!stationCode) return null;
  const clean = stationCode.trim().toUpperCase();
  return STATION_COORDINATES[clean] || null;
}

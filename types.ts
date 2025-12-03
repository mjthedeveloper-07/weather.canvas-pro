export type ImageStyle = 'Isometric' | 'Realistic' | 'Cartoonish' | 'Cyberpunk';

export interface WeatherState {
  city: string;
  condition: WeatherCondition;
  temperature: number;
  unit: 'C' | 'F';
  date: string;
  style: ImageStyle;
}

export enum WeatherCondition {
  Sunny = 'Sunny',
  Cloudy = 'Cloudy',
  Rain = 'Rain',
  Storm = 'Storm',
  Snow = 'Snow',
  Fog = 'Fog',
}

export interface GeneratedCanvas {
  id: string;
  imageUrl: string;
  weatherState: WeatherState;
  timestamp: number;
}

export interface TrendingItem {
  city: string;
  reason: string; // e.g., "Heavy Rain", "Heatwave"
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}
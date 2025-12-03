import React from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from 'lucide-react';
import { WeatherCondition, ImageStyle, WeatherState } from './types';

export const WEATHER_ICONS: Record<WeatherCondition, React.ReactNode> = {
  [WeatherCondition.Sunny]: <Sun className="w-5 h-5" />,
  [WeatherCondition.Cloudy]: <Cloud className="w-5 h-5" />,
  [WeatherCondition.Rain]: <CloudRain className="w-5 h-5" />,
  [WeatherCondition.Storm]: <CloudLightning className="w-5 h-5" />,
  [WeatherCondition.Snow]: <CloudSnow className="w-5 h-5" />,
  [WeatherCondition.Fog]: <CloudFog className="w-5 h-5" />,
};

export const IMAGE_STYLES: ImageStyle[] = ['Isometric', 'Realistic', 'Cartoonish', 'Cyberpunk'];

export const DEFAULT_WEATHER_STATE: WeatherState = {
  city: '',
  condition: WeatherCondition.Sunny,
  temperature: 24,
  unit: 'C',
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  style: 'Isometric',
};

export const MOCK_TRENDS = [
  { city: 'London', reason: 'Fog' },
  { city: 'Tokyo', reason: 'Rain' },
  { city: 'New York', reason: 'Snow' },
];

export const POPULAR_CITIES = [
  "New York, USA", "London, UK", "Tokyo, Japan", "Paris, France", 
  "Singapore", "Dubai, UAE", "Sydney, Australia", "Mumbai, India",
  "Chennai, India", "Delhi, India", "Bangalore, India",
  "San Francisco, USA", "Los Angeles, USA", "Chicago, USA",
  "Toronto, Canada", "Vancouver, Canada", "Berlin, Germany",
  "Munich, Germany", "Rome, Italy", "Milan, Italy",
  "Barcelona, Spain", "Madrid, Spain", "Amsterdam, Netherlands",
  "Seoul, South Korea", "Beijing, China", "Shanghai, China",
  "Hong Kong", "Bangkok, Thailand", "Istanbul, Turkey",
  "Moscow, Russia", "Sao Paulo, Brazil", "Rio de Janeiro, Brazil",
  "Buenos Aires, Argentina", "Mexico City, Mexico", "Cape Town, South Africa",
  "Cairo, Egypt", "Lagos, Nigeria", "Nairobi, Kenya",
  "Jakarta, Indonesia", "Manila, Philippines", "Karachi, Pakistan"
];
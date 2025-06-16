import * as Location from 'expo-location';
import { t } from '../constants/i18n';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  runningTip: string;
}

export class LocationService {
  private static instance: LocationService;
  private apiKey: string = ''; // You'll need to get this from OpenWeatherMap
  
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get city name using reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address?.city || address?.district || 'Unknown',
        country: address?.country || 'Unknown',
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async getWeatherData(location: LocationData): Promise<WeatherData | null> {
    try {
      if (!this.apiKey) {
        // For demo purposes, return mock data
        return this.getMockWeatherData();
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        runningTip: this.getRunningTip(data.main.temp, data.weather[0].main),
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      return this.getMockWeatherData();
    }
  }

  private getMockWeatherData(): WeatherData {
    const mockConditions = [
      { temp: 22, condition: 'Clear', description: 'céu limpo' },
      { temp: 25, condition: 'Clouds', description: 'parcialmente nublado' },
      { temp: 18, condition: 'Rain', description: 'chuva leve' },
      { temp: 28, condition: 'Clear', description: 'ensolarado' },
    ];

    const randomCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
    
    return {
      temperature: randomCondition.temp,
      condition: randomCondition.condition,
      description: randomCondition.description,
      humidity: 65,
      windSpeed: 3.5,
      icon: '01d',
      runningTip: this.getRunningTip(randomCondition.temp, randomCondition.condition),
    };
  }

  private getRunningTip(temperature: number, condition: string): string {
    if (condition === 'Rain') {
      return t('rainy_day');
    } else if (temperature > 30) {
      return t('hot_day');
    } else if (temperature < 10) {
      return t('cold_day');
    } else {
      return t('perfect_for_running');
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

export const locationService = LocationService.getInstance(); 
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = '32b85baedbf01b9b937a80e16aeaf84c';

const getWeatherEmoji = (description) => {
  if (description.includes('clear')) return '☀️';
  if (description.includes('cloud')) return '⛅';
  if (description.includes('rain')) return '🌧️';
  if (description.includes('thunder')) return '⛈️';
  if (description.includes('snow')) return '❄️';
  if (description.includes('mist') || description.includes('fog')) return '🌫️';
  return '🌤️';
};

export default function Explore() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('');

  const fetchForecast = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== '200') {
        setError('Could not load forecast');
      } else {
        const daily = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
        setForecast(daily);
        setCity(cityName);
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('lastCity').then(saved => {
        fetchForecast(saved || 'Mysuru');
      });
    }, [])
  );

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>Loading forecast...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.error}>{error}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📅 5-Day Forecast</Text>
      <Text style={styles.subtitle}>{city}</Text>

      {forecast.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.emoji}>{getWeatherEmoji(item.weather[0].description)}</Text>
            <View>
              <Text style={styles.day}>{getDayName(item.dt_txt)}</Text>
              <Text style={styles.desc}>{item.weather[0].description}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.temp}>{Math.round(item.main.temp)}°C</Text>
            <Text style={styles.minmax}>
              {Math.round(item.main.temp_min)}° / {Math.round(item.main.temp_max)}°
            </Text>
            <Text style={styles.humidity}>💧 {item.main.humidity}%</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', backgroundColor: '#1a1a2e', padding: 20, paddingTop: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#4a90e2', marginBottom: 30 },
  loadingText: { color: '#aaa', marginTop: 10 },
  card: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardRight: { alignItems: 'flex-end' },
  emoji: { fontSize: 36 },
  day: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 13, color: '#aaa', textTransform: 'capitalize', marginTop: 2 },
  temp: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  minmax: { fontSize: 13, color: '#aaa', marginTop: 2 },
  humidity: { fontSize: 13, color: '#4a90e2', marginTop: 2 },
  error: { fontSize: 18, color: 'red' },
});
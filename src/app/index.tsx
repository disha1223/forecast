import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';

const API_KEY = '32b85baedbf01b9b937a80e16aeaf84c';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [recentCities, setRecentCities] = useState([]);

  const saveToFirebase = async (cityName) => {
    try {
      await addDoc(collection(db, 'searches'), {
        city: cityName,
        timestamp: new Date(),
      });
      fetchRecentCities();
    } catch (e) {
      console.log('Firebase error:', e);
    }
  };

  const fetchRecentCities = async () => {
    try {
      const q = query(collection(db, 'searches'), orderBy('timestamp', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const cities = snapshot.docs.map(doc => doc.data().city);
      setRecentCities([...new Set(cities)]);
    } catch (e) {
      console.log('Fetch error:', e);
    }
  };

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) {
        setError('City not found');
      } else {
        setWeather(data);
        await saveToFirebase(cityName);
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecentCities();
    fetchWeather('Mysuru');
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      fetchWeather(search.trim());
      setSearch('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search city..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {recentCities.length > 0 && (
        <View style={styles.recentRow}>
          {recentCities.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentChip}
              onPress={() => fetchWeather(city)}
            >
              <Text style={styles.recentText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.weatherBox}>
          <Text style={styles.city}>{weather.name}</Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <Text style={styles.extra}>Feels like: {Math.round(weather.main.feels_like)}°C</Text>
          <Text style={styles.extra}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.extra}>Wind: {weather.wind.speed} m/s</Text>
          <Text style={styles.extra}>Min: {Math.round(weather.main.temp_min)}°C  |  Max: {Math.round(weather.main.temp_max)}°C</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 20 },
  searchRow: { flexDirection: 'row', marginBottom: 10, width: '100%', maxWidth: 400 },
  input: { flex: 1, backgroundColor: '#2a2a4a', color: '#fff', padding: 12, borderRadius: 10, fontSize: 16, marginRight: 10 },
  button: { backgroundColor: '#4a90e2', padding: 12, borderRadius: 10, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  weatherBox: { alignItems: 'center', marginTop: 10 },
  city: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  temp: { fontSize: 80, fontWeight: '200', color: '#fff' },
  desc: { fontSize: 18, color: '#aaa', textTransform: 'capitalize', marginBottom: 20 },
  extra: { fontSize: 16, color: '#aaa', marginTop: 5 },
  error: { fontSize: 18, color: 'red' },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  recentChip: { backgroundColor: '#2a2a4a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  recentText: { color: '#4a90e2', fontSize: 13 },
});
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSpotifyAuth } from '@/context/spotify-auth-context';
import { MC } from '@/constants/theme';

export default function LoginScreen() {
  const { request, promptAsync } = useSpotifyAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>caffy ♪</Text>
      <Text style={styles.subtitle}>Your music, your way</Text>
      <TouchableOpacity
        style={[styles.button, !request && styles.buttonDisabled]}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Connect with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MC.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: MC.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: MC.textSecondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});

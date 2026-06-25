const BASE = 'https://api.spotify.com/v1';

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  popularity: number;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  album_type: string;
  total_tracks: number;
  release_date: string;
};

export type SpotifyUser = {
  display_name: string;
  images: { url: string }[];
};

export async function getMe(token: string): Promise<SpotifyUser> {
  return get('/me', token);
}

export async function getTopArtists(token: string, limit = 10): Promise<SpotifyArtist[]> {
  const data = await get<{ items: SpotifyArtist[] }>(`/me/top/artists?limit=${limit}&time_range=medium_term`, token);
  return data.items;
}

export async function getTopTracks(token: string, limit = 10): Promise<SpotifyTrack[]> {
  const data = await get<{ items: SpotifyTrack[] }>(`/me/top/tracks?limit=${limit}&time_range=short_term`, token);
  return data.items;
}

export async function getNewReleases(token: string, limit = 10): Promise<SpotifyAlbum[]> {
  const data = await get<{ albums: { items: SpotifyAlbum[] } }>(`/browse/new-releases?limit=${limit}`, token);
  return data.albums.items;
}

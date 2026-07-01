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
  preview_url: string | null;
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
  const data = await get<{ items: { added_at: string; album: SpotifyAlbum }[] }>(`/me/albums?limit=${limit}`, token);
  return data.items.map((i) => i.album);
}

export type SpotifySavedTrack = {
  added_at: string;
  track: SpotifyTrack & { duration_ms: number };
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
};

export async function getSavedTracks(token: string, limit = 30): Promise<SpotifySavedTrack[]> {
  const data = await get<{ items: SpotifySavedTrack[] }>(`/me/tracks?limit=${limit}`, token);
  return data.items;
}

export async function getPlaylists(token: string, limit = 30): Promise<SpotifyPlaylist[]> {
  const data = await get<{ items: SpotifyPlaylist[] }>(`/me/playlists?limit=${limit}`, token);
  return data.items;
}

export type RecentlyPlayed = {
  played_at: string;
  track: SpotifyTrack & { duration_ms: number; album: { name: string; images: { url: string }[] } };
};

export async function getRecentlyPlayed(token: string, limit = 20): Promise<RecentlyPlayed[]> {
  const data = await get<{ items: RecentlyPlayed[] }>(`/me/player/recently-played?limit=${limit}`, token);
  return data.items;
}

export type SearchResults = {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
};

export async function search(token: string, query: string): Promise<SearchResults> {
  const encoded = encodeURIComponent(query);
  const data = await get<{
    tracks: { items: SpotifyTrack[] };
    artists: { items: SpotifyArtist[] };
    albums: { items: SpotifyAlbum[] };
  }>(`/search?q=${encoded}&type=track,artist,album&limit=5`, token);
  return {
    tracks: data.tracks.items,
    artists: data.artists.items,
    albums: data.albums.items,
  };
}

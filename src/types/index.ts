 export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  releaseYear: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseYear: number;
  genre: string;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
  albums: Album[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
}

export interface AppState {
  auth: AuthState;
  player: PlayerState;
  songs: Song[];
  playlists: Playlist[];
  likedSongs: Song[];
  recentlyPlayed: Song[];
  searchQuery: string;
  searchResults: {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
  };
}
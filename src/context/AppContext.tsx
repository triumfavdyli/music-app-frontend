/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Song, Playlist } from '../types';
import { mockPlaylists, } from '../data/mockData';
import { songService, authService } from '../services/api';
import { API_URL } from '../config';

type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_AUTH_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SONGS'; payload: Song[] }
  | { type: 'PLAY_SONG'; payload: Song }
  | { type: 'PAUSE_SONG' }
  | { type: 'RESUME_SONG' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'NEXT_SONG' }
  | { type: 'PREVIOUS_SONG' }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'ADD_TO_RECENTLY_PLAYED'; payload: Song }
  | { type: 'TOGGLE_LIKE_SONG'; payload: Song }
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'CREATE_PLAYLIST'; payload: Playlist }
  | { type: 'UPDATE_PLAYLIST'; payload: Playlist }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'ADD_SONG_TO_PLAYLIST'; payload: { playlistId: string; song: Song } }
  | { type: 'REMOVE_SONG_FROM_PLAYLIST'; payload: { playlistId: string; songId: string } }
  | { type: 'REORDER_PLAYLIST_SONGS'; payload: { playlistId: string; songs: Song[] } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: { songs: Song[]; artists: any[]; albums: any[] } }
  | { type: 'SET_LIKED_SONGS'; payload: Song[] }
  | { type: 'ADD_LIKED_SONG'; payload: Song }
  | { type: 'REMOVE_LIKED_SONG'; payload: string | number };

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false
  },
  player: {
    currentSong: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    currentIndex: 0
  },
  songs: [], 
  playlists: mockPlaylists,
  likedSongs: [],
  recentlyPlayed: [],
  searchQuery: '',
  searchResults: {
    songs: [],
    artists: [],
    albums: []
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
          loading: false
        }
      };

    case 'UPDATE_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload
        }
      };
    
    case 'SET_AUTH_TOKEN':
      localStorage.setItem('token', action.payload);
      return state;
    
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          loading: false
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: action.payload
        }
      };
    
    case 'SET_SONGS':
      return {
        ...state,
        songs: action.payload
      };
    
    case 'PLAY_SONG':
      const songIndexInQueue = state.player.queue.findIndex(queueSong => queueSong.id === action.payload.id);
      return {
        ...state,
        player: {
          ...state.player,
          currentSong: action.payload,
          currentIndex: songIndexInQueue >= 0 ? songIndexInQueue : state.player.currentIndex,
          isPlaying: true,
          currentTime: 0,
          duration: action.payload.duration
        }
      };
    
    case 'PAUSE_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: false
        }
      };
    
    case 'RESUME_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: true
        }
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        player: {
          ...state.player,
          volume: action.payload
        }
      };
    
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        player: {
          ...state.player,
          currentTime: action.payload
        }
      };
    
    case 'SET_DURATION':
      return {
        ...state,
        player: {
          ...state.player,
          duration: action.payload
        }
      };
    
    case 'NEXT_SONG':
      if (state.player.queue.length === 0) {
        return state;
      }
      const nextIndex = (state.player.currentIndex + 1) % state.player.queue.length;
      return {
        ...state,
        player: {
          ...state.player,
          currentIndex: nextIndex,
          currentSong: state.player.queue[nextIndex] || null,
          currentTime: 0,
          isPlaying: state.player.isPlaying 
        }
      };
    
    case 'PREVIOUS_SONG':
      if (state.player.queue.length === 0) {
        return state;
      }
      const prevIndex = state.player.currentIndex > 0 
        ? state.player.currentIndex - 1 
        : state.player.queue.length - 1;
      return {
        ...state,
        player: {
          ...state.player,
          currentIndex: prevIndex,
          currentSong: state.player.queue[prevIndex] || null,
          currentTime: 0,
          isPlaying: state.player.isPlaying
        }
      };
    
    case 'SET_QUEUE':
      return {
        ...state,
        player: {
          ...state.player,
          queue: action.payload,
          currentIndex: 0
        }
      };
    
    case 'ADD_TO_RECENTLY_PLAYED': {
      const filteredRecent = state.recentlyPlayed.filter(song => song.id !== action.payload.id);
      return {
        ...state,
        recentlyPlayed: [action.payload, ...filteredRecent].slice(0, 20)
      };
    }
    
    case 'TOGGLE_LIKE_SONG': {
      const isLiked = state.likedSongs.some(song => song.id === action.payload.id);
      return {
        ...state,
        likedSongs: isLiked
          ? state.likedSongs.filter(song => song.id !== action.payload.id)
          : [...state.likedSongs, action.payload]
      };
    }
    
    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload
      };
    
    case 'CREATE_PLAYLIST':
      return {
        ...state,
        playlists: [...state.playlists, action.payload]
      };
    
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.id ? action.payload : playlist
        )
      };
    
    case 'DELETE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter(playlist => playlist.id !== action.payload)
      };
    
    case 'ADD_SONG_TO_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.playlistId
            ? { ...playlist, songs: [...playlist.songs, action.payload.song] }
            : playlist
        )
      };
    
    case 'REMOVE_SONG_FROM_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.playlistId
            ? { ...playlist, songs: playlist.songs.filter(song => song.id !== action.payload.songId) }
            : playlist
        )
      };
    
    case 'REORDER_PLAYLIST_SONGS':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.playlistId
            ? { ...playlist, songs: action.payload.songs }
            : playlist
        )
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload
      };
    
    case 'SET_LIKED_SONGS':
      return {
        ...state,
        likedSongs: action.payload
      };
    
    case 'ADD_LIKED_SONG':
      return {
        ...state,
        likedSongs: [...state.likedSongs, action.payload]
      };
    
    case 'REMOVE_LIKED_SONG':
      return {
        ...state,
        likedSongs: state.likedSongs.filter(song => String(song.id) !== String(action.payload))
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
     
      
      if (token) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const userInfo = await authService.verifyToken();
          dispatch({ type: 'LOGIN', payload: userInfo });
        } catch (error) {
          localStorage.removeItem('token');
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const songs = await songService.getAllSongs();
        const workingSongs = songs.filter(song => {
          const hasWorkingAudio = song.audioUrl && !song.audioUrl.includes('soundjay.com');
          return hasWorkingAudio;
        });
        
        const uniqueSongs = workingSongs.filter((song, index, self) => 
          index === self.findIndex(s => s.title === song.title && s.artist === song.artist)
        );
        
        dispatch({ type: 'SET_SONGS', payload: uniqueSongs });
      } catch (error) {
        console.error('❌ AppContext: Failed to load songs:', error);
  
        dispatch({ type: 'SET_SONGS', payload: [] });
      }
    };

    loadSongs();
  }, []);

  // Load liked songs when user is authenticated
  useEffect(() => {
    const loadLikedSongs = async () => {
      if (state.auth.isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/likes`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (response.ok) {
            const likedSongsData = await response.json();
          
            
            // Map backend data to frontend Song shape
            const songs = likedSongsData.map((like: any) => ({
              id: like.Song.id,
              title: like.Song.title,
              artist: like.Song.artist,
              album: like.Song.album,
              genre: like.Song.genre,
              url: like.Song.url,
              audioUrl: like.Song.url,
              coverUrl: like.Song.coverImage,
            }));
            
        
            dispatch({ type: 'SET_LIKED_SONGS', payload: songs });
          }
        } catch (error) {
          console.error('Failed to load liked songs:', error);
        }
      } else {
        // Clear liked songs when not authenticated
        dispatch({ type: 'SET_LIKED_SONGS', payload: [] });
      }
    };

    loadLikedSongs();
  }, [state.auth.isAuthenticated]);

  // Load playlists when user is authenticated
  useEffect(() => {
    const loadPlaylists = async () => {
      if (state.auth.isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/playlists`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (response.ok) {
            const playlistsData = await response.json();
            
            const storedCovers = JSON.parse(localStorage.getItem('playlistCovers') || '{}');
 
            const playlists = playlistsData.map((playlist: any) => {
           
              return {
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                coverUrl: storedCovers[playlist.id] || '/default-playlist.jpg', 
                songs: playlist.Songs ? playlist.Songs.map((song: any) => ({
                  id: song.id,
                  title: song.title,
                  artist: song.artist,
                  album: song.album,
                  genre: song.genre,
                  url: song.url,
                  audioUrl: song.url,
                  coverUrl: song.coverImage,
                })) : []
              };
            });
        
            dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
          }
        } catch (error) {
          console.error('Failed to load playlists:', error);
        }
      } else {
        dispatch({ type: 'SET_PLAYLISTS', payload: mockPlaylists });
      }
    };

    loadPlaylists();
  }, [state.auth.isAuthenticated]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
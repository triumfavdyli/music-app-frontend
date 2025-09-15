import { Song, Artist, Playlist } from '../types';

// COMPLETELY REMOVED - NO MORE MOCK SONGS! Only use database songs.
export const mockSongs: Song[] = [];

export const mockArtists: Artist[] = [];

export const mockPlaylists: Playlist[] = [];

export const mockGenres = ['Electronic', 'Chill', 'Hip-Hop', 'Ambient', 'Rock', 'Jazz', 'Synthwave', 'Folk'];


export const genreImages: Record<string, string> = {
  'Electronic': 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Chill': 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Hip-Hop': 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Ambient': 'https://images.pexels.com/photos/1426718/pexels-photo-1426718.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Rock': 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Jazz': 'https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Synthwave': 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Folk': 'https://images.pexels.com/photos/1236678/pexels-photo-1236678.jpeg?auto=compress&cs=tinysrgb&w=400',
};

export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return '0:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SongCard } from '../Common/SongCard';
import { Song } from '../../types';
import axios from 'axios';
import { API_URL } from '../../config';

interface LikedSongsPageProps {
  onPageChange?: (page: string) => void;
}

export const LikedSongsPage: React.FC<LikedSongsPageProps> = ({ onPageChange }) => {
  const { state, dispatch } = useApp();
  const { player, likedSongs } = state;

  const toggleLike = async (song: Song) => {
    try {
      const token = localStorage.getItem('token');
      const isLiked = likedSongs.some((s) => String(s.id) === String(song.id));

      if (isLiked) {
          await axios.delete(`${API_URL}/likes/${song.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        dispatch({ type: 'REMOVE_LIKED_SONG', payload: song.id });
      } else {
        await axios.post(
          'http://localhost:4000/likes',
          { songId: song.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch({ type: 'ADD_LIKED_SONG', payload: song });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handlePlayAllLiked = () => {
    if (likedSongs.length === 0) return;

    const isCurrentPlaylist =
      player.currentSong &&
      likedSongs.some((s: Song) => String(s.id) === String(player.currentSong?.id));

    if (isCurrentPlaylist && player.isPlaying) {
      dispatch({ type: 'PAUSE_SONG' });
    } else {
      dispatch({ type: 'SET_QUEUE', payload: likedSongs });
      dispatch({ type: 'PLAY_SONG', payload: likedSongs[0] });
    }
  };

  const isPlaying =
    player.currentSong &&
    likedSongs.some((s) => String(s.id) === String(player.currentSong?.id)) &&
    player.isPlaying;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-8">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br from-purple-600 to-red-500 flex items-center justify-center shadow-2xl">
          <Heart className="w-24 h-24 text-white" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="text-sm font-medium text-purple-400 uppercase tracking-wide">
            Playlist
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Liked Songs
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Your favorite tracks all in one place
          </p>
          <div className="flex items-center text-gray-400 text-sm space-x-2">
            <span>{likedSongs.length} songs</span>
          </div>
          <button
            onClick={handlePlayAllLiked}
            disabled={likedSongs.length === 0}
            className="bg-gradient-to-r from-purple-600 to-red-500 text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {likedSongs.length > 0 ? (
          likedSongs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              showIndex
              index={index + 1}
              onLikeToggle={() => toggleLike(song)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No liked songs yet
            </h3>
            <p className="text-gray-400 mb-4">
              Songs you like will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

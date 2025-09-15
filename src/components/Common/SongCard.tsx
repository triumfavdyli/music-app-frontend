import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Play, Pause, MoreHorizontal, Heart } from 'lucide-react';
import { Song } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from './Toast';
import { DropdownMenu } from './DropdownMenu';
import { CreatePlaylistModal } from '../Playlist/CreatePlaylistModal';

import { formatDuration } from '../../data/mockData';

interface SongCardProps {
  song: Song;
  showIndex?: boolean;
  index?: number;
  className?: string;
  onPlay?: () => void;
  onLikeToggle?: () => void; // <-- new
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  showIndex = false,
  index,
  className = '',
  onPlay,
  onLikeToggle,
}) => {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const { player, likedSongs, playlists } = state;
  const [showMenu, setShowMenu] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isCurrentSong = player.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && player.isPlaying;
  const isLiked = likedSongs.some((likedSong) => 
    String(likedSong.id) === String(song.id)
  );
  


  const handlePlayPause = () => {
    if (isCurrentSong) {
      dispatch({ type: isPlaying ? 'PAUSE_SONG' : 'RESUME_SONG' });
    } else {
      if (onPlay) {
        onPlay();
      } else {
        dispatch({ type: 'PLAY_SONG', payload: song });
        dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: song });
      }
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeToggle) {
      onLikeToggle();
    } else {
      try {
        const token = localStorage.getItem('token');
        
        if (isLiked) {
          await fetch(`http://localhost:4000/likes/${song.id}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          dispatch({ type: 'REMOVE_LIKED_SONG', payload: song.id });
          showToast('Removed from liked songs', 'success');
        } else {
          await fetch('http://localhost:4000/likes', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ songId: song.id })
          });
          dispatch({ type: 'ADD_LIKED_SONG', payload: song });
          showToast('Added to liked songs', 'success');
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        showToast('Failed to update liked songs', 'error');
      }
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    const songAlreadyInPlaylist = playlist?.songs.some((s) => String(s.id) === String(song.id));

    if (songAlreadyInPlaylist) {
      showToast('Song is already in this playlist', 'error');
      setShowMenu(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/playlists/add-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlistId,
          songId: song.id,
        }),
      });

      if (response.ok) {
        try {
          const token = localStorage.getItem('token');
          const playlistsResponse = await fetch('http://localhost:4000/playlists', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (playlistsResponse.ok) {
            const playlistsData = await playlistsResponse.json();
            
            const storedCovers = JSON.parse(localStorage.getItem('playlistCovers') || '{}');

            const playlists = playlistsData.map((playlist: any) => ({
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
            }));
            
            dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
          }
        } catch (reloadError) {
          console.error('Error reloading playlists:', reloadError);
          dispatch({ type: 'ADD_SONG_TO_PLAYLIST', payload: { playlistId, song } });
        }
        
        showToast(`Added to ${playlist?.name}`, 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to add song to playlist', 'error');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      showToast('Failed to add song to playlist', 'error');
    }
    
    setShowMenu(false);
  };

  const handleCreatePlaylist = () => {
    setShowMenu(false);
    setShowCreatePlaylist(true);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      className={`group bg-white/5 backdrop-blur-sm rounded-lg p-3 md:p-4 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 ${className}`}
      onClick={(e) => {
        if (showMenu) e.stopPropagation();
      }}
    >
      <div className="flex items-center space-x-3 md:space-x-4">
        {showIndex && (
          <div className="w-4 md:w-6 text-center">
            {isPlaying ? (
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-sm animate-pulse" />
              </div>
            ) : (
              <span className="text-gray-400 text-xs md:text-sm">{index}</span>
            )}
          </div>
        )}

        <div className="relative">
          <img
            src={song.coverUrl}
            alt={`${song.album} cover`}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
          />
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate text-sm md:text-base ${
              isCurrentSong ? 'text-purple-400' : 'text-white'
            }`}
          >
            {song.title}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm truncate">
            {song.artist}
          </p>
        </div>

        <div className="hidden sm:block text-gray-400 text-sm">
          {song.album}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-gray-400 text-xs md:text-sm">
            {formatDuration(song.duration)}
          </span>

          <button
            onClick={handleLike}
            className={`p-1 transition-all duration-200 ${
              isLiked
                ? 'text-red-500 hover:text-red-400'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart
              className={`w-3 h-3 md:w-4 md:h-4 ${
                isLiked ? 'fill-current' : ''
              }`}
            />
          </button>

          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 md:opacity-100 transition-all duration-200"
          >
            <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          <DropdownMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            buttonRef={buttonRef}
            playlists={playlists.map((p) => ({ id: p.id, name: p.name }))}
            onPlaylistSelect={handleAddToPlaylist}
            onCreatePlaylist={handleCreatePlaylist}
          />
        </div>
      </div>

      {showCreatePlaylist && ReactDOM.createPortal(
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
        />,
        document.body
      )}
    </div>
  );
};

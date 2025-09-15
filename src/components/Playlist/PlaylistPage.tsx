import React, { useState, useRef } from 'react';
import { Play, Pause, MoreHorizontal, Plus, Edit3, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Common/Toast';
import { SongCard } from '../Common/SongCard';
import { Song } from '../../types';
import { API_URL } from '../../config';

interface PlaylistPageProps {
  playlistId: string;
  onPageChange?: (page: string) => void;
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({ playlistId, onPageChange }) => {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const { playlists, player } = state;
  
  
  const playlist = playlists.find(p => String(p.id) === String(playlistId));
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist?.name || '');
  const [editDescription, setEditDescription] = useState(playlist?.description || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  if (!playlist) {
    if (playlists.length === 0) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
          <p className="text-gray-400">Loading playlist data...</p>
        </div>
      );
    }
    
    // If playlists are loaded but this one isn't found
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Playlist not found</h2>
        <p className="text-gray-400">The playlist you're looking for doesn't exist.</p>
        <p className="text-gray-500 text-sm mt-2">Looking for ID: {playlistId}</p>
        <p className="text-gray-500 text-sm">Available IDs: {playlists.map(p => p.id).join(', ')}</p>
      </div>
    );
  }

  const handlePlayPlaylist = () => {
    if (playlist.songs.length > 0) {
      const isCurrentPlaylist = player.currentSong && 
        playlist.songs.some(song => song.id === player.currentSong?.id);
      
      if (isCurrentPlaylist && player.isPlaying) {
        dispatch({ type: 'PAUSE_SONG' });
      } else {
        dispatch({ type: 'SET_QUEUE', payload: playlist.songs });
        dispatch({ type: 'PLAY_SONG', payload: playlist.songs[0] });
      }
    }
  };

  const handleSaveEdit = () => {
    dispatch({
      type: 'UPDATE_PLAYLIST',
      payload: {
        ...playlist,
        name: editName,
        description: editDescription
      }
    });
    setIsEditing(false);
  };

  const handleDeletePlaylist = async () => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/playlists/${playlist.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          dispatch({ type: 'DELETE_PLAYLIST', payload: playlist.id });
          const storedCovers = JSON.parse(localStorage.getItem('playlistCovers') || '{}');
          delete storedCovers[playlist.id];
          localStorage.setItem('playlistCovers', JSON.stringify(storedCovers));
          
          showToast('Playlist deleted successfully', 'success');
          if (onPageChange) {
            setTimeout(() => onPageChange('home'), 1000);
          }
        } else {
          const errorData = await response.json();
          showToast(`Failed to delete playlist: ${errorData.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting playlist:', error);
        showToast('Failed to delete playlist. Please try again.', 'error');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex.current !== null && draggedIndex !== dragOverIndex.current) {
      const newSongs = [...playlist.songs];
      const [draggedSong] = newSongs.splice(draggedIndex, 1);
      newSongs.splice(dragOverIndex.current, 0, draggedSong);
      
      dispatch({
        type: 'REORDER_PLAYLIST_SONGS',
        payload: { playlistId: playlist.id, songs: newSongs }
      });
    }
    
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  const isPlaying = player.currentSong && 
    playlist.songs.some(song => song.id === player.currentSong?.id) && 
    player.isPlaying;

  return (
    <div className="p-6">
      <div className={`flex flex-col md:flex-row items-start ${isEditing ? 'md:items-start' : 'md:items-end'} space-y-4 md:space-y-0 md:space-x-6 mb-8`}>
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl overflow-hidden">
          {playlist.coverUrl && playlist.coverUrl !== '/default-playlist.jpg' ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-center p-4 ${playlist.coverUrl && playlist.coverUrl !== '/default-playlist.jpg' ? 'hidden' : 'flex'}`}
          >
            <div>
              <div className="text-4xl mb-2">🎵</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="text-sm font-medium text-purple-400 uppercase tracking-wide">
            Playlist
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-transparent border-b-2 border-purple-400 focus:border-purple-300 focus:outline-none transition-colors leading-tight w-full pb-2"
                placeholder="Playlist name"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-gray-300 text-lg bg-gray-800/50 border border-gray-600 focus:border-purple-400 focus:outline-none rounded-lg p-3 transition-colors w-full max-w-2xl resize-none"
                placeholder="Description..."
                rows={2}
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {playlist.name}
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl">{playlist.description}</p>
            </>
          )}
          
          <div className="flex items-center text-gray-400 text-sm space-x-2">
            <span>Created by {state.auth.user?.username || 'You'}</span>
            <span>•</span>
            <span>{playlist.songs.length} songs</span>
          </div>

          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-full hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(playlist.name);
                    setEditDescription(playlist.description);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePlayPlaylist}
                  disabled={playlist.songs.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={handleDeletePlaylist}
              className="p-3 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {playlist.songs.length > 0 ? (
          playlist.songs.map((song, index) => (
            <div
              key={song.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <SongCard
                song={song}
                showIndex={true}
                index={index + 1}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your playlist is empty</h3>
            <p className="text-gray-400 mb-4">Add some songs to get started</p>
            <button 
              onClick={() => onPageChange?.('home')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Music
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
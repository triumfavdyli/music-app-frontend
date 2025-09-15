import React, { useState } from 'react';
import { X, Music, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const mockCovers = [
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1426718/pexels-photo-1426718.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1261427/pexels-photo-1261427.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const [selectedCover, setSelectedCover] = useState(mockCovers[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
        }),
      });

      if (response.ok) {
        const createdPlaylist = await response.json();
        const storedCovers = JSON.parse(localStorage.getItem('playlistCovers') || '{}');
        storedCovers[createdPlaylist.playlist.id] = selectedCover;
        localStorage.setItem('playlistCovers', JSON.stringify(storedCovers));
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
              createdBy: playlist.User?.username || state.auth.user?.username || 'Unknown User',
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
          const newPlaylist = {
            id: createdPlaylist.id,
            name: createdPlaylist.name,
            description: createdPlaylist.description,
            coverUrl: selectedCover,
            songs: [],
            createdBy: state.auth.user?.username || 'Unknown User',
            createdAt: createdPlaylist.createdAt,
            isPublic: createdPlaylist.isPublic
          };
          dispatch({ type: 'CREATE_PLAYLIST', payload: newPlaylist });
        }
        
        setFormData({ name: '', description: '', isPublic: true });
        setSelectedCover(mockCovers[0]);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error creating playlist:', errorData);
        throw new Error(errorData.error || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 relative z-[10000]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose a cover
            </label>
            <div className="grid grid-cols-3 gap-3">
              {mockCovers.map((cover) => (
                <button
                  key={cover}
                  type="button"
                  onClick={() => setSelectedCover(cover)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedCover === cover
                      ? 'border-purple-500 ring-2 ring-purple-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={cover}
                    alt="Cover option"
                    className="w-full h-full object-cover"
                  />
                  {selectedCover === cover && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Awesome Playlist"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Make playlist public
            </label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublic ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
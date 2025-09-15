import React, { useState } from 'react';
import { User, Mail, Calendar, Music, Heart, Clock, Edit3, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Common/Toast';
import { PlaylistCard } from '../Common/PlaylistCard';
import { authService } from '../../services/api';

interface ProfilePageProps {
  onPageChange: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onPageChange }) => {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const { auth, playlists, recentlyPlayed } = state;
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    username: auth.user?.username || '',
    email: auth.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password fields if changing password
      if (isChangingPassword) {
        if (!editForm.currentPassword) {
          showToast('Current password is required', 'error');
          setIsLoading(false);
          return;
        }
        if (!editForm.newPassword) {
          showToast('New password is required', 'error');
          setIsLoading(false);
          return;
        }
        if (editForm.newPassword !== editForm.confirmPassword) {
          showToast('Passwords do not match', 'error');
          setIsLoading(false);
          return;
        }
        if (editForm.newPassword.length < 6) {
          showToast('Password must be at least 6 characters long', 'error');
          setIsLoading(false);
          return;
        }
      }

      const response = await authService.updateProfile(
        editForm.username, 
        editForm.email,
        isChangingPassword ? editForm.currentPassword : undefined,
        isChangingPassword ? editForm.newPassword : undefined
      );
      
      // Update the user in the context
      dispatch({ type: 'UPDATE_USER', payload: response.user });
      
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth.user) return null;

  const userPlaylists = playlists;
  const totalSongs = userPlaylists.reduce((sum, playlist) => sum + playlist.songs.length, 0);


  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative group">

          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-teal-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600 via-purple-800 to-teal-600 flex flex-col items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm">
            <div className="absolute top-2 right-2 md:top-4 md:right-4">
              <Music className="w-4 h-4 md:w-6 md:h-6 text-white/60 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            

            <span className="text-white text-3xl md:text-5xl font-bold mb-1">
              {auth.user.username.charAt(0).toUpperCase()}
            </span>
      
            <div className="flex space-x-1 opacity-60">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>
 
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-white/50 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-4">
          <div className="text-sm font-medium text-purple-400 uppercase tracking-wide">
            Profile
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            {auth.user.username}
          </h1>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {auth.user.email}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userPlaylists.length}</div>
              <div className="text-gray-400 text-sm">Playlists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalSongs}</div>
              <div className="text-gray-400 text-sm">Songs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{recentlyPlayed.length}</div>
              <div className="text-gray-400 text-sm">Recently Played</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditForm({
                    username: auth.user?.username || '',
                    email: auth.user?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setIsChangingPassword(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Change Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {isChangingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditForm({
                      username: auth.user?.username || '',
                      email: auth.user?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setIsChangingPassword(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User's Playlists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Music className="w-6 h-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          </div>
          <button
            onClick={() => onPageChange('create-playlist')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200"
          >
            Create New
          </button>
        </div>

        {userPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {userPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => onPageChange(`playlist-${playlist.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-gray-400 mb-4">Create your first playlist to get started</p>
            <button
              onClick={() => onPageChange('create-playlist')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Playlist
            </button>
          </div>
        )}
      </section>
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-teal-500 mr-3" />
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div
                key={song.id}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
              >
                <img
                  src={song.coverUrl}
                  alt={song.album}
                  className="w-full aspect-square object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                />
                <h4 className="text-white font-medium truncate">{song.title}</h4>
                <p className="text-gray-400 text-sm truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
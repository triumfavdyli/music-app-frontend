import React from 'react';
import { Home, Search, Heart, PlusCircle, Music, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { state } = useApp();
  const { playlists } = state;

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
  ];

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 h-full flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-600 to-teal-600 p-2 rounded-xl mr-3">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SoundWave</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2 mb-8">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-teal-600/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              Playlists
            </h3>
            <button
              onClick={() => onPageChange('create-playlist')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onPageChange(`playlist-${playlist.id}`)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === `playlist-${playlist.id}`
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="truncate">{playlist.name}</div>
                <div className="text-xs text-gray-500 truncate">{playlist.songs.length} songs</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => onPageChange('profile')}
          className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <User className="w-5 h-5 mr-3" />
          Profile
        </button>
      </div>
    </div>
  );
};
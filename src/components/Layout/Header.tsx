import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchBar } from '../Search/SearchBar';

interface HeaderProps {
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { state, dispatch } = useApp();
  const { auth } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home':
        return 'Good evening';
      case 'search':
        return 'Search';
      case 'liked':
        return 'Liked Songs';
      case 'profile':
        return 'Profile';
      default:
        if (currentPage.startsWith('playlist-')) {
          return 'Playlist';
        }
        return 'SoundWave';
    }
  };

  return (
    <header className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-800 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-white mb-1 truncate">
            {getPageTitle()}
          </h1>
          {currentPage === 'home' && auth.user && (
            <p className="text-gray-400 text-sm md:text-base hidden sm:block">Welcome back, {auth.user.username}</p>
          )}
        </div>

        {currentPage !== 'profile' && currentPage !== 'liked' && !currentPage.startsWith('playlist-') && (
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchBar />
          </div>
        )}

        {currentPage !== 'search' && currentPage !== 'home' && (
          <div className="flex md:hidden flex-1 max-w-sm mx-4">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button> */}
          
          <div className="hidden sm:flex items-center space-x-3">
            {auth.user?.avatar && (
              <img
                src={auth.user.avatar}
                alt={auth.user.username}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-purple-500"
              />
            )}
            <span className="text-white font-medium text-sm md:text-base">{auth.user?.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
import React from 'react';
import { Home, Search, User, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  const { state } = useApp();
  const { player } = state;
  const hasCurrentSong = !!player.currentSong;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'liked', label: 'Library', icon: Music },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-gray-900/98 backdrop-blur-lg border-t border-gray-700 px-4 py-2 z-[60] lg:hidden transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
              }}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 min-h-[60px] ${
                isActive
                  ? 'text-purple-400 bg-purple-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-purple-400' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 bg-purple-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
import React from 'react';
import { Play, Music } from 'lucide-react';
import { Playlist } from '../../types';
import { useApp } from '../../context/AppContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { dispatch } = useApp();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      dispatch({ type: 'SET_QUEUE', payload: playlist.songs });
      dispatch({ type: 'PLAY_SONG', payload: playlist.songs[0] });
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
    >
      <div className="relative mb-4">
        <div className="w-full aspect-square rounded-lg overflow-hidden">
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
            className={`w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-center ${playlist.coverUrl && playlist.coverUrl !== '/default-playlist.jpg' ? 'hidden' : 'flex'}`}
          >
            <div>
              <div className="text-2xl mb-1">🎵</div>
              <div className="text-xs font-medium px-2">{playlist.name}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Play className="w-5 h-5 ml-0.5" />
        </button>
      </div>

      <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
      
      <div className="flex items-center text-gray-500 text-xs">
        <Music className="w-3 h-3 mr-1" />
        {playlist.songs.length} songs
      </div>
    </div>
  );
};
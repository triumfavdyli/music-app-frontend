import React from 'react';
import { Search as SearchIcon, Music, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SongCard } from '../Common/SongCard';
import { SearchBar } from './SearchBar';

interface SearchPageProps {
  onPageChange?: (page: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onPageChange }) => {
  const { state } = useApp();
  const { searchQuery, searchResults } = state;

  return (
    <div className="p-4 md:p-6">
      <div className="md:hidden mb-6">
        <SearchBar />
      </div>

      {searchQuery ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Search results for "{searchQuery}"
            </h2>
          </div>
          {searchResults.songs.length > 0 && (
            <section>
              <div className="flex items-center mb-4">
                <Music className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="text-xl font-semibold text-white">Songs</h3>
              </div>
              <div className="space-y-2">
                {searchResults.songs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    showIndex={true}
                    index={index + 1}
                  />
                ))}
              </div>
            </section>
          )}
          {searchResults.artists.length > 0 && (
            <section>
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-teal-500 mr-2" />
                <h3 className="text-xl font-semibold text-white">Artists</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {searchResults.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
                  >
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full aspect-square object-cover rounded-full mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <h4 className="text-white font-medium text-center truncate">{artist.name}</h4>
                    <p className="text-gray-400 text-sm text-center">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {searchResults.songs.length === 0 && searchResults.artists.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400">Try searching for something else</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Search SoundWave</h3>
          <p className="text-gray-400">Find your favorite songs, artists, and albums</p>
        </div>
      )}
    </div>
  );
};
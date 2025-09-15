import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockArtists } from '../../data/mockData';

export const SearchBar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [localQuery, setLocalQuery] = useState(state.searchQuery);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: localQuery });
      
      if (localQuery.trim()) {
        const query = localQuery.toLowerCase().trim();
        
        const filteredSongs = state.songs.filter(song =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
        );

        const filteredArtists = mockArtists.filter(artist =>
          artist.name.toLowerCase().includes(query)
        );

        dispatch({
          type: 'SET_SEARCH_RESULTS',
          payload: {
            songs: filteredSongs,
            artists: filteredArtists,
            albums: []
          }
        });
      } else {
        dispatch({
          type: 'SET_SEARCH_RESULTS',
          payload: { songs: [], artists: [], albums: [] }
        });
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [localQuery, dispatch, state.songs]);

  const handleClear = () => {
    setLocalQuery('');
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
    dispatch({
      type: 'SET_SEARCH_RESULTS',
      payload: { songs: [], artists: [], albums: [] }
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full pl-10 md:pl-10 pr-10 py-2 md:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 text-sm md:text-base"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
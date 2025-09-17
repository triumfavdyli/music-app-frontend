import React from 'react';
import { Clock, TrendingUp, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SongCard } from '../Common/SongCard';
import { SearchBar } from '../Search/SearchBar';
import { mockGenres, genreImages } from '../../data/mockData';
import { API_URL } from '../../config';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { state, dispatch } = useApp();
  const { recentlyPlayed, songs, searchQuery, searchResults } = state;
  
  React.useEffect(() => {
    const reloadSongs = async () => {
      try {
        dispatch({ type: 'SET_SONGS', payload: [] });
        
        const response = await fetch(`${API_URL}/songs`);
        const backendSongs = await response.json();
        
        if (Array.isArray(backendSongs) && backendSongs.length > 0) {
          const workingSongs = backendSongs.filter(song => {
            const hasWorkingAudio = song.audioUrl && !song.audioUrl.includes('soundjay.com');
            return hasWorkingAudio;
          });

          const uniqueSongs = workingSongs.filter((song, index, self) => 
            index === self.findIndex(s => s.title === song.title && s.artist === song.artist)
          );
          dispatch({ type: 'SET_SONGS', payload: uniqueSongs });
        } else {
          console.log(' No songs returned from backend or invalid format');
        }
      } catch (error) {
        console.error('Failed to fetch songs from backend:', error);
      }
    };
    
    reloadSongs();
  }, [dispatch]);

  const handleGenreClick = (genre: string) => {
    let genreSongs = songs.filter(song => 
      song.genre && song.genre.toLowerCase() === genre.toLowerCase()
    );
    if (genreSongs.length === 0 && songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      genreSongs = shuffled.slice(0, 5);
    }
    dispatch({
      type: 'SET_SEARCH_RESULTS',
      payload: { songs: genreSongs, artists: [], albums: [] }
    });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: `Genre: ${genre}` });
  };

  const handlePlayAllGenre = (genre: string) => {
    const genreSongs = songs.filter(song => song.genre === genre);
    if (genreSongs.length > 0) {
      dispatch({ type: 'SET_QUEUE', payload: genreSongs });
      dispatch({ type: 'PLAY_SONG', payload: genreSongs[0] });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      {!searchQuery && (
        <div className="block md:hidden mb-6">
          <SearchBar />
        </div>
      )}

      {searchQuery && (
        <div className="mb-4">
          <button
            onClick={() => {
              dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
              dispatch({ type: 'SET_SEARCH_RESULTS', payload: { songs: [], artists: [], albums: [] } });
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow"
          >
            ← Back to Home
          </button>
        </div>
      )}

      {searchQuery && searchResults.songs.length > 0 && (
        <section>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Search Results for "{searchQuery}"
            </h2>
            <span className="ml-3 text-gray-400">
              ({searchResults.songs.length} songs found)
            </span>
          </div>
          <div className="space-y-2">
            {searchResults.songs.map((song, idx) => (
              <SongCard 
                key={song.id} 
                song={song}
                showIndex={true}
                index={idx + 1}
              />
            ))}
          </div>
        </section>
      )}

      {searchQuery && searchResults.songs.length === 0 && (
        <section>
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-400 mb-2">
              No results found for "{searchQuery}"
            </h2>
            <p className="text-gray-500">
              Try searching with different keywords
            </p>
          </div>
        </section>
      )}

      {!searchQuery && (
        <section>
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-teal-500 mr-3" />
          <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {mockGenres.map((genre) => {
            const genreSong = songs.find(song => song.genre === genre);
            const genreImageUrl = genreImages[genre] || genreSong?.coverUrl;
            
            return (
              <div
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className="group relative bg-gradient-to-br from-purple-600/20 to-teal-600/20 rounded-xl p-4 hover:from-purple-600/30 hover:to-teal-600/30 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
              >
                {genreImageUrl && (
                  <img
                    src={genreImageUrl}
                    alt={genre}
                    className="w-full aspect-square object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <h3 className="text-white font-medium text-center">{genre}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAllGenre(genre);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
      )}
  
      {!searchQuery && recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center mb-4 md:mb-6">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mr-3" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Recently Played</h2>
          </div>
          <div className="space-y-2">
            {recentlyPlayed.slice(0, 5).map((song, index) => (
              <SongCard
                key={`recent-${song.id}-${index}`}
                song={song}
                showIndex={true}
                index={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {!searchQuery && (
      <section>
        <div className="flex items-center mb-4 md:mb-6">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-pink-500 mr-3" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Popular This Week</h2>
        </div>
        <div className="space-y-2">
          {songs.length > 0 ? (
            (() => {
              const filteredSongs = songs
                .filter((song, index, self) => {
                  const isDuplicate = index !== self.findIndex(s => s.title === song.title && s.artist === song.artist);
                  if (isDuplicate) {
                    console.log(' Filtering out duplicate:', song.title, 'by', song.artist);
                  }
                  return !isDuplicate;
                })
                .slice(0, 6);

              return filteredSongs.map((song, index) => {
            
                return (
                  <SongCard
                    key={`popular-${song.id}-${index}`}
                    song={song}
                    showIndex={true}
                    index={index + 1}
                    onPlay={() => {
                      dispatch({ type: 'SET_QUEUE', payload: filteredSongs });
                      // const songIndexInQueue = filteredSongs.findIndex(s => s.id === song.id);
                      // console.log(' Song index in queue:', songIndexInQueue);
                      dispatch({ type: 'PLAY_SONG', payload: song });
                      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: song });
                    }}
                  />
                );
              });
            })()
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading songs from database...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your music.</p>
            </div>
          )}
        </div>
      </section>
      )}
    </div>
  );
};
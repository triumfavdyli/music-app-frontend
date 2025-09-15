import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Common/Toast';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MobileNavigation } from './components/Layout/MobileNavigation';
import { HomePage } from './components/Home/HomePage';
import { SearchPage } from './components/Search/SearchPage';
import { LikedSongsPage } from './components/Liked/LikedSongsPage';
import { PlaylistPage } from './components/Playlist/PlaylistPage';
import { ProfilePage } from './components/Profile/ProfilePage';
import { CreatePlaylistModal } from './components/Playlist/CreatePlaylistModal';
import { MusicPlayer } from './components/Player/MusicPlayer';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const { auth, player } = state;
  const [currentPage, setCurrentPage] = useState('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const hasCurrentSong = !!player.currentSong;

  const handlePageChange = (page: string) => {
    if (page === 'create-playlist') {
      setShowCreateModal(true);
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'search':
        return <SearchPage onPageChange={handlePageChange} />;
      case 'liked':
        return <LikedSongsPage onPageChange={handlePageChange} />;
      case 'profile':
        return <ProfilePage onPageChange={handlePageChange} />;
      default:
        if (currentPage.startsWith('playlist-')) {
          const playlistId = currentPage.replace('playlist-', '');
          return <PlaylistPage playlistId={playlistId} onPageChange={handlePageChange} />;
        }
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-teal-900/30 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-teal-900/30">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header currentPage={currentPage} />
          <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
            hasCurrentSong ? 'pb-48 lg:pb-24' : 'pb-20 lg:pb-6'
          }`}>
            {renderPage()}
          </main>
        </div>
      </div>

      <MobileNavigation currentPage={currentPage} onPageChange={handlePageChange} />

      <MusicPlayer />
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
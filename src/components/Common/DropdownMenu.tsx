import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  playlists: Array<{ id: string; name: string }>;
  onPlaylistSelect: (playlistId: string) => void;
  onCreatePlaylist?: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  buttonRef,
  playlists,
  onPlaylistSelect,
  onCreatePlaylist
}) => {
  const { state } = useApp();
  const { player } = state;
  const hasCurrentSong = !!player.currentSong;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, buttonRef]);

  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuElement = menuRef.current;
      
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      const musicPlayerHeight = hasCurrentSong ? 80 : 0;
      const mobileNavHeight = window.innerWidth < 1024 ? (hasCurrentSong ? 60 : 60) : 0; 
      const totalBottomReserved = musicPlayerHeight + mobileNavHeight;
      const adjustedSpaceBelow = spaceBelow - totalBottomReserved;
      
      if ((hasCurrentSong || window.innerWidth < 768) && spaceAbove >= 180) {
        menuElement.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
        menuElement.style.top = 'auto';
      } else if (adjustedSpaceBelow >= 180 || adjustedSpaceBelow > spaceAbove) {
        menuElement.style.top = `${buttonRect.bottom + 8}px`;
        menuElement.style.bottom = 'auto';
      } else {
        menuElement.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
        menuElement.style.top = 'auto';
      }
      
      menuElement.style.right = `${window.innerWidth - buttonRect.right}px`;
      menuElement.style.left = 'auto';
    }
  }, [isOpen, buttonRef, hasCurrentSong]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-48 z-[9999]"
      style={{
        top: 0,
        right: 0,
      }}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-700">
        Add to playlist
      </div>
      
      {onCreatePlaylist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatePlaylist();
          }}
          className="w-full px-3 py-2 text-left text-sm text-purple-400 hover:bg-gray-700 transition-colors flex items-center space-x-2 border-b border-gray-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Playlist</span>
        </button>
      )}
      
      {playlists.length > 0 ? (
        playlists.map(playlist => (
          <button
            key={playlist.id}
            onClick={(e) => {
              e.stopPropagation();
              onPlaylistSelect(playlist.id);
            }}
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{playlist.name}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-400">
          No playlists available
        </div>
      )}
    </div>,
    document.body
  );
};

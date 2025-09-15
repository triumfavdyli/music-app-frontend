import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Common/Toast';
import { formatDuration } from '../../data/mockData';

export const MusicPlayer: React.FC = () => {
  const { state, dispatch } = useApp();
  const { player, likedSongs } = state;
  const { showToast } = useToast();
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && player.currentSong) {
      audioRef.current.src = player.currentSong.audioUrl;
      audioRef.current.load();
    }
  }, [player.currentSong]);

  useEffect(() => {
    if (audioRef.current && player.currentSong) {
      if (player.isPlaying) {
        const handleCanPlay = () => {
          audioRef.current?.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        };

        if (audioRef.current.readyState >= 2) {
          audioRef.current.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        } else {
          audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [player.isPlaying, player.currentSong]);


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = player.volume;
    }
  }, [player.volume]);

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - player.currentTime) > 1) {
      audioRef.current.currentTime = player.currentTime;
    }
  }, [player.currentTime]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) {
      const currentTime = Math.floor(audioRef.current.currentTime);
      dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const duration = Math.floor(audioRef.current.duration);
      dispatch({ type: 'SET_DURATION', payload: duration });
    }
  };

  const handleAudioEnded = () => {
    dispatch({ type: 'NEXT_SONG' });
  };

  const handlePlayPause = () => {
    if (player.currentSong) {
      dispatch({ type: player.isPlaying ? 'PAUSE_SONG' : 'RESUME_SONG' });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setTempProgress(newTime);
    if (!isDraggingProgress) {
      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });
    }
  };

  const handleProgressMouseDown = () => {
    setIsDraggingProgress(true);
  };

  const handleProgressMouseUp = () => {
    setIsDraggingProgress(false);
    dispatch({ type: 'SET_CURRENT_TIME', payload: tempProgress });
    if (audioRef.current) {
      audioRef.current.currentTime = tempProgress;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) });
  };

  const handleLike = async () => {
    if (!player.currentSong) return;
    
    const isLiked = likedSongs.some((likedSong) => 
      String(likedSong.id) === String(player.currentSong!.id)
    );
    
    try {
      const token = localStorage.getItem('token');
      
      if (isLiked) {
        await fetch(`http://localhost:4000/likes/${player.currentSong.id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        dispatch({ type: 'REMOVE_LIKED_SONG', payload: player.currentSong.id });
        showToast('Removed from liked songs', 'success');
      } else {
        await fetch('http://localhost:4000/likes', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ songId: player.currentSong.id })
        });
        dispatch({ type: 'ADD_LIKED_SONG', payload: player.currentSong });
        showToast('Added to liked songs', 'success');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Failed to update liked songs', 'error');
    }
  };

  if (!player.currentSong) {
    return null;
  }

  const progressPercentage = player.duration > 0 
    ? ((isDraggingProgress ? tempProgress : player.currentTime) / player.duration) * 100 
    : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
        preload="metadata"
      />

      <div className="fixed lg:bottom-0 bottom-20 lg:left-64 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-40">
        <div className="max-w-screen-2xl mx-auto">
          <div className="hidden md:grid grid-cols-3 items-center gap-4 p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={player.currentSong.coverUrl}
                alt={player.currentSong.album}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">
                  {player.currentSong.title}
                </h4>
                <p className="text-gray-400 text-sm truncate">
                  {player.currentSong.artist}
                </p>
              </div>
              <button
                onClick={handleLike}
                className={`p-2 transition-colors ${
                  likedSongs.some(
                    (likedSong) =>
                      String(likedSong.id) === String(player.currentSong?.id)
                  )
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    likedSongs.some(
                      (likedSong) =>
                        String(likedSong.id) === String(player.currentSong?.id)
                    )
                      ? 'fill-current'
                      : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={() => dispatch({ type: 'PREVIOUS_SONG' })}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="bg-white text-gray-900 p-3 rounded-full hover:scale-105 transition-transform shadow-lg"
                >
                  {player.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => dispatch({ type: 'NEXT_SONG' })}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                {/* <button
                  onClick={handleLike}
                  className={`p-2 transition-colors ${
                    likedSongs.some(
                      (likedSong) =>
                        String(likedSong.id) === String(player.currentSong?.id)
                    )
                      ? 'text-red-500 hover:text-red-400'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedSongs.some(
                        (likedSong) =>
                          String(likedSong.id) ===
                          String(player.currentSong?.id)
                      )
                        ? 'fill-current'
                        : ''
                    }`}
                  />
                </button> */}

                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3 w-full max-w-md">
                <span className="text-xs text-gray-400 min-w-[35px]">
                  {formatDuration(
                    isDraggingProgress ? tempProgress : player.currentTime
                  )}
                </span>

                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max={player.duration}
                    value={
                      isDraggingProgress ? tempProgress : player.currentTime
                    }
                    onChange={handleProgressChange}
                    onMouseDown={handleProgressMouseDown}
                    onMouseUp={handleProgressMouseUp}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer progress-slider"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${progressPercentage}%, #4B5563 ${progressPercentage}%, #4B5563 100%)`,
                    }}
                  />
                </div>

                <span className="text-xs text-gray-400 min-w-[35px]">
                  {formatDuration(player.duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={player.volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer volume-slider"
                  style={{
                    background: `linear-gradient(to right, #14B8A6 0%, #14B8A6 ${
                      player.volume * 100
                    }%, #4B5563 ${player.volume * 100}%, #4B5563 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <div className="flex items-center justify-between px-3 pt-2 pb-1">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <img
                  src={player.currentSong.coverUrl}
                  alt={player.currentSong.album}
                  className="w-10 h-10 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium truncate text-sm">
                    {player.currentSong.title}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {player.currentSong.artist}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLike}
                className={`p-1.5 transition-colors ${
                  likedSongs.some(
                    (likedSong) =>
                      String(likedSong.id) === String(player.currentSong?.id)
                  )
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    likedSongs.some(
                      (likedSong) =>
                        String(likedSong.id) === String(player.currentSong?.id)
                    )
                      ? 'fill-current'
                      : ''
                  }`}
                />
              </button>
            </div>
            <div className="px-3 pb-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 min-w-[30px]">
                  {formatDuration(isDraggingProgress ? tempProgress : player.currentTime)}
                </span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={player.duration || 0}
                    value={
                      isDraggingProgress ? tempProgress : player.currentTime || 0
                    }
                    onChange={handleProgressChange}
                    onMouseDown={handleProgressMouseDown}
                    onMouseUp={handleProgressMouseUp}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer progress-slider"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${progressPercentage}%, #4B5563 ${progressPercentage}%, #4B5563 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 min-w-[30px]">
                  {formatDuration(player.duration)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center px-3 pb-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => dispatch({ type: 'PREVIOUS_SONG' })}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="bg-white text-gray-900 p-2 rounded-full hover:scale-105 transition-transform shadow-lg"
                >
                  {player.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => dispatch({ type: 'NEXT_SONG' })}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
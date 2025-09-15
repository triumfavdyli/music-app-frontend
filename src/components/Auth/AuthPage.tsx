import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left order-1 lg:order-1">
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-teal-600 p-3 rounded-2xl mr-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">SoundWave</h1>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Music,
            <span className="block bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              Your World
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto lg:mx-0">
            Discover, create, and share the soundtrack to your life with our revolutionary music platform.
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-center max-w-md mx-auto lg:mx-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">50M+</div>
              <div className="text-sm text-gray-300">Songs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">2M+</div>
              <div className="text-sm text-gray-300">Artists</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">10M+</div>
              <div className="text-sm text-gray-300">Users</div>
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-2">
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};
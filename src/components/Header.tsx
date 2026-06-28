import React from 'react';
import { Globe, Route, LayoutDashboard, Search, MapPin, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'feed' | 'my-plans' | 'stats';
  setActiveTab: (tab: 'feed' | 'my-plans' | 'stats') => void;
  onEditProfile: () => void;
  onSignOut: () => void;
}

export default function Header({
  user,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onEditProfile,
  onSignOut
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#12161c]/65 backdrop-blur-[20px] saturate-[180%] border-b border-white/8 shadow-xl" id="raahi-header">
      <div className="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-lg gap-2">
          <div 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 cursor-pointer select-none group mr-2"
            title="Raahi Home"
            id="logo-button"
          >
            <svg viewBox="0 0 200 200" className="h-9 w-9 filter drop-shadow-[0_2px_8px_rgba(243,108,33,0.35)] group-hover:scale-105 transition-transform duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 52 110 L 152 72 L 118 124 Z" fill="#f36c21" />
              <path d="M 52 110 L 118 124 L 80 132 Z" fill="#d35400" />
              <path d="M 80 132 L 84 148 L 118 124 Z" fill="#f36c21" />
            </svg>
            
            <span className="font-black text-2xl tracking-tight text-[#f36c21] font-sans group-hover:opacity-90 transition-opacity">
              Raahi
            </span>
          </div>

          <div className="relative flex-1 group" id="search-box-container">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9fa3a7] group-focus-within:text-white">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search travel plans, places, routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-sm text-[#e1e1e1] pl-9 pr-4 py-1.5 rounded h-9 border border-white/10 placeholder-[#9fa3a7] focus:border-[#70b5f9] transition-all"
              id="search-input"
            />
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 ml-4" id="nav-menu">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center py-1 px-2 cursor-pointer border-b-2 transition-all min-w-[48px] sm:min-w-[64px] ${
              activeTab === 'feed'
                ? 'border-[#70b5f9] text-[#70b5f9] font-extrabold'
                : 'border-transparent text-[#9fa3a7] hover:text-white'
            }`}
            id="nav-feed"
          >
            <Globe className="h-5 w-5" />
            <span className="text-[10px] sm:text-xs mt-1 hidden sm:block">Home Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('my-plans')}
            className={`flex flex-col items-center justify-center py-1 px-2 cursor-pointer border-b-2 transition-all min-w-[48px] sm:min-w-[64px] ${
              activeTab === 'my-plans'
                ? 'border-[#70b5f9] text-[#70b5f9] font-extrabold'
                : 'border-transparent text-[#9fa3a7] hover:text-white'
            }`}
            id="nav-my-plans"
          >
            <Route className="h-5 w-5" />
            <span className="text-[10px] sm:text-xs mt-1 hidden sm:block">My Journeys</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1 px-2 cursor-pointer border-b-2 transition-all min-w-[48px] sm:min-w-[64px] ${
              activeTab === 'stats'
                ? 'border-[#70b5f9] text-[#70b5f9] font-extrabold'
                : 'border-transparent text-[#9fa3a7] hover:text-white'
            }`}
            id="nav-stats"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] sm:text-xs mt-1 hidden sm:block">Dashboard</span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <div 
            onClick={onEditProfile}
            className="flex flex-col items-center justify-center py-1 px-2 cursor-pointer hover:opacity-85 transition-all text-[#9fa3a7] group"
            title="Edit Profile"
            id="profile-nav-button"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-6 w-6 rounded-full object-cover border border-white/10 group-hover:border-[#70b5f9] transition-colors"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#f36c21] to-[#d35400] flex items-center justify-center text-white font-bold text-[10px] border border-white/10 group-hover:border-[#70b5f9] uppercase select-none transition-colors">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
            )}
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-[10px] sm:text-xs text-[#9fa3a7] font-medium hidden sm:block group-hover:text-white transition-colors">Me</span>
              <ChevronDownIcon className="h-3 w-3 text-[#9fa3a7] group-hover:text-white transition-colors" />
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="flex flex-col items-center justify-center py-1 px-2 cursor-pointer text-[#9fa3a7] hover:text-red-400 transition-all min-w-[48px] outline-none"
            title="Sign Out"
            id="nav-sign-out"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] sm:text-xs mt-1 hidden sm:block">Sign Out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

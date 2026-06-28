import React from 'react';
import { MapPin, Users, Award, Wallet, Calendar } from 'lucide-react';
import { UserProfile, Journey } from '../types';

interface ProfileCardProps {
  user: UserProfile;
  journeys: Journey[];
  onEditProfile: () => void;
}

export default function ProfileCard({ user, journeys, onEditProfile }: ProfileCardProps) {
  const totalJourneys = journeys.length;
  
  const allCheckpoints = journeys.flatMap(j => j.checkpoints);
  const visitedCheckpointsCount = allCheckpoints.filter(cp => cp.status === 'visited').length;
  const totalCheckpointsCount = allCheckpoints.length;
  
  const totalBudget = allCheckpoints.reduce((sum, cp) => sum + cp.cost, 0);

  const completedJourneysCount = journeys.filter(j => j.status === 'completed').length;

  return (
    <div className="glass-card-no-hover rounded-2xl overflow-hidden shadow-xl pt-6" id="profile-card">
      <div className="px-5 pb-5 relative flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden shadow-lg bg-[#0d1117] z-10 flex items-center justify-center hover:scale-105 transition-transform duration-300">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#f36c21] to-[#d35400] flex items-center justify-center text-white font-black text-3xl uppercase select-none">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h3 
            onClick={onEditProfile}
            className="font-extrabold text-white text-lg hover:text-[#70b5f9] hover:underline cursor-pointer transition-colors"
            id="profile-name"
          >
            {user.name}
          </h3>
          <p className="text-xs text-[#a3a8ae] mt-1.5 leading-relaxed font-normal px-2">
            {user.headline}
          </p>
        </div>

        {user.location ? (
          <div className="flex items-center gap-1.5 justify-center mt-3 text-[11px] text-[#70b5f9] font-semibold bg-[#70b5f9]/10 px-2.5 py-1 rounded-full border border-[#70b5f9]/20 shadow-sm">
            <MapPin className="h-3 w-3 text-[#70b5f9]" />
            <span>{user.location}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 justify-center mt-3 text-[11px] text-[#9fa3a7] font-medium opacity-50 italic">
            <MapPin className="h-3 w-3 text-[#9fa3a7]" />
            <span>No location added yet</span>
          </div>
        )}

        <button
          onClick={onEditProfile}
          className="mt-5 w-full py-2 px-4 border border-[#70b5f9]/50 text-xs font-black text-[#70b5f9] rounded-full hover:bg-[#70b5f9] hover:text-[#07090e] hover:shadow-[0_0_12px_rgba(112,181,249,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none cursor-pointer"
          id="edit-profile-action"
        >
          Edit Profile
        </button>
      </div>

      <div className="border-t border-white/8 px-5 py-4 text-left bg-white/2">
        <span className="text-[10px] font-black text-[#70b5f9] tracking-widest uppercase">Voyager Analytics</span>
        
        <div className="space-y-3 mt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#c9ced3] flex items-center gap-2 font-medium">
              <Calendar className="h-3.5 w-3.5 text-[#70b5f9]" />
              Total Journeys:
            </span>
            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5" id="stat-total-journeys">{totalJourneys}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#c9ced3] flex items-center gap-2 font-medium">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              Checkpoints Visited:
            </span>
            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5" id="stat-checkpoints">
              {visitedCheckpointsCount} <span className="text-[10px] text-[#9fa3a7] font-normal">/ {totalCheckpointsCount}</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#c9ced3] flex items-center gap-2 font-medium">
              <Wallet className="h-3.5 w-3.5 text-amber-400" />
              Budget Scheduled:
            </span>
            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5" id="stat-budget">
              ₹{totalBudget.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#c9ced3] flex items-center gap-2 font-medium">
              <Users className="h-3.5 w-3.5 text-sky-400" />
              Co-Travelers Network:
            </span>
            <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5" id="stat-connections">{user.connectionsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

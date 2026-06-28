import React from 'react';
import { Compass, Wallet, MapPin, Award, CheckCircle2, ChevronRight, Milestone, AlertCircle, Sparkles } from 'lucide-react';
import { Journey, Checkpoint } from '../types';

interface DashboardStatsProps {
  journeys: Journey[];
}

export default function DashboardStats({ journeys }: DashboardStatsProps) {
  const totalJourneys = journeys.length;
  const completedJourneys = journeys.filter(j => j.status === 'completed').length;
  const ongoingJourneys = journeys.filter(j => j.status === 'ongoing').length;
  const plannedJourneys = journeys.filter(j => j.status === 'planned').length;

  const allCheckpoints = journeys.flatMap(j => j.checkpoints);
  const totalCheckpoints = allCheckpoints.length;
  const visitedCheckpoints = allCheckpoints.filter(cp => cp.status === 'visited').length;
  const plannedCheckpoints = totalCheckpoints - visitedCheckpoints;

  const totalBudget = allCheckpoints.reduce((sum, cp) => sum + cp.cost, 0);
  const spentBudget = allCheckpoints.filter(cp => cp.status === 'visited').reduce((sum, cp) => sum + cp.cost, 0);
  const remainingBudget = totalBudget - spentBudget;

  const completionPercentage = totalCheckpoints > 0 ? Math.round((visitedCheckpoints / totalCheckpoints) * 100) : 0;

  const transportCount = journeys.reduce((acc, j) => {
    acc[j.transport] = (acc[j.transport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const transports = [
    { key: 'flight', label: '✈️ Flights', color: 'bg-sky-500' },
    { key: 'train', label: '🚂 Trains', color: 'bg-emerald-500' },
    { key: 'car', label: '🚗 Road Trips', color: 'bg-blue-500' },
    { key: 'bike', label: '🏍️ Motorcycles', color: 'bg-indigo-500' },
    { key: 'bus', label: '🚌 Buses', color: 'bg-purple-500' },
    { key: 'walk', label: '🚶 Trekking', color: 'bg-amber-500' }
  ];

  const achievements = [
    {
      id: 'ach-1',
      title: "First Step Forward",
      desc: "Post your first planned travel journey on Raahi.",
      isUnlocked: totalJourneys > 0,
      badge: "🌱"
    },
    {
      id: 'ach-2',
      title: "Veteran Navigator",
      desc: "Log and complete 5 or more travel checkpoints.",
      isUnlocked: visitedCheckpoints >= 5,
      badge: "🧭"
    },
    {
      id: 'ach-3',
      title: "High-Spender Explorer",
      desc: "Map a total journey budget exceeding ₹15,000.",
      isUnlocked: totalBudget > 15000,
      badge: "💎"
    },
    {
      id: 'ach-4',
      title: "Multi-Modal Voyager",
      desc: "Incorporate at least 2 different types of transit in your routes.",
      isUnlocked: Object.keys(transportCount).length >= 2,
      badge: "🚉"
    },
    {
      id: 'ach-5',
      title: "Completed Expedition",
      desc: "Mark at least one entire journey status as 'completed'.",
      isUnlocked: completedJourneys > 0,
      badge: "🏆"
    }
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-6" id="dashboard-stats-view">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="bento-grid-stats">
        
        <div className="glass-card-no-hover p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-[#70b5f9]/10 text-[#70b5f9] border border-[#70b5f9]/15">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#c9ced3] uppercase tracking-widest">Total Scheduled Budget</p>
            <p className="text-xl font-extrabold text-white mt-1">₹{totalBudget.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">₹{spentBudget.toLocaleString('en-IN')} Spent</p>
          </div>
        </div>

        <div className="glass-card-no-hover p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            <Milestone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#c9ced3] uppercase tracking-widest">Stop Checkpoints</p>
            <p className="text-xl font-extrabold text-white mt-1">{visitedCheckpoints} / {totalCheckpoints}</p>
            <p className="text-[10px] text-emerald-400/90 font-medium mt-0.5">{plannedCheckpoints} stops outstanding</p>
          </div>
        </div>

        <div className="glass-card-no-hover p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#c9ced3] uppercase tracking-widest">Journey Distribution</p>
            <p className="text-xl font-extrabold text-white mt-1">{totalJourneys} Active</p>
            <p className="text-[10px] text-purple-300 font-medium mt-0.5">{completedJourneys} Completed • {ongoingJourneys} Ongoing</p>
          </div>
        </div>

        <div className="glass-card-no-hover p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#c9ced3] uppercase tracking-widest">Badges Unlocked</p>
            <p className="text-xl font-extrabold text-white mt-1">{unlockedCount} / {achievements.length}</p>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">Rank: {unlockedCount >= 4 ? 'Master Voyager' : unlockedCount >= 2 ? 'Active Wanderer' : 'Apprentice Traveler'}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-graphs-container">
        
        <div className="glass-card-no-hover p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <h4 className="font-extrabold text-sm text-white font-sans self-start mb-4 tracking-tight flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#70b5f9] animate-spin-slow" />
            Route Completion Performance
          </h4>

          {totalCheckpoints > 0 ? (
            <div className="flex flex-col items-center justify-center my-6 relative">
              <svg width="170" height="170" className="rotate-[-90deg]">
                <circle
                  cx="85"
                  cy="85"
                  r="68"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                />
                <circle
                  cx="85"
                  cy="85"
                  r="68"
                  fill="transparent"
                  stroke="#70b5f9"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(112,181,249,0.35)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white font-sans">{completionPercentage}%</span>
                <span className="text-[9px] text-[#a3a8ae] font-black uppercase tracking-widest mt-0.5">Visits Mapped</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#9fa3a7] flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-white/10" />
              <p className="text-xs">No checkpoints mapped to compute progress rates.</p>
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-4 mt-4 border-t border-white/8 pt-4 text-center">
            <div>
              <p className="text-lg font-black text-[#70b5f9]">{visitedCheckpoints}</p>
              <p className="text-[10px] text-[#a3a8ae] font-bold uppercase tracking-wider">Marked Visited</p>
            </div>
            <div>
              <p className="text-lg font-black text-[#c9ced3]">{plannedCheckpoints}</p>
              <p className="text-[10px] text-[#a3a8ae] font-bold uppercase tracking-wider">Remaining Stopovers</p>
            </div>
          </div>
        </div>

        <div className="glass-card-no-hover p-6 rounded-2xl shadow-xl">
          <h4 className="font-extrabold text-sm text-white font-sans mb-4 tracking-tight">
            Transit Preference Breakdown
          </h4>

          {totalJourneys > 0 ? (
            <div className="space-y-4 my-2">
              {transports.map((t) => {
                const count = transportCount[t.key] || 0;
                const ratio = Math.round((count / totalJourneys) * 100);
                
                return (
                  <div key={t.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#e1e1e1]">{t.label}</span>
                      <span className="text-[#c9ced3] font-extrabold">{count} journeys ({ratio}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/2 rounded-full border border-white/5 overflow-hidden">
                      <div 
                        className={`h-full ${t.color} rounded-full transition-all duration-700`}
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-[#9fa3a7] flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-white/10" />
              <p className="text-xs">No journeys listed to analyze transportation preferences.</p>
            </div>
          )}
        </div>

      </div>

      <div className="glass-card-no-hover rounded-2xl p-6 shadow-xl" id="milestones-checklist">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/25" />
          <div>
            <h4 className="font-extrabold text-sm text-white font-sans tracking-tight">
              Voyage Achievements & Badges
            </h4>
            <p className="text-[10px] text-[#a3a8ae]">Automatically unlocks based on your active journeys and checkpoint details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="achievements-bento">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`p-4 rounded-xl border flex gap-3.5 items-center transition-all duration-300 ${
                ach.isUnlocked 
                  ? 'bg-amber-950/25 border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                  : 'bg-white/2 border-white/5 opacity-60'
              }`}
              id={`ach-card-${ach.id}`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg border shrink-0 ${
                ach.isUnlocked 
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-amber-500 text-amber-200' 
                  : 'bg-white/2 border-white/10 text-white/20 filter grayscale opacity-45'
              }`}>
                {ach.badge}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`font-black text-xs truncate ${ach.isUnlocked ? 'text-amber-400' : 'text-[#9fa3a7]'}`}>
                    {ach.title}
                  </h5>
                  {ach.isUnlocked ? (
                    <span className="text-[8px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-amber-500/30">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[8px] bg-white/5 text-[#9fa3a7] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-white/5">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#a3a8ae] leading-normal mt-1 font-normal">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Plus, Search, HelpCircle, Briefcase, Calendar, MapPin } from 'lucide-react';
import { UserProfile, Journey, Checkpoint } from './types';
import {
  fetchOrCreateProfile,
  signOut,
  saveUserProfile,
  getJourneys,
  addJourney,
  updateJourney,
  deleteJourney,
  toggleLikeJourney
} from './db';
import { supabase } from './supabaseClient';

import Header from './components/Header';
import ProfileCard from './components/ProfileCard';
import JourneyCard from './components/JourneyCard';
import JourneyModal from './components/JourneyModal';
import ProfileModal from './components/ProfileModal';
import DashboardStats from './components/DashboardStats';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import ParticleBackground from './components/ParticleBackground';
import TravelLoadingScreen from './components/TravelLoadingScreen';
import SkeletonCard from './components/SkeletonCard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'my-plans' | 'stats'>('feed');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFetchingJourneys, setIsFetchingJourneys] = useState(true);
  const [currentLoadingUser, setCurrentLoadingUser] = useState<UserProfile | null>(null);

  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);

  const [toast, setToast] = useState<{ message: string; journeyTitle: string; id: number } | null>(null);

  const showToast = (message: string, journeyTitle: string) => {
    const toastId = Date.now();
    setToast({ message, journeyTitle, id: toastId });
    setTimeout(() => {
      setToast(prev => prev && prev.id === toastId ? null : prev);
    }, 4000);
  };

  useEffect(() => {
    const checkSessionAndSetupListener = async () => {
      const { data: { session } } = await (supabase as any).auth.getSession();

      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user);
        setCurrentLoadingUser(profile);
        setIsTransitioning(true);
        setIsFetchingJourneys(true);
        const list = await getJourneys(profile.id);
        setJourneys(list);
        setIsFetchingJourneys(false);
      } else {
        setUser(null);
        setJourneys([]);
        setIsFetchingJourneys(false);
      }

      const { data: { subscription } } = (supabase as any).auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          const profile = await fetchOrCreateProfile(session.user);
          setUser(prev => {
            if (!prev) {
              setCurrentLoadingUser(profile);
              setIsTransitioning(true);
            } else {
              return profile;
            }
            return prev;
          });
          setIsFetchingJourneys(true);
          const list = await getJourneys(profile.id);
          setJourneys(list);
          setIsFetchingJourneys(false);
        } else {
          setUser(null);
          setJourneys([]);
          setCurrentLoadingUser(null);
          setIsTransitioning(false);
          setIsFetchingJourneys(false);
        }
      });

      return subscription;
    };

    let subPromise = checkSessionAndSetupListener();

    return () => {
      subPromise.then(sub => {
        if (sub) sub.unsubscribe();
      });
    };
  }, []);

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    await saveUserProfile(updatedProfile);
  };

  const handleSignOut = async () => {
    await (supabase as any).auth.signOut();
    setUser(null);
    setJourneys([]);
  };

  const handleSaveJourney = async (journeyData: Omit<Journey, 'id' | 'likes' | 'hasLiked' | 'createdAt'>) => {
    if (editingJourney) {
      const updated: Journey = {
        ...editingJourney,
        ...journeyData,
        likes: editingJourney.likes,
        hasLiked: editingJourney.hasLiked,
        createdAt: editingJourney.createdAt,
        checkpoints: journeyData.checkpoints
      };

      const previousJourney = journeys.find(j => j.id === updated.id);
      const wasOngoingToCompleted = previousJourney && previousJourney.status === 'ongoing' && updated.status === 'completed';

      const newJourneysList = await updateJourney(updated);
      setJourneys(newJourneysList);
      setEditingJourney(null);

      if (wasOngoingToCompleted) {
        showToast("Adventure successfully completed! 🎉 You've reached your final stop.", updated.title);
      }
    } else {
      const newJourney = await addJourney(journeyData);
      setJourneys([newJourney, ...journeys.filter(j => j.id !== newJourney.id)]);
    }
  };

  const handleDeleteJourney = async (id: string) => {
    const list = await deleteJourney(id);
    setJourneys(list);
  };

  const handleUpdateJourney = async (updated: Journey) => {
    const previousJourney = journeys.find(j => j.id === updated.id);
    const wasOngoingToCompleted = previousJourney && previousJourney.status === 'ongoing' && updated.status === 'completed';

    const list = await updateJourney(updated);
    setJourneys(list);

    if (wasOngoingToCompleted) {
      showToast("Adventure successfully completed! 🎉 You've reached your final stop.", updated.title);
    }
  };

  const handleToggleLike = async (id: string) => {
    const list = await toggleLikeJourney(id);
    setJourneys(list);
  };



  const handleAddCheckpointQuick = (journeyId: string) => {
    const target = journeys.find(j => j.id === journeyId);
    if (target) {
      setEditingJourney(target);
      setIsJourneyModalOpen(true);
    }
  };

  const filteredJourneys = journeys.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.checkpoints.some(cp => cp.name.toLowerCase().includes(searchQuery.toLowerCase()) || cp.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'my-plans') {
      return j.status === 'completed';
    }

    if (activeTab === 'feed') {
      return j.status === 'planned' || j.status === 'ongoing';
    }

    return true;
  });

  return (
    <AnimatePresence mode="wait">
      {isTransitioning ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <TravelLoadingScreen
            onComplete={() => {
              if (currentLoadingUser) {
                setUser(currentLoadingUser);
              }
              setIsTransitioning(false);
            }}
          />
        </motion.div>
      ) : !user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="min-h-screen bg-[#07090e] overflow-hidden"
        >
          <AuthPage 
            onAuthSuccess={async (authenticatedUser) => {
              setCurrentLoadingUser(authenticatedUser);
              setIsTransitioning(true);
              setIsFetchingJourneys(true);
              const list = await getJourneys(authenticatedUser.id);
              setJourneys(list);
              setIsFetchingJourneys(false);
            }} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-screen bg-[#07090e] text-[#e1e1e1] font-sans leading-normal antialiased pb-12 relative overflow-hidden"
          id="raahi-app-root"
        >
          <ParticleBackground />
          <div className="absolute top-[5%] left-[-15%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#f36c21]/12 to-pink-600/8 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-indigo-600/12 to-[#70b5f9]/12 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[40%] left-[30%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-r from-emerald-500/8 to-teal-500/5 blur-[140px] pointer-events-none" />
          
          <Header
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onEditProfile={() => setIsProfileModalOpen(true)}
            onSignOut={handleSignOut}
          />

          <main className="max-w-8xl mx-auto px-6 mt-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-4 lg:sticky lg:top-[74px] space-y-4">
                <ProfileCard
                  user={user}
                  journeys={journeys}
                  onEditProfile={() => setIsProfileModalOpen(true)}
                />
              </div>

              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'stats' ? (
                    <motion.div
                      key="stats-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DashboardStats journeys={journeys} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="feed-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="glass-card-no-hover p-5 rounded-2xl shadow-xl" id="post-creator-box">
                        <div className="flex gap-4 items-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-11 w-11 rounded-full object-cover border border-white/10 shadow-md hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#f36c21] to-[#d35400] flex items-center justify-center text-white font-bold text-lg border border-white/10 uppercase select-none shrink-0 shadow-md">
                              {user.name ? user.name.charAt(0) : 'U'}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEditingJourney(null);
                              setIsJourneyModalOpen(true);
                            }}
                            className="flex-1 glass-input text-sm text-[#9fa3a7] font-semibold px-5 py-3 rounded-full text-left transition-all duration-300 hover:bg-[#0d1117]/60 hover:text-white hover:border-white/20 outline-none cursor-pointer"
                          >
                            Start planning a new journey...
                          </button>
                        </div>
                      </div>

                      {searchQuery && (
                        <div className="glass-card-no-hover p-4 rounded-xl flex items-center justify-between text-xs text-[#9fa3a7] font-medium shadow-lg backdrop-blur-md">
                          <span>Showing search results for "<span className="font-bold text-[#70b5f9]">{searchQuery}</span>"</span>
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="text-[#70b5f9] font-bold hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                          >
                            Clear search
                          </button>
                        </div>
                      )}

                      {activeTab === 'my-plans' && (
                        <div className="glass-card-no-hover bg-emerald-950/20 border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 flex gap-3 items-start shadow-xl backdrop-blur-md" id="my-plans-header">
                          <Briefcase className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white text-sm">Completed Journeys Archive</p>
                            <p className="text-[#c9ced3] font-normal mt-1 leading-relaxed">This section contains your fully completed adventures and travel logs. Completed journeys automatically migrate here from your Home Feed once all stops are visited!</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'feed' && (
                        <div className="glass-card-no-hover bg-blue-950/20 border-blue-500/30 p-4 rounded-xl text-xs text-[#70b5f9] flex gap-3 items-start shadow-xl backdrop-blur-md" id="feed-info-header">
                          <Compass className="h-4.5 w-4.5 text-[#70b5f9] shrink-0 animate-pulse" />
                          <div>
                            <p className="font-extrabold text-white text-sm">Active & Planned Journeys Feed</p>
                            <p className="text-[#c9ced3] font-normal mt-1 leading-relaxed">View and update your active (ongoing) routes and future planned schedules. Ticking off all checkpoints will automatically archive the journey into your completed logs.</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4" id="journeys-feed-list">
                        {isFetchingJourneys ? (
                          <div className="space-y-4">
                            <SkeletonCard />
                            <SkeletonCard />
                          </div>
                        ) : filteredJourneys.length === 0 ? (
                          <div className="glass-card-no-hover p-12 text-center text-[#9fa3a7] shadow-xl rounded-2xl">
                            <Compass className="h-12 w-12 text-[#38434f] mx-auto mb-4 animate-spin-slow text-[#70b5f9]/80" />
                            <h4 className="font-extrabold text-white text-base">No Journeys Found</h4>
                            <p className="text-xs mt-2 text-[#9fa3a7] max-w-md mx-auto leading-relaxed">
                              We couldn't find any travel plans matching your criteria. Try starting a new plan or revising your search queries!
                            </p>
                            <button
                              onClick={() => {
                                setEditingJourney(null);
                                setIsJourneyModalOpen(true);
                              }}
                              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#70b5f9] to-[#409bf6] hover:from-blue-400 hover:to-blue-500 text-xs font-black text-[#07090e] rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 cursor-pointer"
                              id="empty-state-cta"
                            >
                              Create Journey Plan
                            </button>
                          </div>
                        ) : (
                          filteredJourneys.map((journey) => (
                            <JourneyCard
                              key={journey.id}
                              journey={journey}
                              user={user}
                              onEdit={(j) => {
                                setEditingJourney(j);
                                setIsJourneyModalOpen(true);
                              }}
                              onDelete={handleDeleteJourney}
                              onUpdate={handleUpdateJourney}
                              onToggleLike={handleToggleLike}
                              onAddCheckpointQuick={handleAddCheckpointQuick}
                            />
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </main>

          <JourneyModal
            isOpen={isJourneyModalOpen}
            onClose={() => {
              setIsJourneyModalOpen(false);
              setEditingJourney(null);
            }}
            onSave={handleSaveJourney}
            editingJourney={editingJourney}
          />

          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleSaveProfile}
            user={user}
          />

          <Toast
            isOpen={!!toast}
            message={toast?.message || ''}
            journeyTitle={toast?.journeyTitle || ''}
            onClose={() => setToast(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

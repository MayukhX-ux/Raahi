import React, { useState } from 'react';
import { Plane, Train, Car, Bike, Footprints, Bus, Heart, MessageSquare, Share2, Edit2, Trash2, CheckCircle2, Circle, Plus, MapPin, Compass, MoreHorizontal, ChevronDown, Check, Send, X, BookOpen } from 'lucide-react';
import { Journey, Checkpoint, UserProfile } from '../types';

interface JourneyCardProps {
  key?: string;
  journey: Journey;
  user: UserProfile;
  onEdit: (journey: Journey) => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: Journey) => void;
  onToggleLike: (id: string) => void;
  onAddCheckpointQuick: (journeyId: string) => void;
}

export default function JourneyCard({
  journey,
  user,
  onEdit,
  onDelete,
  onUpdate,
  onToggleLike,
  onAddCheckpointQuick
}: JourneyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);

  const comments = (journey as any).comments || [
    { id: 'c1', author: 'Saurav Sen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', text: 'This route looks incredibly challenging but exciting! Have a safe trip!', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'c2', author: 'Neha Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: 'Make sure to check the permit rules at Keylong, they can get strict.', createdAt: new Date(Date.now() - 3600000).toISOString() }
  ];

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4 text-[#70b5f9]" />;
      case 'train': return <Train className="h-4 w-4 text-emerald-400" />;
      case 'bike': return <Bike className="h-4 w-4 text-indigo-400" />;
      case 'walk': return <Footprints className="h-4 w-4 text-amber-400" />;
      case 'bus': return <Bus className="h-4 w-4 text-purple-400" />;
      default: return <Car className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTransportLabel = (type: string) => {
    switch (type) {
      case 'flight': return 'Flight Journey';
      case 'train': return 'Train Expedition';
      case 'bike': return 'Motorcycle Roadtrip';
      case 'walk': return 'Trekking Journey';
      case 'bus': return 'Bus Transit';
      default: return 'Car Roadtrip';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#38434f] text-[#e1e1e1] border-[#38434f]';
      case 'ongoing': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800 animate-pulse';
      default: return 'bg-blue-950/40 text-[#70b5f9] border-blue-800';
    }
  };

  const handleToggleCheckpoint = (cpId: string) => {
    const targetCp = journey.checkpoints.find(cp => cp.id === cpId);
    const wasVisited = targetCp ? targetCp.status === 'visited' : false;

    if (!wasVisited) {
      setLastCheckedId(cpId);
      setTimeout(() => {
        setLastCheckedId(null);
      }, 3000);
    } else {
      setLastCheckedId(null);
    }

    const updatedCheckpoints = journey.checkpoints.map(cp => {
      if (cp.id === cpId) {
        return { ...cp, status: cp.status === 'visited' ? 'planned' as const : 'visited' as const };
      }
      return cp;
    });

    const total = updatedCheckpoints.length;
    const completed = updatedCheckpoints.filter(c => c.status === 'visited').length;
    let computedStatus: 'planned' | 'ongoing' | 'completed' = journey.status;

    if (total > 0) {
      if (completed === total) {
        computedStatus = 'completed';
      } else if (completed > 0) {
        computedStatus = 'ongoing';
      } else {
        computedStatus = 'planned';
      }
    }

    onUpdate({
      ...journey,
      checkpoints: updatedCheckpoints,
      status: computedStatus
    });
  };

  const handleStatusChange = (status: 'planned' | 'ongoing' | 'completed') => {
    onUpdate({
      ...journey,
      status
    });
    setShowStatusMenu(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: user.name,
      avatar: user.avatarUrl,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...comments, newComment];
    onUpdate({
      ...journey,
      comments: updatedComments
    } as any);

    setCommentText('');
  };

  const handleShare = () => {
    setShareSuccess(true);
    navigator.clipboard.writeText(`${window.location.origin}/#journey/${journey.id}`).catch(() => {});
    setTimeout(() => {
      setShareSuccess(false);
    }, 3000);
  };

  const numCheckpoints = journey.checkpoints.length;
  const svgWidth = 500;
  const svgHeight = 70;
  
  const nodes = journey.checkpoints.map((cp, idx) => {
    const x = 30 + (idx * (svgWidth - 60)) / Math.max(1, numCheckpoints - 1);
    const y = svgHeight / 2 + 15 * Math.sin((idx * Math.PI) / 2);
    return { ...cp, x, y };
  });

  let pathD = '';
  if (nodes.length > 0) {
    pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const p0 = nodes[i - 1];
      const p1 = nodes[i];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  const totalBudget = journey.checkpoints.reduce((sum, cp) => sum + cp.cost, 0);
  const visitedBudget = journey.checkpoints.filter(cp => cp.status === 'visited').reduce((sum, cp) => sum + cp.cost, 0);

  const totalCheckpoints = journey.checkpoints.length;
  const completedCheckpoints = journey.checkpoints.filter(cp => cp.status === 'visited').length;
  const completionPercentage = totalCheckpoints > 0 
    ? Math.round((completedCheckpoints / totalCheckpoints) * 100) 
    : 0;

  const truncateThreshold = 220;
  const showTruncated = journey.description.length > truncateThreshold && !isExpanded;
  const displayText = showTruncated 
    ? `${journey.description.substring(0, truncateThreshold)}...` 
    : journey.description;

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl" id={`journey-card-${journey.id}`}>
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-11 w-11 rounded-full object-cover border border-[#38434f]"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#f36c21] to-[#d35400] flex items-center justify-center text-white font-bold text-lg border border-[#38434f] uppercase select-none shrink-0">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-sans hover:text-[#70b5f9] cursor-pointer hover:underline">
                {user.name}
              </span>
              <span className="text-[#9fa3a7] text-xs">•</span>
              <span className="text-[10px] bg-[#0d1117] text-[#70b5f9] px-2 py-0.5 rounded-full font-bold border border-[#38434f] uppercase">
                Creator
              </span>
            </div>
            <p className="text-[11px] text-[#9fa3a7] leading-normal font-normal">
              {user.headline}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#9fa3a7] font-normal">
              <span>{new Date(journey.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#9fa3a7]">
                {getTransportIcon(journey.transport)}
                {getTransportLabel(journey.transport)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 focus:outline-none transition-all cursor-pointer ${getStatusStyle(journey.status)}`}
              id={`status-dropdown-${journey.id}`}
            >
              <span>{journey.status}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-1.5 w-32 rounded bg-[#1d2226] shadow-2xl border border-[#38434f] z-20 py-1" id={`status-menu-${journey.id}`}>
                {(['planned', 'ongoing', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-[#e1e1e1] hover:bg-[#38434f] hover:text-[#70b5f9] flex items-center justify-between"
                  >
                    <span className="capitalize">{s}</span>
                    {journey.status === s && <Check className="h-3 w-3 text-[#70b5f9]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onEdit(journey)}
            className="p-1.5 text-[#9fa3a7] hover:text-white hover:bg-[#38434f] rounded-full transition-all"
            title="Edit Journey"
            id={`edit-journey-btn-${journey.id}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          {showConfirmDelete ? (
            <div className="flex items-center gap-1 bg-red-950/40 border border-red-900/60 rounded-full px-2 py-0.5" id={`delete-confirm-${journey.id}`}>
              <span className="text-[10px] text-red-400 font-bold px-1 select-none">Delete?</span>
              <button
                onClick={() => onDelete(journey.id)}
                className="p-1 text-red-400 hover:text-white hover:bg-red-900 rounded-full transition-all cursor-pointer"
                title="Confirm Delete"
                id={`confirm-delete-btn-${journey.id}`}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="p-1 text-[#9fa3a7] hover:text-white hover:bg-[#38434f] rounded-full transition-all cursor-pointer"
                title="Cancel Delete"
                id={`cancel-delete-btn-${journey.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-[#9fa3a7] hover:text-red-400 hover:bg-red-950/30 rounded-full transition-all cursor-pointer"
              title="Delete Journey"
              id={`delete-journey-btn-${journey.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-4">
        <h4 className="font-extrabold text-white text-lg font-sans tracking-tight mb-2 leading-snug">
          {journey.title}
        </h4>
        
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[11px] text-[#c9ced3] bg-white/2 px-4 py-2 rounded-xl border border-white/8 mb-4 font-medium backdrop-blur-md shadow-inner">
          <span className="flex items-center gap-1 font-extrabold text-white">
            📅 Route Schedule:
          </span>
          <span>
            {new Date(journey.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {journey.endDate && journey.endDate !== journey.startDate ? ` - ${new Date(journey.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
          </span>
          <span className="text-white/10">|</span>
          <span className="font-extrabold text-white">👥 Companions:</span>
          <span>{journey.companions}</span>
          <span className="text-white/10">|</span>
          <span className="font-extrabold text-emerald-400">💰 Total Cost:</span>
          <span className="font-black text-emerald-300">
            ₹{totalBudget.toLocaleString('en-IN')}
            {visitedBudget > 0 && (
              <span className="text-[10px] text-[#a3a8ae] font-normal"> (Spent: ₹{visitedBudget.toLocaleString('en-IN')})</span>
            )}
          </span>
        </div>

        {totalCheckpoints > 0 && (
          <div className="mb-4 bg-white/2 p-3.5 rounded-xl border border-white/8 shadow-inner" id={`progress-container-${journey.id}`}>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-extrabold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#70b5f9] animate-spin-slow" />
                Route Progress Tracker
              </span>
              <span className="font-mono text-emerald-400 font-extrabold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {completionPercentage}% ({completedCheckpoints}/{totalCheckpoints} stops)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#0d1117]/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <p className="text-sm text-[#e1e1e1] font-normal leading-relaxed whitespace-pre-wrap font-sans">
          {displayText}
          {showTruncated && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs font-bold text-[#70b5f9] hover:underline ml-1.5 cursor-pointer focus:outline-none"
            >
              ...see more
            </button>
          )}
        </p>
      </div>

      {journey.checkpoints.length > 0 && (
        <div className="px-5 py-4 bg-white/1 border-b border-white/8">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-[10px] font-bold text-[#70b5f9] tracking-wider uppercase flex items-center gap-1.5 font-sans">
              <Compass className="h-3.5 w-3.5 text-[#70b5f9] animate-spin-slow" />
              Dynamic Route Network Map
            </h5>
            <span className="text-[9px] text-[#9fa3a7] font-medium">Nodes represent sequential stops</span>
          </div>

          <div className="w-full overflow-x-auto bg-[#0d1117] p-2 rounded-lg border border-[#38434f] scrollbar-none" id={`route-svg-${journey.id}`}>
            <div className="min-w-[500px]">
              <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto overflow-visible">
                {nodes.length > 1 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#38434f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    id={`base-route-path-${journey.id}`}
                  />
                )}

                {nodes.length > 1 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 4"
                    className="animate-[dash_15s_linear_infinite]"
                    id={`active-route-path-${journey.id}`}
                  />
                )}

                {nodes.map((node, idx) => {
                  const isVisited = node.status === 'visited';
                  return (
                    <g key={node.id} className="group cursor-pointer">
                      {lastCheckedId === node.id && (
                        <>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="28"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            className="animate-[ping_1.5s_ease-out_infinite]"
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="16"
                            fill="#10b981"
                            opacity="0.4"
                            className="animate-pulse"
                          />
                        </>
                      )}

                      {isVisited && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="10"
                          fill="#10b981"
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}
                      
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="6.5"
                        fill={isVisited ? "#10b981" : "#1d2226"}
                        stroke={isVisited ? "#047857" : "#70b5f9"}
                        strokeWidth="2.5"
                        onClick={() => handleToggleCheckpoint(node.id)}
                        className="transition-all hover:r-8 hover:stroke-amber-500"
                        title="Click to toggle status"
                      />

                      <text
                        x={node.x}
                        y={node.y - 12}
                        textAnchor="middle"
                        className={`text-[9px] font-bold font-sans tracking-tight fill-[#e1e1e1] ${isVisited ? 'fill-emerald-400 font-extrabold' : ''}`}
                      >
                        {node.name.length > 18 ? `${node.name.substring(0, 16)}..` : node.name}
                      </text>

                      <text
                        x={node.x}
                        y={node.y + 18}
                        textAnchor="middle"
                        className="text-[8px] font-medium font-sans fill-[#9fa3a7]"
                      >
                        {node.location.length > 15 ? `${node.location.substring(0, 13)}..` : node.location}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {journey.checkpoints.length > 0 && (
        <div className="p-4 border-b border-[#38434f] bg-[#0d1117]/40" id={`checkpoints-section-${journey.id}`}>
          <div className="flex items-center justify-between mb-3.5">
            <h5 className="text-[11px] font-extrabold text-[#e1e1e1] tracking-wider uppercase font-sans">
              📍 Checklist & Journey Checkpoints ({journey.checkpoints.length})
            </h5>
            <button
              onClick={() => onAddCheckpointQuick(journey.id)}
              className="text-xs text-[#70b5f9] font-semibold hover:underline flex items-center gap-0.5"
              id={`add-stop-quick-${journey.id}`}
            >
              <Plus className="h-3.5 w-3.5" /> Add Stop
            </button>
          </div>

          <div className="space-y-4 relative pl-3 before:absolute before:inset-y-2 before:left-[10.5px] before:w-[2px] before:bg-[#38434f]">
            {journey.checkpoints.map((cp, idx) => {
              const isVisited = cp.status === 'visited';
              return (
                <div 
                  key={cp.id} 
                  className={`flex items-start gap-3.5 relative transition-all group ${isVisited ? 'opacity-75' : ''}`}
                  id={`checkpoint-row-${cp.id}`}
                >
                  <div className="mt-1 relative z-10 bg-[#1d2226] rounded">
                    <button
                      onClick={() => handleToggleCheckpoint(cp.id)}
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-300 cursor-pointer outline-none ${
                        isVisited 
                          ? 'border-emerald-400 bg-emerald-500 text-[#0d1117] shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                          : 'border-[#38434f] bg-[#0d1117] hover:border-[#70b5f9] text-transparent'
                      }`}
                      title="Mark stop as visited"
                      id={`tickbox-${cp.id}`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                  </div>

                  <div className="flex-1 bg-white/2 p-3 rounded-xl border border-white/8 shadow-md hover:border-[#70b5f9]/40 hover:bg-white/5 transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs text-white ${isVisited ? 'line-through text-[#9fa3a7]' : ''}`}>
                          {cp.name}
                        </span>
                        <span className="text-[10px] text-[#9fa3a7] font-medium flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5 text-[#9fa3a7]" /> {cp.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {cp.cost > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">
                            ₹{cp.cost.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded uppercase border ${isVisited ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' : 'bg-amber-950/20 text-amber-400 border-amber-900/30'}`}>
                          {cp.status}
                        </span>
                      </div>
                    </div>

                    {cp.notes && (
                      <p className="text-[11px] text-[#9fa3a7] font-normal leading-relaxed mt-1.5 pl-1.5 border-l-2 border-white/10 font-sans italic">
                        "{cp.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {journey.notes && (
        <div className="p-5 border-b border-white/8 bg-[#1a1f24]/30 backdrop-blur-md animate-fade-in" id={`journal-notes-section-${journey.id}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <BookOpen className="h-4 w-4 text-[#70b5f9]" />
            <h5 className="text-[11px] font-black text-white tracking-widest uppercase font-sans">
              📖 Travel Journal Entry & Notes
            </h5>
          </div>
          <p className="text-xs text-[#f1f3f5] leading-relaxed whitespace-pre-wrap font-sans italic bg-[#07090e]/50 p-4 rounded-xl border border-white/5 shadow-inner">
            "{journey.notes}"
          </p>
        </div>
      )}

      <div className="px-5 py-3 border-b border-white/8 flex justify-between items-center text-[11px] text-[#c9ced3] font-medium bg-white/1">
        <div className="flex items-center gap-1.5 hover:text-[#70b5f9] cursor-pointer">
          <div className="flex items-center justify-center bg-[#70b5f9] text-[#07090e] rounded-full w-4.5 h-4.5 shadow-sm">
            <Heart className="h-2.5 w-2.5 fill-current" />
          </div>
          <span id={`likes-count-${journey.id}`}>
            {journey.hasLiked ? `You and ${journey.likes - 1} others` : `${journey.likes} likes`}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-[#70b5f9] hover:underline cursor-pointer font-bold"
            id={`comments-toggle-btn-${journey.id}`}
          >
            {comments.length} comments
          </button>
          <span>•</span>
          <span>1 share</span>
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-white/8 py-1 bg-white/2" id="action-bar-container">
        <button
          onClick={() => onToggleLike(journey.id)}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer hover:bg-[#38434f]/50 transition-colors ${journey.hasLiked ? 'text-[#70b5f9]' : 'text-[#9fa3a7] hover:text-white'}`}
          id={`like-btn-${journey.id}`}
        >
          <Heart className={`h-4 w-4 ${journey.hasLiked ? 'fill-[#70b5f9]' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#9fa3a7] hover:text-white cursor-pointer hover:bg-[#38434f]/50 transition-colors ${showComments ? 'text-[#70b5f9]' : ''}`}
          id={`comment-trigger-${journey.id}`}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button
          onClick={() => onAddCheckpointQuick(journey.id)}
          className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#9fa3a7] hover:text-white cursor-pointer hover:bg-[#38434f]/50 transition-colors"
          id={`quick-add-btn-${journey.id}`}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Spot</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#9fa3a7] hover:text-white cursor-pointer hover:bg-[#38434f]/50 transition-colors relative"
          id={`share-btn-${journey.id}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
          {shareSuccess && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap z-30">
              Copied Route link!
            </span>
          )}
        </button>
      </div>

      {showComments && (
        <div className="bg-[#07090e]/50 p-5 border-t border-white/8 backdrop-blur-md" id={`comments-box-${journey.id}`}>
          <form onSubmit={handleAddComment} className="flex gap-3 mb-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f36c21] to-[#d35400] flex items-center justify-center text-white font-bold text-xs border border-white/10 uppercase select-none shrink-0">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
            )}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                placeholder="Write a route suggestion or checkpoint question..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full glass-input text-xs text-white pl-4 pr-10 py-2.5 rounded-full placeholder-[#9fa3a7]"
                id={`comment-input-${journey.id}`}
              />
              <button
                type="submit"
                className="absolute right-1 text-[#9fa3a7] hover:text-[#70b5f9] p-1.5 focus:outline-none"
                id={`comment-submit-${journey.id}`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          <div className="space-y-3.5" id={`comments-list-${journey.id}`}>
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-2.5 items-start">
                <img
                  src={comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={comment.author}
                  className="h-7 w-7 rounded-full object-cover border border-[#38434f]"
                />
                <div className="flex-1 bg-white/3 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[11px] text-white font-sans">
                      {comment.author}
                    </span>
                    <span className="text-[9px] text-[#9fa3a7]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#e1e1e1] leading-relaxed font-sans mt-0.5">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ExternalLink, Info, Flame, Lightbulb, Compass } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Monsoon Treks in Western Ghats Peak",
    category: "Indian Adventure",
    readers: "4,821 explorers",
    time: "2d ago"
  },
  {
    id: 2,
    title: "Kyoto introduces peak-season crowd caps",
    category: "Global Travel Rules",
    readers: "12,942 explorers",
    time: "1d ago"
  },
  {
    id: 3,
    title: "Digital Nomad Visa updates for 2026",
    category: "Career & Travel",
    readers: "8,310 explorers",
    time: "3d ago"
  },
  {
    id: 4,
    title: "Solo Travel Security Checklist: Must-haves",
    category: "Safety First",
    readers: "6,419 explorers",
    time: "5h ago"
  },
  {
    id: 5,
    title: "Bengaluru-Mysuru highway speed restrictions",
    category: "Local Transit Info",
    readers: "2,110 explorers",
    time: "4d ago"
  }
];

const TRAVEL_TIPS = [
  "Acclimatize for at least 36 hours when reaching altitudes above 10,000 feet (like Leh). Hydration is your best defense against altitude sickness.",
  "Keep digital offline copies of all flight tickets, passports, and local travel permits on your phone in case network coverage is lost.",
  "When planning road trips, budget an extra 15-20% of your travel time for surprise photo stops, fuel refills, and road diversions.",
  "Pack lightweight dry-fit clothes instead of cotton; they dry overnight, pack lighter, and are much better for unexpected downpours.",
  "Before heading to remote mountain villages, always carry cash in smaller denominations. Digital payments may not work due to low signal."
];

export default function RightSidebar() {
  const [tipIndex, setTipIndex] = useState(0);

  const rotateTip = () => {
    setTipIndex((prev) => (prev + 1) % TRAVEL_TIPS.length);
  };

  return (
    <aside className="space-y-4" id="right-sidebar">
      <div className="bg-[#1d2226] rounded-lg border border-[#38434f] p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-sans">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            Raahi Travel Trends
          </h4>
          <Info className="h-3.5 w-3.5 text-[#9fa3a7] cursor-pointer hover:text-white" title="Information about trending news" />
        </div>

        <ul className="space-y-2.5 mt-2" id="news-list">
          {NEWS_ITEMS.map((item) => (
            <li key={item.id} className="group cursor-pointer block">
              <h5 className="font-semibold text-xs text-[#e1e1e1] leading-snug group-hover:text-[#70b5f9] group-hover:underline">
                • {item.title}
              </h5>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#9fa3a7] ml-2.5 font-normal">
                <span className="font-medium text-[#70b5f9]">{item.category}</span>
                <span>•</span>
                <span>{item.readers}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#1d2226] rounded-lg border border-[#38434f] p-3.5 shadow-sm" id="tip-container">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-sans">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Travel Tip of the Day
          </h4>
          <button 
            onClick={rotateTip}
            className="text-[10px] text-[#70b5f9] font-semibold hover:underline"
            id="next-tip-button"
          >
            Next Tip →
          </button>
        </div>
        <div className="bg-[#0d1117] border border-[#38434f] p-2.5 rounded-md mt-2">
          <p className="text-xs text-[#e1e1e1] leading-relaxed font-sans italic">
            "{TRAVEL_TIPS[tipIndex]}"
          </p>
        </div>
      </div>

      <div className="bg-[#1d2226] rounded-lg border border-[#38434f] p-3.5 shadow-sm" id="destination-box">
        <h4 className="font-bold text-sm text-white flex items-center gap-1.5 mb-2.5 font-sans">
          <Compass className="h-4 w-4 text-emerald-500" />
          Featured Destination
        </h4>
        <div className="rounded overflow-hidden relative group">
          <img 
            src="https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=400&h=200&fit=crop&q=80" 
            alt="Double Root Bridge Meghalaya" 
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex flex-col justify-end">
            <h5 className="font-bold text-xs text-white">Meghalaya: Land of Floating Clouds</h5>
            <p className="text-[10px] text-gray-200 mt-0.5 font-normal">Living Root Bridges, Crystalline Rivers, and Cleanest Villages.</p>
          </div>
        </div>
      </div>

      <footer className="text-[11px] text-[#9fa3a7] text-center space-y-1 py-2 font-normal" id="sidebar-footer">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          <a href="#" className="hover:text-[#70b5f9] hover:underline">About</a>
          <span>•</span>
          <a href="#" className="hover:text-[#70b5f9] hover:underline">Accessibility</a>
          <span>•</span>
          <a href="#" className="hover:text-[#70b5f9] hover:underline">Help Center</a>
          <span>•</span>
          <a href="#" className="hover:text-[#70b5f9] hover:underline">Privacy & Terms</a>
        </div>
        <div className="flex justify-center items-center gap-1 mt-1 text-[10px] text-[#9fa3a7]">
          <span className="font-bold text-[#70b5f9]">Raahi</span> Corporation © 2026
        </div>
      </footer>
    </aside>
  );
}

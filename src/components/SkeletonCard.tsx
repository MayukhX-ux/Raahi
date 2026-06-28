import React from 'react';
import { motion } from 'motion/react';

export default function SkeletonCard() {
  return (
    <div className="glass-card-no-hover p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Header section with User and Action badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 items-center">
          {/* Avatar Skeleton */}
          <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse shrink-0" />
          <div className="space-y-2">
            {/* Username and travel date Skeleton */}
            <div className="h-4 w-28 bg-white/10 rounded-md animate-pulse" />
            <div className="h-3 w-36 bg-white/5 rounded-md animate-pulse" />
          </div>
        </div>
        {/* Badges/Actions Skeletons */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-white/10 rounded-md animate-pulse" />
        {/* Description skeletons */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full bg-white/5 rounded-md animate-pulse" />
          <div className="h-3.5 w-5/6 bg-white/5 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Route Checkpoints list skeleton */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse mb-1" />
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 pl-2">
              <div className="h-4 w-4 rounded bg-white/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                <div className="h-2 w-1/4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer statistics and reactions */}
      <div className="border-t border-white/5 pt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="h-8 w-12 bg-white/5 rounded-full animate-pulse" />
          <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

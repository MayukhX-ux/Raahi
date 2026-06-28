import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, MapPin, Link, Upload, Camera, Trash2, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  user: UserProfile;
}

export default function ProfileModal({ isOpen, onClose, onSave, user }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('');

  const [uploadError, setUploadError] = useState('');
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setHeadline(user.headline);
      setLocation(user.location);
      setConnectionsCount(user.connectionsCount);
      setAvatarUrl(user.avatarUrl);
      setUploadError('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size exceeds the 2MB limit. Please select a smaller photo.');
      return;
    }
    setUploadError('');
    setIsUploadingAvatar(true);

    try {
      const extension = file.name.split('.').pop() || 'png';
      const path = `${user.id}/profile/avatar/${Date.now()}.${extension}`;

      const { data, error } = await supabase.storage
         .from('app-files')
         .upload(path, file, {
           cacheControl: '3600',
           upsert: true
         });

      if (error) throw error;

      const { data: signData, error: signError } = await supabase.storage
         .from('app-files')
         .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      if (signError) throw signError;

      setAvatarUrl(signData.signedUrl);
    } catch (err: any) {
      console.error('Error uploading file to Supabase Storage:', err);
      setUploadError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAvatar(true);
  };

  const handleDragLeave = () => {
    setIsDragOverAvatar(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAvatar(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isUploadingAvatar) return;

    onSave({
      ...user,
      name: name.trim(),
      headline: headline.trim(),
      location: location.trim(),
      connectionsCount: Math.max(0, connectionsCount),
      avatarUrl: avatarUrl.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-modal">
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <form 
          onSubmit={handleSubmit}
          className="relative w-full max-w-lg transform overflow-hidden rounded-2xl glass-modal shadow-2xl transition-all border border-white/10"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4 bg-white/2">
            <h3 className="text-base font-bold text-white font-sans" id="profile-modal-title">
              Edit Intro & Traveler Profile
            </h3>
            <button 
              type="button"
              onClick={onClose} 
              className="rounded-full p-1 text-[#9fa3a7] hover:bg-[#38434f] hover:text-white transition-colors focus:outline-none"
              id="close-profile-modal-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4" id="profile-form-body">
            
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded text-xs text-center font-medium animate-fadeIn">
                {uploadError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                <User className="h-3 w-3 text-[#9fa3a7]" /> Full Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mayukh Mondal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                id="profile-name-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-[#9fa3a7]" /> Professional/Travel Headline
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Globetrotter & Travel Planner | Exploring the world one checkpoint at a time"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                id="profile-headline-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#9fa3a7]" /> Location / Base City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paris, France"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                  id="profile-loc-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e1e1e1] mb-1">Network Travelers Count</label>
                <input
                  type="number"
                  min="0"
                  value={connectionsCount}
                  onChange={(e) => setConnectionsCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                  id="profile-connections-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e1e1e1] mb-1.5 flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-[#9fa3a7]" /> Profile Picture
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/2 border border-white/8 rounded-2xl">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-white/2 border-2 border-white/10 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile Preview" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-8 w-8 text-[#9fa3a7]" />
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div
                    onDragOver={(e) => !isUploadingAvatar && handleDragOver(e)}
                    onDragLeave={() => !isUploadingAvatar && handleDragLeave()}
                    onDrop={(e) => !isUploadingAvatar && handleDrop(e)}
                    className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                      isUploadingAvatar
                        ? 'border-white/5 bg-white/1 opacity-55 cursor-not-allowed'
                        : isDragOverAvatar 
                          ? 'border-[#70b5f9] bg-[#70b5f9]/10' 
                          : 'border-white/10 hover:border-[#70b5f9]/50 hover:bg-white/3'
                    }`}
                  >
                    <input
                      type="file"
                      id="avatar-file-upload"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e)}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    <label htmlFor="avatar-file-upload" className={`${isUploadingAvatar ? 'cursor-not-allowed' : 'cursor-pointer'} block`}>
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 mx-auto text-[#70b5f9] mb-1 animate-spin" />
                          <p className="text-[11px] text-[#70b5f9] font-medium">Uploading to Supabase Storage...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mx-auto text-[#9fa3a7] mb-1" />
                          <p className="text-[11px] text-[#e1e1e1] font-medium">
                            Drag & drop, or <span className="text-[#70b5f9] underline text-xs">browse</span>
                          </p>
                          <p className="text-[9px] text-[#9fa3a7] mt-0.5">Supports PNG, JPG, WEBP (Max 2MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="p-1.5 bg-[#38434f] hover:bg-red-500/20 hover:text-red-400 text-[#9fa3a7] rounded transition-colors focus:outline-none self-center sm:self-auto"
                    title="Remove avatar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                  className="text-[10px] text-[#70b5f9] hover:underline flex items-center gap-1 ml-auto"
                >
                  <Link className="h-2.5 w-2.5" />
                  {showAvatarUrlInput ? 'Hide photo URL input' : 'Or paste a photo URL'}
                </button>
              </div>

              {showAvatarUrlInput && (
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                    id="profile-avatar-input-manual"
                  />
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/8 px-6 py-4 bg-white/2 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-xs font-bold text-[#9fa3a7] rounded-full hover:bg-white/5 hover:text-white transition-colors focus:outline-none cursor-pointer"
              id="cancel-profile-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploadingAvatar}
              className={`px-5 py-2 border border-transparent text-xs font-black text-[#07090e] rounded-full hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(112,181,249,0.3)] transition-all focus:outline-none shadow-md flex items-center gap-1.5 cursor-pointer ${
                isUploadingAvatar ? 'bg-white/5 text-[#9fa3a7] cursor-not-allowed' : 'bg-[#70b5f9]'
              }`}
              id="submit-profile-btn"
            >
              {isUploadingAvatar && <Loader2 className="h-3 w-3 animate-spin" />}
              Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

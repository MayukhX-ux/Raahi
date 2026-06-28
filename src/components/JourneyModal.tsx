import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Plane, Train, Car, Bike, Footprints, Bus, Calendar, Users, DollarSign } from 'lucide-react';
import { Journey, Checkpoint } from '../types';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (journeyData: any) => void;
  editingJourney: Journey | null;
}

export default function JourneyModal({ isOpen, onClose, onSave, editingJourney }: JourneyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transport, setTransport] = useState<'flight' | 'train' | 'car' | 'bike' | 'walk' | 'bus'>('car');
  const [companions, setCompanions] = useState('');
  const [checkpoints, setCheckpoints] = useState<Omit<Checkpoint, 'order'>[]>([]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingJourney) {
      setTitle(editingJourney.title);
      setDescription(editingJourney.description);
      setStartDate(editingJourney.startDate);
      setEndDate(editingJourney.endDate);
      setTransport(editingJourney.transport);
      setCompanions(editingJourney.companions);
      setNotes(editingJourney.notes || '');

      setCheckpoints(editingJourney.checkpoints.map(({ id, name, location, notes, status, cost }) => ({
        id,
        name,
        location,
        notes,
        status,
        cost
      })));
    } else {
      setTitle('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setTransport('car');
      setCompanions('');
      setNotes('');
      setCheckpoints([
        {
          id: `cp-temp-${Date.now()}-0`,
          name: 'Starting Point',
          location: '',
          notes: 'Beginning of the adventure.',
          status: 'planned',
          cost: 0
        }
      ]);
    }
    setErrors({});
  }, [editingJourney, isOpen]);

  if (!isOpen) return null;

  const handleAddCheckpoint = () => {
    setCheckpoints([
      ...checkpoints,
      {
        id: `cp-temp-${Date.now()}-${checkpoints.length}`,
        name: `Checkpoint ${checkpoints.length + 1}`,
        location: '',
        notes: '',
        status: 'planned',
        cost: 0
      }
    ]);
  };

  const handleRemoveCheckpoint = (index: number) => {
    const updated = checkpoints.filter((_, i) => i !== index);
    setCheckpoints(updated);
  };

  const handleCheckpointChange = (index: number, field: keyof Omit<Checkpoint, 'order'>, value: any) => {
    const updated = [...checkpoints];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCheckpoints(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...checkpoints];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setCheckpoints(updated);
  };

  const moveDown = (index: number) => {
    if (index === checkpoints.length - 1) return;
    const updated = [...checkpoints];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setCheckpoints(updated);
  };

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'A short description or intro is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    
    checkpoints.forEach((cp, idx) => {
      if (!cp.name.trim()) {
        newErrors[`cp-name-${idx}`] = 'Name is required';
      }
      if (!cp.location.trim()) {
        newErrors[`cp-loc-${idx}`] = 'Location / coordinates are required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || startDate,
      transport,
      companions: companions.trim() || 'Solo trip',
      coverUrl: '',
      checkpoints: checkpoints.map((cp, idx) => ({
        ...cp,
        order: idx + 1
      })),
      notes: notes.trim()
    };

    onSave(payload);
    onClose();
  };

  const totalCost = checkpoints.reduce((sum, cp) => sum + (Number(cp.cost) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="journey-modal">
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl glass-modal shadow-2xl transition-all border border-white/10">
          
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4 bg-white/2">
            <h3 className="text-lg font-bold text-white font-sans" id="modal-title">
              {editingJourney ? "Edit Planned Journey" : "Start a New Journey"}
            </h3>
            <button 
              onClick={onClose} 
              className="rounded-full p-1 text-[#9fa3a7] hover:bg-[#38434f] hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#70b5f9]"
              id="close-modal-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6" id="modal-form-body">
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#70b5f9] tracking-wider uppercase">1. Core Information</h4>
              
              <div>
                <label className="block text-xs font-semibold text-[#e1e1e1] mb-1">Journey Name / Heading*</label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g. Western Ghats Monsoon Getaway, Solo Backpacking Japan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-sm text-white px-3 py-2.5 rounded-xl focus:border-[#70b5f9] outline-none transition-all ${errors.title ? 'border-red-500 bg-red-950/20' : 'glass-input border-white/10'}`}
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e1e1e1] mb-1">Journey Overview / Post Intro*</label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Share a short preview, itinerary concept, or why you are planning this trip with your network..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full text-sm text-white px-3 py-2 rounded-xl focus:border-[#70b5f9] outline-none transition-all ${errors.description ? 'border-red-500 bg-red-950/20' : 'glass-input border-white/10'}`}
                />
                {errors.description && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#9fa3a7]" /> Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full text-xs text-white px-3 py-2 rounded-xl focus:border-[#70b5f9] outline-none transition-all ${errors.startDate ? 'border-red-500 bg-red-950/20' : 'glass-input border-white/10'}`}
                  />
                  {errors.startDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#9fa3a7]" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e1e1e1] mb-1">Primary Transport</label>
                  <select
                    value={transport}
                    onChange={(e) => setTransport(e.target.value as any)}
                    className="w-full text-xs text-[#e1e1e1] px-3 py-2 rounded-xl glass-dropdown border border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                  >
                    <option value="flight">✈️ Flight</option>
                    <option value="train">🚂 Train</option>
                    <option value="car">🚗 Road Trip (Car)</option>
                    <option value="bike">🏍️ Motorcycle</option>
                    <option value="bus">🚌 Bus</option>
                    <option value="walk">🚶 Foot / Trekking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e1e1e1] mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#9fa3a7]" /> Companions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solo, Family, 2 Friends"
                    value={companions}
                    onChange={(e) => setCompanions(e.target.value)}
                    className="w-full text-xs text-white px-3 py-2 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                  />
                </div>
              </div>

            </div>

            <div className="space-y-4 border-t border-white/8 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#70b5f9] tracking-wider uppercase">2. Route Checkpoints</h4>
                  <p className="text-[10px] text-[#9fa3a7] mt-0.5">Map your itinerary. Feed coordinates, stops, and actions chronologically.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#70b5f9]/10 border border-[#70b5f9]/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-semibold text-[#e1e1e1] uppercase">Estimated Budget:</span>
                  <span className="text-xs font-bold text-[#70b5f9]" id="modal-budget-indicator">₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-4" id="checkpoints-form-list">
                {checkpoints.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-[#9fa3a7] bg-white/1">
                    <p className="text-xs font-medium">No checkpoints mapped yet. At least one checkpoint is required.</p>
                    <button
                      type="button"
                      onClick={handleAddCheckpoint}
                      className="mt-2 text-xs font-semibold text-[#70b5f9] hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add First Checkpoint
                    </button>
                  </div>
                ) : (
                  checkpoints.map((cp, idx) => (
                    <div 
                      key={cp.id} 
                      className="border border-white/8 rounded-2xl p-4.5 relative bg-white/1 hover:bg-white/3 hover:border-[#70b5f9]/30 transition-all duration-300 flex flex-col md:flex-row gap-4"
                      id={`cp-card-${idx}`}
                    >
                      <div className="flex md:flex-col items-center justify-between md:justify-center gap-1 border-b md:border-b-0 md:border-r border-white/8 pb-2 md:pb-0 md:pr-4">
                        <span className="bg-[#70b5f9]/15 text-[#70b5f9] border border-[#70b5f9]/25 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        
                        <div className="flex md:flex-col gap-0.5 mt-1">
                          <button
                            type="button"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className={`p-1 rounded hover:bg-white/5 text-[#9fa3a7] hover:text-white disabled:opacity-20 transition-colors`}
                            title="Move Checkpoint Up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(idx)}
                            disabled={idx === checkpoints.length - 1}
                            className={`p-1 rounded hover:bg-white/5 text-[#9fa3a7] hover:text-white disabled:opacity-20 transition-colors`}
                            title="Move Checkpoint Down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-[10px] font-semibold text-[#9fa3a7] mb-0.5">Stop / Spot Name*</label>
                          <input
                            type="text"
                            id={`cp-name-${idx}`}
                            placeholder="e.g. Sarchu Camps, Taj Mahal, Airport Terminal"
                            value={cp.name}
                            onChange={(e) => handleCheckpointChange(idx, 'name', e.target.value)}
                            className={`w-full text-xs text-white px-2 py-1.5 rounded-xl outline-none focus:border-[#70b5f9] transition-all ${errors[`cp-name-${idx}`] ? 'border-red-500 bg-red-950/20' : 'glass-input border-white/10'}`}
                          />
                          {errors[`cp-name-${idx}`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`cp-name-${idx}`]}</p>}
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-semibold text-[#9fa3a7] mb-0.5">Location / City*</label>
                          <input
                            type="text"
                            id={`cp-loc-${idx}`}
                            placeholder="e.g. Agra, UP, India"
                            value={cp.location}
                            onChange={(e) => handleCheckpointChange(idx, 'location', e.target.value)}
                            className={`w-full text-xs text-white px-2 py-1.5 rounded-xl outline-none focus:border-[#70b5f9] transition-all ${errors[`cp-loc-${idx}`] ? 'border-red-500 bg-red-950/20' : 'glass-input border-white/10'}`}
                          />
                          {errors[`cp-loc-${idx}`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`cp-loc-${idx}`]}</p>}
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-semibold text-[#9fa3a7] mb-0.5 flex items-center gap-0.5">
                            <DollarSign className="h-2.5 w-2.5 text-[#9fa3a7]" /> Cost (₹)*
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={cp.cost || ''}
                            onChange={(e) => handleCheckpointChange(idx, 'cost', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-xs text-white px-2 py-1.5 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-semibold text-[#9fa3a7] mb-0.5">Status</label>
                          <select
                            value={cp.status}
                            onChange={(e) => handleCheckpointChange(idx, 'status', e.target.value)}
                            className="w-full text-xs text-[#e1e1e1] px-2 py-1.5 rounded-xl glass-dropdown border border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                          >
                            <option value="planned">Planned</option>
                            <option value="visited">Visited</option>
                          </select>
                        </div>

                        <div className="md:col-span-9 flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-[#9fa3a7] mb-0.5">Stays, activities, safety notes...</label>
                            <input
                              type="text"
                              placeholder="e.g. Booked homestay, remember extra battery packs, check weather..."
                              value={cp.notes}
                              onChange={(e) => handleCheckpointChange(idx, 'notes', e.target.value)}
                              className="w-full text-xs text-white px-2 py-1.5 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none transition-all"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCheckpoint(idx)}
                            className="p-1.5 rounded border border-red-900 text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete Checkpoint"
                            id={`delete-cp-${idx}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handleAddCheckpoint}
                className="w-full py-2.5 border border-dashed border-[#70b5f9]/30 rounded-xl hover:bg-[#70b5f9]/10 hover:border-[#70b5f9] text-xs font-black text-[#70b5f9] flex items-center justify-center gap-1.5 transition-all focus:outline-none cursor-pointer"
                id="add-checkpoint-button"
              >
                <Plus className="h-4 w-4" /> Add Checkpoint Stop
              </button>
            </div>

            <div className="space-y-4 border-t border-white/8 pt-6">
              <div>
                <h4 className="text-xs font-bold text-[#70b5f9] tracking-wider uppercase">3. Personal Trip Notes & Journal</h4>
                <p className="text-[10px] text-[#9fa3a7] mt-0.5">Write down your main thoughts, experiences, packing checklist, or general diaries/journal entries for this journey.</p>
              </div>

              <div>
                <textarea
                  id="journey-notes-input"
                  rows={4}
                  placeholder="e.g. Visited during peak monsoon. Roads to some viewpoints were foggy but incredible. Highly recommend staying near the ridge. Packing list: rain jackets, solid hiking boots, waterproof camera gear..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs text-white px-3 py-2.5 rounded-xl glass-input border-white/10 focus:border-[#70b5f9] outline-none placeholder-[#9fa3a7] leading-relaxed font-sans transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/8 px-6 py-4 bg-white/2 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-xs font-bold text-[#9fa3a7] rounded-full hover:bg-white/5 hover:text-white transition-colors focus:outline-none"
              id="cancel-modal-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={validateAndSubmit}
              className="px-5 py-2 bg-[#70b5f9] border border-transparent text-xs font-black text-[#07090e] rounded-full hover:bg-blue-400 hover:shadow-[0_0_12px_rgba(112,181,249,0.3)] transition-all focus:outline-none shadow-md cursor-pointer"
              id="submit-modal-button"
            >
              {editingJourney ? "Save Changes" : "Post Journey"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

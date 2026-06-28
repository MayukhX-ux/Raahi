import { Journey, UserProfile, UserAccount } from './types';
import { supabase } from './supabaseClient';

export function getPathFromUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const markers = [
      '/storage/v1/object/sign/app-files/',
      '/storage/v1/object/public/app-files/'
    ];
    for (const marker of markers) {
      const index = url.indexOf(marker);
      if (index !== -1) {
        let path = url.substring(index + marker.length);
        const qIndex = path.indexOf('?');
        if (qIndex !== -1) {
          path = path.substring(0, qIndex);
        }
        return decodeURIComponent(path);
      }
    }
    return url;
  }
  return url;
}

export async function getSignedUrlForPath(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  try {
    const { data, error } = await supabase.storage
      .from('app-files')
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (error) {
      console.error('Error creating signed URL for path:', path, error);
      return '';
    }
    return data?.signedUrl || '';
  } catch (err) {
    console.error('Exception creating signed URL for path:', path, err);
    return '';
  }
}

export async function fetchOrCreateProfile(u: any): Promise<UserProfile> {
  if (!u) throw new Error('No user provided to fetchOrCreateProfile');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', u.id)
    .maybeSingle();

  let profile: UserProfile;

  if (error || !data) {
    profile = {
      id: u.id,
      email: u.email || '',
      name: u.user_metadata?.full_name || u.email?.split('@')[0] || "Explorer",
      headline: "Explorer | Ready to embark on new adventures 🌍🎒",
      avatarUrl: "",
      coverUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=200&fit=crop&q=80",
      connectionsCount: 12,
      location: ""
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([profile]);

    if (insertError) {
      console.error('Error inserting profile in Supabase:', insertError);
    }
  } else {
    profile = data as UserProfile;
  }

  if (profile.avatarUrl) {
    profile.avatarUrl = await getSignedUrlForPath(profile.avatarUrl);
  }
  if (profile.coverUrl) {
    profile.coverUrl = await getSignedUrlForPath(profile.coverUrl);
  }

  return profile;
}

const JOURNAL_NOTES_SEPARATOR = "===JOURNAL_NOTES_SEPARATOR===";

export async function getJourneys(userId?: string): Promise<Journey[]> {
  let activeUserId = userId;
  if (!activeUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    activeUserId = user.id;
  }

  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('userId', activeUserId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching journeys from Supabase:', error);
    return [];
  }

  const list = (data || []) as Journey[];
  return list.map(journey => {
    let description = journey.description || '';
    let notes = journey.notes || '';
    if (description.includes(JOURNAL_NOTES_SEPARATOR)) {
      const parts = description.split(JOURNAL_NOTES_SEPARATOR);
      description = parts[0].trim();
      notes = parts[1].trim();
    }
    return {
      ...journey,
      status: journey.status || 'planned',
      description,
      notes
    };
  });
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const newAvatarPath = getPathFromUrl(profile.avatarUrl);
  const newCoverPath = getPathFromUrl(profile.coverUrl);

  try {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('avatarUrl, coverUrl')
      .eq('id', profile.id)
      .maybeSingle();

    if (currentProfile) {
      const oldAvatarPath = getPathFromUrl(currentProfile.avatarUrl || '');
      const oldCoverPath = getPathFromUrl(currentProfile.coverUrl || '');

      if (oldAvatarPath && oldAvatarPath !== newAvatarPath && !oldAvatarPath.startsWith('http://') && !oldAvatarPath.startsWith('https://')) {
        console.log('Deleting obsolete avatar from storage:', oldAvatarPath);
        const { error: delErr } = await supabase.storage
          .from('app-files')
          .remove([oldAvatarPath]);
        if (delErr) {
          console.error('Error deleting obsolete avatar from storage:', delErr);
        }
      }

      if (oldCoverPath && oldCoverPath !== newCoverPath && !oldCoverPath.startsWith('http://') && !oldCoverPath.startsWith('https://')) {
        console.log('Deleting obsolete cover from storage:', oldCoverPath);
        const { error: delErr } = await supabase.storage
          .from('app-files')
          .remove([oldCoverPath]);
        if (delErr) {
          console.error('Error deleting obsolete cover from storage:', delErr);
        }
      }
    }
  } catch (err) {
    console.error('Error while checking/cleaning up obsolete storage files:', err);
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      headline: profile.headline,
      avatarUrl: newAvatarPath,
      coverUrl: newCoverPath,
      connectionsCount: profile.connectionsCount,
      location: profile.location,
      updatedAt: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving user profile to Supabase:', error);
  }
}

export async function addJourney(journey: Omit<Journey, 'id' | 'likes' | 'hasLiked' | 'createdAt'>): Promise<Journey> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user is currently logged in.');

  const checkpoints = journey.checkpoints.map((cp, idx) => ({
    ...cp,
    id: cp.id || `cp-${Date.now()}-${idx}`,
    order: idx + 1
  }));

  const combinedDescription = journey.notes
    ? `${journey.description}\n\n${JOURNAL_NOTES_SEPARATOR}\n\n${journey.notes}`
    : journey.description;

  const newJourney = {
    userId: user.id,
    title: journey.title,
    description: combinedDescription,
    coverUrl: journey.coverUrl,
    startDate: journey.startDate,
    endDate: journey.endDate,
    transport: journey.transport,
    status: journey.status || 'planned',
    companions: journey.companions,
    checkpoints,
    comments: [],
    likes: 0,
    hasLiked: false
  };

  const { data, error } = await supabase
    .from('journeys')
    .insert([newJourney])
    .select()
    .single();

  if (error) {
    console.error('Error adding journey to Supabase:', error);
    throw error;
  }

  const inserted = data as Journey;
  let description = inserted.description || '';
  let notes = '';
  if (description.includes(JOURNAL_NOTES_SEPARATOR)) {
    const parts = description.split(JOURNAL_NOTES_SEPARATOR);
    description = parts[0].trim();
    notes = parts[1].trim();
  }

  return {
    ...inserted,
    status: inserted.status || 'planned',
    description,
    notes
  };
}

export async function updateJourney(updated: Journey): Promise<Journey[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const reorderedCheckpoints = updated.checkpoints.map((cp, idx) => ({
    ...cp,
    order: idx + 1
  }));

  const combinedDescription = updated.notes
    ? `${updated.description}\n\n${JOURNAL_NOTES_SEPARATOR}\n\n${updated.notes}`
    : updated.description;

  const { error } = await supabase
    .from('journeys')
    .update({
      title: updated.title,
      description: combinedDescription,
      coverUrl: updated.coverUrl,
      startDate: updated.startDate,
      endDate: updated.endDate,
      transport: updated.transport,
      status: updated.status,
      companions: updated.companions,
      checkpoints: reorderedCheckpoints,
      comments: (updated as any).comments || [],
      likes: updated.likes,
      hasLiked: updated.hasLiked
    })
    .eq('id', updated.id)
    .eq('userId', user.id);

  if (error) {
    console.error('Error updating journey in Supabase:', error);
  }

  return getJourneys(user.id);
}

export async function deleteJourney(id: string): Promise<Journey[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { error } = await supabase
    .from('journeys')
    .delete()
    .eq('id', id)
    .eq('userId', user.id);

  if (error) {
    console.error('Error deleting journey from Supabase:', error);
  }

  return getJourneys(user.id);
}

export async function toggleLikeJourney(id: string): Promise<Journey[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: journey, error: fetchError } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !journey) {
    console.error('Error fetching journey for like toggle:', fetchError);
    return getJourneys(user.id);
  }

  const newHasLiked = !journey.hasLiked;
  const newLikes = newHasLiked ? (journey.likes || 0) + 1 : Math.max(0, (journey.likes || 1) - 1);

  const { error: updateError } = await supabase
    .from('journeys')
    .update({
      likes: newLikes,
      hasLiked: newHasLiked
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating like on Supabase:', updateError);
  }

  return getJourneys(user.id);
}

export function getAccounts(): UserAccount[] {
  return [];
}

export function getCurrentUser(): UserAccount | null {
  return null;
}

export function setCurrentUser(userId: string | null): void {}

export function signUp(name: string, email: string, password: string): UserAccount {
  throw new Error('Supabase Auth is active. Use Supabase Auth instead.');
}

export function signIn(email: string, password: string): UserAccount {
  throw new Error('Supabase Auth is active. Use Supabase Auth instead.');
}

export function signOut(): void {}

export function clearAllData(): void {}

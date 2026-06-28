export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  notes: string;
  status: 'planned' | 'visited';
  cost: number;
  order: number;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  startDate: string;
  endDate: string;
  transport: 'flight' | 'train' | 'car' | 'bike' | 'walk' | 'bus';
  status: 'planned' | 'ongoing' | 'completed';
  companions: string;
  checkpoints: Checkpoint[];
  likes: number;
  hasLiked: boolean;
  createdAt: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  headline: string;
  avatarUrl: string;
  coverUrl: string;
  connectionsCount: number;
  location: string;
}

export interface UserAccount extends UserProfile {
  password?: string;
}

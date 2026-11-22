// Shared app types (ported from the Bolt project).
export type Role = 'client' | 'worker';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: number | null;
  city: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Urgency = 'low' | 'medium' | 'high' | '' | string;

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  city: string;
  deadline: string | null;
  category: string;
  status: 'open' | 'filled';
  required_skills: string[];
  urgency: Urgency;
  estimated_hours: number | null;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'city'> | null;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  match_score: number;
  created_at: string;
  jobs?: Job;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'city' | 'skills' | 'hourly_rate'> | null;
}

export interface WorkerMatch {
  worker_id: string;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: number | null;
  city: string;
  match_score: number;
}

export interface JobMatch {
  job_id: string;
  title: string;
  description: string;
  budget: number;
  city: string;
  deadline: string | null;
  category: string;
  status: 'open' | 'filled';
  created_at: string;
  match_score: number;
}

export interface Review {
  id: string;
  job_id: string;
  author_id: string;
  worker_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

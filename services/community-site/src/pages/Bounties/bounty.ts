type BountyState = {
  id: number;
};

export type Bounty = {
  id: number;
  name: string;
  description: string;
  submission: string;
  reward: string;
  reward_text: string;
  state: BountyState | null;
  submissionsCount?: number;
  end_date: Date;
  active: boolean;
  is_pinned: boolean;
};

export type Submission = {
  user: any;
  hashed_content: string;
  created_at: Date;
};
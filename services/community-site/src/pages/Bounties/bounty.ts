type BountyState = {
  id: number;
};

type Localization = {
  id: number;
  locale: string;
  description: string;
  submission: string;
  reward_text: string; 
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
  text_submission_needed: boolean;
  file_submission_needed: boolean;
  localizations: Localization[];
};

export type Submission = {
  user: any;
  hashed_content: string;
  created_at: Date;
};
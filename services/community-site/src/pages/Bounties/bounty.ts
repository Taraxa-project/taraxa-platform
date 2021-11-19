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
  proof_file?: string;
  proof_text?: string;
  localizations: Localization[];
  allow_multiple_submissions: boolean;
  userSubmissionsCount?: number;
};

export type Submission = {
  id: number;
  user: any;
  hashed_content: string;
  created_at: Date;
};

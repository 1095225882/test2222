
export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  lastSurveyDate: number | null; // Timestamp
}

// --- Forum Types ---
export interface Post {
  id: string;
  author: string;
  title: string;
  category: string;
  content: string;
  views: number;
  replyCount: number;
  timestamp: number;
  status: 'PENDING' | 'APPROVED';
  replies: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

// --- Financial Search Types ---

// The "Document" stored in ElasticSearch
export interface FinancialProfile {
  id: string;
  name: string; // Desensitized in search, e.g. "Zhang**"
  avatar: string;
  gender: '男' | '女';
  age: number;
  region: string; // e.g. "Shanghai"
  annualIncome: string; // e.g. "50w-100w"
  investmentPreferences: string[]; // Multi-select, e.g. ["Stock", "Fund"]
  riskTolerance: 'Low' | 'Medium' | 'High';
  
  // Sensitive Data (Backend returns these only after "Unlock")
  realName?: string;
  phoneNumber?: string;
  exactAssets?: string;
  creditScore?: number;
}

// The Filter Criteria for ElasticSearch
export interface SearchFilters {
  region: string;      // Single Select
  gender: string;      // Single Select (Any, Male, Female)
  ageRange: string;    // Single Select (e.g. "20-30")
  incomeRange: string; // Single Select
  preferences: string[]; // Multi Select (OR logic)
}

// Search History
export interface SearchHistoryRecord {
  id: string;
  timestamp: number;
  filters: SearchFilters;
  resultCount: number;
  actionType: 'SELF_VIEW' | 'EXPERT_HELP';
  targetProfileId?: string;
}

export interface SurveySubmission {
  userId: string;
  answers: any;
  score: number;
  timestamp: number;
}


import { Post, User, UserRole, SearchFilters, SearchHistoryRecord, SurveySubmission, FinancialProfile } from '../types';

// ==========================================
// [Java Backend Simulation]
// ==========================================

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// --- Mock Database (In-Memory) ---
let MOCK_USERS: Record<string, User> = {};
const SEARCH_HISTORY_TABLE: Record<string, SearchHistoryRecord[]> = {};
const SURVEY_TABLE: SurveySubmission[] = [];

// --- Mock ElasticSearch Data ---
const NAMES = ['张', '李', '王', '赵', '陈', '刘', '周', '吴'];
const REGIONS = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉'];
const PREFERENCES = ['股票', '基金', '期货', '保险', '信托', '虚拟货币', '国债'];

const MOCK_PROFILES: FinancialProfile[] = Array.from({ length: 50 }).map((_, i) => {
  const gender = Math.random() > 0.5 ? '男' : '女';
  const age = 22 + Math.floor(Math.random() * 40); // 22 - 62
  return {
    id: `profile-${1000 + i}`,
    name: `${NAMES[i % NAMES.length]}先生/女士`, // Desensitized
    realName: `${NAMES[i % NAMES.length]}${gender === '男' ? '伟' : '芳'}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=b6e3f4`,
    gender: gender,
    age: age,
    region: REGIONS[i % REGIONS.length],
    annualIncome: age < 30 ? '10w-30w' : age < 40 ? '30w-80w' : '80w-200w',
    investmentPreferences: [PREFERENCES[i % PREFERENCES.length], PREFERENCES[(i + 2) % PREFERENCES.length]],
    riskTolerance: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
    phoneNumber: `138****${1000 + i}`,
    exactAssets: `¥${(Math.random() * 500 + 50).toFixed(2)}万`,
    creditScore: 600 + Math.floor(Math.random() * 200)
  };
});

// --- Mock Forum Data ---
let MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    author: '用户_9921',
    title: '高净值客户的资产配置策略探讨',
    category: '行业分析',
    content: '在当前的经济环境下，如何为资产超过500万的客户进行稳健的资产配置？',
    views: 120,
    replyCount: 0,
    timestamp: Date.now() - 10000000,
    status: 'APPROVED',
    replies: []
  }
];

// ==========================================
// [Service Layer] - Equivalent to Java Services
// ==========================================

/**
 * 模拟第三方短信服务 (Tencent SMS / Aliyun SMS)
 */
const ThirdPartySmsService = {
  send: async (phone: string, code: string) => {
    console.log(`[ThirdPartySMS] Calling API to send ${code} to ${phone}`);
    return true; // Success
  }
};

/**
 * 模拟 ElasticSearch 搜索引擎
 */
const ElasticSearchService = {
  search: async (criteria: SearchFilters): Promise<FinancialProfile[]> => {
    console.log('[ElasticSearch] Executing DSL Query:', criteria);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let hits = MOCK_PROFILES;

        // 1. Term Query: Region
        if (criteria.region && criteria.region !== '不限') {
          hits = hits.filter(p => p.region === criteria.region);
        }

        // 2. Term Query: Gender
        if (criteria.gender && criteria.gender !== '不限') {
          hits = hits.filter(p => p.gender === criteria.gender);
        }

        // 3. Range Query: Age
        if (criteria.ageRange && criteria.ageRange !== '不限') {
          const [min, max] = criteria.ageRange.split('-').map(Number);
          if (max) {
             hits = hits.filter(p => p.age >= min && p.age <= max);
          } else {
             // Handle "60+"
             hits = hits.filter(p => p.age >= 60);
          }
        }

        // 4. Term Query: Income
        if (criteria.incomeRange && criteria.incomeRange !== '不限') {
          hits = hits.filter(p => p.annualIncome === criteria.incomeRange);
        }

        // 5. Terms Set Query (Multi-select): Preferences
        // Logic: Return if profile has ANY of the selected preferences (OR logic)
        if (criteria.preferences.length > 0) {
          hits = hits.filter(p => 
            p.investmentPreferences.some(pref => criteria.preferences.includes(pref))
          );
        }

        resolve(hits);
      }, 600); // Simulate network latency
    });
  }
};

// ==========================================
// [Controller Layer] - Exposed to Frontend
// ==========================================

export const sendSmsCode = async (phone: string): Promise<string> => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  await ThirdPartySmsService.send(phone, code);
  return code; // In real app, don't return code to frontend, mock only
};

export const performLogin = async (phone: string, code: string): Promise<User> => {
  // Validate code (Mock)
  // Check DB
  let user = Object.values(MOCK_USERS).find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `u_${Date.now()}`,
      phone,
      role: phone === '13888888888' ? UserRole.ADMIN : UserRole.USER,
      lastSurveyDate: null
    };
    MOCK_USERS[user.id] = user;
    // Persist to local for demo refresh
    localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  }
  return user;
};

export const searchProfiles = async (filters: SearchFilters): Promise<FinancialProfile[]> => {
  return ElasticSearchService.search(filters);
};

export const recordUserAction = async (user: User, action: 'SELF_VIEW' | 'EXPERT_HELP', profileId: string, filters: SearchFilters) => {
  console.log('[Backend] Recording Audit Log:', { userId: user.id, action, profileId });
  
  const record: SearchHistoryRecord = {
    id: `log_${Date.now()}`,
    timestamp: Date.now(),
    filters,
    resultCount: 1,
    actionType: action,
    targetProfileId: profileId
  };

  if (!SEARCH_HISTORY_TABLE[user.id]) SEARCH_HISTORY_TABLE[user.id] = [];
  SEARCH_HISTORY_TABLE[user.id].unshift(record);
};

/**
 * 获取完整数据 (Simulates fetching sensitive data after permission check)
 */
export const fetchSensitiveProfileData = async (user: User, profileId: string): Promise<Partial<FinancialProfile>> => {
    // 1. Check Permissions (e.g. Survey Check)
    const { eligible } = checkSurveyEligibility(user);
    if (!eligible) {
       // In strict backend, throw error. For demo, we might allow basic or return partial.
       // Here we assume UI handled the check, but backend double-checks.
       // Let's assume strict:
       // throw new Error("Permission Denied: Survey Required");
    }

    // 2. Fetch Data
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (!profile) throw new Error("Profile not found");

    return {
        phoneNumber: profile.phoneNumber?.replace('****', '8888'), // Reveal
        exactAssets: profile.exactAssets,
        realName: profile.realName
    };
};

export const getSearchHistory = async (user: User): Promise<SearchHistoryRecord[]> => {
  return SEARCH_HISTORY_TABLE[user.id] || [];
};

export const checkSurveyEligibility = (user: User): { eligible: boolean; message: string } => {
  if (!user.lastSurveyDate) return { eligible: true, message: '' };
  const diff = Date.now() - user.lastSurveyDate;
  if (diff < WEEK_MS) {
    const daysWait = Math.ceil((WEEK_MS - diff) / (1000 * 60 * 60 * 24));
    return { eligible: false, message: `需等待 ${daysWait} 天后再次提交` };
  }
  return { eligible: true, message: '' };
};

export const submitSurvey = async (user: User, data: any): Promise<{ updatedUser: User, redirectType: 'VIP' | 'BASIC' }> => {
  // Call Wenjuan.com API callback handler simulation
  console.log('[Wenjuan.com Callback] Received data:', data);
  
  const score = parseInt(data.q3 || '0');
  SURVEY_TABLE.push({ userId: user.id, answers: data, score, timestamp: Date.now() });

  const updatedUser = { ...user, lastSurveyDate: Date.now() };
  MOCK_USERS[user.id] = updatedUser;
  localStorage.setItem(`user_${user.phone}`, JSON.stringify(updatedUser));

  return { updatedUser, redirectType: score >= 4 ? 'VIP' : 'BASIC' };
};

export const fetchPosts = async (): Promise<Post[]> => Promise.resolve(MOCK_POSTS);

export const createPost = async (user: User, title: string, content: string, category: string): Promise<Post> => {
    const newPost: Post = {
        id: `p_${Date.now()}`,
        author: user.phone,
        title,
        content,
        category,
        views: 0,
        replyCount: 0,
        timestamp: Date.now(),
        status: user.role === UserRole.ADMIN ? 'APPROVED' : 'PENDING',
        replies: []
    };
    MOCK_POSTS = [newPost, ...MOCK_POSTS];
    return newPost;
};

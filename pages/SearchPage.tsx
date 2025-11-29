
import React, { useState } from 'react';
import { User, FinancialProfile, SearchFilters } from '../types';
import { searchProfiles, recordUserAction, checkSurveyEligibility, fetchSensitiveProfileData } from '../services/mockService';

interface SearchPageProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

// --- Filter Options Configuration ---
const OPTIONS = {
  regions: ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都'],
  genders: ['不限', '男', '女'],
  ageRanges: ['不限', '20-30', '30-40', '40-50', '50-60', '60+'],
  incomeRanges: ['不限', '10w-30w', '30w-80w', '80w-200w', '200w+'],
  preferences: ['股票', '基金', '保险', '信托', '期货', '国债', '虚拟货币']
};

export const SearchPage: React.FC<SearchPageProps> = ({ user, onNavigate }) => {
  // State: Filters
  const [filters, setFilters] = useState<SearchFilters>({
    region: '不限',
    gender: '不限',
    ageRange: '不限',
    incomeRange: '不限',
    preferences: []
  });

  // State: Data & UI
  const [results, setResults] = useState<FinancialProfile[] | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State: Interaction
  // Track which card is flipped to back
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  // Track which cards have been unlocked (Self View clicked) to show real data
  const [unlockedCards, setUnlockedCards] = useState<Record<string, Partial<FinancialProfile>>>({});

  const handleSearch = async () => {
    setLoading(true);
    setFlippedCardId(null); // Reset flip
    const data = await searchProfiles(filters);
    setResults(data);
    setLoading(false);
  };

  const togglePreference = (pref: string) => {
    setFilters(prev => {
      const has = prev.preferences.includes(pref);
      return {
        ...prev,
        preferences: has ? prev.preferences.filter(p => p !== pref) : [...prev.preferences, pref]
      };
    });
  };

  const handleCardClick = (id: string) => {
    // If clicking the same card, flip it back to front? Or just keep it flipped.
    // Let's toggle.
    setFlippedCardId(prev => prev === id ? null : id);
  };

  const handleAction = async (e: React.MouseEvent, type: 'SELF_VIEW' | 'EXPERT_HELP', profileId: string) => {
    e.stopPropagation(); // Prevent card flip when clicking buttons
    if (!user) return alert('请先登录系统');

    // 1. Record User Action to DB
    await recordUserAction(user, type, profileId, filters);

    if (type === 'EXPERT_HELP') {
       alert('专家请求已发送。客服将在 10 分钟内联系您 (模拟)');
       setFlippedCardId(null); // Close card
    } else {
       // 2. Self View Logic
       const check = checkSurveyEligibility(user);
       
       // Note: In a real app, we might force survey here. 
       // For better UX demo, if they logged in, let's try to show them something,
       // or prompt survey if they haven't done it.
       const canView = user.lastSurveyDate && (Date.now() - user.lastSurveyDate < 7 * 24 * 60 * 60 * 1000);
       
       if (!canView) {
          if(window.confirm('查看敏感数据需要完成本周的 "金融洞察问卷"。是否现在填写？')) {
              onNavigate('survey');
          }
          return;
       }

       // 3. Unlock Data
       try {
         const secretData = await fetchSensitiveProfileData(user, profileId);
         setUnlockedCards(prev => ({ ...prev, [profileId]: secretData }));
       } catch (err) {
         console.error(err);
         alert('数据获取失败');
       }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      
      {/* 1. Advanced Filter Panel (Form-based) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b border-gray-100 pb-4">
          <span className="bg-brand-600 w-1 h-6 mr-3 rounded-full"></span>
          高净值客户画像检索
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">所属地区</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"
              value={filters.region}
              onChange={e => setFilters({...filters, region: e.target.value})}
            >
              {OPTIONS.regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">性别</label>
            <div className="flex bg-gray-50 rounded-md p-1 border border-gray-300">
              {OPTIONS.genders.map(g => (
                <button
                  key={g}
                  onClick={() => setFilters({...filters, gender: g})}
                  className={`flex-1 py-1.5 text-sm rounded transition ${filters.gender === g ? 'bg-white shadow text-brand-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">年龄段</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"
              value={filters.ageRange}
              onChange={e => setFilters({...filters, ageRange: e.target.value})}
            >
              {OPTIONS.ageRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Income Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">年收入范围</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"
              value={filters.incomeRange}
              onChange={e => setFilters({...filters, incomeRange: e.target.value})}
            >
              {OPTIONS.incomeRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Multi-select: Preferences */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">投资偏好 (多选)</label>
          <div className="flex flex-wrap gap-3">
            {OPTIONS.preferences.map(pref => {
              const active = filters.preferences.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition ${
                    active 
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {pref} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-gray-900 text-white px-10 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition transform active:scale-95 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                正在检索数据库...
              </>
            ) : (
              '开始检索'
            )}
          </button>
        </div>
      </div>

      {/* 2. Results Grid */}
      {results && (
        <div className="animate-fade-in">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-500">
               检索结果: 共找到 <span className="text-brand-600 font-bold text-lg">{results.length}</span> 位符合条件的客户
             </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {results.map(profile => {
               const isFlipped = flippedCardId === profile.id;
               const unlockedData = unlockedCards[profile.id];

               return (
                 <div 
                   key={profile.id} 
                   className="relative h-80 perspective-1000 group cursor-pointer"
                   onClick={() => handleCardClick(profile.id)}
                 >
                   <div className={`w-full h-full transition-transform duration-700 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                     
                     {/* --- FRONT SIDE --- */}
                     <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden flex flex-col p-6">
                        <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <img src={profile.avatar} className="w-12 h-12 rounded-full bg-brand-50" alt="Avatar" />
                             <div>
                               <h4 className="font-bold text-gray-900">{profile.name}</h4>
                               <p className="text-xs text-gray-500">{profile.id}</p>
                             </div>
                           </div>
                           <span className={`px-2 py-1 text-xs rounded font-medium ${
                             profile.riskTolerance === 'High' ? 'bg-red-100 text-red-700' :
                             profile.riskTolerance === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                           }`}>
                             {profile.riskTolerance === 'High' ? '进取型' : profile.riskTolerance === 'Medium' ? '稳健型' : '保守型'}
                           </span>
                        </div>

                        <div className="space-y-3 flex-1">
                          <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                             <span className="text-gray-500">地区</span>
                             <span className="text-gray-800">{profile.region}</span>
                          </div>
                          <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                             <span className="text-gray-500">年龄</span>
                             <span className="text-gray-800">{profile.age}岁</span>
                          </div>
                          <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                             <span className="text-gray-500">年收入</span>
                             <span className="text-gray-800 font-medium">{profile.annualIncome}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {profile.investmentPreferences.slice(0, 3).map(p => (
                              <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{p}</span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 text-center text-xs text-brand-600 font-medium bg-brand-50 py-2 rounded">
                           点击卡片查看详情
                        </div>
                     </div>

                     {/* --- BACK SIDE --- */}
                     <div className="absolute w-full h-full bg-slate-900 text-white rounded-xl shadow-xl p-6 backface-hidden rotate-y-180 flex flex-col justify-between border border-slate-700">
                        <div>
                          <h4 className="text-lg font-bold text-brand-400 mb-4 flex items-center gap-2">
                            {unlockedData ? (
                              <>
                                <span className="text-green-400">✓</span> 已解锁数据
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                敏感信息保护中
                              </>
                            )}
                          </h4>
                          
                          <div className="space-y-4">
                             <div>
                               <span className="block text-xs text-slate-400 mb-1">真实姓名</span>
                               <p className="font-mono text-lg tracking-wider">
                                 {unlockedData?.realName || '***'}
                               </p>
                             </div>
                             <div>
                               <span className="block text-xs text-slate-400 mb-1">联系电话</span>
                               <p className="font-mono text-lg tracking-wider">
                                 {unlockedData?.phoneNumber || '138****0000'}
                               </p>
                             </div>
                             <div>
                               <span className="block text-xs text-slate-400 mb-1">精确资产规模</span>
                               <p className={`font-mono text-lg tracking-wider ${unlockedData ? 'text-yellow-400 font-bold' : ''}`}>
                                 {unlockedData?.exactAssets || '¥ ***.**万'}
                               </p>
                             </div>
                          </div>
                        </div>

                        {!unlockedData ? (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <button 
                              onClick={(e) => handleAction(e, 'SELF_VIEW', profile.id)}
                              className="bg-brand-600 hover:bg-brand-700 text-white py-2 rounded text-sm font-bold transition"
                            >
                              自行查看
                            </button>
                            <button 
                              onClick={(e) => handleAction(e, 'EXPERT_HELP', profile.id)}
                              className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium transition"
                            >
                              人工解读
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 bg-green-900/30 border border-green-800 rounded p-2 text-center text-xs text-green-300">
                             数据已记录至您的访问历史
                          </div>
                        )}
                     </div>

                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
};

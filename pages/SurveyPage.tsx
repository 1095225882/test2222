
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { checkSurveyEligibility, submitSurvey } from '../services/mockService';

interface SurveyPageProps {
  user: User | null;
  onSurveyComplete: (updatedUser: User) => void;
  onNavigate: (view: string) => void;
}

export const SurveyPage: React.FC<SurveyPageProps> = ({ user, onSurveyComplete, onNavigate }) => {
  const [eligibility, setEligibility] = useState<{ eligible: boolean; message: string } | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEligibility(checkSurveyEligibility(user));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">需要登录</h2>
          <p className="text-gray-600 mt-2">请先登录以访问每周调研问卷。</p>
        </div>
      </div>
    );
  }

  // Bypass eligibility check for demo purposes if needed, otherwise:
  if (eligibility && !eligibility.eligible) {
     // Comment out this block to force test survey even if done recently
     return (
       <div className="flex items-center justify-center h-[60vh]">
         <div className="text-center max-w-lg p-8 bg-white shadow-lg rounded-xl border-t-4 border-yellow-500">
           <div className="text-5xl mb-4">⏳</div>
           <h2 className="text-2xl font-bold text-gray-800 mb-2">请稍后再来！</h2>
           <p className="text-gray-600 mb-6">{eligibility.message}</p>
           <button onClick={() => onNavigate('search')} className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">
             返回数据查询
           </button>
         </div>
       </div>
     );
  }

  const handleInputChange = (q: string, val: any) => {
    setAnswers({ ...answers, [q]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // API call simulates storing to DB and returning logic decision
      const result = await submitSurvey(user, answers);
      
      onSurveyComplete(result.updatedUser);
      
      // Navigate based on logic
      if (result.redirectType === 'VIP') {
        onNavigate('survey-success-vip');
      } else {
        onNavigate('survey-success-basic');
      }
    } catch (err) {
      alert('问卷提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">每周洞察调研</h1>
          <p className="text-brand-100 mt-1">请填写以下问卷以解锁本周的高级数据访问权限。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Question 1: Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">1. 您的主要行业是什么？</label>
            <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" onChange={e => handleInputChange('q1', e.target.value)} placeholder="例如：互联网、金融..." />
          </div>

          {/* Question 2: Single Choice */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">2. 您使用我们数据的频率是？</label>
            <select required className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" onChange={e => handleInputChange('q2', e.target.value)}>
              <option value="">请选择...</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>

          {/* Question 3: Rating - Used for VIP logic */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <label className="block text-sm font-bold text-gray-900 mb-2">3. [关键指标] 您对平台数据的满意度 (4分及以上解锁VIP体验)</label>
             <div className="flex gap-4">
               {[1,2,3,4,5].map(n => (
                 <label key={n} className="flex items-center gap-1 cursor-pointer">
                   <input type="radio" name="q3" value={n} required onChange={() => handleInputChange('q3', n)} />
                   <span className="font-medium">{n}</span>
                 </label>
               ))}
             </div>
          </div>

           {/* Question 4: Multi Select */}
           <div>
             <label className="block text-sm font-semibold text-gray-900 mb-2">4. 您感兴趣的话题？ (可多选)</label>
             <div className="space-y-2">
               {['科技创新', '金融市场', '医疗健康', '新能源'].map(opt => (
                 <label key={opt} className="flex items-center gap-2">
                   <input type="checkbox" onChange={e => {
                     const current = answers.q4 || [];
                     if(e.target.checked) handleInputChange('q4', [...current, opt]);
                     else handleInputChange('q4', current.filter((x: string) => x !== opt));
                   }} />
                   <span>{opt}</span>
                 </label>
               ))}
             </div>
          </div>

          {/* Filler Questions */}
          {[5,6,7].map((num) => (
            <div key={num}>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{num}. 补充问题 {num} (开放式)</label>
              <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" onChange={e => handleInputChange(`q${num}`, e.target.value)} />
            </div>
          ))}

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition transform active:scale-95 shadow-md"
            >
              {submitting ? '数据同步中...' : '提交并接入数据库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

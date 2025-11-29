import React, { useEffect, useState } from 'react';
import { User, SearchHistoryRecord } from '../types';
import { getSearchHistory } from '../services/mockService';

interface UserProfilePageProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onNavigate }) => {
  const [history, setHistory] = useState<SearchHistoryRecord[]>([]);

  useEffect(() => {
    if (user) {
      getSearchHistory(user).then(setHistory);
    }
  }, [user]);

  if (!user) return <div>请先登录</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user.phone.slice(-2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户中心</h1>
          <p className="text-gray-500">账号: {user.phone}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">搜索与浏览记录</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无历史记录。去<button onClick={() => onNavigate('search')} className="text-brand-600 hover:underline mx-1">搜索数据</button>看看吧。
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map(record => (
              <li key={record.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                         record.actionType === 'SELF_VIEW' 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-purple-100 text-purple-800'
                       }`}>
                         {record.actionType === 'SELF_VIEW' ? '自行查看' : '咨询专家'}
                       </span>
                       <span className="text-xs text-gray-400">
                         {new Date(record.timestamp).toLocaleString()}
                       </span>
                    </div>
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">搜索条件:</span>
                      {record.filters.region && record.filters.region !== '不限' && (
                        <span className="ml-2 bg-gray-100 px-1 rounded text-xs">地区: {record.filters.region}</span>
                      )}
                      {record.filters.gender && record.filters.gender !== '不限' && (
                        <span className="ml-2 bg-gray-100 px-1 rounded text-xs">性别: {record.filters.gender}</span>
                      )}
                      {record.filters.ageRange && record.filters.ageRange !== '不限' && (
                        <span className="ml-2 bg-gray-100 px-1 rounded text-xs">年龄: {record.filters.ageRange}</span>
                      )}
                      {record.filters.incomeRange && record.filters.incomeRange !== '不限' && (
                        <span className="ml-2 bg-gray-100 px-1 rounded text-xs">收入: {record.filters.incomeRange}</span>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {record.filters.preferences.map(p => (
                          <span key={p} className="bg-blue-50 text-blue-700 px-1 rounded text-xs">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-2xl font-bold text-gray-200">
                       {record.resultCount}
                     </div>
                     <div className="text-xs text-gray-400">匹配结果</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Post, User, UserRole } from '../types';
import { fetchPosts } from '../services/mockService';

interface ForumPageProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: '所有话题', color: 'bg-gray-200 text-gray-700' },
  { id: 'analysis', name: '行业分析', color: 'bg-blue-100 text-blue-800' },
  { id: 'help', name: '数据求助', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'feedback', name: '平台反馈', color: 'bg-purple-100 text-purple-800' },
];

export const ForumPage: React.FC<ForumPageProps> = ({ user, onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => {
        if (activeCategory === 'analysis') return p.category === '行业分析';
        if (activeCategory === 'help') return p.category === '数据求助';
        return true;
      });

  const handleCreatePost = () => {
    if (!user) {
      alert('请先登录');
      return;
    }
    onNavigate('create-post');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
           <button 
             onClick={handleCreatePost}
             className="w-full bg-brand-600 text-white py-3 px-4 rounded-md font-bold shadow-sm hover:bg-brand-700 transition mb-6 flex items-center justify-center gap-2"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             发起新话题
           </button>

           <nav className="space-y-1">
             {CATEGORIES.map(cat => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                   activeCategory === cat.id 
                     ? 'bg-gray-200 text-gray-900' 
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }`}
               >
                 <span className={`w-3 h-3 rounded-full mr-3 ${cat.id === 'all' ? 'bg-gray-400' : cat.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                 {cat.name}
               </button>
             ))}
           </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <span className="font-medium text-gray-500 w-1/2">话题</span>
              <div className="flex gap-8 text-sm text-gray-500 w-1/2 justify-end pr-4">
                <span className="w-16 text-center">回复</span>
                <span className="w-16 text-center">浏览</span>
                <span className="w-24 text-right">活动</span>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
              {filteredPosts.map(post => (
                <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-center group">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand-600 cursor-pointer flex items-center gap-2">
                       {post.status === 'PENDING' && <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 rounded border border-yellow-200">审核中</span>}
                       {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-xs px-2 py-0.5 rounded ${
                         post.category === '行业分析' ? 'bg-blue-100 text-blue-800' : 
                         post.category === '数据求助' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {post.category || '综合'}
                       </span>
                       <span className="text-xs text-gray-400">
                         {post.author} • {new Date(post.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                  <div className="flex gap-8 text-sm text-gray-500 w-1/2 justify-end pr-4 items-center">
                    <span className="w-16 text-center font-mono">{post.replyCount}</span>
                    <span className="w-16 text-center font-mono text-gray-400">{post.views}</span>
                    <span className="w-24 text-right text-xs text-gray-400">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  暂无相关话题
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

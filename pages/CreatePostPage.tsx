
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { createPost } from '../services/mockService';

interface CreatePostPageProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({ user, onNavigate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('行业分析');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold mb-4">请先登录</h2>
        <button onClick={() => onNavigate('home')} className="text-brand-600 hover:underline">返回首页</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title || !content) return alert('请填写标题和内容');
    setIsSubmitting(true);
    await createPost(user, title, content, category);
    setIsSubmitting(false);
    alert(user.role === UserRole.ADMIN ? '发布成功' : '提交成功，等待管理员审核');
    onNavigate('forum');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900">发起新话题</h1>
         <button onClick={() => onNavigate('forum')} className="text-gray-500 hover:text-gray-700">取消</button>
      </div>

      <div className="bg-white shadow rounded-lg p-8 space-y-6">
        
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
             <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
             <input 
               type="text" 
               className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
               placeholder="简单描述您的问题或观点..."
               value={title}
               onChange={e => setTitle(e.target.value)}
             />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="行业分析">行业分析</option>
              <option value="数据求助">数据求助</option>
              <option value="平台反馈">平台反馈</option>
            </select>
          </div>
        </div>

        {/* Mock Rich Editor */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
           <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500">
             {/* Toolbar */}
             <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-3 text-gray-600">
               <button className="hover:text-black font-bold">B</button>
               <button className="hover:text-black italic">I</button>
               <button className="hover:text-black underline">U</button>
               <span className="border-r border-gray-300 mx-1"></span>
               <button className="hover:text-black text-sm">❝ 引用</button>
               <button className="hover:text-black text-sm">Code</button>
               <button className="hover:text-black text-sm">图片</button>
             </div>
             <textarea 
               className="w-full h-64 p-4 outline-none resize-y"
               placeholder="在这里输入详细内容..."
               value={content}
               onChange={e => setContent(e.target.value)}
             />
           </div>
           <p className="text-xs text-gray-500 mt-2 text-right">支持 Markdown 语法</p>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-600 text-white px-8 py-3 rounded-md font-bold hover:bg-brand-700 transition disabled:opacity-50"
          >
            {isSubmitting ? '正在提交...' : '发布话题'}
          </button>
        </div>

      </div>
    </div>
  );
};

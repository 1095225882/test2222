
import React from 'react';

export const SurveySuccessVip: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-4xl shadow-lg">
      🌟
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">感谢您的深度反馈！</h1>
    <p className="text-gray-600 max-w-md mb-8">
      根据您的回答，您已被系统识别为 <span className="text-brand-600 font-bold">高价值合作伙伴</span>。
      您现在拥有 7 天的无限制高级数据查看权限。
    </p>
    <div className="space-x-4">
      <button onClick={() => onNavigate('search')} className="bg-brand-600 text-white px-6 py-3 rounded shadow hover:bg-brand-700 font-bold">
        立即去查询数据
      </button>
      <button onClick={() => onNavigate('forum')} className="text-gray-600 hover:text-gray-900">
        逛逛社区
      </button>
    </div>
  </div>
);

export const SurveySuccessBasic: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 text-4xl">
      ✓
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">反馈已提交</h1>
    <p className="text-gray-600 max-w-md mb-8">
      感谢您的参与。您的数据查询权限已解锁。
    </p>
    <button onClick={() => onNavigate('search')} className="bg-gray-800 text-white px-6 py-3 rounded shadow hover:bg-gray-900">
      返回数据查询
    </button>
  </div>
);

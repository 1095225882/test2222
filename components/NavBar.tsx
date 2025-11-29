
import React from 'react';
import { User, UserRole } from '../types';

interface NavBarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ user, onLoginClick, onLogoutClick, currentView, onNavigate }) => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center mr-2">
                 <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">数据中心</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <button
                onClick={() => onNavigate('forum')}
                className={`${currentView.startsWith('forum') ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                社区论坛
              </button>
              <button
                onClick={() => onNavigate('search')}
                className={`${currentView === 'search' ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                高级数据查询
              </button>
              {user && (
                 <button
                 onClick={() => onNavigate('survey')}
                 className={`${currentView.startsWith('survey') ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
               >
                 每周调研
               </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md transition"
                >
                  <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {user.phone.slice(-2)}
                  </div>
                  <span className="font-medium">{user.phone}</span>
                </button>
                {user.role === UserRole.ADMIN && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">管理</span>}
                <button
                  onClick={onLogoutClick}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition shadow-sm"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

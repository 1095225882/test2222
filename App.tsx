
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { AuthModal } from './components/AuthModal';
import { ForumPage } from './pages/ForumPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { SearchPage } from './pages/SearchPage';
import { SurveyPage } from './pages/SurveyPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SurveySuccessVip, SurveySuccessBasic } from './pages/SurveyResultPages';
import { User } from './types';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Restore session
    const keys = Object.keys(localStorage);
    const userKey = keys.find(k => k.startsWith('user_'));
    if (userKey) {
       const stored = localStorage.getItem(userKey);
       if (stored) {
         try {
           setUser(JSON.parse(stored));
         } catch (e) {
           console.error("无法解析用户会话", e);
         }
       }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path === 'home' ? '/' : `/${path}`);
  };

  const currentView = location.pathname.substring(1) || 'home';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/forum" replace />} />
          <Route path="/forum" element={<ForumPage user={user} onNavigate={handleNavigate} />} />
          <Route path="/create-post" element={<CreatePostPage user={user} onNavigate={handleNavigate} />} />
          <Route path="/search" element={<SearchPage user={user} onNavigate={handleNavigate} />} />
          <Route path="/survey" element={<SurveyPage user={user} onSurveyComplete={setUser} onNavigate={handleNavigate} />} />
          <Route path="/profile" element={<UserProfilePage user={user} onNavigate={handleNavigate} />} />
          <Route path="/survey-success-vip" element={<SurveySuccessVip onNavigate={handleNavigate} />} />
          <Route path="/survey-success-basic" element={<SurveySuccessBasic onNavigate={handleNavigate} />} />
        </Routes>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; 2024 行业数据与洞察中心 (IDC) |  用户协议 | 隐私政策
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;

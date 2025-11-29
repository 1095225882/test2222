import React, { useState, useEffect } from 'react';
import { sendSmsCode, performLogin } from '../services/mockService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (phone.length < 11) {
      setError('请输入有效的11位手机号码');
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const sentCode = await sendSmsCode(phone);
      alert(`[开发模式] 验证码: ${sentCode}`);
      setCountdown(60);
    } catch (err) {
      setError('短信发送失败');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code) return;
    try {
      const user = await performLogin(phone, code);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || '登录失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">登录 / 注册</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">手机号码</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2"
              placeholder="请输入手机号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">验证码</label>
            <div className="flex mt-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2"
                placeholder="1234"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending || countdown > 0 || phone.length < 11}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-r-md border-t border-b border-r border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-32"
              >
                {isSending ? '发送中...' : countdown > 0 ? `${countdown}秒` : '获取验证码'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-2 px-4 rounded-md hover:bg-brand-700 transition font-medium"
            >
              安全登录
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
        >
          取消
        </button>
      </div>
    </div>
  );
};
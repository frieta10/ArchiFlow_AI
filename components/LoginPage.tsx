import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User, UserQuotas } from '../types';

import { Link } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (user: User, isNew?: boolean) => void;
  customLogo?: string | null;
}

type AuthView = 'login' | 'register' | 'profile';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, customLogo }) => {
  const [view, setView] = useState<AuthView>('login');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Auth Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // CRM Profile State
  const [profileData, setProfileData] = useState({
    role: '',
    company: '',
    focus: ''
  });

  // Default quotas for new users (SRS 4.1)
  const defaultQuotas: UserQuotas = {
    diagramsUsed: 0,
    uploadsUsed: 0,
    revisionsUsed: 0,
    exportsUsed: 0
  };

  const handleSSO = (provider: 'google' | 'apple' | 'microsoft') => {
    alert("SSO not yet configured. Please use Email login with a registered database user.");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting('email');

    try {
      let endpoint = '/api/login';
      let body: any = { email: formData.email, password: formData.password };

      if (view === 'register') {
        endpoint = '/api/register';
        body.name = formData.name;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (view === 'register' ? 'Registration failed' : 'Login failed'));
      }

      // Login Success
      onLogin(data.user, false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: crypto.randomUUID(),
      name: formData.name || 'Architect',
      email: formData.email,
      provider: 'google',
      avatar: `https://ui-avatars.com/api/?name=${formData.name || 'Architect'}&background=1A4594&color=fff`,
      quotas: defaultQuotas
    }, true);
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(26,69,148,0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1A4594] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00D9BC] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
          <div className="p-8">

            {/* Header */}
            <div className={`flex flex-col items-center text-center ${customLogo && view === 'login' ? 'mb-4' : 'mb-8'}`}>
              <Link
                to="/"
                className={`block hover:scale-105 transition-transform duration-300 ${customLogo && view === 'login' ? '-mb-12 relative z-10' : 'mb-6'}`}
              >
                <ICONS.LogoMark
                  src={customLogo}
                  className={`drop-shadow-[0_0_30px_rgba(0,217,188,0.4)] ${customLogo ? 'h-[264px] w-auto object-contain' : 'w-16 h-16'}`}
                />
              </Link>

              {(!customLogo || view !== 'login') && (
                <h1 className="text-xl font-bold text-white tracking-tight mb-1">
                  {view === 'register' && "Join ArchiFlow"}
                  {view === 'profile' && "Setup Profile"}
                  {view === 'login' && !customLogo && "Welcome Back"}
                </h1>
              )}

              <p className={`text-slate-400 text-xs font-medium tracking-wide ${customLogo && view === 'login' ? 'relative z-20 mt-2' : ''}`}>
                {view === 'profile' ? "Configure your architectural persona" : "Sign in to access your workspace"}
              </p>
            </div>

            {/* Profile Setup View (CRM Integration) */}
            {view === 'profile' ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Current Role</label>
                    <div className="relative">
                      <select
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm appearance-none transition-all focus:bg-white/10"
                        value={profileData.role}
                        onChange={e => setProfileData({ ...profileData, role: e.target.value })}
                      >
                        <option value="" className="bg-slate-900">Select Role...</option>
                        <option value="architect" className="bg-slate-900">System Architect</option>
                        <option value="lead" className="bg-slate-900">Engineering Lead</option>
                        <option value="developer" className="bg-slate-900">Software Engineer</option>
                        <option value="manager" className="bg-slate-900">Product Manager</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm placeholder:text-white/20 transition-all focus:bg-white/10"
                      value={profileData.company}
                      onChange={e => setProfileData({ ...profileData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Primary Focus</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud Infrastructure"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm placeholder:text-white/20 transition-all focus:bg-white/10"
                      value={profileData.focus}
                      onChange={e => setProfileData({ ...profileData, focus: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#1A4594] to-[#00D9BC] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#00D9BC]/20 hover:shadow-[#00D9BC]/40 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                >
                  Complete Setup
                </button>
              </form>
            ) : (
              <>
                {/* Email/Password Auth */}
                <form onSubmit={handleEmailAuth} className="space-y-3 mb-6">
                  {view === 'register' && (
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm placeholder:text-white/20 transition-all focus:bg-white/10"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Work Email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm placeholder:text-white/20 transition-all focus:bg-white/10"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#00D9BC]/50 text-white text-sm placeholder:text-white/20 transition-all focus:bg-white/10"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    disabled={!!isConnecting}
                    className="w-full py-3.5 bg-white text-[#020617] text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-slate-200 active:scale-[0.98] shadow-lg shadow-white/5"
                  >
                    {isConnecting === 'email' ? 'Authorizing...' : view === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="relative flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleSSO('google')} className="flex items-center justify-center p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                    <ICONS.Google className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => handleSSO('microsoft')} className="flex items-center justify-center p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                    <ICONS.Microsoft className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => handleSSO('apple')} className="flex items-center justify-center p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                    <ICONS.Apple className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Toggle View */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setView(view === 'login' ? 'register' : 'login')}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#00D9BC] transition-colors tracking-widest uppercase"
                  >
                    {view === 'login' ? "New to ArchiFlow? Create Account" : "Already have an account? Sign In"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
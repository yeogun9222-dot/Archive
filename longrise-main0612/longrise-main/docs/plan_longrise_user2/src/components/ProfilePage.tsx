import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Shield,
  Key,
  Bell,
  Smartphone,
  UserCheck,
  Mail,
  ChevronRight,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  AlertTriangle,
  QrCode,
  Copy
} from 'lucide-react';

export const ProfilePage = ({ user, onUpdateUser, onLogout }: { user?: any, onUpdateUser?: (u: any) => void, onLogout?: () => void }) => {
  const displayUser = user || { name: 'GoldenDragon', rank: 'Blue Dragon', hasSetTradingPassword: false };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleUpdatePassword = () => {
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({
        ...displayUser,
        tradingPassword: password,
        hasSetTradingPassword: true
      });
    }

    setIsModalOpen(false);
    setPassword('');
    setConfirmPassword('');
    setError('');
    alert('Trading Password successfully configured.');
  };

  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-2xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-luxury-red-light/30 to-transparent" />
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-luxury-gold to-yellow-300">
                <div className="w-full h-full rounded-full bg-luxury-red-dark flex items-center justify-center border-4 border-luxury-red-dark overflow-hidden">
                  <User size={60} className="text-luxury-gold" />
                </div>
              </div>
              <div className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 w-8 h-8 bg-green-500 rounded-full border-4 border-luxury-red-dark flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
            </div>
            <div className="space-y-1 pt-4">
              <h2 className="text-2xl font-serif font-bold text-white">{displayUser.name}</h2>
              <p className="text-[10px] text-luxury-gold font-black tracking-[0.3em] uppercase">{displayUser.rank} Rank</p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Edit Identity</button>
              <button 
                onClick={onLogout}
                className="w-full py-3 bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl text-xs font-bold hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14}/> LOG OUT
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 font-mono">Platform Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Bell size={16} />
                  <span>Notifications</span>
                </div>
                <span className="text-green-500 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="glass-panel p-8 rounded-2xl space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <UserCheck className="text-luxury-gold" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email Address', value: 'dragon88@longrise.com', icon: Mail },
                  ].map((info) => (
                    <div key={info.label} className="p-4 bg-white/5 border border-white/5 rounded-2xl group cursor-pointer hover:border-luxury-gold/30 transition-all">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{info.label}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">{info.value}</span>
                        <info.icon size={16} className="text-gray-600 group-hover:text-luxury-gold" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Key className="text-luxury-gold" />
                Security Settings
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Google OTP Configuration */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-luxury-gold/5 to-red-600/5 border border-luxury-gold/20 rounded-2xl group transition-all hover:border-luxury-gold/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-gold/20 to-red-600/20 flex items-center justify-center text-luxury-gold">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Authenticator</h4>
                      <p className="text-xs text-gray-500">Two-factor authentication with OTP</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOTPModalOpen(true)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                      isOTPVerified
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-red-600 to-luxury-gold text-white hover:scale-105 shadow-[0_10px_30px_rgba(220,38,38,0.3)]'
                    }`}
                  >
                    {isOTPVerified ? '✓ VERIFIED' : 'SETUP'}
                  </button>
                </div>

                {/* Trading Password Configuration */}
                <div className="flex items-center justify-between p-6 bg-luxury-gold/5 border border-luxury-gold/20 rounded-2xl group transition-all hover:bg-luxury-gold/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Trading Password</h4>
                      <p className="text-xs text-gray-500">Required for withdrawals & organization status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                      displayUser.hasSetTradingPassword
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-red-600 to-luxury-gold text-white hover:scale-105 shadow-[0_10px_30px_rgba(220,38,38,0.3)]'
                    }`}
                  >
                    {displayUser.hasSetTradingPassword ? '✓ CHANGE PIN' : 'CONFIGURE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a0505] border border-luxury-gold/30 rounded-2xl p-10 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                  <Key size={40} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase italic">Trading Password</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This password is required for all digital asset withdrawals and viewing sensitive organizational maps.
                  </p>
                </div>

                <div className="w-full space-y-6">
                   <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-gray-600 tracking-widest uppercase ml-2">Secure Passkey (8+ Alphanumeric)</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-luxury-gold outline-none transition-all"
                          placeholder="e.g. Dragon777"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                   </div>
                   
                   <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-gray-600 tracking-widest uppercase ml-2">Confirm Passkey</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-luxury-gold outline-none transition-all"
                        placeholder="••••••••"
                      />
                   </div>

                   {error && (
                     <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-500">
                       <AlertTriangle size={16} />
                       <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">{error}</p>
                     </div>
                   )}
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <button 
                    onClick={handleUpdatePassword}
                    className="w-full py-5 bg-luxury-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all text-sm shadow-[0_15px_40px_rgba(234,179,8,0.2)]"
                  >
                    Set Identity Passkey
                  </button>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google OTP Setup Modal */}
      <AnimatePresence>
        {isOTPModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOTPModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-10 rounded-3xl border border-luxury-gold/30 text-center space-y-8 bg-gradient-to-br from-[#5c1a1a] via-[#3b0a0a] to-[#2a0505] shadow-[0_0_60px_rgba(234,179,8,0.2)]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-luxury-gold rounded-3xl blur-2xl opacity-5 pointer-events-none"></div>

              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-luxury-gold/20 to-red-600/20 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold mx-auto shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <QrCode size={32} />
              </div>

              {!isOTPVerified ? (
                <>
                  <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                      Google <span className="text-luxury-gold">Authenticator</span>
                    </h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      Enable two-factor authentication for enhanced security
                    </p>
                  </div>

                  <div className="relative z-10 space-y-3 p-6 bg-black/40 border border-luxury-gold/20 rounded-2xl">
                    <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">Manual Authentication Key</p>
                    <div className="flex items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-luxury-gold/30 transition-all">
                      <code className="flex-1 text-xs font-mono text-luxury-gold break-all font-bold">JBSWY3DPEBLW64TMMQ======</code>
                      <button className="p-2 text-gray-500 hover:text-luxury-gold transition-colors group-hover:scale-110">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <label className="text-[10px] font-black tracking-widest uppercase text-luxury-gold block">Verify 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full py-4 px-4 bg-black/60 border border-luxury-gold/30 rounded-xl text-center text-3xl font-mono font-black text-luxury-gold focus:outline-none focus:border-luxury-gold/60 transition-all shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                    />
                    <p className="text-[9px] text-gray-500 font-bold">From your Google Authenticator app</p>
                  </div>

                  <div className="relative z-10 flex gap-3">
                    <button
                      onClick={() => setIsOTPModalOpen(false)}
                      className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-black text-xs tracking-widest uppercase hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        if (otpCode) {
                          setIsOTPVerified(true);
                          setOtpCode('');
                          alert('Google Authenticator has been successfully configured!');
                        } else {
                          alert('Please enter a code');
                        }
                      }}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-600 to-luxury-gold text-white font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
                    >
                      VERIFY & ENABLE
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-luxury-gold/20 to-green-500/20 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold mx-auto shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-black text-white uppercase italic">Setup Complete</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                      Two-factor authentication is now active on your account
                    </p>
                  </div>

                  <div className="relative z-10 p-6 bg-gradient-to-r from-luxury-gold/10 to-green-500/10 rounded-2xl border border-luxury-gold/20">
                    <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">✓ Google Authenticator Enabled</p>
                    <p className="text-[9px] text-gray-400 mt-2">A 6-digit code will be required at login</p>
                  </div>

                  <button
                    onClick={() => setIsOTPModalOpen(false)}
                    className="relative z-10 w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.3)]"
                  >
                    CLOSE
                  </button>
                </>
              )}

              <button
                onClick={() => setIsOTPModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-luxury-gold transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

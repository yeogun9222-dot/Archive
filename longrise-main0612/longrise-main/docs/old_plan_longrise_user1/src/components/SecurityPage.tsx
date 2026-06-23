import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  ScanFace, 
  Mail, 
  CheckCircle2, 
  Activity, 
  Globe, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Key,
  X,
  Zap
} from 'lucide-react';

export const SecurityPage = ({ user, onUpdateUser }: { user: any, onUpdateUser: (u: any) => void }) => {
  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (pw: string) => {
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return pw.length >= 8 && hasLetter && hasNumber;
  };

  const handleUpdatePassword = () => {
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with letters and numbers.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({ 
        ...user, 
        tradingPassword: password, 
        hasSetTradingPassword: true 
      });
    }
    
    setIsTradingModalOpen(false);
    setPassword('');
    setConfirmPassword('');
    setError('');
    alert('Trading Password successfully updated.');
  };

  const protectionLayers = [
    { 
      id: 'otp', 
      title: 'Google OTP (2FA)', 
      desc: 'HIGHEST PROTECTION TIER', 
      icon: Lock, 
      status: 'ACTIVATE',
      isSecure: false 
    },
    { 
      id: 'mobile', 
      title: 'Mobile Device', 
      desc: 'SMS SECURE RECOVERY', 
      icon: Smartphone, 
      status: 'ACTIVATE',
      isSecure: false 
    },
    { 
      id: 'face', 
      title: 'Face Recognition', 
      desc: 'BIOMETRIC GATEWAY', 
      icon: ScanFace, 
      status: 'ACTIVATE',
      isSecure: false 
    },
    { 
      id: 'email', 
      title: 'Email Verifier', 
      desc: 'TRANSACTION CONFIRMATION', 
      icon: Mail, 
      status: 'SECURE',
      isSecure: true 
    },
    { 
      id: 'trading', 
      title: 'Trading Password', 
      desc: 'SENSITIVE DATA GATEWAY', 
      icon: Key, 
      status: 'MANAGE',
      isSecure: user.hasSetTradingPassword 
    },
  ];

  const securityEvents = [
    { event: 'Login Session Started', ip: '142.12.8.2', loc: 'Seoul, KR', time: '12 mins ago', status: 'Success' },
    { event: 'Withdrawal Whitelisting', ip: '142.12.8.2', loc: 'Seoul, KR', time: '4 hours ago', status: 'Verified' },
    { event: 'Login Attempt Blocked', ip: '45.12.8.2', loc: 'Frankfurt, DE', time: '1 day ago', status: 'Blocked (Geo)' },
    { event: 'Security PIN Update', ip: '142.12.8.2', loc: 'Seoul, KR', time: '2 days ago', status: 'Completed' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-5xl mx-auto space-y-16">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">Advanced Protection</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-luxury-gold"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-luxury-gold"></div>
          </div>
        </motion.div>
      </div>

      {/* Account Integrity Dashboard */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 lg:p-20 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-red-light/20 via-transparent to-transparent opacity-30"></div>
        
        {/* Central Shield Graphic */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-luxury-gold/10 scale-150 animate-[pulse_3s_infinite]"></div>
          <div className="w-32 h-32 rounded-full border-2 border-luxury-gold/40 flex items-center justify-center p-6 bg-black/40 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <Shield className="text-luxury-gold" size={64} />
          </div>
          {/* Subtle shield overlay in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 opacity-5 pointer-events-none">
             <Shield size={300} className="text-white" />
          </div>
        </div>

        <div className="text-center space-y-6 relative z-10 w-full max-w-md">
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-[0.2em] uppercase italic">Account Integrity</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-luxury-gold tracking-widest uppercase">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mr-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  className="h-full bg-luxury-gold"
                />
              </div>
              <span>25%</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Moderate Risk - Action Required</p>
          </div>
        </div>

        {/* Protection Layers List */}
        <div className="mt-16 w-full max-w-2xl space-y-4 relative z-10">
          {protectionLayers.map((layer, i) => (
            <motion.div 
              key={layer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/60 border border-white/5 rounded-2xl p-6 lg:p-8 flex items-center justify-between group hover:border-luxury-gold/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-6 lg:gap-8">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${layer.isSecure ? 'text-green-500' : 'text-gray-500'}`}>
                  <layer.icon size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg lg:text-xl font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{layer.title}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{layer.desc}</p>
                </div>
              </div>

              {layer.isSecure ? (
                <button 
                  onClick={() => layer.id === 'trading' && setIsTradingModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-green-500 text-[10px] font-black tracking-widest uppercase hover:bg-green-500/20 transition-all"
                >
                  {layer.status === 'MANAGE' ? <Zap size={16} /> : <CheckCircle2 size={16} />} 
                  {layer.status}
                </button>
              ) : (
                <button className="px-8 py-3 rounded-xl bg-luxury-red-dark border border-white/5 text-gray-500 group-hover:text-luxury-gold group-hover:border-luxury-gold/50 text-[10px] font-black tracking-widest uppercase transition-all">
                  ACTIVATE
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trading Password Modal */}
      <AnimatePresence>
        {isTradingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTradingModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#2a0505] border border-luxury-gold/30 rounded-2xl p-10 shadow-[0_0_80px_rgba(234,179,8,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50" />
              
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                  <Key size={40} className="animate-pulse" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Trading Password</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Set a 4-digit PIN to protect sensitive team data and authorize withdrawals.
                  </p>
                </div>

                <div className="w-full space-y-6">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-600 tracking-widest uppercase text-left ml-2">New Security Passkey (8+ Alphanumeric)</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-lg font-mono text-center tracking-[0.2em] text-white focus:border-luxury-gold outline-none transition-all"
                        placeholder="••••••••"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-600 tracking-widest uppercase text-left ml-2">Confirm Passkey</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-lg font-mono text-center tracking-[0.2em] text-white focus:border-luxury-gold outline-none transition-all"
                        placeholder="••••••••"
                      />
                   </div>
                   {error && (
                     <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
                   )}
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <button 
                    onClick={handleUpdatePassword}
                    className="w-full py-5 bg-luxury-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all text-sm"
                  >
                    Update Security Passkey
                  </button>
                  <button 
                    onClick={() => setIsTradingModalOpen(false)}
                    className="w-full py-5 border border-white/5 text-gray-500 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <button onClick={() => setIsTradingModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recent Security Events - Added Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 lg:p-16 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
        
        <div className="flex items-center justify-between relative z-10 px-4">
          <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight flex items-center gap-4">
             <Activity className="text-luxury-gold" />
             Recent Security <span className="gold-gradient-text italic">Events</span>
          </h2>
          <div className="flex items-center gap-2 text-luxury-gold text-[10px] font-black tracking-widest uppercase">
             <ShieldCheck size={16} /> All Systems Verified
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {securityEvents.map((event, i) => (
            <div key={i} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer">
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${event.status.includes('Blocked') ? 'text-red-500' : 'text-luxury-gold'}`}>
                  {event.status.includes('Blocked') ? <AlertTriangle size={20} /> : <Globe size={20} />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{event.event}</p>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{event.ip} • {event.loc}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{event.time}</p>
                <p className={`text-[11px] font-black tracking-widest uppercase ${event.status.includes('Blocked') ? 'text-red-500' : 'text-green-500'}`}>
                   {event.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center relative z-10">
           <button className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] hover:text-luxury-gold transition-all">
              DOWNLOAD SECURITY LOGS (CSV)
           </button>
        </div>
      </motion.div>
    </div>
  );
};

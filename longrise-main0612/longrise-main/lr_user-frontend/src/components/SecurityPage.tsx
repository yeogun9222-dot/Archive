import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
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

const getErrorMessage = (err: any, fallback: string) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || String(item))
      .join(' ');
  }
  if (detail && typeof detail === 'object') {
    return detail.message || detail.msg || fallback;
  }
  return fallback;
};

export const SecurityPage = ({
  user,
  securityData,
  onSetTradingPassword,
  onSetupOtp,
  onVerifyOtpSetup,
  onEnableOtp,
  onDisableOtp,
}: {
  user: any;
  securityData?: any;
  onSetTradingPassword?: (password: string, confirmPassword: string, otpCode?: string, currentPassword?: string) => Promise<void>;
  onSetupOtp?: (currentOtpCode?: string) => Promise<any>;
  onVerifyOtpSetup?: (code: string) => Promise<any>;
  onEnableOtp?: (code: string) => Promise<any>;
  onDisableOtp?: (code: string, password: string) => Promise<void>;
}) => {
  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentTradingPassword, setCurrentTradingPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [tradingOtpCode, setTradingOtpCode] = useState('');
  const [otpSetup, setOtpSetup] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      setError('Trading Password must be a 4-digit numeric PIN.');
      return;
    }
    if (user.hasSetTradingPassword && !/^\d{4}$/.test(currentTradingPassword)) {
      setError('Please enter your current 4-digit Trading Password.');
      return;
    }
    if (user.otp && tradingOtpCode.length !== 6) {
      setError('Please enter a valid 6-digit Google OTP code.');
      return;
    }

    try {
      await onSetTradingPassword?.(
        password,
        confirmPassword,
        tradingOtpCode || undefined,
        currentTradingPassword || undefined,
      );
      setIsTradingModalOpen(false);
      setPassword('');
      setConfirmPassword('');
      setCurrentTradingPassword('');
      setTradingOtpCode('');
      setError('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Trading password update failed.'));
    }
  };

  const startOtpSetup = async () => {
    try {
      setError('');
      setOtpCode('');
      setBackupCodes([]);
      const setup = await onSetupOtp?.();
      setOtpSetup(setup);
    } catch (err: any) {
      setError(getErrorMessage(err, 'OTP setup failed.'));
    }
  };

  const verifyOtpSetup = async () => {
    try {
      const result = await onVerifyOtpSetup?.(otpCode);
      setBackupCodes(result?.backup_codes || []);
      setOtpSetup(null);
      setOtpCode('');
      setError('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'OTP setup failed.'));
    }
  };

  const openOtpModal = () => {
    setIsOtpModalOpen(true);
    setOtpCode('');
    setDisablePassword('');
    setOtpSetup(null);
    setBackupCodes([]);
    setError('');
    if (!user.otpConfigured) {
      void startOtpSetup();
    }
  };

  const defaultProtectionLayers = [
    {
      id: 'otp',
      title: 'Google OTP (2FA)',
      desc: 'HIGHEST PROTECTION TIER',
      icon: Lock,
      status: user.otp ? 'ACTIVE' : 'ACTIVATE',
      isSecure: Boolean(user.otp),
      isConfigured: Boolean(user.otpConfigured || user.otp)
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
  const iconByLayerId: Record<string, any> = {
    otp: Lock,
    email: Mail,
    trading: Key,
  };
  const descByLayerId: Record<string, string> = {
    otp: 'HIGHEST PROTECTION TIER',
    email: 'TRANSACTION CONFIRMATION',
    trading: 'SENSITIVE DATA GATEWAY',
  };
  const protectionLayers = (securityData?.protectionLayers?.length ? securityData.protectionLayers : defaultProtectionLayers).map((layer: any) => ({
    ...layer,
    isSecure: layer.id === 'otp' ? Boolean(user.otp) : layer.isSecure,
    isConfigured: layer.id === 'otp' ? Boolean(user.otpConfigured || user.otp) : layer.isConfigured,
    desc: layer.desc || descByLayerId[layer.id] || 'SECURITY CONTROL',
    icon: typeof layer.icon === 'function' ? layer.icon : iconByLayerId[layer.id] || Shield,
  }));

  const securityEvents = securityData?.events?.map((event: any) => ({
    event: event.event,
    ip: event.location || 'N/A',
    loc: event.location || 'Known Environment',
    time: event.time || '',
    status: event.status || 'Success',
  })) || [
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

      {/* Account Integrity & Recent Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Integrity Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center h-full"
        >
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-red-light/20 via-transparent to-transparent opacity-30"></div>

        {/* Central Shield Graphic */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-luxury-gold/10 scale-150 animate-[pulse_3s_infinite]"></div>
          <div className="w-20 h-20 rounded-full border-2 border-luxury-gold/40 flex items-center justify-center p-4 bg-black/40 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <Shield className="text-luxury-gold" size={40} />
          </div>
          {/* Subtle shield overlay in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 opacity-5 pointer-events-none">
             <Shield size={200} className="text-white" />
          </div>
        </div>

        <div className="text-center space-y-4 relative z-10 w-full">
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-[0.2em] uppercase italic">Account Integrity</h2>

          <div className="space-y-3">
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
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Moderate Risk - Action Required</p>
          </div>
        </div>

        {/* Protection Layers List */}
        <div className="mt-8 w-full space-y-3 relative z-10">
          {protectionLayers.map((layer, i) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/60 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-luxury-gold/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${layer.isSecure ? 'text-green-500' : 'text-gray-500'}`}>
                  <layer.icon size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{layer.title}</h4>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{layer.desc}</p>
                </div>
              </div>

              {layer.isSecure ? (
                <button
                  onClick={() => {
                    if (layer.id === 'trading') setIsTradingModalOpen(true);
                    if (layer.id === 'otp') openOtpModal();
                  }}
                  className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-500 text-[8px] font-black tracking-widest uppercase hover:bg-green-500/20 transition-all"
                >
                  {layer.status === 'MANAGE' ? <Zap size={12} /> : <CheckCircle2 size={12} />}
                  {layer.status}
                </button>
              ) : (
                <button onClick={() => layer.id === 'otp' && openOtpModal()} className="px-5 py-2 rounded-lg bg-luxury-red-dark border border-white/5 text-gray-500 group-hover:text-luxury-gold group-hover:border-luxury-gold/50 text-[8px] font-black tracking-widest uppercase transition-all">
                  {layer.id === 'otp' && layer.isConfigured ? 'ENABLE' : 'SETUP'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
        </motion.div>

        {/* Recent Security Events - Added Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-8 shadow-2xl relative overflow-hidden h-full"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>

          <div className="flex items-center justify-between relative z-10 px-2">
            <h2 className="text-xl font-serif font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <Activity className="text-luxury-gold" size={20} />
              Recent <span className="gold-gradient-text italic">Events</span>
            </h2>
            <div className="flex items-center gap-1 text-luxury-gold text-[8px] font-black tracking-widest uppercase whitespace-nowrap">
              <ShieldCheck size={12} /> Verified
            </div>
          </div>

          <div className="space-y-2 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {securityEvents.map((event, i) => (
              <div key={i} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${event.status.includes('Blocked') ? 'text-red-500' : 'text-luxury-gold'}`}>
                    {event.status.includes('Blocked') ? <AlertTriangle size={14} /> : <Globe size={14} />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-serif font-black text-white group-hover:text-luxury-gold transition-colors truncate">{event.event}</p>
                    <p className="text-[8px] text-gray-500 font-mono tracking-widest uppercase truncate">{event.ip} • {event.loc}</p>
                  </div>
                </div>
                <div className="text-right space-y-0.5 ml-2 flex-shrink-0">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">{event.time}</p>
                  <p className={`text-[8px] font-black tracking-widest uppercase ${event.status.includes('Blocked') ? 'text-red-500' : 'text-green-500'}`}>
                    {event.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center relative z-10">
            <button className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-luxury-gold transition-all">
              DOWNLOAD LOGS
            </button>
          </div>
        </motion.div>
      </div>

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
                    Set or change the 4-digit numeric PIN used to authorize withdrawals and sensitive account actions.
                  </p>
                </div>

                <div className="w-full space-y-5">
                   {user.hasSetTradingPassword && (
                     <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left">
                        <label className="mb-3 flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest uppercase">
                          <Lock size={14} className="text-red-400" />
                          Current Trading Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={currentTradingPassword}
                            onChange={(e) => setCurrentTradingPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-black/50 border border-red-500/20 rounded-xl py-4 pl-12 pr-5 text-white focus:border-red-400 outline-none transition-all"
                            placeholder="0000"
                          />
                          <ShieldCheck size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/80" />
                        </div>
                     </div>
                   )}

                   <div className="rounded-2xl border border-luxury-gold/20 bg-luxury-gold/5 p-4 text-left">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase">
                        <Key size={14} />
                        New Credentials
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">New 4-Digit PIN</label>
                          <input 
                            type="password" 
                            inputMode="numeric"
                            maxLength={4}
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-black/50 border border-luxury-gold/20 rounded-xl py-4 px-4 text-white focus:border-luxury-gold outline-none transition-all"
                            placeholder="0000"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Confirm</label>
                          <input 
                            type="password" 
                            inputMode="numeric"
                            maxLength={4}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-black/50 border border-luxury-gold/20 rounded-xl py-4 px-4 text-white focus:border-luxury-gold outline-none transition-all"
                            placeholder="0000"
                          />
                        </div>
                      </div>
                   </div>

                   {user.otp && (
                     <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                        <label className="mb-3 flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                          <ShieldCheck size={14} />
                          Google OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={tradingOtpCode}
                          onChange={(e) => setTradingOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-black/60 border border-emerald-500/20 rounded-xl py-4 px-6 text-center text-2xl font-mono font-black tracking-[0.35em] text-emerald-300 focus:border-emerald-400 outline-none transition-all"
                          placeholder="000000"
                        />
                     </div>
                   )}
                   {error && (
                     <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
                   )}
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <button 
                    onClick={handleUpdatePassword}
                    className="w-full py-5 bg-luxury-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all text-sm"
                  >
                    {user.hasSetTradingPassword ? 'Change Trading Password' : 'Set Trading Password'}
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

      <AnimatePresence>
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOtpModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#2a0505] border border-luxury-gold/30 rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Google OTP</h3>
              {backupCodes.length > 0 ? (
                <>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Store these one-time recovery codes securely</p>
                  <div className="grid gap-2 rounded-2xl border border-luxury-gold/20 bg-black/40 p-4">
                    {backupCodes.map((code) => (
                      <code key={code} className="text-center text-xs font-mono font-bold text-luxury-gold">{code}</code>
                    ))}
                  </div>
                  <button onClick={() => setIsOtpModalOpen(false)} className="w-full py-3 bg-luxury-gold text-black rounded-xl font-black text-xs tracking-widest uppercase">
                    Close
                  </button>
                </>
              ) : otpSetup ? (
                <>
                  {otpSetup.qr_code_data_url && (
                    <img src={otpSetup.qr_code_data_url} alt="Google Authenticator QR" className="mx-auto h-40 w-40 rounded-xl bg-white p-2" />
                  )}
                  <div className="rounded-2xl border border-luxury-gold/20 bg-black/40 p-4">
                    <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest mb-2">Manual Key</p>
                    <code className="block break-all text-xs font-mono font-bold text-luxury-gold">{otpSetup.secret}</code>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-center text-3xl font-mono font-black text-luxury-gold focus:border-luxury-gold outline-none transition-all"
                  />
                  <button onClick={verifyOtpSetup} className="w-full py-3 bg-luxury-gold text-black rounded-xl font-black text-xs tracking-widest uppercase">
                    Verify & Enable
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-center text-3xl font-mono font-black text-luxury-gold focus:border-luxury-gold outline-none transition-all"
                  />
                  {user.otp && (
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Login password"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-luxury-gold outline-none transition-all"
                    />
                  )}
                  <div className="flex gap-3">
                    {user.otp && (
                  <button
                    onClick={async () => {
                      try {
                        await onDisableOtp?.(otpCode, disablePassword);
                        setIsOtpModalOpen(false);
                      } catch (err: any) {
                        setError(getErrorMessage(err, 'OTP disable failed.'));
                      }
                    }}
                    className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black text-xs tracking-widest uppercase"
                  >
                    Disable
                  </button>
                    )}
                    {!user.otp && (
                      <button
                        onClick={async () => {
                          try {
                            await onEnableOtp?.(otpCode);
                            setOtpCode('');
                            setIsOtpModalOpen(false);
                          } catch (err: any) {
                            setError(getErrorMessage(err, 'OTP enable failed.'));
                          }
                        }}
                        className="flex-1 py-3 bg-luxury-gold text-black rounded-xl font-black text-xs tracking-widest uppercase"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </>
              )}
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

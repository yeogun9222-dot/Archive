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

export const ProfilePage = ({
  user,
  onLogout,
  onSaveProfile,
  onSetTradingPassword,
  onSetupOtp,
  onVerifyOtpSetup,
}: {
  user?: any;
  onLogout?: () => void;
  onSaveProfile?: (payload: { name: string; nickname: string; phone: string }) => Promise<void>;
  onSetTradingPassword?: (password: string, confirmPassword: string, otpCode?: string, currentPassword?: string) => Promise<void>;
  onSetupOtp?: (currentOtpCode?: string) => Promise<any>;
  onVerifyOtpSetup?: (code: string) => Promise<any>;
}) => {
  const displayUser = user || { name: 'GoldenDragon', rank: 'Blue Dragon', hasSetTradingPassword: false };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(Boolean(displayUser.otp));
  const [otpCode, setOtpCode] = useState('');
  const [currentOtpCode, setCurrentOtpCode] = useState('');
  const [otpSetup, setOtpSetup] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentTradingPassword, setCurrentTradingPassword] = useState('');
  const [tradingOtpCode, setTradingOtpCode] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: displayUser.name || '',
    nickname: displayUser.nickname || '',
    phone: displayUser.phone || '',
  });
  const referralCode = displayUser.referralCode || displayUser.referral_code || '';
  const referralLink = referralCode ? `${window.location.origin}/join?ref=${referralCode}` : '';
  const referralQrUrl = referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`
    : '';

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
    if (displayUser.hasSetTradingPassword && !/^\d{4}$/.test(currentTradingPassword)) {
      setError('Please enter your current 4-digit Trading Password.');
      return;
    }
    if (displayUser.otp && tradingOtpCode.length !== 6) {
      setError('Please enter a valid 6-digit Google OTP code.');
      return;
    }

    try {
      if (onSetTradingPassword) {
        await onSetTradingPassword(
          password,
          confirmPassword,
          tradingOtpCode || undefined,
          currentTradingPassword || undefined,
        );
      }
      setIsModalOpen(false);
      setPassword('');
      setConfirmPassword('');
      setCurrentTradingPassword('');
      setTradingOtpCode('');
      setError('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Unable to update trading password.'));
    }
  };

  const buildReferralLink = () => {
    return referralLink;
  };

  const copyReferralLink = async () => {
    const link = buildReferralLink();
    if (!link) return;
    await navigator.clipboard?.writeText(link);
    setReferralCopied(true);
    window.setTimeout(() => setReferralCopied(false), 1600);
  };

  const handleSaveIdentity = async () => {
    try {
      if (onSaveProfile) {
        await onSaveProfile(profileForm);
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Unable to update profile.'));
    }
  };

  const startOtpSetup = async () => {
    try {
      setError('');
      setOtpCode('');
      setBackupCodes([]);
      const setup = await onSetupOtp?.(currentOtpCode || undefined);
      setOtpSetup(setup);
      setCurrentOtpCode('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'OTP setup failed.'));
    }
  };

  const verifyOtpSetup = async () => {
    if (!otpCode || !onVerifyOtpSetup) {
      setError('Please enter a code.');
      return;
    }
    try {
      const result = await onVerifyOtpSetup(otpCode);
      setIsOTPVerified(true);
      setBackupCodes(result?.backup_codes || []);
      setOtpCode('');
      setError('');
    } catch (err: any) {
      setError(getErrorMessage(err, 'OTP activation failed.'));
    }
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
              <button onClick={() => setIsEditModalOpen(true)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Edit Identity</button>
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
                    { label: 'Email Address', value: displayUser.email || '-', icon: Mail },
                    { label: 'Nickname', value: displayUser.nickname || '-', icon: User },
                    { label: 'Phone', value: displayUser.phone || '-', icon: Smartphone },
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

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Copy className="text-luxury-gold" />
                  Referral
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">My Referral Code</p>
                    <div className="flex items-center gap-3">
                      <code className="min-w-0 flex-1 rounded-xl border border-luxury-gold/15 bg-black/35 px-4 py-3 text-sm font-black tracking-[0.18em] text-luxury-gold">
                        {referralCode || '-'}
                      </code>
                      <button
                        onClick={copyReferralLink}
                        disabled={!referralCode}
                        className="h-11 w-11 shrink-0 rounded-xl border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold transition-all hover:bg-luxury-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center"
                        aria-label="Copy referral link"
                      >
                        <Copy size={17} />
                      </button>
                    </div>
                    {referralCopied && (
                      <p className="mt-3 text-xs font-bold text-luxury-gold">Referral link copied.</p>
                    )}
                  </div>

                  <div className="p-4 bg-black/25 border border-luxury-gold/10 rounded-2xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-32 w-32 shrink-0 rounded-2xl bg-white p-3 shadow-[0_18px_45px_rgba(255,255,255,0.08)]">
                        {referralQrUrl ? (
                          <img src={referralQrUrl} alt="Referral QR code" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/5 text-gray-400">
                            <QrCode size={36} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Referral QR Code</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Scan this code to open your referral signup link.
                        </p>
                        <div className="rounded-xl border border-white/5 bg-black/35 px-4 py-3">
                          <p className="truncate font-mono text-[11px] text-gray-500">{referralLink || 'Referral link unavailable'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    onClick={() => {
                      setIsOTPModalOpen(true);
                      setOtpSetup(null);
                      setBackupCodes([]);
                      setError('');
                      if (!isOTPVerified) {
                        void startOtpSetup();
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                      isOTPVerified
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-red-600 to-luxury-gold text-white hover:scale-105 shadow-[0_10px_30px_rgba(220,38,38,0.3)]'
                    }`}
                  >
                    {isOTPVerified ? 'RESET' : 'SETUP'}
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
                    This 4-digit numeric PIN is required for withdrawals, transfers, and sensitive team data.
                  </p>
                </div>

                <div className="w-full space-y-5">
                   {displayUser.hasSetTradingPassword && (
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
                          <Shield size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/80" />
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
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              inputMode="numeric"
                              maxLength={4}
                              value={password}
                              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="w-full bg-black/50 border border-luxury-gold/20 rounded-xl py-4 px-4 pr-11 text-white focus:border-luxury-gold outline-none transition-all"
                              placeholder="0000"
                            />
                            <button 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
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

                   {displayUser.otp && (
                     <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                        <label className="mb-3 flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                          <QrCode size={14} />
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
                    {displayUser.hasSetTradingPassword ? 'Change Trading Password' : 'Set Trading Password'}
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

              {backupCodes.length > 0 ? (
                <>
                  <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-serif font-black text-white uppercase italic">Backup Codes</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                      Store these one-time recovery codes securely
                    </p>
                  </div>
                  <div className="relative z-10 grid grid-cols-1 gap-2 p-4 bg-black/40 border border-luxury-gold/20 rounded-2xl">
                    {backupCodes.map((code) => (
                      <code key={code} className="text-xs font-mono text-luxury-gold font-bold">{code}</code>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsOTPModalOpen(false);
                      setOtpSetup(null);
                      setBackupCodes([]);
                    }}
                    className="relative z-10 w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.3)]"
                  >
                    CLOSE
                  </button>
                </>
              ) : !isOTPVerified || otpSetup ? (
                <>
                  <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                      Google <span className="text-luxury-gold">Authenticator</span>
                    </h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      Enable two-factor authentication for enhanced security
                    </p>
                  </div>

                  {isOTPVerified && !otpSetup && (
                    <div className="relative z-10 space-y-3">
                      <label className="text-[10px] font-black tracking-widest uppercase text-luxury-gold block">Current OTP Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={currentOtpCode}
                        onChange={(e) => setCurrentOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full py-4 px-4 bg-black/60 border border-luxury-gold/30 rounded-xl text-center text-3xl font-mono font-black text-luxury-gold focus:outline-none focus:border-luxury-gold/60 transition-all"
                      />
                      <button
                        onClick={startOtpSetup}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-luxury-gold text-white font-black text-xs tracking-widest uppercase hover:scale-105 transition-all"
                      >
                        START RESET
                      </button>
                    </div>
                  )}

                  {otpSetup && (
                    <>
                  <div className="relative z-10 space-y-3 p-6 bg-black/40 border border-luxury-gold/20 rounded-2xl">
                    {otpSetup.qr_code_data_url && (
                      <img src={otpSetup.qr_code_data_url} alt="Google Authenticator QR" className="mx-auto h-40 w-40 rounded-xl bg-white p-2" />
                    )}
                    <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">Manual Authentication Key</p>
                    <div className="flex items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-luxury-gold/30 transition-all">
                      <code className="flex-1 text-xs font-mono text-luxury-gold break-all font-bold">{otpSetup.secret}</code>
                      <button onClick={() => navigator.clipboard?.writeText(otpSetup.secret)} className="p-2 text-gray-500 hover:text-luxury-gold transition-colors group-hover:scale-110">
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
                      onClick={verifyOtpSetup}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-600 to-luxury-gold text-white font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
                    >
                      VERIFY & ENABLE
                    </button>
                  </div>
                    </>
                  )}
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

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass-panel p-10 rounded-2xl border border-white/10 space-y-6">
              <h3 className="text-2xl font-serif font-black text-white uppercase italic">Edit Identity</h3>
              <div className="space-y-4">
                <input value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-luxury-gold outline-none transition-all" />
                <input value={profileForm.nickname} onChange={(e) => setProfileForm((prev) => ({ ...prev, nickname: e.target.value }))} placeholder="Nickname" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-luxury-gold outline-none transition-all" />
                <input value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone number" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-luxury-gold outline-none transition-all" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-black text-xs tracking-widest uppercase">Cancel</button>
                <button onClick={handleSaveIdentity} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-600 to-luxury-gold text-white font-black text-xs tracking-widest uppercase">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

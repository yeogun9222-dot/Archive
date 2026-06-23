import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, LogIn, Cpu, Mail, Send, CheckCircle2, UserPlus, ShieldCheck } from 'lucide-react';

interface VIPEntranceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export const VIPEntranceModal = ({ isOpen, onClose, onLogin }: VIPEntranceModalProps) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [signupStep, setSignupStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const resetSignup = () => {
        setMode('login');
        setSignupStep(1);
        setEmail('');
        setVerificationCode('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            onClose();
                            setTimeout(resetSignup, 300);
                        }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-[440px] bg-[#4a0d0d] rounded-[2.5rem] border border-[#d4af37] p-10 shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => {
                                onClose();
                                setTimeout(resetSignup, 300);
                            }}
                            className="absolute top-6 right-6 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all group z-10"
                        >
                            <X size={20} className="text-[#d4af37] group-hover:rotate-90 transition-transform" />
                        </button>

                        {/* Header Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[#fcd34d] blur-3xl opacity-40 animate-pulse"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#fcd34d] to-[#d4af37] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] border-2 border-white/20">
                                    {mode === 'login' ? (
                                        <Cpu size={52} className="text-[#3b1111]" />
                                    ) : (
                                        <UserPlus size={52} className="text-[#3b1111]" />
                                    )}
                                </div>
                            </div>
                            <h2 className="text-4xl font-serif text-white font-bold mb-1 tracking-tight text-center">
                                {mode === 'login' ? 'VIP Entrance' : 'Join Elite Club'}
                            </h2>
                            <p className="text-[#d4af37] text-sm font-bold uppercase tracking-wider text-center">
                                {mode === 'login' ? 'Secure Access' : 'Begin Your Golden Journey'}
                            </p>
                        </div>

                        {/* Form Section */}
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.form 
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-5"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        onLogin();
                                    }}
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">Email / ID</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                                                <User size={20} />
                                            </div>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Enter your ID"
                                                className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4 pl-14 pr-6 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                                                <Lock size={20} />
                                            </div>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="Enter password"
                                                className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4 pl-14 pr-6 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">Transaction Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="Enter transaction password"
                                                className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4 pl-14 pr-6 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full h-16 bg-gradient-to-r from-[#ff512f] to-[#fdd835] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(255,81,47,0.35)] group mt-6">
                                        <LogIn size={24} className="text-black transition-transform group-hover:translate-x-1" />
                                        <span className="text-black font-black text-xl">Access Portfolio</span>
                                    </button>
                                </motion.form>
                            ) : signupStep === 1 ? (
                                <motion.form 
                                    key="signup-step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setSignupStep(2);
                                    }}
                                >
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">EMAIL</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                                                <Mail size={20} />
                                            </div>
                                            <input 
                                                required
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email"
                                                className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4.5 pl-14 pr-6 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full h-16 bg-gradient-to-r from-[#ff512f] to-[#fdd835] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(255,81,47,0.35)] group mt-10">
                                        <Send size={22} className="text-black transition-transform group-hover:translate-x-1" />
                                        <span className="text-black font-black text-xl">Send Code</span>
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form 
                                    key="signup-step2"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        onLogin();
                                    }}
                                >
                                    <div className="bg-black/20 rounded-2xl p-6 border border-[#d4af37]/10 text-center space-y-3">
                                        <p className="text-white/80 text-xs">
                                            Code sent to <span className="text-[#d4af37] font-bold">{email || "2342@awf"}</span>
                                        </p>
                                        <button 
                                            type="button"
                                            onClick={() => setSignupStep(1)}
                                            className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest border-b border-[#d4af37]/30 pb-0.5 hover:text-white transition-colors"
                                        >
                                            Change Contact
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">VERIFICATION CODE</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <input 
                                                required
                                                type="text" 
                                                maxLength={6}
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4.5 pl-14 pr-6 text-white text-base tracking-[0.8em] font-mono placeholder:text-white/20 focus:outline-none focus:border-[#d4af37] transition-all"
                                                placeholder="0 0 0 0 0 0"
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full h-16 bg-gradient-to-r from-[#ff512f] to-[#fdd835] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(255,81,47,0.35)] group mt-10">
                                        <CheckCircle2 size={24} className="text-black" />
                                        <span className="text-black font-black text-xl">Verify & Join</span>
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Footer Section */}
                        <div className="mt-10 pt-8 border-t border-[#d4af37]/20 text-center">
                            <p className="text-sm text-gray-300">
                                {mode === 'login' ? (
                                    <>
                                        New to Longrise? <button onClick={() => setMode('signup')} className="text-[#d4af37] font-bold hover:underline transition-all">Create Account</button>
                                    </>
                                ) : (
                                    <>
                                        Already a VIP member? <button onClick={resetSignup} className="text-[#d4af37] font-bold hover:underline transition-all">Access Portfolio</button>
                                    </>
                                )}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

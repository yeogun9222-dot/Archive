import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ShoppingCart,
  Gift,
  Wallet,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  Settings,
  ShieldCheck,
  MessageCircle,
  Newspaper,
  Cpu,
  ArrowDown,
  ArrowUp,
  RefreshCcw,
  Crown,
  Star,
  AlertCircle,
  Gem,
  ArrowRight,
  ChevronDown,
  Timer,
  LogIn,
  Mail,
  Check,
  UserCheck,
  Rocket,
  Key,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

import { NetworkOverlay } from './components/VisualEffects';

// --- Page Components ---
import { HomePage } from './components/HomePage';
import { CryptoAIPage } from './components/CryptoAIPage';
import { RewardsPage } from './components/RewardsPage';
import { WalletPage } from './components/WalletPage';
import { ProfilePage } from './components/ProfilePage';
import { SecurityPage } from './components/SecurityPage';
import { SupportPage } from './components/SupportPage';
import { NoticesPage } from './components/NoticesPage';
import { CNYTMarketPage } from './components/CNYTMarketPage';
import { PlatformSettingsPage } from './components/PlatformSettingsPage';
import { PackageSection } from './components/PackageSection';
import { PackagesPage } from './components/PackagesPage';
import { AboutLongrisePage } from './components/AboutLongrisePage';
import { VIPEntranceModal } from './components/VIPEntranceModal';

// --- Shared Types & Mock Data ---
import { UserData } from './shared/types';
import { SHARED_MOCK_USERS } from './shared/mockData';

// --- Types ---
const LANGUAGES = [
  { name: 'Macanese', flag: '🇲🇴', code: 'MO' },
  { name: 'Filipino', flag: '🇵🇭', code: 'PH' },
  { name: 'Vietnamese', flag: '🇻🇳', code: 'VN' },
  { name: 'Georgian', flag: '🇬🇪', code: 'GE' },
  { name: 'USA', flag: '🇺🇸', code: 'EN' },
  { name: 'Chinese', flag: '🇨🇳', code: 'CN' },
  { name: 'Korean', flag: '🇰🇷', code: 'KR' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Deposit Successful', time: '2 mins ago', read: false, type: 'wallet' },
  { id: 2, title: 'Reward Paid: $4.20 USDT', time: '1 hour ago', read: false, type: 'reward' },
  { id: 3, title: 'Security Alert: New Login', time: '5 hours ago', read: true, type: 'security' },
  { id: 4, title: 'Network Maintenance Notice', time: '1 day ago', read: true, type: 'system' },
];

type View = 'home' | 'crypto-ai' | 'packages' | 'rewards' | 'wallet' | 'profile' | 'security' | 'support' | 'notices' | 'settings' | 'cnyt-market' | 'about';

// --- Constants ---

const PACKAGE_POLICY = {
  flexible: { usdt: 4, cnyt: 0, penalty: { '1-12': 0 }, maturity: 'Immediate', min: 100 },
  basic: { usdt: 7, cnyt: 2, penalty: { '1-6': 30, '7-9': 20, '10-11': 15 }, maturity: '12 Months', min: 200 },
  standard: { usdt: 9, cnyt: 4, penalty: { '1-6': 30, '7-9': 20, '10-11': 15 }, maturity: '12 Months', min: 500 },
  premium: { usdt: 11, cnyt: 6, penalty: { '1-6': 30, '7-9': 20, '10-11': 15 }, maturity: '12 Months', min: 1000 },
  vip: { usdt: 18, cnyt: 10, penalty: { '1-6': 30, '7-9': 20, '10-11': 15 }, maturity: '12 Months', min: 5000 },
};

// --- Components ---

const InvestmentModal = ({ pkgId, onClose, onConfirm }: { pkgId: string, onClose: () => void, onConfirm: () => void }) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const policy = PACKAGE_POLICY[pkgId as keyof typeof PACKAGE_POLICY];
  
  const monthlyUsdt = (policy.usdt / 100) * policy.min;
  const monthlyCnyt = (policy.cnyt / 100) * policy.min;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-md relative z-10 border border-luxury-gold/30 p-8 rounded-2xl"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest">{pkgId} PACKAGE</h2>
              <div className="text-luxury-gold text-[10px] font-bold tracking-[0.3em] mt-1">INVESTMENT SUMMARY</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase">Initial Deposit</span>
                <span className="text-2xl font-mono font-black text-white">${policy.min}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase">Monthly USDT</span>
                <span className="text-xl font-mono font-black text-green-400">+${monthlyUsdt.toLocaleString()}</span>
              </div>
              {policy.cnyt > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-bold uppercase">Monthly CNYT</span>
                  <span className="text-xl font-mono font-black text-luxury-gold">+{monthlyCnyt.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-xs text-center justify-center">
                <Timer size={14} className="text-luxury-gold" />
                <span>Contract Period: {policy.maturity}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl bg-luxury-gold text-black font-black text-xs tracking-[0.3em] hover:scale-105 transition-all"
            >
              INVEST NOW
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
              <h3 className="text-xl font-black text-white">Cancellation Policy</h3>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="text-[10px] font-black text-red-400 tracking-widest uppercase mb-2">Early Withdrawal Penalty</div>
              {Object.entries(policy.penalty).map(([range, fee]) => (
                <div key={range} className="flex justify-between text-xs">
                  <span className="text-gray-400">{range} Months</span>
                  <span className="text-red-400 font-bold">{fee}% Penalty</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                <span className="text-gray-300">12 Months</span>
                <span className="text-green-400 font-bold">Safe (0% Fee)</span>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-2 translate-x-[-8px]">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-luxury-gold"
              />
              <span className="text-[11px] text-gray-400 leading-snug">
                I agree to the V7.2 asset management policy and understand the withdrawal fees.
              </span>
            </label>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-xl bg-white/5 text-gray-400 font-bold text-[10px] tracking-widest"
              >
                BACK
              </button>
              <button 
                disabled={!agreed}
                onClick={onConfirm}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                  agreed ? 'bg-luxury-gold text-black' : 'bg-gray-800 text-gray-600'
                }`}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Navbar = ({ currentView, setCurrentView, user, isLoggedIn, onLoginClick, onLogout }: { 
  currentView: View, 
  setCurrentView: (v: View) => void, 
  user: UserData, 
  isLoggedIn: boolean,
  onLoginClick: () => void,
  onLogout: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'crypto-ai', label: 'CRYPTO AI', icon: Zap },
    { id: 'packages', label: 'PACKAGES', icon: ShoppingCart },
    { id: 'rewards', label: 'REWARDS', icon: Gift },
    { id: 'cnyt-market', label: 'MARKET', icon: Gem },
    { id: 'wallet', label: 'WALLET', icon: Wallet },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 flex items-center justify-between px-6 lg:px-10 h-20 lg:h-24 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      {/* Left: Branding */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
        <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-luxury-gold to-yellow-800 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform">
          <Cpu className="text-black w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <span className="font-serif text-xl lg:text-2xl font-bold text-luxury-gold tracking-widest hidden sm:block">LONGRISE</span>
      </div>

      {/* Center: Main Navigation */}
      <div className="hidden lg:flex items-center gap-2 xl:gap-3">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setCurrentView(item.id as View)}
            className={`px-4 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border-[1.5px] ${
              currentView === item.id 
                ? 'bg-red-600/10 text-white border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                : 'bg-transparent text-gray-300 border-red-900/40 hover:text-white hover:border-red-600/60'
            }`}
          >
            <item.icon size={16} className="text-white" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-6">
        <div className="flex items-center gap-4 p-1 bg-black/40 border border-white/5 rounded-xl">
           {/* Connect Web3 */}
           <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all group">
             <LinkIcon size={16} className="text-gray-400 group-hover:text-white" />
             <span className="text-[11px] font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">Connect Web3</span>
           </button>

           <div className="h-4 w-[1px] bg-white/10"></div>

           {/* User Profile / Login */}
           {!isLoggedIn ? (
             <button 
               onClick={onLoginClick}
               className="px-6 py-2 rounded-lg text-[12px] font-black tracking-widest bg-gradient-to-r from-[#f12711] to-[#f5af19] text-white hover:scale-105 shadow-lg transition-all flex items-center gap-2"
             >
               <LogIn size={18} className="rotate-0"/> LOGIN
             </button>
           ) : (
             <div className="relative">
               <button 
                 onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                 className="flex items-center gap-3 px-2 group"
               >
                  <div className="text-right">
                    <p className="text-[9px] text-luxury-gold font-bold tracking-tighter uppercase">{user.rank}</p>
                    <p className="text-[12px] font-black text-white leading-none whitespace-nowrap">{user.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-luxury-gold to-yellow-300 p-[1px] group-hover:scale-110 transition-transform">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                       <User size={16} className="text-luxury-gold" />
                     </div>
                  </div>
               </button>

               {/* Profile Dropdown Menu */}
               <AnimatePresence>
                 {activeDropdown === 'profile' && (
                   <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-[#1a0505] border border-luxury-gold/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                      
                      <div className="space-y-1 relative z-10">
                        {[
                          { id: 'profile', label: 'My Profile', icon: User },
                          { id: 'security', label: 'Security Center', icon: ShieldCheck },
                          { id: 'notices', label: 'News & Updates', icon: Newspaper },
                          { id: 'support', label: 'Support Tickets', icon: MessageCircle },
                          { id: 'settings', label: 'Platform Settings', icon: Settings },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentView(item.id as View);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-luxury-gold/10 flex items-center justify-center group-hover:border-luxury-gold/40 transition-colors">
                              <item.icon size={18} className="text-luxury-gold" />
                            </div>
                            <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                          </button>
                        ))}
                        
                        <div className="my-2 h-px bg-white/5 mx-2" />
                        
                        <button
                          onClick={() => {
                            onLogout();
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-900/10 border border-red-900/20 flex items-center justify-center group-hover:border-red-500/40 transition-colors">
                            <LogOut size={18} className="text-red-500" />
                          </div>
                          <span className="text-[13px] font-bold tracking-tight">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                   </>
                 )}
               </AnimatePresence>
             </div>
           )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
              className={`relative p-2 transition-colors ${activeDropdown === 'notifications' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse border border-black"></span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'notifications' && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#1a0505] border border-luxury-gold/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60]"
                  >
                    <div className="flex justify-between items-center mb-4 px-2">
                       <h3 className="text-white font-black text-sm uppercase tracking-widest">Messages</h3>
                       <button className="text-[10px] text-luxury-gold font-bold hover:underline">Mark all as read</button>
                    </div>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      {MOCK_NOTIFICATIONS.map((notif) => (
                        <div key={notif.id} className={`p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group ${!notif.read ? 'bg-white/[0.02]' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                              notif.type === 'wallet' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                              notif.type === 'reward' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                              'bg-blue-500/10 border-blue-500/20 text-blue-500'
                            }`}>
                               <Bell size={14} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-[12px] font-bold ${!notif.read ? 'text-white' : 'text-gray-400'} group-hover:text-luxury-gold transition-colors`}>{notif.title}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-3 rounded-xl bg-white/5 text-[11px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">
                      View All Activity
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
              className={`p-2 transition-colors flex items-center gap-2 group ${activeDropdown === 'language' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{selectedLang.flag}</span>
              <Globe size={18} />
              <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === 'language' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'language' && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-16 bg-black border border-luxury-gold/50 rounded-2xl py-3 px-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang);
                            setActiveDropdown(null);
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 group ${
                            selectedLang.code === lang.code ? 'bg-white/5 border border-luxury-gold/30' : ''
                          }`}
                          title={lang.name}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Trigger */}
      <button className="lg:hidden text-luxury-gold p-2" onClick={() => setActiveDropdown('mobile')}>
        <Menu size={28} />
      </button>

      {/* Mobile Drawer (simplified for this task) */}
      <AnimatePresence>
        {activeDropdown === 'mobile' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDropdown(null)}
              className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-xl"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-black border-l border-white/10 z-[101] p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="font-serif text-xl font-bold text-luxury-gold">LONGRISE</span>
                <button onClick={() => setActiveDropdown(null)} className="text-white"><X size={28} /></button>
              </div>
              <div className="flex flex-col gap-4">
                {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { setCurrentView(item.id as View); setActiveDropdown(null); }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 text-gray-300 font-bold uppercase tracking-widest text-sm"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-white/10">
                 {!isLoggedIn ? (
                   <button 
                    onClick={() => { onLoginClick(); setActiveDropdown(null); }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f12711] to-[#f5af19] text-white font-black tracking-widest uppercase"
                   >
                     LOGIN
                   </button>
                 ) : (
                   <button onClick={onLogout} className="w-full py-4 border border-red-600/30 text-red-500 font-bold rounded-xl uppercase">Logout</button>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

const BottomTabBar = ({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) => {
  const items = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'packages', label: 'INVEST', icon: ShoppingCart },
    { id: 'wallet', label: 'WALLET', icon: Wallet },
    { id: 'rewards', label: 'TEAM', icon: Users },
    { id: 'profile', label: 'MY', icon: User },
  ];

  function Home(props: any) { return <Cpu {...props} />; }
  function Users(props: any) { return <Gift {...props} />; }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-luxury-red-dark/95 backdrop-blur-xl border-t border-luxury-gold/20 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => setCurrentView(item.id as View)}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
            currentView === item.id ? 'text-luxury-gold' : 'text-gray-500'
          }`}
        >
          <item.icon size={24} className={currentView === item.id ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]' : ''}/>
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData>(SHARED_MOCK_USERS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup' | 'verify' | 'success'>('login');
  const [emailForSignup, setEmailForSignup] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setCurrentView('home');
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  const handleSignupInit = () => {
    if (!emailForSignup.includes('@')) return;
    setModalMode('verify');
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') {
      setModalMode('success');
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        setModalMode('login');
        setCurrentView('home');
      }, 2000);
    } else {
      alert('Invalid verification code. Please try 123456 for demo.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('home');
    setSelectedPkg(null);
  };

  const handlePackageSelect = (pkgId: string) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedPkg(pkgId);
    }
  };

  const handleInvestmentConfirm = () => {
    setSelectedPkg(null);
    setCurrentView('wallet');
  };

  return (
    <div className="min-h-screen relative">
      <NetworkOverlay intensity={0.5} speed={0.3} />
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user} 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="pb-24 lg:pb-0">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
             <HomePage 
               onLoginClick={() => setIsLoginModalOpen(true)} 
               onSelectPackage={handlePackageSelect} 
               onAboutClick={() => setCurrentView('about')}
             />
          )}

          {currentView === 'about' && (
            <AboutLongrisePage onBack={() => setCurrentView('home')} />
          )}

          {currentView === 'packages' && (
            <motion.div 
              key="packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PackagesPage onInvestClick={handlePackageSelect} />
            </motion.div>
          )}

          {currentView === 'crypto-ai' && <CryptoAIPage onUpgrade={() => setCurrentView('packages')} />}
          {currentView === 'rewards' && <RewardsPage user={user} onUpdateUser={handleUpdateUser} onSetView={setCurrentView} />}
          {currentView === 'wallet' && <WalletPage user={user} onSetView={setCurrentView} />}
          {currentView === 'profile' && <ProfilePage user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />}
          {currentView === 'security' && <SecurityPage user={user} onUpdateUser={handleUpdateUser} />}
          {currentView === 'support' && <SupportPage />}
          {currentView === 'notices' && <NoticesPage />}
          {currentView === 'cnyt-market' && <CNYTMarketPage />}
          {currentView === 'settings' && <PlatformSettingsPage user={user} />}
        </AnimatePresence>
      </main>

      <BottomTabBar currentView={currentView} setCurrentView={setCurrentView} />

      <AnimatePresence>
        {selectedPkg && (
          <InvestmentModal 
            pkgId={selectedPkg} 
            onClose={() => setSelectedPkg(null)} 
            onConfirm={handleInvestmentConfirm}
          />
        )}
      </AnimatePresence>

      <footer className="bg-luxury-red-dark border-t border-luxury-gold/10 pt-16 pb-32 lg:pb-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                <Cpu size={20} className="text-black"/>
              </div>
              <span className="font-serif font-bold text-2xl text-white tracking-widest">LONGRISE</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              The world's first AI-driven integrated wealth management platform connecting Crypto and Institutional assets with premium financial services.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button className="hover:text-luxury-gold transition-colors" onClick={() => setCurrentView('crypto-ai')}>Crypto AI Trading</button></li>
              <li><button className="hover:text-luxury-gold transition-colors" onClick={() => setCurrentView('packages')}>VIP Packages</button></li>
              <li><button className="hover:text-luxury-gold transition-colors" onClick={() => setCurrentView('rewards')}>Rewards Program</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button className="hover:text-luxury-gold transition-colors">Help Center</button></li>
              <li><button className="hover:text-luxury-gold transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-luxury-gold transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-gray-600">© 2026 LONGRISE AI. All rights reserved. | V6.0 Master Plan Edition</p>
        </div>
      </footer>

      {/* Premium VIP Entrance Modal */}
      <VIPEntranceModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

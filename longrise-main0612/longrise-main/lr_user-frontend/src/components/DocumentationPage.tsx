import { useState } from 'react';
import { motion } from 'motion/react';
import { ReferralProgramPage } from './ReferralProgramPage';
import { BookOpen, Zap, Users, HelpCircle, ChevronRight, FileText, ChevronDown, Cpu, Rocket, TrendingUp, Shield, Layers, Database, Share2, Download, ExternalLink } from 'lucide-react';

type DocSection = 'overview' | 'getting-started' | 'user-guide' | 'faq' | 'whitepaper' | 'guide-commission' | 'guide-rank' | 'guide-signup' | 'guide-invest' | 'guide-deposit' | 'guide-withdraw' | 'roadmap' | 'referral-program';

interface MenuItem {
  id: DocSection;
  label: string;
  icon?: any;
  children?: MenuItem[];
}

export const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const whitepaperDownloadUrl = `${import.meta.env.VITE_API_BASE_URL}/content/whitepaper`;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const sections: MenuItem[] = [
    { id: 'overview', label: 'Introduction', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'user-guide', label: 'User Guide', icon: Users },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'whitepaper', label: 'Whitepaper', icon: FileText },
    {
      id: 'guide-commission',
      label: 'Guides',
      icon: BookMarked,
      children: [
        { id: 'guide-commission', label: 'Commission System' },
        { id: 'guide-rank', label: 'Rank System' },
        { id: 'guide-signup', label: 'How to Sign Up' },
        { id: 'guide-invest', label: 'How to Invest' },
        { id: 'guide-deposit', label: 'How to Deposit' },
        { id: 'guide-withdraw', label: 'How to Withdraw' },
      ],
    },
    { id: 'roadmap', label: 'Project Roadmap', icon: Rocket },
    { id: 'referral-program', label: 'Referral Program', icon: Share2 },
  ];

  function BookMarked(props: any) {
    return <BookOpen {...props} />;
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4 max-w-6xl mx-auto"
      >
        <h1 className="text-5xl lg:text-6xl font-serif font-black text-white italic">
          Documentation
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Everything you need to know about LONGRISE AI and how to get started
        </p>
      </motion.div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-panel p-6 rounded-2xl border border-white/5 sticky top-32 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-widest text-luxury-gold mb-4">
              Sections
            </h3>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isMenuExpanded = expandedMenus.includes(section.id);
              const hasChildren = section.children && section.children.length > 0;

              return (
                <div key={section.id}>
                  <motion.button
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(section.id);
                      } else {
                        setActiveSection(section.id as DocSection);
                      }
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                      isActive && !hasChildren
                        ? 'bg-luxury-gold/20 border border-luxury-gold/50 text-luxury-gold'
                        : 'border border-white/10 text-gray-400 hover:border-luxury-gold/30 hover:text-gray-300'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-black uppercase tracking-wider flex-1">
                      {section.label}
                    </span>
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`flex-shrink-0 transition-transform ${isMenuExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </motion.button>

                  {/* Submenu */}
                  {hasChildren && isMenuExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1 pl-4"
                    >
                      {section.children.map((child) => {
                        const isChildActive = activeSection === child.id;
                        return (
                          <motion.button
                            key={child.id}
                            onClick={() => setActiveSection(child.id as DocSection)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-left text-xs ${
                              isChildActive
                                ? 'bg-luxury-gold/20 border border-luxury-gold/50 text-luxury-gold'
                                : 'border border-white/10 text-gray-400 hover:border-luxury-gold/30 hover:text-gray-300'
                            }`}
                          >
                            <ChevronRight size={14} className="flex-shrink-0" />
                            <span className="font-black uppercase tracking-wider">
                              {child.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 glass-panel p-10 lg:p-16 rounded-2xl border border-white/5 space-y-8"
        >
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-8 -mx-10 -mt-16">
              {/* Large Hero Banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-80 rounded-xl overflow-hidden border-b-4 border-luxury-gold/50"
              >
                {/* Gradient Background with Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-luxury-gold opacity-40"></div>

                {/* Animated Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-10 right-20 text-9xl opacity-20"
                >
                  🐉
                </motion.div>

                {/* Tech Lines Animation */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EAB308" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <motion.line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.line
                    x1="100%"
                    y1="0"
                    x2="0"
                    y2="100%"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </svg>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-6xl font-serif font-black text-white mb-4 italic drop-shadow-lg">
                      LONGRISE AI
                    </h1>
                    <p className="text-2xl text-luxury-gold font-black drop-shadow-lg">
                      Next-Generation Trading Intelligence
                    </p>
                  </motion.div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
              </motion.div>

              {/* Brief Description */}
              <div className="px-10 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl font-black text-white">Welcome to LONGRISE</h2>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    LONGRISE AI is an advanced artificial intelligence-driven trading platform that combines cutting-edge machine learning with quantitative analysis. Powered by NVIDIA's enterprise-grade GPUs and trained on billions of market data points, our Red Dragon engine delivers consistent, institutional-quality returns.
                  </p>
                  <p className="text-base text-gray-400 leading-relaxed">
                    With a proven 71-76% win rate and daily ROI ranging from 0.8% to 2.5%, LONGRISE transforms the future of automated wealth management by leveraging global exchange data, behavioral analytics, and sophisticated risk management protocols.
                  </p>
                </motion.div>

                {/* Key Metrics Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-4 gap-4 py-6 border-y border-white/10"
                >
                  <div className="text-center">
                    <div className="text-3xl font-black text-red-500">76%</div>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-luxury-gold">2.5%</div>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Daily ROI</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400">10K+</div>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Signals/Sec</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400">&lt;1ms</div>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Latency</p>
                  </div>
                </motion.div>
              </div>

              {/* Technology Cards Grid */}
              <div>
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Cpu className="text-luxury-gold" size={28} />
                  Advanced Technology Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-luxury-gold/20 rounded-lg">
                        <Rocket size={24} className="text-luxury-gold" />
                      </div>
                      <h4 className="text-lg font-black text-white">V6 Neural Engine</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Next-generation deep learning architecture powered by NVIDIA H100 Tensor Core GPUs. Quantum-optimized algorithms process market data at unprecedented speeds.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full">NVIDIA H100</span>
                      <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full">TensorFlow 2.14</span>
                    </div>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-luxury-gold/20 rounded-lg">
                        <Database size={24} className="text-luxury-gold" />
                      </div>
                      <h4 className="text-lg font-black text-white">Global Data Fusion</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Real-time analysis of Top 5 exchanges: Binance • Coinbase • Kraken • Kucoin • Bittrex. 500M+ daily data points processed.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full">Binance</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Coinbase</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Kraken</span>
                    </div>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-luxury-gold/20 rounded-lg">
                        <Layers size={24} className="text-luxury-gold" />
                      </div>
                      <h4 className="text-lg font-black text-white">Behavioral Analytics</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Integrates historical gaming probability data from regulated casinos: Georgia • Danang • Ho Chi Minh City • Philippines • Cambodia
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">Probability AI</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">78-82% Accuracy</span>
                    </div>
                  </motion.div>

                  {/* Card 4 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-luxury-gold/20 rounded-lg">
                        <TrendingUp size={24} className="text-luxury-gold" />
                      </div>
                      <h4 className="text-lg font-black text-white">Profit Realization</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Three-tier model: CEX Arbitrage (0.1-0.3%) • Swing Trading (2-48hrs) • Options Premium Selling
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Multi-Strategy</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">USDT + CNYT</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Performance Metrics */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-luxury-gold/10 to-red-900/10 border border-luxury-gold/30 rounded-xl p-8"
              >
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                  <TrendingUp className="text-luxury-gold" size={28} />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-luxury-gold mb-2">71-76%</div>
                    <p className="text-sm text-gray-400">Win Rate on Trades</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-red-400 mb-2">0.8-2.5%</div>
                    <p className="text-sm text-gray-400">Daily ROI Range</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-green-400 mb-2">10,000+</div>
                    <p className="text-sm text-gray-400">Signals Per Second</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-blue-400 mb-2">&lt;1ms</div>
                    <p className="text-sm text-gray-400">Latency Execution</p>
                  </div>
                </div>
              </motion.div>

              {/* Technology Stack */}
              <div>
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Shield className="text-luxury-gold" size={28} />
                  Enterprise Technology Stack
                </h3>
                <div className="bg-black/40 border border-white/10 rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">Hardware</p>
                        <p className="text-sm text-gray-400">NVIDIA H100 Tensor Core • Quantum Co-processors • Multi-GPU Clustering</p>
                      </div>
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">AI Framework</p>
                        <p className="text-sm text-gray-400">TensorFlow 2.14 • Custom LSTM Networks • Attention Mechanisms</p>
                      </div>
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">Data Pipeline</p>
                        <p className="text-sm text-gray-400">Real-time Kafka Streaming • Apache Spark • Bloomberg Terminal API</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">Security</p>
                        <p className="text-sm text-gray-400">Military-Grade Encryption • Smart Contract Escrow • Multi-Sig Wallets</p>
                      </div>
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">Infrastructure</p>
                        <p className="text-sm text-gray-400">AWS • Azure • Multi-Cloud • 4 Continents • 99.99% Uptime</p>
                      </div>
                      <div>
                        <p className="text-xs text-luxury-gold font-black uppercase tracking-widest mb-2">Blockchain</p>
                        <p className="text-sm text-gray-400">Ethereum • Polygon • Settlement Verification • Immutable Records</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dragon Symbol Footer */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-center text-7xl opacity-20"
              >
                🐉
              </motion.div>
            </div>
          )}

          {/* Getting Started Section */}
          {activeSection === 'getting-started' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">Getting Started</h2>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0 text-luxury-gold font-black">1</div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">Create Your Account</h4>
                      <p className="text-gray-400">Sign up with your email and set up your trading password for secure transactions. Verification takes just a few minutes.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0 text-luxury-gold font-black">2</div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">Fund Your Wallet</h4>
                      <p className="text-gray-400">Deposit USDT to your wallet. We support deposits from all major exchanges and payment methods. Minimum deposit varies by package tier.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0 text-luxury-gold font-black">3</div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">Select Your Package</h4>
                      <p className="text-gray-400">Choose from our premium packages: Flexible, Basic, Standard, Premium, or VIP. Each offers different returns and benefits.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0 text-luxury-gold font-black">4</div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">Start Earning</h4>
                      <p className="text-gray-400">Your AI portfolio begins trading immediately. Watch daily ROI credits appear in real-time and track your profits in the dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Guide Section */}
          {activeSection === 'user-guide' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">User Guide</h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">Dashboard Overview</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Your main dashboard displays your total assets, daily ROI, current CNYT balance, and win rate. This is your command center for monitoring portfolio performance and market insights.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">Managing Your Packages</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-3">
                      <ChevronRight size={20} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                      <span>View active and completed packages in your Purchase History</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight size={20} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                      <span>Track maturity dates and remaining active investment periods</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight size={20} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                      <span>Early termination available with standard 15% penalty</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">Withdrawals & Transfers</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Process withdrawals from your available balance anytime. Batch processing occurs daily with instant confirmation. Minimum withdrawal amounts vary by account tier.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">Security Settings</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Set up your trading password and enable Google Authenticator 2FA in Security Settings. These are critical for protecting your account from unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="space-y-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-luxury-gold/20 rounded-xl">
                    <HelpCircle size={32} className="text-luxury-gold" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-serif font-black text-white">FAQs</h2>
                    <p className="text-gray-400 text-lg mt-1">Frequently Asked Questions</p>
                  </div>
                </div>

                {/* FAQ Categories Introduction */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <p className="text-gray-300">We offer two FAQ sections for your convenience:</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-gray-400">
                      <span className="text-luxury-gold font-black">👥</span>
                      <span className="font-black text-luxury-gold cursor-default">User FAQs</span>
                      <span className="text-gray-500">- Questions about accounts, deposits, withdrawals, and packages</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                      <span className="text-luxury-gold font-black">📊</span>
                      <span className="font-black text-luxury-gold cursor-default">Project FAQs</span>
                      <span className="text-gray-500">- Questions about LONGRISE technology, strategy, and vision</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* User FAQs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-luxury-gold to-red-500 rounded-full"></div>
                  <h3 className="text-3xl font-black text-white">User FAQs</h3>
                </div>

                <div className="space-y-4">
                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How is daily ROI calculated?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Daily ROI is calculated based on your package tier, market performance, and the AI core's trading success rate. Returns are credited daily at 00:00 UTC and appear instantly in your dashboard. The calculation factors in the current market volatility, your invested amount, and the AI engine's confidence level.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      What are the minimum deposit requirements?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Minimum deposits vary by package: Flexible ($200), Basic ($500), Standard ($800), Premium ($1,000), and VIP ($2,500+). You can add funds to your account at any time without penalty. Each tier unlocks additional features and higher potential returns.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      Can I withdraw my profits anytime?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Yes. You can withdraw from your available USDT balance anytime without restrictions. Daily dividends are transferred to your available balance upon crediting. Withdrawal batch processing occurs once daily at 18:00 UTC and funds are transferred within 24 hours.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      What happens if I terminate my package early?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Early termination incurs a 15% capital loss penalty that is retained by the platform. All future daily dividends and CNYT token rewards are forfeited immediately. This action cannot be reversed after confirmation, so please consider carefully before terminating.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How do referral bonuses work?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Earn direct referral bonuses when your network makes deposits. You also earn 10% matching commissions from their daily earnings and participate in the global pool distribution monthly. Your network tier determines commission percentages and pool eligibility.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How secure is my account?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      All accounts are protected by trading passwords and optional 2FA via Google Authenticator. Your capital is held in multi-signature smart contract escrow systems and all transactions are recorded on-chain for transparency. We conduct monthly security audits.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      Is there a lockup period for my investments?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      No lockup period exists. You can terminate your package and withdraw your capital (minus any applicable penalties) at any time. However, keeping your package active allows you to accumulate CNYT rewards and participate in compounding benefits.
                    </p>
                  </details>
                </div>
              </motion.div>

              {/* Project FAQs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-luxury-gold to-red-500 rounded-full"></div>
                  <h3 className="text-3xl font-black text-white">Project FAQs</h3>
                </div>

                <div className="space-y-4">
                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How does the Red Dragon AI engine work?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      The Red Dragon engine is a V6 neural architecture powered by NVIDIA H100 Tensor Core GPUs. It processes 500M+ daily data points from the top 5 exchanges using quantum-optimized algorithms. The system combines machine learning with behavioral analytics trained on casino probability data for market pattern recognition.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      What is CNYT and how does it work?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      CNYT is LONGRISE's native reward token distributed to users for maintaining active packages and generating referral volume. Tokens accumulate daily based on your investment tier and can be held for future appreciation, used for package upgrades, or traded on secondary markets. Supply is capped at 1 billion tokens.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How does LONGRISE ensure consistent returns in volatile markets?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Our three-tier profit strategy includes CEX Arbitrage (0.1-0.3% daily), Swing Trading (2-48 hour positions), and Options Premium Selling (covered strategies). The AI selects the most optimal strategy for each market condition. A circuit breaker system halts trading if conditions become unfavorable, protecting capital.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      Is LONGRISE regulated or licensed?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      LONGRISE operates as a decentralized autonomous organization (DAO) across multiple jurisdictions. While not regulated as a traditional financial institution, we maintain compliance with local laws in each operating region and conduct third-party security audits quarterly. User funds are protected by multi-signature blockchain escrow.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      What is the long-term vision for LONGRISE?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Our roadmap targets global domination of AI-driven trading by 2027. This includes expanding to 50+ exchanges, reaching 1M active users, launching proprietary blockchain, and establishing partnerships with major financial institutions. The platform aims to democratize institutional-grade trading intelligence for retail investors worldwide.
                    </p>
                  </details>

                  <details className="group border border-white/10 rounded-xl p-6 cursor-pointer hover:border-luxury-gold/30 transition-all">
                    <summary className="flex items-center justify-between text-lg font-black text-white">
                      How can I get involved in the LONGRISE community?
                      <span className="text-luxury-gold group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      Join our community Discord for daily trading insights, webinars, and networking with other members. Participate in governance votes through the DAO framework, submit feature requests, and contribute to ecosystem development. Top community contributors receive additional CNYT token rewards and recognition.
                    </p>
                  </details>
                </div>
              </motion.div>
            </div>
          )}

          {/* Whitepaper Section */}
          {activeSection === 'whitepaper' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">Whitepaper</h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between hover:border-luxury-gold/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-luxury-gold/20 rounded-xl">
                    <FileText size={32} className="text-luxury-gold" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">LONGRISE Master Plan V8.9</h3>
                    <p className="text-gray-400 leading-relaxed max-w-2xl">
                      Download or open the approved LONGRISE V8.9 master plan document served by the platform API.
                    </p>
                    <p className="text-sm text-gray-500 font-mono break-all">{whitepaperDownloadUrl}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
                  <a
                    href={whitepaperDownloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-luxury-gold px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105"
                  >
                    <Download size={18} />
                    Download Document
                  </a>
                  <a
                    href={whitepaperDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/30 px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-300 transition-all hover:border-luxury-gold/40 hover:text-luxury-gold"
                  >
                    <ExternalLink size={18} />
                    Open
                  </a>
                </div>
              </motion.div>
            </div>
          )}

          {/* Guide Sections */}
          {activeSection === 'guide-commission' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">Commission System</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - COMMISSION SYSTEM GUIDE
=====================================

1. DIRECT REFERRAL COMMISSION
When you refer a user and they make a deposit:
- Earn 5-10% direct commission based on their package tier
- Flexible Package: 5% commission
- Basic Package: 6% commission
- Standard Package: 7% commission
- Premium Package: 8% commission
- VIP Package: 10% commission

2. MATCHING COMMISSION
Earn from your referral's earnings:
- Earn 20-30% of your direct referral's daily ROI
- Flexible Package: 20% matching
- Basic Package: 22% matching
- Standard Package: 25% matching
- Premium Package: 28% matching
- VIP Package: 30% matching

3. GLOBAL POOL DISTRIBUTION
Monthly distribution from the platform's profit pool:
- Share in monthly global pool rewards
- Distribution based on your rank and referral network size
- Minimum referral count required varies by rank

4. BONUSES & INCENTIVES
Special bonuses available:
- Sign-up bonus: $50 CNYT upon registration
- First deposit bonus: Extra 5% credit
- Referral milestone bonuses at 5, 10, 20 referrals
- Performance bonuses for top performers

5. WITHDRAWAL OF COMMISSIONS
Commission withdrawal rules:
- Commissions credited to your account daily
- Minimum withdrawal: $50 USDT
- Withdrawal fee: 1-2% depending on method
- Processing time: 24 hours batch processing`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'guide-rank' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">Rank System</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - RANK SYSTEM GUIDE
================================

1. MEMBER RANKS
LONGRISE has 6 membership levels with progressive benefits:

RANK 1: BRONZE (Entry Level)
- Minimum deposit: $200
- Daily ROI: 0.5-1.2%
- Commission: Standard rates
- Benefits: Basic portfolio access, daily reports

RANK 2: SILVER (Active Member)
- Minimum referrals: 3
- Minimum team deposit: $5,000
- Daily ROI: 1.2-1.5%
- Commission: +2% bonus on referrals
- Benefits: Enhanced analytics, priority support

RANK 3: GOLD (Professional)
- Minimum referrals: 10
- Minimum team deposit: $50,000
- Daily ROI: 1.5-2.0%
- Commission: +5% bonus + matching upgrade
- Benefits: Dedicated account manager, weekly insights

RANK 4: PLATINUM (Elite)
- Minimum referrals: 25
- Minimum team deposit: $250,000
- Daily ROI: 2.0-2.5%
- Commission: +10% bonus, 35% matching
- Benefits: VIP trading signals, monthly strategy session

RANK 5: DIAMOND (Master)
- Minimum referrals: 50
- Minimum team deposit: $1,000,000
- Daily ROI: 2.5-3.0%
- Commission: +15% bonus, 40% matching
- Benefits: Private wealth advisor, custom strategies

RANK 6: CROWN (Founder)
- Minimum referrals: 100+
- Minimum team deposit: $5,000,000+
- Daily ROI: 3.0%+
- Commission: +20% bonus, 50% matching
- Benefits: Executive privileges, profit sharing

2. RANK ADVANCEMENT
- Ranks automatically upgrade when requirements are met
- Ranks never downgrade
- Benefits stack across all previous ranks

3. RANK-SPECIFIC BENEFITS
- Higher ranks unlock better trading conditions
- Access to exclusive investment packages
- Priority withdrawal processing
- Invitations to VIP events`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'guide-signup' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">How to Sign Up</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - HOW TO SIGN UP GUIDE
===================================

STEP 1: CREATE YOUR ACCOUNT
1. Visit LONGRISE platform homepage
2. Click "Sign Up" or "JOIN THE EMPIRE"
3. Enter your email address
4. Enter your verification code (sent to email)
5. Create a secure trading password
6. Confirm your details

STEP 2: COMPLETE YOUR PROFILE
1. Enter your full name
2. Enter your phone number
3. Select your country
4. Set your preferred currency (USDT)
5. Agree to terms and conditions
6. Submit your profile

STEP 3: VERIFY YOUR ACCOUNT
1. Verification email sent to your registered email
2. Click verification link
3. Your account is now active
4. You can now fund your wallet

STEP 4: SET UP SECURITY
1. Go to Security Settings
2. Create a trading password
3. Enable Google Authenticator (2FA)
4. Scan QR code with Google Authenticator app
5. Save backup codes in a safe place
6. Your account is now fully secured

STEP 5: FUND YOUR WALLET
1. Go to Wallet section
2. Click "Deposit"
3. Choose deposit amount
4. Select your wallet or payment method
5. Complete the transaction
6. Funds will appear in your account

IMPORTANT NOTES:
- Keep your trading password safe and secret
- Never share your 2FA codes
- Set a strong, unique password
- Backup your security codes
- Verify all deposit addresses before sending funds`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'guide-invest' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">How to Invest</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - HOW TO INVEST GUIDE
==================================

STEP 1: SELECT YOUR PACKAGE
LONGRISE offers 5 investment packages:

Flexible Package: $200-$9,999
- ROI: 0.8%-1.0% daily
- Duration: Flexible (no lock-in)
- Minimum: $200
- Perfect for beginners

Basic Package: $500-$19,999
- ROI: 1.0%-1.2% daily
- Duration: 30 days
- Minimum: $500
- Good for consistent traders

Standard Package: $800-$49,999
- ROI: 1.2%-1.5% daily
- Duration: 60 days
- Minimum: $800
- Popular choice

Premium Package: $1,000-$99,999
- ROI: 1.5%-1.8% daily
- Duration: 90 days
- Minimum: $1,000
- High performers

VIP Package: $2,500+
- ROI: 2.0%-2.5% daily
- Duration: 180 days
- Minimum: $2,500
- Maximum returns

STEP 2: REVIEW THE TERMS
- Understand the lock-in period
- Review the daily ROI rates
- Check early termination penalties (15%)
- Confirm the maturity date

STEP 3: CONFIRM YOUR INVESTMENT
1. Click "Purchase" on your chosen package
2. Verify the investment details
3. Confirm your trading password
4. Review the 2FA code
5. Click "Confirm Investment"

STEP 4: MONITOR YOUR INVESTMENT
1. Dashboard shows real-time balance
2. Daily ROI credited at 00:00 UTC
3. Check "My Portfolio" for details
4. Track ROI accumulation on the chart

STEP 5: MANAGE YOUR INVESTMENT
- View "Purchase History" anytime
- See maturity dates and countdown
- Check earned rewards
- Reinvest or withdraw when mature

IMPORTANT:
- Early termination incurs 15% penalty
- Daily ROI compounds
- Never click suspicious links
- Only use official LONGRISE platform`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'guide-deposit' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">How to Deposit</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - HOW TO DEPOSIT GUIDE
===================================

BEFORE YOU DEPOSIT:
1. Verify you're on official LONGRISE website
2. Ensure your account is verified
3. Have USDT ready (ERC-20 or TRC-20)
4. Check deposit limits for your rank
5. Enable 2FA before depositing large amounts

STEP 1: ACCESS WALLET
1. Log in to your account
2. Click "Wallet" in main menu
3. Click "Deposit" button
4. Choose "USDT" as currency

STEP 2: SELECT DEPOSIT METHOD
Available methods:
- Direct wallet transfer (USDT)
- Bank transfer (varies by region)
- Credit/Debit card
- Cryptocurrency exchange transfer
- Peer-to-peer transfer

STEP 3: ENTER DEPOSIT AMOUNT
1. Click "Amount" field
2. Enter desired amount in USDT
3. System shows fees (0-2%)
4. Click "Next"

STEP 4: COPY WALLET ADDRESS
1. Receive unique deposit wallet address
2. **IMPORTANT: Copy this address carefully**
3. Address is specific to your account
4. Never send to wrong address

STEP 5: SEND FUNDS
From your exchange or wallet:
1. Choose send/transfer option
2. Paste the LONGRISE wallet address
3. Enter the amount (match exactly)
4. Review transaction
5. Confirm and send

STEP 6: WAIT FOR CONFIRMATION
- Blockchain confirmation: 1-5 minutes
- Account credit: 5-30 minutes
- Check "Wallet" > "Transaction History"
- Funds appear as "Available Balance"

DEPOSIT LIMITS BY RANK:
- Bronze: $200-$5,000
- Silver: $5,000-$20,000
- Gold: $20,000-$100,000
- Platinum: $100,000+
- No maximum limits for Diamond/Crown

DEPOSIT FEES:
- Platform fee: 0% (free deposits)
- Network fee: Varies by blockchain
- Bank transfer: 1-2%
- Card payment: 2-3%

SECURITY REMINDERS:
- Triple-check wallet address
- Use secure internet connection
- Enable 2FA before large deposits
- Verify amount before sending
- Never share your private keys
- Keep proof of transaction`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'guide-withdraw' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-white mb-6">How to Withdraw</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`LONGRISE AI - HOW TO WITHDRAW GUIDE
====================================

WITHDRAWAL REQUIREMENTS:
1. Account must be verified
2. Minimum withdrawal: $50 USDT
3. Available balance must be sufficient
4. No active disputes on account
5. 2FA must be enabled

WITHDRAWAL TYPES:

1. EARNED PROFITS WITHDRAWAL
Your daily ROI dividends can be withdrawn anytime:
- Source: Daily earned commissions and dividends
- Minimum: $50
- Fee: 1-2%
- Processing: 24 hours

2. CAPITAL WITHDRAWAL
Only after your package matures:
- Wait for maturity date to arrive
- Capital becomes "Available Balance"
- Can withdraw anytime after maturity
- No penalty after maturity
- Fee: 1-2%

3. EARLY TERMINATION WITHDRAWAL
Before package maturity (if needed):
- 15% capital loss penalty
- Forfeited future dividends
- CNYT rewards cancelled
- Cannot be reversed
- Only use in emergencies

STEP 1: ACCESS WALLET
1. Log in to your account
2. Click "Wallet"
3. View "Available Balance"
4. Click "Withdraw" button

STEP 2: SELECT WITHDRAWAL METHOD
Options:
- USDT to wallet
- Bank transfer
- Card refund
- Crypto exchange transfer

STEP 3: ENTER WITHDRAWAL DETAILS
1. Enter amount ($50 minimum)
2. Verify withdrawal fee
3. Choose destination wallet/account
4. System calculates final amount
5. Click "Next"

STEP 4: CONFIRM WITHDRAWAL
1. Verify all details are correct
2. Enter your trading password
3. Enter 2FA code
4. Click "Confirm Withdrawal"

STEP 5: PROCESS QUEUE
- Withdrawal enters batch processing
- Daily batch at 00:00-02:00 UTC
- Status: "Processing" → "Sent"
- Track in "Withdrawal History"

STEP 6: RECEIVE FUNDS
- Blockchain transfer: 1-5 minutes
- Bank transfer: 1-3 business days
- Check your wallet/bank account
- Verify amount received

WITHDRAWAL FEES:
- Platform fee: 1-2%
- Network fee: Included
- Bank transfer fee: 0.5-1%
- Card refund: 0%

DAILY/MONTHLY LIMITS:
- Bronze: $200/day, $5,000/month
- Silver: $500/day, $15,000/month
- Gold: $2,000/day, $50,000/month
- Platinum: $5,000/day, $200,000/month
- Diamond: Unlimited
- Crown: Unlimited

SAFETY TIPS:
1. Always verify wallet address
2. Start with small withdrawal first
3. Keep withdrawal receipts
4. Monitor transaction status
5. Report suspicious activity
6. Contact support if unsure

TROUBLESHOOTING:
- Pending over 24 hours? Contact support
- Wrong amount? Check fees deducted
- Wrong wallet? Cannot reverse, contact support
- Funds not received? Verify address on blockchain
- Account locked? Enable 2FA and verify identity`}
                </pre>
              </div>
            </div>
          )}

          {/* Roadmap Section */}
          {activeSection === 'roadmap' && (
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-serif font-black text-white mb-4">Project Roadmap</h2>
                <p className="text-gray-400 text-lg">
                  LONGRISE AI development timeline from 2025 to 2027, featuring infrastructure deployment, testing phases, and live operations.
                </p>
              </motion.div>

              {/* Timeline */}
              <div className="space-y-8">
                {/* 2025 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-32 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg">
                      <h3 className="text-xl font-black text-white">2025</h3>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
                  </div>

                  {/* Q1 2025 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ml-8 bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-blue-500/30 border border-blue-500/50 rounded-full">
                        <span className="text-xs font-black text-blue-300">Q1 2025</span>
                      </div>
                      <span className="text-xs text-gray-400">Mar - May</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Infrastructure & Server Setup</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ Establish AWS/Azure multi-cloud infrastructure</li>
                      <li>✓ Deploy NVIDIA GPU clusters (H100)</li>
                      <li>✓ Build data pipeline architecture</li>
                      <li>✓ Configure blockchain settlement layer</li>
                      <li>✓ Security audit & compliance setup</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">Infrastructure</span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">DevOps</span>
                    </div>
                  </motion.div>

                  {/* Q2 2025 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ml-8 bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full">
                        <span className="text-xs font-black text-purple-300">Q2 2025</span>
                      </div>
                      <span className="text-xs text-gray-400">Jun - Aug</span>
                    </div>
                    <h4 className="text-lg font-black text-white">AI Model Development & Testing</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ V6 Neural Engine model training</li>
                      <li>✓ Integrate CEX exchange data feeds</li>
                      <li>✓ Develop behavioral analytics module</li>
                      <li>✓ Backtesting on 15+ years of data</li>
                      <li>✓ Risk management protocol finalization</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">AI/ML</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">Testing</span>
                    </div>
                  </motion.div>

                  {/* Q3 2025 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="ml-8 bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-yellow-500/30 border border-yellow-500/50 rounded-full">
                        <span className="text-xs font-black text-yellow-300">Q3 2025</span>
                      </div>
                      <span className="text-xs text-gray-400">Sep - Nov</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Simulation & Beta Launch</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ Paper trading simulation (500M volume)</li>
                      <li>✓ Beta platform frontend development</li>
                      <li>✓ Smart contract deployment (Ethereum)</li>
                      <li>✓ Internal testing team onboarding</li>
                      <li>✓ Security penetration testing</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">Simulation</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">Beta</span>
                    </div>
                  </motion.div>

                  {/* Q4 2025 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="ml-8 bg-gradient-to-br from-red-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-green-500/30 border border-green-500/50 rounded-full">
                        <span className="text-xs font-black text-green-300">Q4 2025</span>
                      </div>
                      <span className="text-xs text-gray-400">Dec - Feb</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Live Trading Launch</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ Go-live production environment</li>
                      <li>✓ Initial liquidity pools deployment</li>
                      <li>✓ CNYT token generation event</li>
                      <li>✓ Compliance & regulatory approval</li>
                      <li>✓ API integrations complete</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">Live</span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">Trading</span>
                    </div>
                  </motion.div>
                </div>

                {/* 2026 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-32 px-4 py-2 bg-gradient-to-r from-luxury-gold to-yellow-600 rounded-lg">
                      <h3 className="text-xl font-black text-black">2026</h3>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-luxury-gold to-transparent"></div>
                  </div>

                  {/* Q1 2026 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="ml-8 bg-gradient-to-br from-yellow-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-cyan-500/30 border border-cyan-500/50 rounded-full">
                        <span className="text-xs font-black text-cyan-300">Q1 2026</span>
                      </div>
                      <span className="text-xs text-gray-400">Mar - May</span>
                    </div>
                    <h4 className="text-lg font-black text-white">User Acquisition & Growth</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ Marketing campaign launch (multi-channel)</li>
                      <li>✓ Community building & social engagement</li>
                      <li>✓ First 10K members onboarded</li>
                      <li>✓ VIP program tier rollout</li>
                      <li>✓ Partnership agreements with exchanges</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">Growth</span>
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">Community</span>
                    </div>
                  </motion.div>

                  {/* Q2 2026 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="ml-8 bg-gradient-to-br from-yellow-900/30 to-black/50 border border-luxury-gold/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-orange-500/30 border border-orange-500/50 rounded-full">
                        <span className="text-xs font-black text-orange-300">Q2 2026</span>
                      </div>
                      <span className="text-xs text-gray-400">Jun - Aug</span>
                      <span className="px-2 py-1 bg-red-500/30 border border-red-500/50 rounded text-xs font-black text-red-300">CURRENT</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Revenue Distribution & Scaling</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ Daily ROI payouts to 50K+ members</li>
                      <li>✓ Commission distribution system active</li>
                      <li>✓ Global pool rewards monthly distribution</li>
                      <li>✓ CNYT token secondary markets enabled</li>
                      <li>✓ Platform reaches $500M AUM milestone</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">Revenue</span>
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">Scaling</span>
                    </div>
                  </motion.div>

                  {/* Q3 2026 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="ml-8 bg-gradient-to-br from-yellow-900/30 to-black/50 border border-white/10 rounded-xl p-6 space-y-4 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-pink-500/30 border border-pink-500/50 rounded-full">
                        <span className="text-xs font-black text-pink-300">Q3 2026</span>
                      </div>
                      <span className="text-xs text-gray-400">Sep - Nov</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Advanced Features & Integrations</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Mobile app iOS/Android launch</li>
                      <li>• Leverage trading options (up to 10x)</li>
                      <li>• Additional CEX integrations (Bybit, OKX)</li>
                      <li>• Advanced analytics dashboard</li>
                      <li>• Referral tier expansion</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded">Upcoming</span>
                    </div>
                  </motion.div>

                  {/* Q4 2026 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="ml-8 bg-gradient-to-br from-yellow-900/30 to-black/50 border border-white/10 rounded-xl p-6 space-y-4 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-violet-500/30 border border-violet-500/50 rounded-full">
                        <span className="text-xs font-black text-violet-300">Q4 2026</span>
                      </div>
                      <span className="text-xs text-gray-400">Dec - Feb</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Exchange Listing & Expansion</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• CEX listing for CNYT token</li>
                      <li>• Global partnership announcements</li>
                      <li>• Institutional investor on-boarding</li>
                      <li>• Regional office expansions</li>
                      <li>• Reach 200K+ active members</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded">Upcoming</span>
                    </div>
                  </motion.div>
                </div>

                {/* 2027 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                      <h3 className="text-xl font-black text-white">2027</h3>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-green-600 to-transparent"></div>
                  </div>

                  {/* Q1 2027 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="ml-8 bg-gradient-to-br from-green-900/30 to-black/50 border border-white/10 rounded-xl p-6 space-y-4 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-lime-500/30 border border-lime-500/50 rounded-full">
                        <span className="text-xs font-black text-lime-300">Q1 2027</span>
                      </div>
                      <span className="text-xs text-gray-400">Mar - May</span>
                    </div>
                    <h4 className="text-lg font-black text-white">V7 Neural Engine & AI Advancement</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Launch V7 Neural Engine upgrade</li>
                      <li>• Quantum computing integration</li>
                      <li>• Multi-asset class support (stocks, forex)</li>
                      <li>• AI accuracy improvement to 80%+</li>
                      <li>• $2B+ AUM milestone</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded">Upcoming</span>
                    </div>
                  </motion.div>

                  {/* Q2 2027 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="ml-8 bg-gradient-to-br from-green-900/30 to-black/50 border border-white/10 rounded-xl p-6 space-y-4 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-teal-500/30 border border-teal-500/50 rounded-full">
                        <span className="text-xs font-black text-teal-300">Q2 2027</span>
                      </div>
                      <span className="text-xs text-gray-400">Jun - May</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Global Domination & Maturity</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Presence in 150+ countries</li>
                      <li>• 500K+ active members globally</li>
                      <li>• Cumulative payouts exceed $1B</li>
                      <li>• Become industry leader in AI trading</li>
                      <li>• Year 1 review & roadmap v2 launch</li>
                    </ul>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded">Upcoming</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-white font-black mb-4">Legend</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">Completed Phase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">Current Phase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-gray-400">Upcoming Phase</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Program Section */}
          {activeSection === 'referral-program' && (
            <ReferralProgramPage />
          )}
        </motion.div>
      </div>
    </div>
  );
};

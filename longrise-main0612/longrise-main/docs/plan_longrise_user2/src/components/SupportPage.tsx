import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, FileText, ChevronRight, HelpCircle, Search, X } from 'lucide-react';

export const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    { q: 'How is my daily ROI calculated?', cat: 'Rewards' },
    { q: 'What are the withdrawal batch cycles?', cat: 'Withdrawal' },
    { q: 'How do I upgrade my distributor rank?', cat: 'Growth' },
    { q: 'Is my capital collateralized?', cat: 'Safety' },
    { q: 'I deposited USDT to a Tron address by mistake. Can it be recovered?', cat: 'Deposit' },
    { q: 'What is the cancellation fee for package purchases?', cat: 'Withdrawal' },
    { q: 'When exactly are daily earnings deposited?', cat: 'Rewards' },
    { q: 'What are the criteria for team member bonus calculations?', cat: 'Commission' },
    { q: 'I forgot my Trading Password. How do I recover it?', cat: 'Security' },
    { q: 'How do I recover my account if I lost my Google Authenticator?', cat: 'Security' },
    { q: 'Do I need to upgrade my KYC verification level?', cat: 'Verification' },
    { q: 'What is the difference between Flexible and Premium packages?', cat: 'Packages' },
    { q: 'How is the early withdrawal penalty calculated?', cat: 'Withdrawal' },
    { q: 'Where can I trade CNYT tokens?', cat: 'Trading' },
    { q: 'Can I earn bonuses without direct referrals?', cat: 'Commission' },
    { q: 'What is the maximum withdrawal limit?', cat: 'Withdrawal' },
    { q: 'What is the minimum asset requirement for VIP entrance?', cat: 'Growth' },
    { q: 'Is settlement performed on the last day of each month?', cat: 'Settlement' },
    { q: 'Is it okay to operate two accounts?', cat: 'Policy' },
    { q: 'I cannot login. How do I resolve this?', cat: 'Technical' },
  ];

  const filteredFaq = faqItems.filter(item =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">CONCIERGE <span className="gold-gradient-text">SUPPORT</span></h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Elite and VIP members have priority access to our dedicated wealth managers 24/7. Standard users can access our AI-powered resolution bot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Open Support Ticket', desc: 'Blockchain-tracked requests', icon: FileText, color: 'text-red-400' },
          { title: 'Telegram', desc: 'Average response: 5-10 min', icon: MessageCircle, color: 'text-blue-400' },
          { title: 'Email Desk', desc: 'Secure document portal', icon: Mail, color: 'text-luxury-gold' },
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-10 rounded-2xl text-center space-y-6 group hover:border-luxury-gold/50 transition-all cursor-pointer"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
              <item.icon size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button className="text-[10px] font-black tracking-widest text-luxury-gold uppercase group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
              Connect Now <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-2xl border-white/5">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-white">Frequently Asked <span className="italic text-luxury-gold">Intelligence</span></h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredFaq.map((item) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-luxury-gold/30 flex justify-between items-start gap-4 group cursor-pointer transition-all"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2">{item.q}</span>
                  <span className="inline-block mt-2 text-[8px] font-black px-2 py-1 rounded-lg bg-luxury-gold/10 text-luxury-gold uppercase tracking-widest">{item.cat}</span>
                </div>
                <HelpCircle className="text-gray-700 group-hover:text-luxury-gold flex-shrink-0 transition-colors" size={18} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

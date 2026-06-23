import { motion } from 'motion/react';
import { MessageCircle, Phone, Mail, FileText, ChevronRight, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';

export const SupportPage = () => {
  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">CONCIERGE <span className="gold-gradient-text">SUPPORT</span></h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Elite and VIP members have priority access to our dedicated wealth managers 24/7. Standard users can access our AI-powered resolution bot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Live Chat', desc: 'Average response: 30s', icon: MessageCircle, color: 'text-green-500' },
          { title: 'Priority Phone', desc: 'For Gold Rank & Above', icon: Phone, color: 'text-luxury-gold' },
          { title: 'Email Desk', desc: 'Secure document portal', icon: Mail, color: 'text-blue-500' },
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

      <div className="glass-panel p-10 rounded-2xl border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-white">Frequently Asked <span className="italic text-luxury-gold">Intelligence</span></h2>
          <div className="space-y-4">
            {[
              'How is my daily ROI calculated?',
              'What are the withdrawal batch cycles?',
              'How do I upgrade my distributor rank?',
              'Is my capital collateralized?',
            ].map((q) => (
              <div key={q} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium text-gray-300">{q}</span>
                <HelpCircle className="text-gray-700 group-hover:text-luxury-gold" size={18} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-luxury-red to-black rounded-2xl p-10 space-y-6 flex flex-col justify-center border border-white/10 shadow-2xl">
          <MessageSquare className="text-luxury-gold" size={48} />
          <h3 className="text-2xl font-serif font-bold text-white leading-tight">Need a customized resolution?</h3>
          <p className="text-gray-400 text-sm">Open a secured support ticket. Our team tracks all tickets through the blockchain for absolute transparency.</p>
          <button className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all">
            OPEN SUPPORT TICKET
          </button>
        </div>
      </div>
    </div>
  );
};

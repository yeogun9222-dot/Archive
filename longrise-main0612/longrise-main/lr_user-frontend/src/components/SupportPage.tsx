import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Mail, FileText, ChevronRight, HelpCircle, Search, X, Clock, CheckCircle2 } from 'lucide-react';

type TicketPayload = {
  title: string;
  description: string;
  category: string;
  priority?: string;
};

const SUPPORT_CHANNELS = [
  { title: 'Open Support Ticket', desc: 'Blockchain-tracked requests', icon: FileText, color: 'text-red-400', category: 'GENERAL', priority: 'medium' },
  { title: 'Telegram Desk', desc: 'Route to live ops queue', icon: MessageCircle, color: 'text-blue-400', category: 'TELEGRAM', priority: 'high' },
  { title: 'Email Desk', desc: 'Secure document review queue', icon: Mail, color: 'text-luxury-gold', category: 'EMAIL', priority: 'medium' },
];

export const SupportPage = ({
  portalData,
  onCreateTicket,
  onSetView,
}: {
  portalData?: any;
  onCreateTicket?: (payload: TicketPayload) => Promise<{ ticketId?: string; status?: string }>;
  onSetView?: (view: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketPayload>({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'medium',
  });
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketError, setTicketError] = useState('');

  const faqItems = (portalData?.support?.faq && portalData.support.faq.length > 0)
    ? portalData.support.faq
    : [];

  const tickets = portalData?.support?.tickets || [];

  const filteredFaq = useMemo(
    () =>
      faqItems.filter((item: any) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [faqItems, searchQuery],
  );

  const openTicketModal = (category: string, priority: string) => {
    setTicketForm({
      title: category === 'GENERAL' ? '' : `${category} support request`,
      description: '',
      category,
      priority,
    });
    setTicketError('');
    setTicketMessage('');
    setIsTicketModalOpen(true);
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.title.trim()) {
      setTicketError('Please enter a ticket title.');
      return;
    }
    if (!ticketForm.description.trim()) {
      setTicketError('Please enter a detailed description.');
      return;
    }

    try {
      const response = await onCreateTicket?.(ticketForm);
      setTicketMessage(`Ticket ${response?.ticketId || ''} was submitted successfully.`.trim());
      setTicketError('');
      setIsTicketModalOpen(false);
    } catch (err: any) {
      setTicketError(err?.response?.data?.detail || 'Unable to create support ticket.');
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">CONCIERGE <span className="gold-gradient-text">SUPPORT</span></h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Operational support is connected to live ticket queues. Submit issues here and review recent case statuses on the same screen.</p>
      </div>

      {ticketMessage && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          {ticketMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUPPORT_CHANNELS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-10 rounded-2xl text-center space-y-6 group hover:border-luxury-gold/50 transition-all"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
              <item.icon size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => openTicketModal(item.category, item.priority)}
              className="text-[10px] font-black tracking-widest text-luxury-gold uppercase group-hover:translate-x-2 transition-transform inline-flex items-center gap-2"
            >
              Connect Now <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
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
              {filteredFaq.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-400">
                  No FAQ entries have been published yet.
                </div>
              )}
              {filteredFaq.map((item: any) => (
                <motion.div
                  key={`${item.q}-${item.cat}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-luxury-gold/30 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-300 block">{item.q}</span>
                      <span className="inline-block mt-2 text-[8px] font-black px-2 py-1 rounded-lg bg-luxury-gold/10 text-luxury-gold uppercase tracking-widest">{item.cat}</span>
                      {item.a && <p className="mt-3 text-xs text-gray-500 leading-relaxed">{item.a}</p>}
                    </div>
                    <HelpCircle className="text-gray-700 flex-shrink-0" size={18} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-black text-white italic">My Tickets</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live operational queue</p>
            </div>
            <button
              onClick={() => onSetView?.('usdt-fraud-report')}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-500/20"
            >
              Fraud Report
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-400">
              No support tickets have been created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 6).map((ticket: any) => (
                <div key={ticket.ticketId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{ticket.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-luxury-gold">{ticket.category}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {ticket.createdAt ? ticket.createdAt.slice(0, 19).replace('T', ' ') : '-'}</span>
                    <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} /> {ticket.priority || 'medium'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTicketModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl glass-panel rounded-2xl border border-luxury-gold/20 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white italic">Create Support Ticket</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operational queue submission</p>
                </div>
                <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {ticketError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {ticketError}
                </div>
              )}

              <input
                value={ticketForm.title}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ticket title"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="TELEGRAM">TELEGRAM</option>
                <option value="EMAIL">EMAIL</option>
                <option value="WITHDRAWAL">WITHDRAWAL</option>
                <option value="SECURITY">SECURITY</option>
              </select>
              <textarea
                value={ticketForm.description}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail."
                className="h-40 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all focus:border-luxury-gold/40"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsTicketModalOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-gray-400 transition-all hover:text-white">
                  Cancel
                </button>
                <button onClick={handleSubmitTicket} className="rounded-xl bg-luxury-gold px-5 py-3 text-sm font-black text-black transition-all hover:brightness-110">
                  Submit Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

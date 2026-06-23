import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
  Send,
  X
} from 'lucide-react';

interface RedDragon {
  id: string;
  name: string;
  rating: number;
  completedTrades: number;
  country: string;
  bankAccount?: string;
}

const redDragons: RedDragon[] = [
  {
    id: 'RED_DRAGON_KR',
    name: 'DRAGON_KOREA',
    rating: 4.9,
    completedTrades: 247,
    country: '🇰🇷 Korea',
    bankAccount: '신한 1002-889-123456'
  },
  {
    id: 'RED_DRAGON_CN',
    name: 'DRAGON_ASIA',
    rating: 4.8,
    completedTrades: 312,
    country: '🇨🇳 China'
  },
  {
    id: 'RED_DRAGON_VN',
    name: 'PHOENIX_VN',
    rating: 4.5,
    completedTrades: 124,
    country: '🇻🇳 Vietnam'
  },
  {
    id: 'RED_DRAGON_PH',
    name: 'GOLDLEADER',
    rating: 4.9,
    completedTrades: 189,
    country: '🇵🇭 Philippines'
  },
];

type OnboardingStep = 'dragon-select' | 'deposit-info' | 'deposit-confirm' | 'transfer-request' | 'transfer-complete';

export const USDTOnboardingPage = ({ onSetView }: { onSetView: (view: string) => void }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('dragon-select');
  const [selectedDragon, setSelectedDragon] = useState<RedDragon | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [transferRequested, setTransferRequested] = useState(false);

  const handleSelectDragon = (dragon: RedDragon) => {
    setSelectedDragon(dragon);
    setCurrentStep('deposit-info');
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmDeposit = () => {
    if (depositAmount) {
      setDepositConfirmed(true);
      setCurrentStep('transfer-request');
    }
  };

  const handleRequestTransfer = () => {
    setTransferRequested(true);
    setCurrentStep('transfer-complete');
  };

  const handleBackToDragonSelect = () => {
    setCurrentStep('dragon-select');
    setSelectedDragon(null);
    setDepositAmount('');
    setDepositConfirmed(false);
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown size={32} className="text-luxury-gold" />
          <h1 className="text-5xl lg:text-6xl font-serif font-black text-white italic">USDT Onboarding</h1>
        </div>
        <p className="text-gray-500 text-sm uppercase tracking-widest font-black">New Members Welcome - 5-Minute Setup</p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
        {[
          { step: 'dragon-select', label: 'Select Red Dragon' },
          { step: 'deposit-info', label: 'Deposit Info' },
          { step: 'deposit-confirm', label: 'Confirm' },
          { step: 'transfer-request', label: 'Request USDT' },
          { step: 'transfer-complete', label: 'Complete' }
        ].map((item, idx) => (
          <motion.div key={item.step} className="flex items-center flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                (currentStep === item.step ||
                 ['dragon-select', 'deposit-info', 'deposit-confirm', 'transfer-request', 'transfer-complete'].indexOf(currentStep) >= idx)
                  ? 'bg-luxury-gold text-black'
                  : 'bg-white/10 text-gray-600'
              }`}
            >
              {idx + 1}
            </motion.div>
            {idx < 4 && (
              <div className={`flex-1 h-1 mx-2 transition-all ${
                ['dragon-select', 'deposit-info', 'deposit-confirm', 'transfer-request', 'transfer-complete'].indexOf(currentStep) > idx
                  ? 'bg-luxury-gold'
                  : 'bg-white/10'
              }`}></div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Red Dragon */}
        {currentStep === 'dragon-select' && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Step 1: Choose Your Red Dragon</h2>
              <p className="text-gray-500 text-sm">Select a trusted Red Dragon member to facilitate your deposit</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {redDragons.map((dragon, idx) => (
                <motion.button
                  key={dragon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelectDragon(dragon)}
                  className="text-left glass-panel p-8 rounded-2xl border border-white/5 hover:border-luxury-gold/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown size={18} className="text-luxury-gold" />
                        <span className="font-black text-luxury-gold text-xs uppercase tracking-widest">Red Dragon</span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-luxury-gold transition-colors">{dragon.name}</h3>
                    </div>
                    <ArrowRight size={20} className="text-gray-600 group-hover:text-luxury-gold transition-colors" />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-black tracking-wide">Rating</span>
                      <span className="text-lg font-mono font-black text-yellow-400">⭐ {dragon.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-black tracking-wide">Completed Trades</span>
                      <span className="text-lg font-mono font-black text-white">{dragon.completedTrades}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-black tracking-wide">Location</span>
                      <span className="text-lg font-black text-white">{dragon.country}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 font-black">Click to select this Red Dragon</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Deposit Info */}
        {currentStep === 'deposit-info' && selectedDragon && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Step 2: Deposit Information</h2>
              <p className="text-gray-500 text-sm">Send money to {selectedDragon.name}'s bank account</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-2xl border border-luxury-gold/30 bg-luxury-gold/5 space-y-8 max-w-2xl mx-auto"
            >
              {/* Selected Dragon Info */}
              <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-luxury-gold/20 flex items-center justify-center">
                  <Crown size={24} className="text-luxury-gold" />
                </div>
                <div>
                  <p className="font-black text-white text-lg">{selectedDragon.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{selectedDragon.country}</p>
                </div>
              </div>

              {/* Deposit Amount */}
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">Deposit Amount (Optional)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter amount you want to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-gray-600 text-xl font-mono focus:outline-none focus:border-luxury-gold/50"
                  />
                  <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 font-black text-lg">USD</span>
                </div>
                <p className="text-xs text-gray-500">You can adjust this later if needed</p>
              </div>

              {/* Bank Account Info */}
              {selectedDragon.bankAccount && (
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">Bank Account Details</label>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg flex items-center justify-between group">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-1">Account</p>
                      <p className="text-lg font-mono font-black text-white">{selectedDragon.bankAccount}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleCopyAccount(selectedDragon.bankAccount!)}
                      className="p-3 hover:bg-luxury-gold/20 rounded-lg transition-all"
                    >
                      {isCopied ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <Copy size={20} className="text-gray-600 group-hover:text-luxury-gold transition-colors" />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200 space-y-1">
                  <p className="font-black">Important</p>
                  <p>Once you transfer the money, click "Confirm Deposit" and request the USDT transfer from your Red Dragon.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToDragonSelect}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep('deposit-confirm')}
                  className="flex-1 py-4 bg-luxury-gold hover:bg-luxury-gold/80 text-black font-black text-sm rounded-lg transition-all uppercase"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Deposit Confirmation */}
        {currentStep === 'deposit-confirm' && selectedDragon && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Step 3: Confirm Deposit</h2>
              <p className="text-gray-500 text-sm">Let us know the deposit is complete</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8 max-w-2xl mx-auto"
            >
              {/* Confirmation Checklist */}
              <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-black text-white text-lg mb-1">Deposit Sent</p>
                      <p className="text-sm text-gray-500">I have transferred the money to {selectedDragon.name}'s bank account</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={depositConfirmed}
                      onChange={(e) => setDepositConfirmed(e.target.checked)}
                      className="w-6 h-6 rounded accent-luxury-gold cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="font-black text-white text-lg mb-1">Confirm Completion</p>
                      <p className="text-sm text-gray-500">I have completed the bank transfer and am ready to request USDT</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="p-4 bg-black/40 rounded-lg border border-white/10 flex items-center gap-3">
                <Clock size={18} className="text-luxury-gold" />
                <div className="text-xs text-gray-500">
                  <p className="font-black uppercase tracking-wide">Transaction Time</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep('deposit-info')}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep('transfer-request')}
                  disabled={!depositConfirmed}
                  className="flex-1 py-4 bg-luxury-gold hover:bg-luxury-gold/80 text-black font-black text-sm rounded-lg transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 4: Request USDT Transfer */}
        {currentStep === 'transfer-request' && selectedDragon && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Step 4: Request USDT Transfer</h2>
              <p className="text-gray-500 text-sm">Ask {selectedDragon.name} to send your USDT</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8 max-w-2xl mx-auto"
            >
              {/* Request Summary */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Red Dragon</p>
                    <p className="text-lg font-black text-white truncate">{selectedDragon.name}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Deposit Amount</p>
                    <p className="text-lg font-mono font-black text-luxury-gold">${depositAmount || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Notification Info */}
              <div className="p-6 bg-luxury-gold/10 border border-luxury-gold/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                    <Send size={16} className="text-luxury-gold" />
                  </div>
                  <p className="font-black text-luxury-gold">Notification Sent</p>
                </div>
                <p className="text-sm text-gray-300">
                  {selectedDragon.name} will receive a notification to transfer your USDT. This usually takes 5-15 minutes.
                </p>
              </div>

              {/* What Happens Next */}
              <div className="space-y-3">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">What happens next:</p>
                <ol className="space-y-3">
                  {[
                    'Your Red Dragon receives the notification',
                    'They verify your deposit has been received',
                    'They transfer USDT to your wallet',
                    'You can now purchase packages!'
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-300">
                      <span className="font-black text-luxury-gold flex-shrink-0 w-6 text-center">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep('deposit-confirm')}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestTransfer}
                  className="flex-1 py-4 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-sm rounded-lg transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Request USDT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 5: Transfer Complete */}
        {currentStep === 'transfer-complete' && selectedDragon && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                  <CheckCircle size={48} className="text-green-400" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Request Submitted!</h2>
                <p className="text-gray-500 text-sm">Your USDT transfer request has been sent to {selectedDragon.name}</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-10 rounded-2xl border border-green-500/30 bg-green-500/5 space-y-8 max-w-2xl mx-auto"
            >
              {/* Completion Details */}
              <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <p className="text-lg font-black text-green-400">Awaiting Red Dragon Confirmation</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Red Dragon</p>
                    <p className="text-sm font-black text-white truncate">{selectedDragon.name}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Deposit Amount</p>
                    <p className="text-sm font-mono font-black text-luxury-gold">${depositAmount || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Expected Timeline</p>
                <div className="space-y-3">
                  {[
                    { label: 'Request Sent', time: 'Just now', icon: '✓', status: 'complete' },
                    { label: 'Red Dragon Verification', time: '1-5 min', icon: '⏳', status: 'pending' },
                    { label: 'USDT Transfer', time: '5-10 min', icon: '⏳', status: 'pending' },
                    { label: 'Ready for Package', time: '5-15 min', icon: '⭐', status: 'pending' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                      <span className={`text-lg font-black ${item.status === 'complete' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">{item.label}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-black">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
                <p className="text-sm font-black text-blue-400">💡 Next Steps</p>
                <p className="text-xs text-blue-200">Once you receive the USDT, return to the Wallet page to purchase your first package!</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSetView('home')}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  Return to Home
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSetView('wallet')}
                  className="flex-1 py-4 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-sm rounded-lg transition-all uppercase"
                >
                  Go to Wallet
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

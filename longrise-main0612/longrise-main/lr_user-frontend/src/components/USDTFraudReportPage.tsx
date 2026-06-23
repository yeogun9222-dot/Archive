import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Upload,
  X,
  CheckCircle,
  Camera,
  MessageSquare,
  Shield,
  Clock,
  FileText
} from 'lucide-react';

interface FraudReport {
  id: string;
  reporterUid: string;
  fraudsterUid: string;
  reportedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  reason: string;
  description: string;
  evidence: string[];
}

const FRAUD_REASONS = [
  { id: 'usdt-not-received', label: 'USDT Not Received After Deposit' },
  { id: 'wrong-amount', label: 'Wrong Amount Transferred' },
  { id: 'false-deposit', label: 'False Deposit Claim' },
  { id: 'communication-blocked', label: 'Communication Blocked' },
  { id: 'other', label: 'Other (Specify in Description)' }
];

export const USDTFraudReportPage = ({
  onSetView,
  onSubmitReport,
}: {
  onSetView: (view: string) => void;
  onSubmitReport?: (payload: {
    fraudster_uid: string;
    fraud_reason: string;
    description: string;
    evidence: string[];
  }) => Promise<{ reportId?: string; status?: string }>;
}) => {
  const [step, setStep] = useState<'form' | 'submitted'>('form');
  const [fraudsterUid, setFraudsterUid] = useState('');
  const [fraudReason, setFraudReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<FraudReport | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (evidence.length + files.length > 5) {
        setErrorMessage('Maximum 5 images allowed.');
        return;
      }

      setErrorMessage('');
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidence(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    if (!fraudsterUid.trim()) {
      setErrorMessage('Please enter the fraudster UID.');
      return;
    }
    if (!fraudReason) {
      setErrorMessage('Please select a fraud reason.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a detailed description.');
      return;
    }
    if (evidence.length === 0) {
      setErrorMessage('Please attach at least one evidence image.');
      return;
    }

    setErrorMessage('');

    const response = await onSubmitReport?.({
      fraudster_uid: fraudsterUid,
      fraud_reason: fraudReason,
      description,
      evidence,
    });

    const report: FraudReport = {
      id: response?.reportId || `REPORT_${Date.now()}`,
      reporterUid: '',
      fraudsterUid,
      reportedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      reason: fraudReason,
      description,
      evidence
    };

    setSubmittedReport(report);
    setShowSuccess(true);
    setStep('submitted');
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-4xl mx-auto space-y-12">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle size={32} className="text-red-500" />
                <h1 className="text-5xl lg:text-6xl font-serif font-black text-white italic">Report Fraud</h1>
              </div>
              <p className="text-gray-500 text-sm uppercase tracking-widest font-black">
                Help us protect the community from fraudulent activities
              </p>
            </motion.div>

            {/* Warning Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex gap-4"
            >
              <Shield size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-black text-red-400 text-sm">⚠️ False Reports are Serious</p>
                <p className="text-xs text-red-200">
                  Making false fraud reports may result in account restrictions or suspension. Only submit legitimate reports with proper evidence.
                </p>
              </div>
            </motion.div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-200"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8"
            >
              {/* Fraudster UID */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
                  Fraudster UID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="USER_12345 or RED_DRAGON_KR"
                  value={fraudsterUid}
                  onChange={(e) => setFraudsterUid(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50 text-lg font-mono"
                />
                <p className="text-xs text-gray-500">Enter the UID of the user who committed fraud</p>
              </div>

              {/* Fraud Reason */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
                  Fraud Reason <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {FRAUD_REASONS.map(reason => (
                    <motion.label
                      key={reason.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-luxury-gold/30 transition-all"
                    >
                      <input
                        type="radio"
                        name="fraud-reason"
                        value={reason.id}
                        checked={fraudReason === reason.id}
                        onChange={(e) => setFraudReason(e.target.value)}
                        className="w-5 h-5 accent-luxury-gold cursor-pointer"
                      />
                      <span className="text-sm font-black text-white flex-1">{reason.label}</span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Explain what happened. Include dates, times, transaction details, and how this affected you..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50 resize-none h-40 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">{description.length}/500 characters</p>
              </div>

              {/* Evidence Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
                    Evidence Images <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-black text-gray-500">Max 5 images</span>
                </div>

                {/* Upload Area */}
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  className="relative block p-10 bg-white/[0.02] border-2 border-dashed border-white/20 hover:border-luxury-gold/50 rounded-2xl cursor-pointer transition-all text-center"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddEvidence}
                    className="hidden"
                    disabled={evidence.length >= 5}
                  />
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-luxury-gold/10 flex items-center justify-center">
                        <Camera size={32} className="text-luxury-gold" />
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-white mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (max 10MB each)
                        {evidence.length > 0 && ` - ${evidence.length} uploaded`}
                      </p>
                    </div>
                  </div>
                </motion.label>

                {/* Evidence Preview */}
                {evidence.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {evidence.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-lg overflow-hidden border border-white/10"
                      >
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:brightness-75 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveEvidence(idx)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} className="text-white" />
                        </motion.button>
                        <p className="absolute bottom-2 left-2 text-[10px] font-black text-white bg-black/50 px-2 py-1 rounded">
                          #{idx + 1}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
                <p className="text-xs font-black text-blue-400 uppercase">📋 What Evidence Should Include</p>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>✓ Screenshots of transaction records</li>
                  <li>✓ Chat conversations or communication proof</li>
                  <li>✓ Bank transfer confirmation or receipts</li>
                  <li>✓ Any other relevant documentation</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSetView('wallet')}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitReport}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-600/80 hover:to-red-500/80 text-white font-black text-sm rounded-lg transition-all uppercase flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={16} />
                  Submit Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'submitted' && submittedReport && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Success Message */}
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
                <h2 className="text-4xl font-black text-white mb-2">Report Submitted</h2>
                <p className="text-gray-500 text-sm">Thank you for helping keep the community safe</p>
              </div>
            </div>

            {/* Report Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8"
            >
              {/* Report ID */}
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Report ID</p>
                <p className="text-2xl font-mono font-black text-white">{submittedReport.id}</p>
                <p className="text-xs text-gray-500">Save this ID for reference</p>
              </div>

              {/* Report Summary */}
              <div className="space-y-4">
                <h3 className="font-black text-white text-lg uppercase tracking-wide">Report Summary</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Fraudster UID</p>
                    <p className="text-sm font-mono font-black text-white truncate">{submittedReport.fraudsterUid}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Status</p>
                    <p className="text-sm font-black text-yellow-400">UNDER REVIEW</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-2">Fraud Reason</p>
                  <p className="text-sm font-black text-white">
                    {FRAUD_REASONS.find(r => r.id === submittedReport.reason)?.label}
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-3">Your Description</p>
                  <p className="text-sm text-gray-300">{submittedReport.description}</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-wide mb-3">Evidence Attached</p>
                  <p className="text-sm font-black text-white">{submittedReport.evidence.length} image(s)</p>
                </div>
              </div>

              {/* Review Process */}
              <div className="space-y-4">
                <h3 className="font-black text-white text-lg uppercase tracking-wide">Review Process</h3>

                <div className="space-y-3">
                  {[
                    { icon: '📋', label: 'Initial Review', desc: 'Our team will review your report within 24 hours' },
                    { icon: '🔍', label: 'Investigation', desc: 'We will investigate the fraud claim thoroughly' },
                    { icon: '✓', label: 'Decision', desc: 'You will be notified of the outcome via notification' },
                    { icon: '⚡', label: 'Action', desc: 'If approved, fraudster loses stars or gets account locked' }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      className="flex gap-4 p-3 bg-white/[0.02] rounded-lg border border-white/5"
                    >
                      <span className="text-2xl flex-shrink-0">{step.icon}</span>
                      <div>
                        <p className="text-sm font-black text-white">{step.label}</p>
                        <p className="text-xs text-gray-500">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Important Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
                <p className="text-xs font-black text-blue-400 uppercase">ℹ️ What Happens Next</p>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• You will receive a notification when the report is reviewed</li>
                  <li>• If approved, the fraudster will receive a strike</li>
                  <li>• Two strikes result in permanent account lock</li>
                  <li>• You can track this report anytime in your notification center</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSetView('wallet')}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                >
                  Return to Wallet
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStep('form');
                    setFraudsterUid('');
                    setFraudReason('');
                    setDescription('');
                    setEvidence([]);
                  }}
                  className="flex-1 py-4 bg-luxury-gold hover:bg-luxury-gold/80 text-black font-black text-sm rounded-lg transition-all uppercase"
                >
                  Submit Another Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

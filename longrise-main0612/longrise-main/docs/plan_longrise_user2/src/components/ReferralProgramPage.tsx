import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Users, CheckCircle, Share2, BarChart3, Trash2, Download, MessageCircle, BookOpen, Send } from 'lucide-react';

interface ReferralStep {
  id: number;
  title: string;
  description: string;
  details: string[];
  imageUrl: string | null;
}

export const ReferralProgramPage = () => {
  const [steps, setSteps] = useState<ReferralStep[]>([
    {
      id: 1,
      title: 'Register Your Account',
      description: 'Create your LONGRISE account and get started with our platform.',
      details: [
        'Sign up for a LONGRISE account using your email or wallet',
        'Complete basic profile setup',
        'Your unique referral ID will be generated automatically'
      ],
      imageUrl: null
    },
    {
      id: 2,
      title: 'Complete KYC Verification',
      description: 'KYC (Know Your Customer) verification is required to activate referrals.',
      details: [
        'Go to My Profile → KYC Now',
        'Complete identity verification through our partner (Blockpass)',
        'Once verified, your referral program will be unlocked'
      ],
      imageUrl: null
    },
    {
      id: 3,
      title: 'Share Your Referral Link',
      description: 'After verification, share your unique referral code and link with others.',
      details: [
        'Copy your referral link from your profile',
        'Share it with friends, communities, or social platforms',
        'Anyone registering via your link and completing KYC will count as your referral'
      ],
      imageUrl: null
    },
    {
      id: 4,
      title: 'Track Earnings in Dashboard',
      description: 'Monitor your referral performance and earnings in real-time.',
      details: [
        'View your referral dashboard for complete statistics',
        'Track: Unique Projects, Unique Investors, Total Invested, Commission Earned',
        'Monitor your tier progress and commission structure'
      ],
      imageUrl: null
    }
  ]);

  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});

  const handleImageUpload = (stepId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading({ ...isUploading, [stepId]: true });

    // Create a temporary URL for the image
    const fileUrl = URL.createObjectURL(file);
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, imageUrl: fileUrl } : step
    ));

    setTimeout(() => {
      setIsUploading({ ...isUploading, [stepId]: false });
    }, 500);
  };

  const removeImage = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step?.imageUrl) {
      URL.revokeObjectURL(step.imageUrl);
    }
    setSteps(steps.map(s =>
      s.id === stepId ? { ...s, imageUrl: null } : s
    ));
  };

  const tiers = [
    { name: 'Base', commission: '0%', color: 'from-gray-500 to-gray-600' },
    { name: 'Bronze', commission: '30%', color: 'from-amber-600 to-amber-700', milestone: '2,000 RWIs' },
    { name: 'Silver', commission: '55%', color: 'from-slate-400 to-slate-500', milestone: '20,000 RWIs' },
    { name: 'Gold', commission: '70%', color: 'from-yellow-400 to-yellow-500', milestone: '50,000 RWIs' },
    { name: 'Platinum', commission: '85%', color: 'from-blue-300 to-blue-400', milestone: '100,000 RWIs' },
    { name: 'Diamond', commission: '100%', color: 'from-purple-400 to-purple-500', milestone: '200,000 RWIs' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-luxury-gold/20 rounded-xl">
            <Share2 size={40} className="text-luxury-gold" />
          </div>
        </div>
        <h1 className="text-5xl lg:text-6xl font-serif font-black text-white italic">
          LONGRISE Referral Program
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Earn generous commissions by referring new users to LONGRISE. Build your network and unlock higher tiers with increased rewards.
        </p>
      </motion.div>

      {/* Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-5xl mx-auto mb-16"
      >
        <div className="bg-white/5 border border-luxury-gold/30 rounded-2xl p-8 space-y-4">
          <p className="text-gray-300 text-base leading-relaxed">
            The LONGRISE Referral Program lets you earn rewards by inviting your network to join. When your referrals participate in package investments, you earn a commission on their investments. The commission structure is tied to your staking tier.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3">
              <Users size={24} className="text-luxury-gold flex-shrink-0 mt-1" />
              <div>
                <p className="font-black text-white text-sm mb-1">Build Your Network</p>
                <p className="text-gray-400 text-xs">Invite friends and community members to LONGRISE</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-luxury-gold flex-shrink-0 mt-1" />
              <div>
                <p className="font-black text-white text-sm mb-1">20% Commission Pool</p>
                <p className="text-gray-400 text-xs">20% of platform fees allocated to referral rewards</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step-by-Step Section */}
      <div className="max-w-5xl mx-auto space-y-8 mb-20">
        <h2 className="text-3xl font-black text-white mb-8">How It Works</h2>

        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="space-y-6"
          >
            {/* Step Number and Title */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-luxury-gold to-red-500 text-black font-black text-2xl">
                  {step.id}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-base">{step.description}</p>
              </div>
            </div>

            {/* Step Content */}
            <div className="ml-0 lg:ml-24 space-y-4">
              {/* Image Upload Area */}
              <div className="bg-white/5 border-2 border-dashed border-luxury-gold/50 rounded-xl p-8">
                {step.imageUrl ? (
                  <div className="space-y-4">
                    <img
                      src={step.imageUrl}
                      alt={`Step ${step.id}`}
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                    <div className="flex gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(step.id, e)}
                          disabled={isUploading[step.id]}
                          className="hidden"
                        />
                        <span className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-luxury-gold font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all duration-300 text-sm">
                          <Upload size={18} />
                          {isUploading[step.id] ? 'Uploading...' : 'Change Image'}
                        </span>
                      </label>
                      <button
                        onClick={() => removeImage(step.id)}
                        className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Upload size={40} className="text-luxury-gold mx-auto" />
                    <div>
                      <h4 className="text-white font-black mb-2">Upload Step Image</h4>
                      <p className="text-gray-400 mb-4 text-sm">Add a screenshot or image for this step</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(step.id, e)}
                          disabled={isUploading[step.id]}
                          className="hidden"
                        />
                        <span className="inline-block px-6 py-3 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all duration-300">
                          {isUploading[step.id] ? 'Uploading...' : 'Choose Image'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Details List */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-luxury-gold mt-2 flex-shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex justify-center py-4">
                <div className="h-12 w-1 bg-gradient-to-b from-luxury-gold to-transparent rounded-full" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Commission Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-5xl mx-auto mb-20 space-y-8"
      >
        <div>
          <h2 className="text-3xl font-black text-white mb-6">Commission Structure</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-gray-300">
                Your commission percentage is tied to your staking tier. The higher your tier, the larger share you earn from the <span className="text-luxury-gold font-black">20% referral commission pool</span>.
              </p>
              <p className="text-gray-300">
                When a user invests through your referral link:
              </p>
              <ul className="space-y-2 pl-4">
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-luxury-gold font-black">•</span>
                  <span>LONGRISE takes a platform fee (varies by investment amount)</span>
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-luxury-gold font-black">•</span>
                  <span>20% of that fee is allocated to the referral pool</span>
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-luxury-gold font-black">•</span>
                  <span>You earn a percentage of that 20% based on your tier</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-black text-white mb-4">Commission by Tier</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${tier.color} rounded-xl p-6 text-white border border-white/10`}
                  >
                    <div className="font-black text-lg mb-2">{tier.name}</div>
                    <div className="text-3xl font-black mb-2">{tier.commission}</div>
                    {tier.milestone && (
                      <div className="text-xs opacity-90">{tier.milestone}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-black text-white text-sm mb-2">Example Calculation</p>
                  <p className="text-gray-300 text-sm">
                    If a referral invests $100,000 and LONGRISE charges 10% fee ($10,000), 20% goes to referral pool ($2,000). If you're a Gold tier (70%), you earn <span className="text-yellow-300 font-black">$1,400</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tier Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-5xl mx-auto mb-20 space-y-8"
      >
        <div>
          <h2 className="text-3xl font-black text-white mb-6">Tier Benefits & Milestones</h2>
          <div className="space-y-4">
            {tiers.map((tier, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className={`bg-gradient-to-r ${tier.color} rounded-xl p-6 border border-white/20`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-xl font-black">{tier.name} Tier</div>
                    {tier.milestone && (
                      <div className="text-sm opacity-90 mt-1">Milestone: {tier.milestone}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">{tier.commission}</div>
                    <div className="text-xs opacity-90">Commission</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-5xl mx-auto mb-20"
      >
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">📋</span>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white">Important Notes</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>Referrals must complete KYC verification to count towards your commission</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>All referral rewards are paid in USDT and deposited directly to your account</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>Pending USDT commissions will automatically convert to CNYT once they reach $10 minimum</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>Commission tiers are updated monthly based on your cumulative referral milestones</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>The referral system is fully on-chain and all transactions are transparent on the blockchain</span>
                </li>
                <li className="flex gap-3 text-gray-300">
                  <span className="text-orange-300 font-black mt-1">•</span>
                  <span>All images provided here are for illustrative purposes only</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-5xl mx-auto text-center py-12"
      >
        <div className="space-y-6">
          <p className="text-xl text-gray-300">
            🚀 Ready to start earning? <span className="text-luxury-gold font-black">Log in to LONGRISE</span> and begin inviting your network today!
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 text-lg">
            Access Your Referral Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

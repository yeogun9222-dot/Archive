import { useState } from 'react';
import { motion } from 'motion/react';
import { BookMarked, Download, Share2, ChevronRight } from 'lucide-react';

type GuideSection = 'commission' | 'rank' | 'signup' | 'invest' | 'deposit' | 'withdraw';

interface Section {
  id: GuideSection;
  title: string;
  description: string;
  icon: string;
}

export const GuidePage = () => {
  const [activeSection, setActiveSection] = useState<GuideSection>('commission');

  const sections: Section[] = [
    {
      id: 'commission',
      title: 'Commission System',
      description: 'Understand how you earn commissions',
      icon: '💰',
    },
    {
      id: 'rank',
      title: 'Rank System',
      description: 'Learn about membership levels and benefits',
      icon: '⭐',
    },
    {
      id: 'signup',
      title: 'How to Sign Up',
      description: 'Step-by-step guide to join LONGRISE',
      icon: '📝',
    },
    {
      id: 'invest',
      title: 'How to Invest',
      description: 'Get started with your first investment',
      icon: '📈',
    },
    {
      id: 'deposit',
      title: 'How to Deposit',
      description: 'Fund your account with USDT',
      icon: '💳',
    },
    {
      id: 'withdraw',
      title: 'How to Withdraw',
      description: 'Withdraw your earnings easily',
      icon: '🏦',
    },
  ];

  const downloadSection = () => {
    const content = getSectionContent();
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `LONGRISE_${getSectionTitle()}_Guide.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSectionTitle = () => {
    const section = sections.find(s => s.id === activeSection);
    return section?.title.replace(/\s+/g, '_') || 'Guide';
  };

  const getSectionContent = (): string => {
    const contents: Record<GuideSection, string> = {
      commission: `LONGRISE AI - COMMISSION SYSTEM GUIDE
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
- Processing time: 24 hours batch processing`,

      rank: `LONGRISE AI - RANK SYSTEM GUIDE
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
- Invitations to VIP events`,

      signup: `LONGRISE AI - HOW TO SIGN UP GUIDE
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
- Verify all deposit addresses before sending funds`,

      invest: `LONGRISE AI - HOW TO INVEST GUIDE
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
- Only use official LONGRISE platform`,

      deposit: `LONGRISE AI - HOW TO DEPOSIT GUIDE
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
- Keep proof of transaction`,

      withdraw: `LONGRISE AI - HOW TO WITHDRAW GUIDE
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
- Account locked? Enable 2FA and verify identity`,
    };

    return contents[activeSection] || '';
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4 max-w-6xl mx-auto"
      >
        <h1 className="text-5xl lg:text-6xl font-serif font-black text-white italic">
          LONGRISE Guides
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Complete guides to understand LONGRISE AI and maximize your earnings
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
          <div className="glass-panel p-6 rounded-2xl border border-white/5 sticky top-32 space-y-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-luxury-gold mb-4">
              Guides
            </h3>
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                    isActive
                      ? 'bg-luxury-gold/20 border border-luxury-gold/50 text-luxury-gold'
                      : 'border border-white/10 text-gray-400 hover:border-luxury-gold/30 hover:text-gray-300'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{section.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm font-black uppercase tracking-wider block">
                      {section.title}
                    </span>
                    <span className="text-xs text-gray-500">{section.description}</span>
                  </div>
                </motion.button>
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
          {/* Section Title */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-4xl font-serif font-black text-white mb-2">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-gray-400">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadSection}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black uppercase tracking-widest rounded-lg transition-all duration-300"
          >
            <Download size={20} />
            Download This Guide (TXT)
          </motion.button>

          {/* Content Display */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 max-h-[600px] overflow-y-auto">
            <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
              {getSectionContent()}
            </pre>
          </div>

          {/* Share Section */}
          <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-xl p-6 flex items-center gap-4">
            <Share2 size={24} className="text-luxury-gold flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-white font-black mb-1">Share This Guide</h4>
              <p className="text-gray-400 text-sm">Share this guide with your network to help them understand LONGRISE</p>
            </div>
            <button className="px-4 py-2 bg-luxury-gold/20 border border-luxury-gold/50 text-luxury-gold rounded-lg hover:bg-luxury-gold/30 transition-all font-black text-sm">
              Copy Link
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import { motion } from 'motion/react';
import { Shield, Box, Crown, Zap, Star } from 'lucide-react';

const defaultPackages = [
    { id: 'flexible', name: 'Flexible', price: '$100', roi: '48%~', period: 'No Lock-in', color: 'gray', icon: Shield, cnyt: 'None' },
    { id: 'basic', name: 'Basic', price: '$200', roi: '84%~', period: '12 Months', color: 'orange', icon: Box, cnyt: '2%~' },
    { id: 'standard', name: 'Standard', price: '$500', roi: '108%~', period: '12 Months', color: 'blue', icon: Crown, popular: true, cnyt: '4%~' },
    { id: 'premium', name: 'Premium', price: '$1,000', roi: '132%~', period: '12 Months', color: 'gold', icon: Zap, cnyt: '6%~' },
    { id: 'vip', name: 'VIP', price: '$5,000', roi: '216%~', period: '12 Months', color: 'red', icon: Star, cnyt: '10%~' },
];

type PackageSectionMode = 'example' | 'live';

const normalizePackageKey = (value: unknown) => String(value || '').trim().toLowerCase().replace(/\s+/g, '-');

const getPackageIcon = (id: string) => {
  if (id === 'flexible') return Shield;
  if (id === 'basic') return Box;
  if (id === 'standard') return Crown;
  if (id === 'premium') return Zap;
  return Star;
};

export const PackageSection = ({
  onSelect,
  packages,
  activeInvestments = [],
  mode = 'live',
}: {
  onSelect: (p: string) => void;
  packages?: any[];
  activeInvestments?: any[];
  mode?: PackageSectionMode;
}) => {
  const packageList = (packages && packages.length > 0)
    ? packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        price: `$${Number(pkg.price).toLocaleString()}`,
        roi: `${Number(pkg.roi).toLocaleString()}%`,
        period: pkg.period,
        popular: Boolean(pkg.featured),
        cnyt: `${Number(pkg.bonusRate).toLocaleString()}%`,
        icon: getPackageIcon(pkg.id),
      }))
    : defaultPackages;
  const activePackageKeys = new Set(
    activeInvestments
      .filter((investment) => String(investment.status || '').toLowerCase() === 'active')
      .flatMap((investment) => [
        normalizePackageKey(investment.packageId),
        normalizePackageKey(investment.package_id),
        normalizePackageKey(investment.package_type),
        normalizePackageKey(investment.name),
      ])
      .filter(Boolean)
  );

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-luxury-gold font-bold tracking-[0.3em] text-sm uppercase mb-3 text-[10px]">Investment Plans</h2>
        <h3 className="text-4xl lg:text-5xl font-serif font-black text-white">Dragon Wealth Packages</h3>
        {mode === 'example' && (
          <div className="mx-auto mt-6 flex max-w-xl items-center justify-center rounded-xl border-2 border-dashed border-luxury-gold/60 bg-luxury-gold/10 px-5 py-3 shadow-[0_0_30px_rgba(234,179,8,0.12)]">
            <span className="text-xs lg:text-sm font-black uppercase tracking-[0.28em] text-luxury-gold">
              Example Data Preview
            </span>
          </div>
        )}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {packageList.map((pkg, index) => {
          const isExampleActive = mode === 'example' && (index === 2 || index === 4);
          const isLiveActive = mode === 'live' && (
            activePackageKeys.has(normalizePackageKey(pkg.id)) ||
            activePackageKeys.has(normalizePackageKey(pkg.name))
          );
          const isActivated = isExampleActive || isLiveActive;

          return (
          <motion.div 
            key={pkg.id}
            whileHover={{ y: -10 }}
            className={`glass-panel p-4 lg:p-6 relative overflow-hidden group cursor-pointer border-2 ${
              isExampleActive
                ? 'border-luxury-gold shadow-[0_0_36px_rgba(234,179,8,0.22)]'
                : isActivated
                  ? 'border-luxury-gold shadow-[0_0_30px_rgba(234,179,8,0.2)]'
                  : 'border-luxury-gold/20'
            }`}
            onClick={() => onSelect(pkg.id)}
          >
            {isExampleActive && (
              <>
                <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full border border-white/20 bg-black/70 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.22em] text-white lg:left-4 lg:top-4 lg:text-[9px]">
                  Demo Data
                </div>
              </>
            )}
            {(pkg.popular || isExampleActive) && (
              <div className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-luxury-gold text-black text-[8px] lg:text-[10px] font-black px-2 lg:px-3 py-0.5 lg:py-1 rounded-full tracking-widest z-10">
                {isExampleActive ? 'SAMPLE' : 'POPULAR'}
              </div>
            )}
            
            <div className="mb-4 lg:mb-6">
              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center mb-2 lg:mb-4 group-hover:scale-110 transition-transform`}>
                <pkg.icon size={20} className="text-luxury-gold lg:w-[28px] lg:h-[28px]" />
              </div>
              <h4 className="text-sm lg:text-xl font-black text-white mb-1 uppercase tracking-tight">{pkg.name}</h4>
              <p className="text-gray-400 text-[8px] lg:text-[10px] uppercase tracking-wider">{pkg.period}</p>
            </div>

            <div className="mb-4 lg:mb-8">
              <p className="text-xl lg:text-3xl font-mono font-black text-white mb-1">{pkg.price}</p>
              <p className="text-luxury-gold font-bold text-[8px] lg:text-[10px] uppercase tracking-widest">Entry Level</p>
            </div>

            <div className="space-y-2 lg:space-y-4 mb-4 lg:mb-8">
              <div className="flex justify-between items-center text-[10px] lg:text-xs">
                <span className="text-gray-400">ROI</span>
                <span className="text-green-400 font-bold">{pkg.roi}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] lg:text-xs">
                <span className="text-gray-400">Bonus</span>
                <span className="text-luxury-gold font-bold">{pkg.cnyt}</span>
              </div>
              <div className="h-px bg-white/10"></div>
            </div>

            <motion.button
              animate={isExampleActive ? { opacity: [0.62, 1, 0.62], scale: [1, 1.05, 1] } : undefined}
              transition={isExampleActive ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : undefined}
              className={`w-full py-2 lg:py-4 rounded-lg lg:rounded-xl font-black text-[9px] lg:text-[10px] tracking-widest transition-all border-2 ${
                isExampleActive
                  ? 'border-dashed border-black bg-luxury-gold text-black shadow-[0_10px_24px_rgba(234,179,8,0.35)]'
                  : isActivated
                    ? 'border-transparent bg-luxury-gold text-black shadow-[0_10px_20px_rgba(234,179,8,0.3)] hover:scale-105'
                    : 'border-transparent bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isActivated ? 'ACTIVATE' : 'SELECT'}
            </motion.button>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
};

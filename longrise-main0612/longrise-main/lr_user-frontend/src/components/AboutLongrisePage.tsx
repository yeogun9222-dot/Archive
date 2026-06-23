import { motion } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  ChevronRight, 
  ArrowLeft,
  Globe,
  Lock,
  LineChart,
  Layers,
  Database
} from 'lucide-react';

export const AboutLongrisePage = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-luxury-red-dark pt-24 lg:pt-32 pb-20 px-6 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-luxury-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-luxury-gold transition-colors mb-12 uppercase text-[10px] font-black tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          RETURN TO HUB
        </button>

        <div className="space-y-20">
          {/* Header */}
          <header className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[9px] font-extrabold uppercase tracking-[.4em] mb-4">
                PLATFORM MANIFESTO
              </div>
              <h1 className="text-5xl lg:text-8xl font-serif font-black text-white leading-[0.9] tracking-tighter">
                What is <br/>
                <span className="gold-gradient-text italic">Longrise AI?</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl lg:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl"
            >
              Longrise AI is the world's premier neural-integrated wealth management engine, bridging the gap between volatile crypto markets and institutional financial stability.
            </motion.p>
          </header>

          {/* Core Vision */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -30 }}
              className="space-y-6 lg:border-l lg:border-white/10 lg:pl-12"
            >
              <h3 className="text-2xl font-serif font-black text-white uppercase tracking-widest flex items-center gap-4">
                <Globe className="text-luxury-gold" />
                Global Vision
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Born from the fusion of advanced neural networking and institutional-grade risk management, Longrise was established to democratize high-frequency quant trading for sovereign individuals. Our mission is to provide the same technological edge once reserved only for the world's largest hedge funds.
              </p>
              <p className="text-gray-400 leading-relaxed font-light">
                We operate at the intersection of decentralization and precision, ensuring that capital remains sovereign while its growth remains automated.
              </p>
            </motion.div>

            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 30 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col justify-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu size={120} />
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-mono font-black text-white">$142.5M+</p>
                <p className="text-[10px] text-luxury-gold font-black uppercase tracking-[0.4em]">Current AUM Capacity</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-mono font-black text-white">840K+</p>
                <p className="text-[10px] text-luxury-gold font-black uppercase tracking-[0.4em]">Global Node Network</p>
              </div>
            </motion.div>
          </section>

          {/* Pillars of Technology */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h3 className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.6em]">The V6 Master Architecture</h3>
              <h2 className="text-3xl lg:text-5xl font-serif font-black text-white">Neural Foundations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Zap, 
                  title: "Quant Neural AI", 
                  desc: "Utilizing massive-input neural networks to identify micro-anomalies across global liquidity meshes." 
                },
                { 
                  icon: Lock, 
                  title: "Sovereign Security", 
                  desc: "Multi-layer encryption and institutional custody protocols that ensure asset safety is non-negotiable." 
                },
                { 
                  icon: LineChart, 
                  title: "Tactical Execution", 
                  desc: "Automated execution logic that adapts to real-time volatility while maintaining strict risk filters." 
                }
              ].map((pillar, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 hover:border-luxury-gold/30 transition-all group"
                >
                  <pillar.icon size={32} className="text-luxury-gold mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-serif font-black text-white mb-4">{pillar.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* The Network Ecosystem */}
          <section className="relative p-12 lg:p-20 rounded-2xl bg-gradient-to-br from-luxury-red via-luxury-red-dark to-black border border-luxury-gold/20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl lg:text-4xl font-serif font-black text-white">Full-Stack Wealth <br/><span className="gold-gradient-text italic">Ecosystem.</span></h3>
                <div className="space-y-6">
                  {[
                    { icon: Layers, label: "Multi-layered Profit Packages" },
                    { icon: ShieldCheck, label: "Integrated Security Sentinel" },
                    { icon: Database, label: "Real-time Blockchain Analytics" }
                  ].map((item, id) => (
                    <div key={id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold">
                        <item.icon size={18} />
                      </div>
                      <span className="text-gray-300 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-left space-y-8 p-8 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm">
                <p className="text-gray-400 font-light leading-relaxed">
                  "Longrise AI is not just a platform; it is a movement towards absolute financial autonomy. By removing the emotional barrier from trading and replacing it with neural-precision, we redefine what is possible in the modern market."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-luxury-gold flex items-center justify-center font-black text-black">HQ</div>
                  <div>
                    <p className="text-white font-bold text-sm">Longrise Master Core</p>
                    <p className="text-[10px] text-luxury-gold font-black uppercase tracking-widest">Platform Genesis V6.0</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Call to Action */}
          <footer className="text-center py-20 border-t border-white/5">
                <h2 className="text-3xl lg:text-5xl font-serif font-black text-white mb-10">Ready to Begin <br/><span className="gold-gradient-text italic">Your Sovereignty?</span></h2>
                <button 
                  onClick={onBack}
                  className="gold-button !px-16 !py-6 text-sm uppercase tracking-[0.3em] font-black group"
                >
                  START JOURNEY <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
          </footer>
        </div>
      </div>
    </motion.div>
  );
};

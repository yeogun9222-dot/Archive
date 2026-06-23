import { useState } from 'react';
import { Package, Save, Eye, EyeOff, Settings, AlertCircle, TrendingUp, Info, X, DollarSign, Coins, ShieldAlert, History } from 'lucide-react';
import { cn } from '../lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  roi: string;
  bonus: string;
  lockIn: string;
  category: string;
  isPopular: boolean;
  status: 'Active' | 'Hidden';
  supply: number;
  sold: number;
  // New Details for Modal
  monthlyUsdt: number;
  monthlyCnyt: number;
  penalty1to6: number;
  penalty7to9: number;
  penalty10to11: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 'DWP-01', name: 'Flexible', price: 100, status: 'Active', roi: '48%', bonus: 'None', lockIn: 'No Lock-in', category: 'Entry Level', isPopular: false, supply: 99999, sold: 12450, monthlyUsdt: 4, monthlyCnyt: 0, penalty1to6: 0, penalty7to9: 0, penalty10to11: 0 },
  { id: 'DWP-02', name: 'Basic', price: 200, status: 'Active', roi: '84%', bonus: '2%', lockIn: '12 Months', category: 'Entry Level', isPopular: false, supply: 10000, sold: 4200, monthlyUsdt: 14, monthlyCnyt: 5, penalty1to6: 30, penalty7to9: 20, penalty10to11: 15 },
  { id: 'DWP-03', name: 'Standard', price: 500, status: 'Active', roi: '108%', bonus: '4%', lockIn: '12 Months', category: 'Entry Level', isPopular: true, supply: 5000, sold: 1250, monthlyUsdt: 45, monthlyCnyt: 20, penalty1to6: 30, penalty7to9: 20, penalty10to11: 15 },
  { id: 'DWP-04', name: 'Premium', price: 1000, status: 'Active', roi: '132%', bonus: '6%', lockIn: '12 Months', category: 'Entry Level', isPopular: false, supply: 2000, sold: 840, monthlyUsdt: 110, monthlyCnyt: 50, penalty1to6: 30, penalty7to9: 20, penalty10to11: 15 },
  { id: 'DWP-05', name: 'VIP', price: 5000, status: 'Active', roi: '216%', bonus: '10%', lockIn: '12 Months', category: 'Entry Level', isPopular: false, supply: 500, sold: 120, monthlyUsdt: 900, monthlyCnyt: 250, penalty1to6: 30, penalty7to9: 20, penalty10to11: 15 }
];

export function ProductControl() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === editingId);

  const handleUpdate = (id: string, field: keyof Product, value: any) => {
     setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-6 px-6 pb-12 relative">
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-2xl dashboard-card border-accent-amber/30 shadow-2xl relative overflow-hidden bg-bg-surface">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-amber via-accent-blue to-accent-amber opacity-30" />
              
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-amber/10 border border-accent-amber/20 rounded-lg text-accent-amber">
                       <Settings size={20} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white uppercase tracking-tight">{selectedProduct.name} 패키지 상세 구성</h3>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Investment Summary & Penalty Rules Configuration</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setEditingId(null)}
                   className="p-2 text-text-muted hover:text-white transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Monthly Summary */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <History size={16} className="text-accent-blue" />
                       <h4 className="text-[11px] font-black text-white uppercase tracking-wider">배당 서머리 (Monthly Summary)</h4>
                    </div>
                    
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-6">
                       <div>
                          <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-2">Monthly USDT Return (+)</label>
                          <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-green font-bold text-xs">$</div>
                             <input 
                               type="number"
                               value={selectedProduct.monthlyUsdt}
                               onChange={(e) => handleUpdate(selectedProduct.id, 'monthlyUsdt', parseInt(e.target.value) || 0)}
                               className="w-full bg-black/40 border border-border-main rounded-lg pl-8 pr-4 py-3 text-lg font-black text-white font-mono outline-none focus:border-accent-blue transition-all"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-2">Monthly CNYT Bonus (+)</label>
                          <div className="relative">
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-black text-[10px] uppercase">CNYT</div>
                             <input 
                               type="number"
                               value={selectedProduct.monthlyCnyt}
                               onChange={(e) => handleUpdate(selectedProduct.id, 'monthlyCnyt', parseInt(e.target.value) || 0)}
                               className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-3 text-lg font-black text-white font-mono outline-none focus:border-purple-500 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Cancellation Penalty */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldAlert size={16} className="text-red-500" />
                       <h4 className="text-[11px] font-black text-white uppercase tracking-wider">중도 해지 페널티 (Cancellation Policy)</h4>
                    </div>

                    <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-4">
                       <div className="grid grid-cols-2 items-center gap-4">
                          <span className="text-[10px] font-bold text-text-muted uppercase">1-6 Months</span>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number" 
                               value={selectedProduct.penalty1to6} 
                               onChange={(e) => handleUpdate(selectedProduct.id, 'penalty1to6', parseInt(e.target.value) || 0)}
                               className="w-full bg-black/40 border border-border-main rounded px-3 py-1.5 text-xs text-red-500 font-bold outline-none"
                             />
                             <span className="text-[10px] font-bold text-text-muted">%</span>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 items-center gap-4">
                          <span className="text-[10px] font-bold text-text-muted uppercase">7-9 Months</span>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number" 
                               value={selectedProduct.penalty7to9} 
                               onChange={(e) => handleUpdate(selectedProduct.id, 'penalty7to9', parseInt(e.target.value) || 0)}
                               className="w-full bg-black/40 border border-border-main rounded px-3 py-1.5 text-xs text-red-500 font-bold outline-none"
                             />
                             <span className="text-[10px] font-bold text-text-muted">%</span>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 items-center gap-4">
                          <span className="text-[10px] font-bold text-text-muted uppercase">10-11 Months</span>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number" 
                               value={selectedProduct.penalty10to11} 
                               onChange={(e) => handleUpdate(selectedProduct.id, 'penalty10to11', parseInt(e.target.value) || 0)}
                               className="w-full bg-black/40 border border-border-main rounded px-3 py-1.5 text-xs text-red-500 font-bold outline-none"
                             />
                             <span className="text-[10px] font-bold text-text-muted">%</span>
                          </div>
                       </div>
                       <div className="pt-2 flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-text-muted">12 Months (Maturity)</span>
                          <span className="text-accent-green">SAFE (0% FEE)</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-10 flex gap-4 pt-8 border-t border-white/5">
                 <button 
                   onClick={() => setEditingId(null)}
                   className="flex-1 py-3.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                 >
                    설정 닫기
                 </button>
                 <button 
                   onClick={() => setEditingId(null)}
                   className="flex-[2] py-3.5 btn-gold rounded-xl text-xs font-black uppercase tracking-widest"
                 >
                    패키지 서머리에 즉시 반영
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Global Node Controls */}
        <div className="lg:col-span-1 space-y-6">
           <div className="dashboard-card border-border-main bg-accent-blue/5">
              <div className="flex items-center gap-2 mb-4 text-accent-blue">
                 <Settings size={16} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">글로벌 제약 조건 (Constraints)</h4>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">UID당 최대 노드 수</label>
                    <input type="number" defaultValue={20} className="w-full bg-black/20 border border-border-main rounded px-3 py-1.5 text-xs text-text-primary" />
                 </div>
                 <div>
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">구매 간격 제한 (분)</label>
                    <input type="number" defaultValue={5} className="w-full bg-black/20 border border-border-main rounded px-3 py-1.5 text-xs text-text-primary" />
                 </div>
              </div>
              <button className="w-full mt-6 btn-gold py-2 text-[10px] uppercase font-bold tracking-widest">설정 동기화</button>
           </div>

           <div className="dashboard-card border-border-main">
              <div className="flex items-center gap-2 text-accent-green mb-4">
                 <TrendingUp size={16} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">노드 시장 총액</h4>
              </div>
              <p className="text-xl font-black text-text-primary">$1.45M</p>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                 <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                    <span className="text-text-muted">전체 활성 노드</span>
                    <span className="text-accent-green">14,280</span>
                 </div>
                 <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                    <span className="text-text-muted">평균 생명주기</span>
                    <span className="text-accent-blue">242 일</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
          <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
            <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-accent-blue" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">드래곤 웰스 패키지(DWP) 통합 관리 엔진</h3>
              </div>
              <button className="btn-outline-gold text-[10px] py-1.5 px-6 font-bold flex items-center gap-2 border-border-main">
                <Save size={14} /> 변경 사항 저장
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16 text-[10px]">ID</th>
                    <th className="text-[10px]">패키지 명칭</th>
                    <th className="text-[10px]">가격 (USDT)</th>
                    <th className="text-[10px]">락업 기간</th>
                    <th className="text-[10px]">ROI (%)</th>
                    <th className="text-[10px]">보너스 (%)</th>
                    <th className="text-[10px]">인기 표시</th>
                    <th className="sticky right-0 top-0 bg-bg-surface z-10 text-right text-[10px] border-l border-white/10 px-4">제어</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01]">
                      <td className="font-mono text-[10px] text-text-muted font-bold opacity-60 italic">{p.id}</td>
                      <td>
                        <div className="flex flex-col">
                           <span className="font-bold text-text-primary text-[11px] uppercase tracking-tight">{p.name}</span>
                           <span className="text-[8px] text-text-muted uppercase font-black">{p.category}</span>
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold text-text-primary">
                        ${p.price.toLocaleString()}
                      </td>
                      <td>
                        <input 
                           type="text" 
                           value={p.lockIn} 
                           onChange={(e) => handleUpdate(p.id, 'lockIn', e.target.value)}
                           className="bg-black/40 border border-border-main rounded px-2 py-1 text-[11px] text-text-muted w-20 focus:border-accent-blue/50 outline-none"
                        />
                      </td>
                      <td>
                        <input 
                           type="text" 
                           value={p.roi} 
                           onChange={(e) => handleUpdate(p.id, 'roi', e.target.value)}
                           className="bg-black/40 border border-border-main rounded px-2 py-1 text-[11px] text-accent-blue w-14 focus:border-accent-blue/50 outline-none font-bold tabular-nums"
                        />
                      </td>
                      <td>
                        <input 
                           type="text" 
                           value={p.bonus} 
                           onChange={(e) => handleUpdate(p.id, 'bonus', e.target.value)}
                           className="bg-black/40 border border-border-main rounded px-2 py-1 text-[11px] text-purple-400 w-14 focus:border-purple-500/50 outline-none font-bold tabular-nums"
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => handleUpdate(p.id, 'isPopular', !p.isPopular)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all border",
                            p.isPopular ? "bg-accent-amber text-black border-accent-amber" : "bg-transparent text-text-muted border-white/10"
                          )}
                        >
                          {p.isPopular ? 'Popular' : 'Normal'}
                        </button>
                      </td>
                      <td className="sticky right-0 bg-bg-surface z-10 text-right border-l border-white/10 px-4">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => setEditingId(p.id)}
                             className="p-1.5 hover:bg-white/5 rounded text-text-muted hover:text-accent-blue transition-colors border border-transparent hover:border-accent-blue/20"
                             title="상세 구성 설정"
                           >
                              <Settings size={14} />
                           </button>
                           <button 
                             onClick={() => handleUpdate(p.id, 'status', p.status === 'Active' ? 'Hidden' : 'Active')}
                             className={cn(
                               "flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all border",
                               p.status === 'Active' ? "text-accent-green bg-accent-green/10 border-accent-green/20" : "text-text-muted bg-white/5 border-border-main"
                             )}
                           >
                             {p.status === 'Active' ? <Eye size={12} /> : <EyeOff size={12} />}
                             {p.status === 'Active' ? '판매 중' : '숨김'}
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-black/20 border-t border-border-main">
               <div className="flex gap-4">
                  <div className="p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-accent-blue shrink-0 h-fit">
                    <Info size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.1em]">상품 정책 거버넌스 (Policy Board V7.2)</h4>
                    <p className="text-[10px] text-text-muted mt-2 leading-relaxed max-w-4xl italic">
                      ROI 조정은 다음 배당 블록부터 모든 활성 계약에 소급 적용됩니다.
                      중도 해지 페널티 구조는 'Cancellation Policy' 모달 설정을 따르며, 법적 효력을 위해 이용약관과 동기화되어야 합니다.
                      노드 계층 구조는 배포 후 변경 불가능하며, "숨김" 상태를 사용하여 중단된 상품 라인을 폐기하십시오.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

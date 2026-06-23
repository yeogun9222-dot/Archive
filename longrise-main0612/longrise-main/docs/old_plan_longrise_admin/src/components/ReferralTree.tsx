import { useState, useMemo } from 'react';
import { Network, Search, ShieldCheck, Database, Filter, ArrowUpRight, Move, RefreshCw, ZoomIn, ZoomOut, AlertTriangle, Layers, UserCog, CheckCircle2, XCircle, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_USERS } from '../lib/mockData';

type ViewMode = 'search' | 'global';

export function ReferralTree() {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // For Global View deep-dive
  const [globalRootId, setGlobalRootId] = useState<string | null>(null);

  const handleSearch = () => {
    const user = MOCK_USERS.find(u => 
      u.id.toLowerCase() === searchQuery.toLowerCase() || 
      u.nickname.toLowerCase() === searchQuery.toLowerCase()
    );

    if (user) {
      // Find direct children for search view
      const children = MOCK_USERS.filter(u => u.sponsorId === user.id);
      
      setTargetUser({
        ...user,
        maxDepth: 25,
        totalOrg: user.teamSize || 15420,
        nodes: [
          { id: 'ROOT', name: user.nickname, rank: user.rank, level: 0, volume: user.teamVol, directs: user.directs, isTarget: true, data: user },
          ...children.map((child, idx) => ({
            id: `CHILD_${idx}`,
            name: child.nickname,
            rank: child.rank,
            level: 1,
            volume: child.teamVol,
            directs: child.directs,
            parent: 'ROOT',
            data: child
          }))
        ]
      });
      setViewMode('search');
    } else {
      alert('회원을 정확히 찾을 수 없습니다.');
    }
  };

  const handleMoveNode = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('노드 스폰서 강제 재배치가 완료되었습니다. 정산 엔진 재검색이 필요합니다.');
      setSelectedNode(null);
    }, 1200);
  };

  // Global Tree Logic: Build 5 levels from root
  const globalTreeData = useMemo(() => {
    // Determine the root of the "Global View"
    // If globalRootId is set, start from there. Otherwise, find SYSTEM roots.
    let rootUsers = [];
    if (globalRootId) {
       const u = MOCK_USERS.find(x => x.id === globalRootId);
       if (u) rootUsers = [u];
    } else {
       rootUsers = MOCK_USERS.filter(u => u.sponsorId === 'SYSTEM' || !u.sponsorId);
    }

    const buildTree = (user: any, depth: number): any => {
      if (depth >= 5) {
        return { ...user, children: [], hasMore: true };
      }
      const children = MOCK_USERS.filter(u => u.sponsorId === user.id);
      return {
        ...user,
        children: children.map(c => buildTree(c, depth + 1)),
        hasMore: false
      };
    };

    return rootUsers.map(u => buildTree(u, 0));
  }, [globalRootId]);

  const renderGlobalNode = (node: any, depth: number = 0) => {
    const isSpecialRank = ['Black Dragon', 'Red Dragon', 'Purple Dragon'].includes(node.rank);
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div 
          onClick={() => setSelectedNode({ ...node, name: node.nickname })}
          className={cn(
            "relative group cursor-pointer transition-all hover:-translate-y-1 mb-6",
            depth === 0 ? "scale-110 mb-8" : "scale-100"
          )}
        >
          <div className={cn(
            "w-44 p-4 rounded-2xl border bg-[#0f172a] shadow-xl relative overflow-hidden",
            node.rank === 'Black Dragon' ? 'border-accent-amber/50 shadow-accent-amber/5' :
            node.rank === 'Red Dragon' ? 'border-red-500/50 shadow-red-500/5' :
            node.rank === 'Purple Dragon' ? 'border-purple-500/50 shadow-purple-500/5' :
            'border-white/10 shadow-white/5'
          )}>
             {/* Rank Indicator */}
             <div className={cn(
               "absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 opacity-20",
               node.rank === 'Black Dragon' ? 'bg-accent-amber' :
               node.rank === 'Red Dragon' ? 'bg-red-500' :
               node.rank === 'Purple Dragon' ? 'bg-purple-500' : 'bg-slate-500'
             )} />

             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">LV {depth} NODE</div>
             <div className="text-sm font-bold text-white truncate">{node.nickname}</div>
             <div className={cn("text-[10px] font-black uppercase mt-0.5", 
               node.rank === 'Black Dragon' ? 'text-accent-amber' :
               node.rank === 'Red Dragon' ? 'text-red-500' : 
               node.rank === 'Purple Dragon' ? 'text-purple-500' : 'text-slate-400'
             )}>{node.rank}</div>
             
             <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] text-slate-500 font-bold uppercase">Vol</span>
                <span className="text-[10px] font-mono font-bold text-white">${(node.teamVol || 0).toLocaleString()}</span>
             </div>

             {/* Deep Dive Button for level 5 or nodes with more children */}
             {(depth === 4 || node.hasMore) && (
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalRootId(node.id);
                }}
                className="absolute bottom-1 right-1 p-1 bg-accent-blue/20 text-accent-blue rounded-md hover:bg-accent-blue transition-colors group/edit"
               >
                 <ArrowUpRight size={10} className="group-hover/edit:scale-125 transition-transform" />
               </button>
             )}
          </div>
          
          {/* Vertical line to children */}
          {node.children && node.children.length > 0 && (
            <div className="absolute left-1/2 -bottom-6 w-[2px] h-6 bg-white/10 -translate-x-1/2" />
          )}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="relative pt-6">
            {/* Horizontal connection line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 hidden md:block" />
            <div className="flex gap-8 px-4">
              {node.children.map((child: any) => renderGlobalNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header with Search & Mode Switcher */}
      <div className="dashboard-card border-accent-amber/20 bg-[#0f172a]/90 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-accent-amber/10 border border-accent-amber/20 rounded-2xl text-accent-amber shadow-lg shadow-accent-amber/5">
                <Network size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">조직 계보 마스터 제어 터미널</h3>
                <div className="flex items-center gap-4 mt-1.5">
                   <button 
                    onClick={() => setViewMode('search')}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full transition-all",
                      viewMode === 'search' ? "bg-accent-amber text-black" : "text-slate-500 hover:text-white"
                    )}
                   >
                     <Search size={14} /> Search Audit
                   </button>
                   <button 
                    onClick={() => {
                      setViewMode('global');
                      setGlobalRootId(null); // Reset to system roots
                    }}
                   className={cn(
                      "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full transition-all",
                      viewMode === 'global' ? "bg-accent-amber text-black" : "text-slate-500 hover:text-white"
                    )}
                   >
                     <Globe size={14} /> Global Map (5 Levels)
                   </button>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="ID 또는 닉네임 (Global Search)"
                   className="w-80 bg-black/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-accent-amber outline-none transition-all placeholder:text-slate-700"
                />
             </div>
             <button 
                onClick={handleSearch} 
                className="btn-gold py-3 px-8 rounded-xl text-[12px] uppercase tracking-wider transition-all h-[46px]"
             >
                Run Audit
             </button>
          </div>
        </div>
      </div>

      {viewMode === 'search' ? (
        <>
          {!targetUser ? (
            <div className="dashboard-card border-dashed border-white/10 flex flex-col items-center justify-center py-32 opacity-30 select-none">
               <Network size={80} className="text-slate-500 mb-6" />
               <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-400">Node Entry Protocol Pending</p>
               <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest text-center max-w-md">
                 조직도를 분석할 회원을 검색창에서 조회하십시오. <br/> (예: CryptoWhale, InvestJP)
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <div className="xl:col-span-3 space-y-6">
                  <div className="dashboard-card bg-[#1e293b]/50 border-white/5 p-8 relative overflow-hidden group">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
                           <Layers size={24} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Node Explorer</h4>
                           <p className="text-lg font-bold text-white uppercase tracking-tight">{targetUser.nickname}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direct Partners</span>
                           <span className="text-sm font-black text-white">{targetUser.directs}</span>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Team Vol</span>
                           <span className="text-sm font-black text-accent-amber">${targetUser.teamVol.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="dashboard-card border-white/5 bg-white/[0.02] p-8">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Search Quick Tools</h4>
                    <div className="space-y-3 font-bold">
                       <button className="w-full flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">Tree Consistency Check</span>
                          <RefreshCw size={14} className="text-slate-500 group-hover:text-accent-blue" />
                       </button>
                       <button className="w-full flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-accent-amber/40 hover:bg-accent-amber/5 transition-all group">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">Audit Logs</span>
                          <Database size={14} className="text-slate-500 group-hover:text-accent-amber" />
                       </button>
                    </div>
                  </div>
               </div>

               <div className="xl:col-span-9">
                  <div className="dashboard-card p-0 overflow-hidden border-white/5 min-h-[600px] flex flex-col bg-[#020617] relative">
                     <div className="bg-[#0f172a] border-b border-white/5 px-8 py-5 flex items-center justify-between z-20">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-accent-green" /> Linked Node Visualization
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center bg-black/60 border border-white/5 rounded-xl p-1.5">
                              <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 text-slate-400 hover:text-white"><ZoomOut size={16}/></button>
                              <span className="text-[10px] font-mono text-slate-500 px-3 min-w-[50px] text-center">{Math.round(zoomLevel * 100)}%</span>
                              <button onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 text-slate-400 hover:text-white"><ZoomIn size={16}/></button>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 relative overflow-auto p-12 custom-scrollbar">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <div className="relative z-10 transition-transform duration-500" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                           <div className="flex flex-col items-center">
                              {/* Central Node */}
                              <div onClick={() => setSelectedNode(targetUser)} className="w-56 p-6 bg-slate-900 border-2 border-accent-amber rounded-[2rem] shadow-2xl flex flex-col items-center space-y-3 cursor-pointer hover:scale-105 transition-all">
                                 <div className="badge-gold text-[8px] px-3">TARGET ROOT</div>
                                 <div className="text-xl font-black text-white">{targetUser.nickname}</div>
                                 <div className="text-[10px] font-black text-accent-amber uppercase">{targetUser.rank}</div>
                                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-accent-green">
                                    <ShieldCheck size={12} /> SECURED NODE
                                 </div>
                              </div>
                              <div className="w-[2px] h-12 bg-gradient-to-b from-accent-amber to-white/10" />
                              <div className="flex gap-12 pt-0">
                                 {targetUser.nodes.filter((n: any) => n.parent === 'ROOT').map((child: any) => (
                                    <div key={child.id} className="flex flex-col items-center">
                                       <div className="w-[1px] h-8 bg-white/10" />
                                       <div onClick={() => setSelectedNode(child.data)} className={cn(
                                         "w-44 p-4 bg-slate-900 border rounded-2xl flex flex-col items-center space-y-2 cursor-pointer hover:-translate-y-1 transition-all",
                                         child.rank === 'Black Dragon' ? 'border-accent-amber shadow-accent-amber/5' : 'border-white/10 shadow-white/5'
                                       )}>
                                          <div className="text-[9px] font-bold text-white">{child.name}</div>
                                          <div className="text-[8px] font-black text-slate-500 uppercase">{child.rank}</div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </>
      ) : (
        /* Global Map Mode */
        <div className="dashboard-card p-0 overflow-hidden border-white/5 min-h-[750px] flex flex-col bg-[#020617] relative ring-1 ring-white/10">
           <div className="bg-[#0f172a] border-b border-white/5 px-8 py-5 flex items-center justify-between z-20">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Global Genealogy (5 Levels Matrix)</span>
                 </div>
                 {globalRootId && (
                   <button 
                    onClick={() => setGlobalRootId(null)}
                    className="text-[10px] font-bold text-accent-blue hover:underline bg-accent-blue/10 px-3 py-1 rounded-md"
                   >
                     Reset to Master Root ↑
                   </button>
                 )}
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center bg-black/60 border border-white/5 rounded-xl p-1.5 shadow-inner">
                    <button onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))} className="p-1.5 text-slate-400 hover:text-white"><ZoomOut size={16}/></button>
                    <span className="text-[11px] font-mono text-slate-500 px-4 min-w-[70px] text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))} className="p-1.5 text-slate-400 hover:text-white"><ZoomIn size={16}/></button>
                 </div>
              </div>
           </div>

           <div className="flex-1 relative overflow-auto p-20 custom-scrollbar flex items-start justify-center">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #38bdf8 1.5px, transparent 1.5px), linear-gradient(to bottom, #38bdf8 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
              
              <div className="relative z-10 transition-transform duration-700 ease-out" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                 <div className="flex gap-20">
                    {globalTreeData.map(rootNode => renderGlobalNode(rootNode, 0))}
                 </div>
              </div>
           </div>
           
           <div className="bg-[#0f172a]/95 backdrop-blur-md p-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-10">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-accent-blue/30 rounded-full" />
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Matrix View Mode</p>
                       <p className="text-[11px] font-black text-white uppercase tracking-widest">Recursive Load: <span className="text-accent-amber">Enabled</span></p>
                    </div>
                 </div>
                 <div className="flex gap-1.5 items-center">
                   {[5, 4, 3, 2, 1].map(lvl => (
                     <div key={lvl} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-400">
                       L{lvl}
                     </div>
                   ))}
                   <span className="text-[10px] text-slate-500 font-bold ml-2">Display Depth</span>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase italic">Tip: Click node to see details or 深 Dive button to explore deeper</p>
           </div>
        </div>
      )}

      {/* Shared Node Control Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-[#1e293b] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-6">
                    <div className={cn("p-5 rounded-2xl border bg-black shadow-inner", 
                      selectedNode.rank === 'Black Dragon' ? 'border-accent-amber text-accent-amber' : 
                      selectedNode.rank === 'Red Dragon' ? 'border-red-500 text-red-500' : 
                      selectedNode.rank === 'Purple Dragon' ? 'border-purple-500 text-purple-500' : 'border-slate-500 text-slate-500'
                    )}>
                       <UserCog size={36} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedNode.nickname}</h3>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn("px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest", 
                            selectedNode.rank === 'Black Dragon' ? 'bg-accent-amber text-black' : 'bg-white/5 text-slate-400'
                          )}>{selectedNode.rank}</span>
                          <span className="text-[10px] text-accent-blue font-bold uppercase tracking-wider bg-accent-blue/10 px-2 py-1 rounded">UID: {selectedNode.id}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedNode(null)} className="p-2 text-slate-500 hover:text-white transition-all transform hover:rotate-90">
                    <XCircle size={32} />
                 </button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-accent-amber pl-3">Audit Details</h4>
                    <div className="space-y-3">
                       {[
                         { label: 'Register Date', val: selectedNode.joinDate },
                         { label: 'Body Balance', val: `$${(selectedNode.usdt || 0).toLocaleString()}` },
                         { label: 'Direct Referrals', val: selectedNode.directs },
                         { label: 'Network Points', val: (selectedNode.teamVol || 0).toLocaleString() },
                         { label: 'Sponsor Link', val: selectedNode.sponsorId || 'SYSTEM' },
                       ].map(s => (
                         <div key={s.label} className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-colors">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</span>
                            <span className="text-sm font-black text-white font-mono">{s.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest border-l-2 border-red-500 pl-3">Structure Overrides</h4>
                    <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl p-6 space-y-4 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <AlertTriangle size={64} className="text-red-500" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest px-1">Relocate to Sponsor UID</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-red-500 transition-all shadow-inner"
                            placeholder="LR-XXXX"
                          />
                       </div>
                       <button 
                         onClick={handleMoveNode}
                         className="w-full py-4 bg-red-500 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                       >
                          Finalize Migration
                       </button>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                       <ShieldCheck size={20} className="text-accent-blue shrink-0" />
                       <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                          Warning: All migrations are logged. Moving a leaf node to a parallel branch will recalculate points for all ancestors.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Global Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center">
           <RefreshCw size={80} className="text-red-500 animate-spin mb-8" />
           <p className="text-3xl font-black text-white uppercase tracking-[0.5em] animate-pulse">Relocating Node...</p>
           <p className="text-xs text-red-500 mt-4 font-bold uppercase tracking-widest opacity-60">Synchronizing Global Ledger & Re-calculating Tree Points</p>
        </div>
      )}
    </div>
  );
}

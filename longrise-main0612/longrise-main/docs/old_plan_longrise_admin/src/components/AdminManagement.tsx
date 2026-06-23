import { useState } from 'react';
import { Shield, UserPlus, Key, RefreshCcw, Search, Eye, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminAccount {
  id: string;
  name: string;
  role: 'Super Admin' | 'Finance Op' | 'Support Op' | 'Strategy Dev';
  lastActive: string;
  status: 'Active' | 'Suspended';
}

const MOCK_ADMINS: AdminAccount[] = [
  { id: 'ADM-001', name: 'Master_Architect', role: 'Super Admin', lastActive: '현재', status: 'Active' },
  { id: 'ADM-005', name: 'Fiat_Manager_K', role: 'Finance Op', lastActive: '12분 전', status: 'Active' },
  { id: 'ADM-012', name: 'Agent_007', role: 'Support Op', lastActive: '2시간 전', status: 'Active' },
  { id: 'ADM-009', name: 'Dev_Legacy_X', role: 'Strategy Dev', lastActive: '1일 전', status: 'Suspended' },
];

export function AdminManagement() {
  const translateRole = (role: string) => {
    const roles: any = {
      'Super Admin': '슈퍼 관리자',
      'Finance Op': '재무 운영자',
      'Support Op': '지원 운영자',
      'Strategy Dev': '전략 개발자'
    };
    return roles[role] || role;
  };

  const translateStatus = (status: string) => {
    const statuses: any = {
      'Active': '활성',
      'Suspended': '일시 정지'
    };
    return statuses[status] || status;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="flex items-center justify-between mb-2">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="dashboard-card border-border-main py-4 flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">활성 관리자 수</p>
                  <p className="text-xl font-black text-text-primary">3</p>
               </div>
               <Shield className="text-accent-blue" size={24} />
            </div>
            <div className="dashboard-card border-border-main py-4 flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">최고 권한 상태</p>
                  <p className="text-xl font-black text-text-primary">마스터(Master)</p>
               </div>
               <Key className="text-accent-amber" size={24} />
            </div>
         </div>
         <div className="ml-6 flex items-center gap-3">
            <button className="btn-gold text-[10px] py-1.5 px-6 font-bold flex items-center gap-2">
               <UserPlus size={14} /> 신규 관리자 계정 생성
            </button>
         </div>
      </div>

      <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">내부 권한 매트릭스 (Authority Matrix)</h3>
            <div className="flex gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                  <input 
                     type="text" 
                     placeholder="관리자 ID 검색..." 
                     className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-48"
                  />
               </div>
               <button className="p-1.5 border border-border-main rounded hover:bg-white/5 text-text-muted">
                  <RefreshCcw size={14} />
               </button>
            </div>
         </div>
         <table className="data-table">
            <thead>
               <tr>
                  <th className="text-[10px]">액세스 ID</th>
                  <th className="text-[10px]">관리자명</th>
                  <th className="text-[10px]">할당된 역할</th>
                  <th className="text-[10px]">최종 활동 일시</th>
                  <th className="text-[10px]">계정 상태</th>
                  <th className="text-right text-[10px]">거버넌스 제어</th>
               </tr>
            </thead>
            <tbody>
               {MOCK_ADMINS.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.01] group">
                     <td className="font-mono text-[10px] text-text-muted font-bold italic opacity-60">{a.id}</td>
                     <td className="text-[11px] font-bold text-text-primary uppercase tracking-tight">{a.name}</td>
                     <td>
                        <span className="text-[9px] font-black uppercase text-accent-blue/80 tracking-widest">{translateRole(a.role)}</span>
                     </td>
                     <td className="text-[9px] text-text-muted font-bold uppercase">{a.lastActive}</td>
                     <td>
                        <div className="flex items-center gap-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", a.status === 'Active' ? "bg-accent-green shadow-accent-green/40" : "bg-red-500 shadow-red-500/40")} />
                           <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{translateStatus(a.status)}</span>
                        </div>
                     </td>
                     <td className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button className="text-[9px] font-black uppercase border border-accent-blue/30 px-3 py-1.5 rounded text-accent-blue hover:bg-accent-blue/10">권한 로그</button>
                           <button className="p-1.5 text-text-muted hover:text-white"><MoreVertical size={14} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="p-6 bg-black/30 border-t border-border-main">
            <div className="flex items-center gap-3">
               <Shield className="text-accent-blue opacity-50" size={16} />
               <p className="text-[9px] text-text-muted font-medium italic">
                  중요 경고: 관리자 계정은 FDS 잠금을 우회할 수 있는 특권을 가집니다.
                  모든 권한 행사 기록은 변경 불가능한 오프체인 장부에 기록됩니다.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

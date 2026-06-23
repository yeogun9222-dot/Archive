import { useState } from 'react';
import { 
  UserCheck, 
  UserX, 
  Search, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_USERS } from '../lib/mockData';

export function KYCVerification() {
  const pendingUsers = MOCK_USERS.filter(u => u.pageface === 'Pending');

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card border-border-main">
          <h4 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">검토 대기 중</h4>
          <p className="text-2xl font-black text-text-primary tabular-nums">{pendingUsers.length}</p>
        </div>
        <div className="dashboard-card border-border-main">
          <h4 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">오늘 승인 완료</h4>
          <p className="text-2xl font-black text-accent-green tabular-nums">24</p>
        </div>
        <div className="dashboard-card border-border-main">
          <h4 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">거절 비율</h4>
          <p className="text-2xl font-black text-red-500 tabular-nums">1.2%</p>
        </div>
        <div className="dashboard-card border-border-main">
          <h4 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">AI 자동 통과율</h4>
          <p className="text-2xl font-black text-accent-blue tabular-nums">85%</p>
        </div>
      </div>

      <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
        <div className="p-6 border-b border-border-main bg-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent-blue" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">KYC 및 신원 승인 데스크</h3>
          </div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">정책: V7.2 글로벌 컴플라이언스 준수</p>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="text-[10px]">회원 프로필</th>
              <th className="text-[10px]">제출 카테고리</th>
              <th className="text-[10px]">증빙 서류 이미지</th>
              <th className="text-[10px]">AI 매칭 점수</th>
              <th className="text-[10px]">진행 상태</th>
              <th className="text-right text-[10px]">최종 승인/거절</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] group">
                <td>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-text-primary">{u.nickname}</span>
                    <span className="text-[10px] text-text-muted font-mono">{u.id}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <FileText size={12} />
                    <span className="text-[10px] font-bold uppercase">여권 / 신분증</span>
                  </div>
                </td>
                <td>
                  <div className="w-16 h-10 bg-black/40 border border-white/5 rounded flex items-center justify-center cursor-pointer hover:border-accent-blue/50 transition-all">
                    <Eye size={14} className="text-text-muted" />
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-black/30 rounded-full overflow-hidden">
                       <div className="h-full bg-accent-green w-[92%]" />
                    </div>
                    <span className="text-[10px] font-mono text-accent-green font-bold">92%</span>
                  </div>
                </td>
                <td>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border text-accent-amber bg-accent-amber/10 border-accent-amber/20">
                    관리자 승인 대기
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2 px-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20">
                      <UserX size={14} />
                    </button>
                    <button className="p-2 rounded bg-accent-green/10 text-accent-green hover:bg-accent-green/20 border border-accent-green/20">
                      <UserCheck size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Shield, Lock, UserPlus, Key, Mail, ShieldAlert, CheckCircle2, XCircle, Settings, ToggleLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function PolicySecurity({ view }: { view: string }) {
  const isAuthView = view === 'fe_auth';

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration & Authentication Policy */}
        <div className={cn("dashboard-card border-border-main", !isAuthView && "opacity-50 blur-[1px] pointer-events-none")}>
           <div className="flex items-center gap-2 mb-6 border-b border-border-main pb-4">
              <UserPlus size={18} className="text-accent-blue" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">회원 가입 및 인증 정책 (Auth Policy)</h3>
           </div>
           
           <div className="space-y-6">
              <PolicyToggle 
                label="신규 회원 가입 허용" 
                desc="플랫폼 전체의 신규 사용자 유입을 허용하거나 차단합니다."
                active={true}
              />
              <PolicyToggle 
                label="이메일 인증 필수 (OTP)" 
                desc="가입 시 반드시 이메일 인증 코드를 확인하도록 강제합니다."
                active={true}
              />
              <PolicyToggle 
                label="추천인 코드 필수 (Invitation Only)" 
                desc="추천인 코드가 없는 사용자의 가입을 제한합니다."
                active={true}
              />
              <div className="pt-4 space-y-3">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">회원 가입 기본 드래곤 등급</label>
                 <select className="w-full bg-black/20 border border-border-main rounded px-4 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50">
                    <option>Investor (기본)</option>
                    <option>White Dragon</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Global Security Hardening */}
        <div className={cn("dashboard-card border-border-main", isAuthView && "opacity-50 blur-[1px] pointer-events-none")}>
           <div className="flex items-center gap-2 mb-6 border-b border-border-main pb-4">
              <ShieldAlert size={18} className="text-red-400" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">전역 보안 강화 설정 (Hardening)</h3>
           </div>

           <div className="space-y-6">
              <PolicyToggle 
                label="2단계 인증(2FA) 강제화" 
                desc="출금 및 자산 이동 시 Google OTP 인증을 필수로 설정합니다."
                active={true}
                urgent
              />
              <PolicyToggle 
                label="관리자 세션 타임아웃 (15m)" 
                desc="활동이 없는 관리자 세션을 15분 후 자동 종료합니다."
                active={true}
              />
              <PolicyToggle 
                label="API 엑세스 화이트리스트" 
                desc="등록된 IP 주소에서만 관리자 API 호출을 허용합니다."
                active={false}
              />
              <div className="pt-4 space-y-3">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">최소 비밀번호 복잡도</label>
                 <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-accent-blue/10 border border-accent-blue/30 rounded text-[10px] font-bold text-accent-blue uppercase">보통</button>
                    <button className="flex-1 py-2 bg-black/40 border border-white/5 rounded text-[10px] font-bold text-text-muted uppercase">강함</button>
                    <button className="flex-1 py-2 bg-black/40 border border-white/5 rounded text-[10px] font-bold text-text-muted uppercase">매우 강함</button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="dashboard-card border-border-main bg-black/20">
         <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-full text-accent-amber">
                  <Key size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">마스터 마이그레이션 및 초기화</h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed max-w-2xl italic">
                     보안 정책을 변경하면 플랫폼 전체 노드에 즉시 소급 적용됩니다. 
                     가입 정책 변경은 현재 진행 중인 세션에는 영향을 주지 않지만, 신규 요청부터 즉시 반영됩니다.
                  </p>
               </div>
            </div>
            <button className="btn-gold py-2 px-10 text-xs font-black uppercase tracking-widest">글로벌 보안 정책 선포</button>
         </div>
      </div>
    </div>
  );
}

function PolicyToggle({ label, desc, active, urgent }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 border border-border-main rounded-lg group">
       <div className="pr-4">
          <p className={cn("text-xs font-bold uppercase tracking-tight", urgent ? "text-red-400" : "text-text-primary")}>{label}</p>
          <p className="text-[9px] text-text-muted mt-1 font-medium italic">{desc}</p>
       </div>
       <div className={cn(
         "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
         active ? (urgent ? "bg-red-500" : "bg-accent-green") : "bg-slate-700"
       )}>
          <div className={cn(
            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
            active ? "right-1" : "left-1"
          )} />
       </div>
    </div>
  );
}

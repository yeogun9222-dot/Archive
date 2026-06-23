import { useState } from 'react';
import { ShieldCheck, UserPlus, Mail, Lock, AlertCircle, RefreshCw, Save, Power, UserMinus, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthPolicyControl() {
  const [config, setConfig] = useState({
    allowSignup: true,
    allowLogin: true,
    requireEmailVerify: true,
    maintenanceMode: false,
    maxLoginAttempts: 5,
    signupGreeting: 'Join Longrise',
    signupSub: 'No complex ID verification required. Enter your email for instant verification.',
    loginGreeting: 'Welcome Back',
    loginSub: 'ENTER YOUR CREDENTIALS'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Policy Header */}
      <div className="dashboard-card border-accent-blue/20 bg-accent-blue/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-xl text-accent-blue">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">인증 및 가입 정책 마스터 센터</h3>
                <p className="text-[10px] text-accent-blue font-bold uppercase tracking-widest mt-1">플랫폼의 진입로(로그인/가입) 보안 및 운영 로직을 실시간 제어합니다.</p>
             </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-gold px-8 py-2.5 flex items-center gap-2 text-[11px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? '서버 적용 중...' : '변경 사항 즉시 반영'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Access Switches */}
        <div className="dashboard-card space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <Power size={18} className="text-accent-green" />
              <h4 className="text-sm font-bold text-white uppercase">시스템 진입 스위치 (Global Access)</h4>
           </div>
           
           <div className="space-y-4">
              <ToggleItem 
                label="신규 회원 가입 허용" 
                desc="비활성화 시 SIGN UP 페이지에서 가입이 차단됩니다."
                active={config.allowSignup}
                onToggle={() => setConfig({...config, allowSignup: !config.allowSignup})}
                icon={UserPlus}
              />
              <ToggleItem 
                label="전체 로그인 허용" 
                desc="비활성화 시 기존 회원의 로그인이 차단됩니다."
                active={config.allowLogin}
                onToggle={() => setConfig({...config, allowLogin: !config.allowLogin})}
                icon={Lock}
              />
              <ToggleItem 
                label="이메일 인증 필수화" 
                desc="비활성화 시 Verification Code 없이 즉시 가입됩니다."
                active={config.requireEmailVerify}
                onToggle={() => setConfig({...config, requireEmailVerify: !config.requireEmailVerify})}
                icon={Mail}
                color="text-accent-blue"
              />
              <ToggleItem 
                label="점검 모드 (Maintenance)" 
                desc="활성화 시 메인 화면에 점검 안내가 표시됩니다."
                active={config.maintenanceMode}
                onToggle={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                icon={AlertCircle}
                color="text-red-500"
              />
           </div>
        </div>

        {/* Security Thresholds */}
        <div className="dashboard-card space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-red-400" />
              <h4 className="text-sm font-bold text-white uppercase">보안 임계치 설정 (Security)</h4>
           </div>
           
           <div className="p-6 bg-black/40 rounded-xl border border-white/5 space-y-6">
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">최대 로그인 시도 제한 (Lockout)</label>
                    <span className="text-xl font-black text-white">{config.maxLoginAttempts}회</span>
                 </div>
                 <input 
                   type="range" 
                   min="3" 
                   max="20" 
                   step="1"
                   value={config.maxLoginAttempts}
                   onChange={(e) => setConfig({...config, maxLoginAttempts: parseInt(e.target.value)})}
                   className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-accent-blue"
                 />
                 <div className="flex justify-between mt-2 text-[8px] text-text-muted font-bold">
                    <span>최소 3회</span>
                    <span>최대 20회</span>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                 <p className="text-[9px] text-text-muted leading-relaxed font-bold italic">
                    * 설정된 횟수 이상 로그인 실패 시 해당 IP는 30분간 차단됩니다.<br />
                    * 이 설정은 실시간으로 FDS 감지 엔진과 동기화됩니다.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Copywriting Control - Based on the Screenshots */}
      <div className="dashboard-card">
         <div className="flex items-center gap-2 mb-8">
            <RefreshCw size={18} className="text-purple-400" />
            <h4 className="text-sm font-bold text-white uppercase">캡처본 기반 문구 제어 (Auth UI CMS)</h4>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Login Side */}
            <div className="space-y-4 p-6 bg-black/20 rounded-xl border border-white/5">
               <span className="text-[10px] font-black text-accent-amber uppercase tracking-widest bg-accent-amber/10 px-3 py-1 rounded">Login Page View</span>
               <div>
                  <label className="text-[9px] font-bold text-text-muted mb-1 block">Main Header (Login)</label>
                  <input 
                    type="text" 
                    value={config.loginGreeting}
                    onChange={(e) => setConfig({...config, loginGreeting: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-sm text-white focus:border-accent-blue outline-none"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-bold text-text-muted mb-1 block">Subtext (Login)</label>
                  <input 
                    type="text" 
                    value={config.loginSub}
                    onChange={(e) => setConfig({...config, loginSub: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-xs text-text-muted focus:border-accent-blue outline-none"
                  />
               </div>
            </div>

            {/* Signup Side */}
            <div className="space-y-4 p-6 bg-black/20 rounded-xl border border-white/5">
               <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest bg-accent-blue/10 px-3 py-1 rounded">Signup Page View</span>
               <div>
                  <label className="text-[9px] font-bold text-text-muted mb-1 block">Main Header (Signup)</label>
                  <input 
                    type="text" 
                    value={config.signupGreeting}
                    onChange={(e) => setConfig({...config, signupGreeting: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-sm text-white focus:border-accent-blue outline-none"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-bold text-text-muted mb-1 block">Subtext (Signup)</label>
                  <textarea 
                    rows={2}
                    value={config.signupSub}
                    onChange={(e) => setConfig({...config, signupSub: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-xs text-text-muted focus:border-accent-blue outline-none leading-relaxed"
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, active, onToggle, icon: Icon, color = "text-text-primary" }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 transition-all hover:bg-black/60">
       <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-lg bg-white/5", active ? color : "text-text-muted grayscale")}>
             <Icon size={20} />
          </div>
          <div>
             <p className="text-xs font-bold text-white uppercase tracking-tight">{label}</p>
             <p className="text-[9px] text-text-muted font-medium mt-0.5">{desc}</p>
          </div>
       </div>
       <button 
          onClick={onToggle}
          className={cn(
             "w-11 h-5.5 rounded-full relative transition-all duration-300",
             active ? "bg-accent-green" : "bg-slate-700"
          )}
       >
          <div className={cn(
            "absolute top-1 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-md", 
            active ? "right-1" : "left-1"
          )} />
       </button>
    </div>
  );
}

import { useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Power, 
  RefreshCw, 
  Globe, 
  Database, 
  Cpu, 
  Lock,
  Eye,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyLock, setEmergencyLock] = useState(false);

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Global Toggles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card border-border-main">
            <div className="flex items-center gap-2 mb-6 border-b border-border-main pb-4">
              <Settings size={18} className="text-accent-blue" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">플랫폼 핵심 인프라 제어 (CPI)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ControlToggle 
                  label="전체 점검 모드" 
                  desc="관리자를 제외한 모든 사용자의 접속을 차단하고 점검 화면을 표시합니다."
                  active={maintenanceMode}
                  onToggle={() => setMaintenanceMode(!maintenanceMode)}
                  urgent
                />
                <ControlToggle 
                  label="출금 게이트웨이 잠금" 
                  desc="모든 외부 블록체인 트랜잭션 전송을 즉시 중단합니다."
                  active={emergencyLock}
                  onToggle={() => setEmergencyLock(!emergencyLock)}
                  urgent
                />
              </div>
              <div className="space-y-4">
                 <ControlToggle 
                    label="P2P 거래 샌드박스" 
                    desc="인증된 노드 사용자만 P2P 마켓에 접근할 수 있도록 제한합니다."
                    active={true}
                    onToggle={() => {}}
                  />
                  <ControlToggle 
                    label="스마트 컨트랙트 자동 감사" 
                    desc="노드 정산 바이트코드의 실시간 무결성 검증을 수행합니다."
                    active={true}
                    onToggle={() => {}}
                  />
              </div>
            </div>
          </div>

          <div className="dashboard-card border-border-main p-0 overflow-hidden">
             <div className="p-6 border-b border-border-main bg-black/10">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">API 및 통합 키 관리자 (Key-Manager)</h3>
             </div>
             <div className="p-6 space-y-4">
                <ApiKeyRow label="ETH/BTC 인덱스 RPC" state="연결됨" latency="42ms" />
                <ApiKeyRow label="KYC 검증 엔진 (PageFace)" state="활성" latency="105ms" />
                <ApiKeyRow label="CloudFlare Firewall V3" state="우회됨" latency="0ms" warning />
             </div>
          </div>
        </div>

        {/* System Health & Resources */}
        <div className="space-y-6">
          <div className="dashboard-card border-border-main bg-accent-blue/5">
            <h3 className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] mb-4">리소스 점유율 현황</h3>
            <div className="space-y-4">
              <ResourceBar label="CPU 부하율" percent={42} />
              <ResourceBar label="메모리 사용량" percent={78} />
              <ResourceBar label="DB 동시 연결" percent={12} />
              <ResourceBar label="DLQ 큐 크기" percent={2} />
            </div>
            <button className="w-full mt-6 py-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-[9px] font-black uppercase tracking-widest hover:bg-accent-blue/20 transition-all rounded">
              강제 GC / 캐시 퍼지 실행
            </button>
          </div>

          <div className="dashboard-card border-red-500/30 bg-red-500/5">
             <div className="flex items-center gap-2 mb-4 text-red-400">
                <ShieldAlert size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">프로토콜 M13 해제됨</h3>
             </div>
             <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                마스터 긴급 프로토콜(M13)이 현재 대기 상태입니다.
                이 프로토콜을 실행하면 모든 활성 세션이 파괴되고 데이터베이스 자격 증명이 초기화됩니다.
             </p>
             <button className="w-full mt-4 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all rounded shadow-lg shadow-red-500/20">
                긴급 데이터 영구 삭제 (ARM EMERGENCY WIPE)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlToggle({ label, desc, active, onToggle, urgent }: any) {
  return (
    <div className="p-4 bg-black/20 border border-border-main rounded-lg flex items-center justify-between group">
      <div className="pr-4">
        <p className={cn("text-xs font-bold uppercase tracking-tight", urgent ? "text-red-400" : "text-text-primary")}>{label}</p>
        <p className="text-[9px] text-text-muted mt-1 leading-tight font-medium italic">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-10 h-5 rounded-full relative transition-all shrink-0",
          active ? (urgent ? "bg-red-500" : "bg-accent-green") : "bg-slate-700"
        )}
      >
        <div className={cn(
          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
          active ? "right-1" : "left-1"
        )} />
      </button>
    </div>
  );
}

function ResourceBar({ label, percent }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-text-muted uppercase">{label}</span>
        <span className="text-text-primary">{percent}%</span>
      </div>
      <div className="h-1 bg-black/30 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", percent > 80 ? "bg-red-500" : "bg-accent-blue")} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}

function ApiKeyRow({ label, state, latency, warning }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", warning ? "bg-amber-500 animate-pulse" : "bg-accent-green")} />
        <span className="text-[11px] font-bold text-text-primary uppercase tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-text-muted">{latency}</span>
        <span className={cn("text-[9px] font-black uppercase tracking-widest", warning ? "text-amber-500" : "text-text-muted")}>{state}</span>
      </div>
    </div>
  );
}

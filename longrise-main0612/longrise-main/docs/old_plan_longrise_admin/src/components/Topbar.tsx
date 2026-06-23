import { Bell, Search, Globe, LogOut, ChevronDown } from 'lucide-react';

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 bg-[#0f172a] border-b border-border-main flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          <span className="text-text-muted font-normal lowercase">Overview / </span>
          {title}
        </h2>
        <div className="h-4 w-px bg-white/10 hidden md:block" />
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-accent-green uppercase">
          <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
          <span>System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search Member ID / TX..."
            className="bg-black/20 border border-border-main rounded-md pl-10 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-text-muted hover:text-accent-blue transition-colors p-2 rounded-full hover:bg-white/5">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-amber rounded-full border border-[#0f172a]" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-border-main">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-text-primary uppercase">Master Admin</span>
              <span className="text-[9px] text-text-muted">lrs_manager_04</span>
            </div>
            <button className="text-text-muted hover:text-text-primary transition-all">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

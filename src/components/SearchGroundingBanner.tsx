import React from "react";
import { X, Check } from "lucide-react";

interface SearchGroundingBannerProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onDismiss: () => void;
  className?: string;
}

export const SearchGroundingBanner: React.FC<SearchGroundingBannerProps> = ({
  enabled,
  onToggle,
  onDismiss,
  className = "",
}) => {
  return (
    <div
      id="google-search-grounding-banner"
      className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#09111f] border border-[#1e2f4a] shadow-lg text-xs font-sans transition-all select-none ${className}`}
    >
      {/* Official Google G Icon in subtle circular container */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      </div>

      {/* Text Info */}
      <div onClick={() => onToggle(!enabled)} className="flex flex-col cursor-pointer pr-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 text-xs">Use Google Search data</span>
          {enabled && (
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
              <Check className="h-2.5 w-2.5" /> Active
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">
          Access real-time info with Search Grounding
        </span>
      </div>

      {/* Close/Dismiss Button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#132238] transition cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

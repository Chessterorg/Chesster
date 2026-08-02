import { useState, useRef, useEffect } from "react";
import { useWalletStore } from "../store/walletStore";
import { useToastStore } from "../store/toastStore";
import { ChevronDown, LogOut, RefreshCw } from "lucide-react";

export default function WalletDropdown() {
  const { address, disconnect } = useWalletStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!address) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-mono bg-(--bg-secondary) hover:bg-(--bg-tertiary) px-3 py-1.5 rounded-lg border border-(--border) transition-colors"
      >
        {address.slice(0, 4)}...{address.slice(-4)}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-(--bg-secondary) border border-(--border) rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={() => {
                addToast("Please open the Freighter extension to switch accounts", "info");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-(--text-secondary) hover:text-(--text) hover:bg-(--bg-tertiary) rounded-lg transition-colors text-left"
            >
              <RefreshCw size={14} />
              Change Account
            </button>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

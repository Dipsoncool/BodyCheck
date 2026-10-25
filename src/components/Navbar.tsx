import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  RotateCcw, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  X
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface NavbarProps {
  currentTab: 'dashboard' | 'new-check' | 'history' | 'review' | 'detail';
  onNavigate: (tab: 'dashboard' | 'new-check' | 'history') => void;
  onResetData: () => void;
  totalChecksCount: number;
  pendingChecksCount: number;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onResetData,
  totalChecksCount,
  pendingChecksCount,
  currentUser,
  onLogout
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="h-9 w-9 rounded bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg text-slate-900 tracking-tight">Body Check</span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Secure Body Check Review</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'dashboard'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onNavigate('new-check')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'new-check' || currentTab === 'review'
                    ? 'bg-sky-50 text-sky-900 border border-sky-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-sky-600" />
                <span>New Body Check</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  currentTab === 'history' || currentTab === 'detail'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>History</span>
                {totalChecksCount > 0 && (
                  <span className="ml-1.5 text-xs font-mono bg-slate-200 text-slate-700 rounded-full px-1.5 py-0.2">
                    {totalChecksCount}
                  </span>
                )}
                {pendingChecksCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </button>
            </nav>

            {/* Right Side: Demo Reset & User Profile Area */}
            <div className="flex items-center space-x-3">
              
              <button
                onClick={onResetData}
                title="Reset records to default state"
                className="text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded transition-colors hidden sm:flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Reset Data</span>
              </button>

              {/* User Profile Dropdown Area */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-sky-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                    SM
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Menu Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">{currentUser.role}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1 truncate">{currentUser.email}</div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveModal('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveModal('settings');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings & Review Preferences</span>
                      </button>
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-sky-800 text-white font-semibold text-xs flex items-center justify-center">
                  SM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Profile</h3>
                  <p className="text-[11px] text-slate-500">Account details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-slate-900">{currentUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-mono text-slate-800">{currentUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-mono text-slate-800">USR-8842</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility / Unit</span>
                  <span className="font-medium text-slate-800">{currentUser.facility}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Review Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">High-Contrast Side-by-Side View</div>
                    <div className="text-[11px] text-slate-500">Enforce maximum luminance separation in review</div>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold text-[11px]">Enabled</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-medium text-slate-800">Assistive Delta Focus Reticle</div>
                    <div className="text-[11px] text-slate-500">Show algorithmically detected surface coordinate ring</div>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold text-[11px]">Enabled</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-medium text-slate-800">Explicit Attestation Confirmation</div>
                    <div className="text-[11px] text-slate-500">Require reviewer signature before saving to history</div>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold text-[11px]">Required</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

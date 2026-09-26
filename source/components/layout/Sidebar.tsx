'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  AlertOctagon,
  AlertTriangle,
  Network,
  Activity,
  Bot,
  GitBranch,
  Scale,
  Sliders,
  CheckSquare,
  PlayCircle,
  Database,
  Settings,
  Building2,
  LogOut,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/lib/hana/notification-context';

export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: 'earlyWarning' | 'disruption' | 'approval' | 'execution';
}

export interface NavGroupConfig {
  id: string;
  phaseNumber: string;
  label: string;
  groupBadgeKey: 'monitorDetect' | 'analyzeSimulate' | 'decideApprove' | 'executeLearn';
  items: NavItemConfig[];
}

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'monitor-detect',
    phaseNumber: '01',
    label: 'MONITOR & DETECT',
    groupBadgeKey: 'monitorDetect',
    items: [
      {
        label: 'Executive Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        label: 'Early Warning',
        href: '/early-warning',
        icon: AlertTriangle,
        badgeKey: 'earlyWarning',
      },
      {
        label: 'Supply Chain Map',
        href: '/supply-chain-map',
        icon: Network,
      },
      {
        label: 'Integration Hub',
        href: '/integration-hub',
        icon: Layers,
      },
    ],
  },
  {
    id: 'analyze-simulate',
    phaseNumber: '02',
    label: 'ANALYZE & SIMULATE',
    groupBadgeKey: 'analyzeSimulate',
    items: [
      {
        label: 'Disruptions',
        href: '/disruptions',
        icon: AlertOctagon,
        badgeKey: 'disruption',
      },
      {
        label: 'Crisis Analysis',
        href: '/crisis-analysis',
        icon: Activity,
      },
      {
        label: 'AI Command Center',
        href: '/ai-command-center',
        icon: Bot,
      },
      {
        label: 'What-If Simulator',
        href: '/what-if-simulator',
        icon: Sliders,
      },
    ],
  },
  {
    id: 'decide-approve',
    phaseNumber: '03',
    label: 'DECIDE & APPROVE',
    groupBadgeKey: 'decideApprove',
    items: [
      {
        label: 'Recovery Strategies',
        href: '/recovery-strategies',
        icon: GitBranch,
      },
      {
        label: 'Conflict Resolution',
        href: '/conflict-resolution',
        icon: Scale,
      },
      {
        label: 'Approval Center',
        href: '/approval-center',
        icon: CheckSquare,
        badgeKey: 'approval',
      },
    ],
  },
  {
    id: 'execute-learn',
    phaseNumber: '04',
    label: 'EXECUTE & LEARN',
    groupBadgeKey: 'executeLearn',
    items: [
      {
        label: 'Recovery Execution',
        href: '/recovery-execution',
        icon: PlayCircle,
        badgeKey: 'execution',
      },
      {
        label: 'Resilience Memory',
        href: '/resilience-memory',
        icon: Database,
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { counts } = useNotifications();

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const isGroupActive = (group: NavGroupConfig) => {
    return group.items.some((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    );
  };

  // Helper to get real unread badge count for individual items (NEVER hardcoded)
  const getItemBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey) return 0;
    switch (badgeKey) {
      case 'earlyWarning':
        return counts.monitorDetect;
      case 'disruption':
        return counts.analyzeSimulate;
      case 'approval':
        return counts.decideApprove;
      case 'execution':
        return counts.executeLearn;
      default:
        return 0;
    }
  };

  const renderNavContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div
        className={`p-4 border-b border-slate-200 bg-slate-50/60 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        } gap-3 shrink-0`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Image
              src="/resilinet-logo.png"
              alt="ResiliNet Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                  RESILINET
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-200 font-bold shrink-0">
                  HANA
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                Supply Chain Resilience
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button or desktop collapse button */}
        {isMobileOpen ? (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )
        )}
      </div>

      {/* Navigation Groups List */}
      <nav
        aria-label="Lifecycle Navigation"
        className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin"
      >
        {NAV_GROUPS.map((group) => {
          const groupActive = isGroupActive(group);
          const groupUnread = counts[group.groupBadgeKey] || 0;

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Phase Header */}
              {!collapsed ? (
                <div className="flex items-center justify-between px-2.5 py-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[10px] font-bold font-mono px-1 py-0.2 rounded ${
                        groupActive
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {group.phaseNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold tracking-wider uppercase truncate ${
                        groupActive ? 'text-sky-950 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {group.label}
                    </span>
                  </div>

                  {/* Real HANA Unread Count Badge - ONLY displayed when > 0 */}
                  {groupUnread > 0 && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-rose-100 text-rose-800 border border-rose-200"
                      title={`${groupUnread} unread notifications in ${group.label}`}
                    >
                      {groupUnread}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-1">
                  <span
                    className={`text-[9px] font-bold font-mono px-1 rounded ${
                      groupActive
                        ? 'bg-sky-100 text-sky-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {group.phaseNumber}
                  </span>
                </div>
              )}

              {/* Group Nav Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);

                  const itemUnread = getItemBadgeCount(item.badgeKey);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center ${
                        collapsed ? 'justify-center px-2' : 'px-2.5'
                      } py-2 rounded-md text-xs transition-all group relative focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden ${
                        isActive
                          ? 'bg-sky-50 text-sky-950 font-semibold border border-sky-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="w-1 h-5 bg-sky-600 rounded-r-md absolute left-0" />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-sky-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />

                      {!collapsed && (
                        <>
                          <span className="truncate flex-1 ml-2.5 text-xs">
                            {item.label}
                          </span>

                          {/* Item Badge ONLY displayed if real unread count > 0 */}
                          {itemUnread > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                              {itemUnread}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Info / Plant Context & Persona */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
        {!collapsed ? (
          <>
            {/* Operational Node */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Astra Motors</span>
              </span>
              <span className="font-semibold text-slate-700 font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded">
                PLANT-001
              </span>
            </div>

            {/* User Profile Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 shadow-2xs space-y-1">
              <div className="font-bold text-slate-800 truncate">
                {profile?.full_name || user?.email || 'Authenticated User'}
              </div>
              <div className="text-[10px] text-slate-500 truncate flex items-center justify-between">
                <span>{profile?.department || 'Operations'}</span>
                {profile?.role && (
                  <span className="font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 text-[9px] uppercase tracking-wider">
                    {profile.role.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              title="Sign Out of ResiliNet"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop & Tablet Sidebar (Always static in DOM) ── */}
      <aside
        aria-label="Main Navigation"
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200 z-30 transition-[width] duration-150 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderNavContent(isCollapsed)}
      </aside>

      {/* ── Mobile Slide-In Drawer with Backdrop Overlay ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col transform transition-transform duration-200 ease-out">
            {renderNavContent(false)}
          </div>
        </div>
      )}
    </>
  );
}

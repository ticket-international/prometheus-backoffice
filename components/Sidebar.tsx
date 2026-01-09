'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FiHome,
  FiBarChart2,
  FiShoppingCart,
  FiFilm,
  FiMail,
  FiUsers,
  FiShare2,
  FiDollarSign,
  FiTrendingUp,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiFileText,
  FiPackage,
  FiPlusCircle,
  FiEdit,
  FiPieChart,
  FiBarChart,
  FiSend,
  FiSquare,
  FiImage,
  FiGlobe,
  FiInfo,
  FiSmartphone,
  FiCreditCard,
  FiLogOut,
  FiUser,
  FiCalendar,
  FiTag,
  FiRefreshCw,
} from 'react-icons/fi';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { hasMenuAccess } from '@/lib/permissionMapping';

interface SubNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Bestellungen', href: '/bestellungen', icon: FiShoppingCart },
  {
    name: 'Filme',
    icon: FiFilm,
    subItems: [
      {
        name: 'Filmbeschreibungen',
        href: '/filme/filmbeschreibungen',
        icon: FiFileText,
      },
      { name: 'Bald im Kino', href: '/filme/bald-im-kino', icon: FiCalendar },
      {
        name: 'Postersortierung',
        href: '/filme/postersortierung',
        icon: FiImage,
      },
      { name: 'Filmattribute', href: '/filme/filmattribute', icon: FiTag },
      {
        name: 'Programm neuladen',
        href: '/filme/programm-neuladen',
        icon: FiRefreshCw,
      },
    ],
  },
  { name: 'Zahlungen', href: '/zahlungen', icon: FiCreditCard },
  {
    name: 'Kampagnen',
    icon: FiMail,
    subItems: [
      { name: 'Mailings', href: '/kampagnen/mailings', icon: FiSend },
      { name: 'Rectangles', href: '/kampagnen/rectangles', icon: FiSquare },
      { name: 'Banner', href: '/kampagnen/banner', icon: FiImage },
      {
        name: 'MeinKino App',
        href: '/kampagnen/meinkino-app',
        icon: FiSmartphone,
      },
    ],
  },
  {
    name: 'Kunden',
    icon: FiUsers,
    subItems: [
      { name: 'Bearbeiten', href: '/kunden/bearbeiten', icon: FiEdit },
      { name: 'Auswertungen', href: '/kunden/auswertungen', icon: FiPieChart },
      { name: 'Statistiken', href: '/kunden/statistiken', icon: FiBarChart },
    ],
  },
  { name: 'Social Media', href: '/social-media', icon: FiShare2 },
  {
    name: 'Webseite',
    icon: FiGlobe,
    subItems: [
      { name: 'News', href: '/webseite/news', icon: FiFileText },
      { name: 'Kinoinfos', href: '/webseite/kinoinfos', icon: FiInfo },
      {
        name: 'Eigene Inhalte',
        href: '/webseite/eigene-inhalte',
        icon: FiEdit,
      },
    ],
  },
  {
    name: 'Verwaltung',
    icon: FiDollarSign,
    subItems: [
      {
        name: 'Abrechnungen anzeigen',
        href: '/verwaltung/abrechnungen-anzeigen',
        icon: FiFileText,
      },
      {
        name: 'Artikelverkauf',
        href: '/verwaltung/artikelverkauf',
        icon: FiPackage,
      },
      {
        name: 'Abrechnungen erstellen',
        href: '/verwaltung/abrechnungen-erstellen',
        icon: FiPlusCircle,
      },
      {
        name: 'Umsatzstatistik',
        href: '/verwaltung/umsatzstatistik',
        icon: FiTrendingUp,
      },
    ],
  },
  { name: 'Verkaufsstatistik', href: '/verkaufsstatistik', icon: FiTrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { clearSites } = useSite();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  const handleLogout = () => {
    logout();
    clearSites();
    router.push('/login');
  };

  const filteredNavItems = navItems
    .filter((item) => {
      if (!session) return false;

      const { isAdmin, authsByName } = session.permissions;

      if (item.subItems) {
        const visibleSubItems = item.subItems.filter((subItem) =>
          hasMenuAccess(subItem.name, isAdmin, authsByName)
        );
        return visibleSubItems.length > 0;
      }

      return hasMenuAccess(item.name, isAdmin, authsByName);
    })
    .map((item) => {
      if (item.subItems) {
        const { isAdmin, authsByName } = session!.permissions;
        return {
          ...item,
          subItems: item.subItems.filter((subItem) =>
            hasMenuAccess(subItem.name, isAdmin, authsByName)
          ),
        };
      }
      return item;
    });

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground w-64 z-40 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 pb-8 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ticket.
          </h1>
          <p className="text-sidebar-foreground text-sm mt-1 font-medium">
            Admin Dashboard
          </p>
        </div>

        <nav
          className="p-4 space-y-0.5 mt-2 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubmenuOpen = openSubmenu === item.name;
            const isActiveParent =
              hasSubItems &&
              item.subItems?.some((sub) => pathname === sub.href);
            const isActive = item.href && pathname === item.href;

            if (hasSubItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg transition-all duration-200 group
                      ${
                        isActiveParent
                          ? 'bg-primary/10 text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        className={
                          isActiveParent
                            ? ''
                            : 'group-hover:scale-110 transition-transform'
                        }
                      />
                      <span className="font-medium text-[15px]">
                        {item.name}
                      </span>
                    </div>
                    {isSubmenuOpen ? (
                      <FiChevronDown size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    )}
                  </button>

                  {isSubmenuOpen && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group
                              ${
                                isSubActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }
                            `}
                          >
                            <SubIcon
                              size={18}
                              className={
                                isSubActive
                                  ? ''
                                  : 'group-hover:scale-110 transition-transform'
                              }
                            />
                            <span className="font-medium text-[14px]">
                              {subItem.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? '' : 'group-hover:scale-110 transition-transform'
                  }
                />
                <span className="font-medium text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sidebar-border space-y-3">
          {session && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent border border-sidebar-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
                <FiUser size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.permissions.isAdmin ? 'Administrator' : 'Benutzer'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Abmelden"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <div className="text-xs text-muted-foreground text-center font-medium">
            Version 1.0.0
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

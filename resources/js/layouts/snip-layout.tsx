import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BarChart2, Bell, ChevronRight, ChevronsUpDown, Globe, Link2, Plus, Search, Settings } from 'lucide-react';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { SnipLogo } from '@/components/snip-logo';
import { home } from '@/routes';
import * as shortUrls from '@/routes/short-urls';
const crumbLabels: Record<string, string> = {
    '/links': 'Tautan',
    '/links/create': 'Buat link',
    '/settings/profile': 'Pengaturan',
    '/settings/security': 'Pengaturan',
};

export default function SnipLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const user = page.props.auth.user;
    const url = page.url;

    const isLinks = url.startsWith('/links');
    const isSettings = url.startsWith('/settings');
    const currentCrumb = crumbLabels[url] ?? 'Tautan';
    const linkCount = page.props.linkCount ?? 0;

    return (
        <div className="app">
            {/* SIDEBAR (desktop) */}
            <aside className="snip-sidebar">
                <div className="side-head">
                    <Link href={home.url()}>
                        <SnipLogo />
                    </Link>
                </div>

                <Link href={shortUrls.index.url()} className="btn btn-primary btn-block" style={{ marginBottom: 8 }}>
                    <Plus size={16} />
                    Link baru
                </Link>

                <div className="nav-label">Menu</div>
                <div className="nav-group">
                    <Link href={shortUrls.index.url()} className={`nav-item${isLinks ? ' active' : ''}`}>
                        <Link2 size={18} />
                        Tautan
                        {linkCount > 0 && <span className="count">{linkCount}</span>}
                    </Link>
                    <Link href="/settings/profile" className={`nav-item${isSettings ? ' active' : ''}`}>
                        <Settings size={18} />
                        Pengaturan
                    </Link>
                </div>

                <div className="nav-label">Pintasan</div>
                <div className="nav-group">
                    <a className="nav-item" href="#analytics">
                        <BarChart2 size={18} />
                        Analitik
                    </a>
                    <a className="nav-item" href="#domain">
                        <Globe size={18} />
                        Domain
                    </a>
                </div>

                <div className="side-foot">
                    <SidebarProvider style={{ display: 'contents' }}>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            size="lg"
                                            className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                            data-test="sidebar-menu-button"
                                        >
                                            <UserInfo user={user} />
                                            <ChevronsUpDown className="ml-auto size-4" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" side="top" align="start">
                                        <UserMenuContent user={user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarProvider>
                </div>
            </aside>

            {/* MAIN */}
            <div className="snip-main">
                {/* desktop topbar */}
                <div className="snip-topbar">
                    <div className="crumb">
                        <Link href={shortUrls.index.url()}>Loncatan</Link>
                        <ChevronRight size={14} />
                        <span className="here">{currentCrumb}</span>
                    </div>
                    <div className="spacer" />
                    <div className="search-mini hide-sm">
                        <Search size={15} />
                        <input placeholder="Cari link…  ⌘K" readOnly />
                    </div>
                    <button className="btn btn-icon btn-quiet btn-sm" title="Notifikasi">
                        <Bell size={18} />
                    </button>
                </div>

                {/* mobile top */}
                <div className="mobile-top">
                    <Link href={home.url()}>
                        <SnipLogo />
                    </Link>
                    <div className="spacer" />
                    <button className="btn btn-icon btn-quiet btn-sm">
                        <Search size={18} />
                    </button>
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="snip-avatar"
                            style={{ width: 30, height: 30, objectFit: 'cover' }}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <span className="snip-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                            {user.name[0].toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="snip-content">
                    <div className="content-inner">
                        <div className="fade">{children}</div>
                    </div>
                </div>

                {/* mobile bottom nav */}
                <nav className="bottom-nav">
                    <Link href={shortUrls.index.url()} className={isLinks ? 'active' : ''}>
                        <Link2 size={21} />
                        <span>Tautan</span>
                    </Link>
                    <a href="#create">
                        <Plus size={21} />
                        <span>Buat</span>
                    </a>
                    <Link href="/settings/profile" className={isSettings ? 'active' : ''}>
                        <Settings size={21} />
                        <span>Pengaturan</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}

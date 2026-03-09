'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Users, BarChart3, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Students', icon: Users },
    { href: '/classes', label: 'Classes', icon: BookOpen },
    { href: '/statistics', label: 'Statistics', icon: BarChart3 },
];

export function Header() {
    const pathname = usePathname();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl"
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex p-1.5 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.2)] transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20 group-hover:shadow-[0_0_25px_rgba(var(--color-primary),0.4)]">
                        <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight font-heading">
                        Student<span className="text-primary font-normal">Manager</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === '/'
                                ? pathname === '/' || pathname.startsWith('/students')
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </motion.header>
    );
}

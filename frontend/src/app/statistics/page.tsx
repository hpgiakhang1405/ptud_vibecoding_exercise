'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStatistics } from '@/features/students/api/student-api';
import { Statistics } from '@/features/students/types';

const CHART_COLORS = [
    'hsl(221, 83%, 53%)',
    'hsl(160, 60%, 45%)',
    'hsl(280, 65%, 55%)',
    'hsl(30, 90%, 55%)',
    'hsl(340, 75%, 55%)',
    'hsl(190, 70%, 45%)',
    'hsl(45, 85%, 50%)',
    'hsl(0, 70%, 55%)',
];

export default function StatisticsPage() {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading mb-10">Statistics</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-xl border border-border/50 bg-card/70 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading mb-4">Statistics</h1>
                <p className="text-muted-foreground">Failed to load statistics. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">Statistics</h1>
                <p className="mt-2 text-base text-muted-foreground max-w-xl leading-relaxed">
                    Aggregated enrollment insights and academic performance overview.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold tracking-tight">{stats.total_students}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold tracking-tight">{stats.average_gpa.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-1">on 4.0 scale</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Students by Major Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Students by Major</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.students_by_major.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No data available</p>
                        ) : (
                            <ResponsiveContainer
                                width="100%"
                                height={Math.max(300, stats.students_by_major.length * 50)}
                            >
                                <BarChart
                                    data={stats.students_by_major}
                                    layout="vertical"
                                    margin={{ left: 20, right: 30 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="major" width={180} tick={{ fontSize: 13 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            background: 'hsl(var(--card))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                                        {stats.students_by_major.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

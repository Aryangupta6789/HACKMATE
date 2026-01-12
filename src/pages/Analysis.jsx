import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Analysis() {
    const { currentUser } = useAuth();

    // Mock Data (since backend doesn't track this yet)
    const stats = {
        streak: 12,
        totalContributions: 87,
        projectsCompleted: 5,
        hoursCoded: 120,
        topSkills: [
            { name: "React", count: 45 },
            { name: "Node.js", count: 30 },
            { name: "Firebase", count: 25 },
            { name: "Tailwind", count: 15 },
            { name: "Python", count: 10 }
        ],
        contributions: [
            // Simulating a git-style contribution calendar
            ...Array.from({ length: 14 }).map((_, i) => ({ date: `Day ${i + 1}`, count: Math.floor(Math.random() * 10) }))
        ]
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">User Analysis</h1>
                    <p className="text-slate-400 text-lg">Track your growth, contributions, and coding journey.</p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.streak} Days</div>
                    <div className="text-slate-400 text-sm">Longest Streak</div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.projectsCompleted}</div>
                    <div className="text-slate-400 text-sm">Projects Conquered</div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.hoursCoded}h</div>
                    <div className="text-slate-400 text-sm">Hours Contributed</div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalContributions}</div>
                    <div className="text-slate-400 text-sm">Total Contributions</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section - Placeholder for visual contribution graph */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Contribution Activity</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {stats.contributions.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full group">
                                <div
                                    className="w-full bg-blue-500/20 rounded-t-lg transition-all duration-300 hover:bg-blue-500/50 relative"
                                    style={{ height: `${day.count * 10}%` }}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {day.count} commits
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Technologies */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Top Technologies</h3>
                    <div className="space-y-6">
                        {stats.topSkills.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-white font-medium">{skill.name}</span>
                                    <span className="text-slate-400">{skill.count}%</span>
                                </div>
                                <div className="w-full bg-slate-700/50 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                        style={{ width: `${skill.count}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Achievements */}
            <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <div className="font-bold text-white">Hackathon Winner</div>
                            <div className="text-xs text-slate-400">Won 1st place in AI Hackathon</div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <div>
                            <div className="font-bold text-white">Team Player</div>
                            <div className="text-xs text-slate-400">Joined 5 different teams</div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div>
                            <div className="font-bold text-white">Code Streak</div>
                            <div className="text-xs text-slate-400">Committed code for 7 days</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";

export default function Dashboard() {
    const [teams, setTeams] = useState([]);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        let q = query(collection(db, "teams"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeams(teamsData);
        });

        return unsubscribe;
    }, []);

    const filteredTeams = filter === "All" ? teams : teams.filter(t => t.eventType === filter);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">Find a Team</h1>
                    <p className="text-slate-400 text-lg">Join forces with others to build something amazing.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="glass-input appearance-none pl-4 pr-10 py-3 rounded-xl text-white outline-none cursor-pointer min-w-[180px]"
                        >
                            <option value="All" className="bg-slate-900">All Events</option>
                            <option value="Hackathon" className="bg-slate-900">Hackathon</option>
                            <option value="Project" className="bg-slate-900">Project</option>
                            <option value="Cultural Event" className="bg-slate-900">Cultural Event</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <Link to="/create-team" className="glass-button px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Create Team
                    </Link>
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <div className="glass-panel p-16 rounded-2xl text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No teams found</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">There are no teams matching your criteria right now. Be the first to start one!</p>
                    <Link to="/create-team" className="glass-button px-6 py-2 rounded-lg text-sm font-bold inline-block">Start a New Team</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => (
                        <Link key={team.id} to={`/team/${team.id}`} className="glass-card p-6 rounded-2xl group relative overflow-hidden">
                            {/* Gradient glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="bg-blue-500/10 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/20">{team.eventType}</span>
                                <span className="text-slate-500 text-xs font-medium">{new Date(team.createdAt?.toDate()).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors relative z-10">{team.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed relative z-10">{team.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                {team.requiredRoles.slice(0, 3).map((role, index) => (
                                    <span key={index} className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700/50">
                                        {role}
                                    </span>
                                ))}
                                {team.requiredRoles.length > 3 && (
                                    <span className="bg-slate-800/80 text-slate-400 text-xs px-2.5 py-1 rounded-md border border-slate-700/50">
                                        +{team.requiredRoles.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-sm text-slate-400 border-t border-white/5 pt-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                        {team.creatorName ? team.creatorName[0].toUpperCase() : 'U'}
                                    </div>
                                    <span className="truncate max-w-[100px]">{team.creatorName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span>{team.members.length}/{team.teamSize}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

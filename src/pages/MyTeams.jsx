import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function MyTeams() {
    const { currentUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Query teams where the user is a member
        const q = query(
            collection(db, "teams"),
            where("members", "array-contains", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side since we can't easily compound query with array-contains + orderBy in simple mode without index
            teamsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

            setTeams(teamsData);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const activeTeams = teams.filter(t => t.status === 'Open' || t.status === 'In Progress');
    const pastTeams = teams.filter(t => t.status === 'Completed' || t.status === 'Closed');

    if (loading) return <div className="text-center mt-10 text-white">Loading your teams...</div>;

    const TeamCard = ({ team }) => (
        <Link to={`/team/${team.id}`} className="glass-card p-6 rounded-2xl group flex flex-col h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${team.status === 'Open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {team.status}
                </span>
                <span className="text-slate-500 text-xs">{new Date(team.createdAt?.toDate()).toLocaleDateString()}</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors relative z-10">{team.title}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow relative z-10">{team.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Role:</span>
                    <span className="text-xs text-white font-medium bg-slate-800 px-2 py-0.5 rounded">
                        {team.createdBy === currentUser.uid ? 'Owner' : 'Member'}
                    </span>
                </div>
                <div className="text-xs text-slate-400">
                    {team.members.length} Members
                </div>
            </div>
        </Link>
    );

    return (
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-8">My Teams</h1>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm">Now</span>
                        Active Teams
                    </h2>
                    {activeTeams.length === 0 ? (
                        <div className="glass-panel p-8 rounded-2xl text-center">
                            <p className="text-slate-400 mb-4">You are not part of any active teams currently.</p>
                            <Link to="/" className="glass-button px-6 py-2 rounded-lg text-sm font-bold inline-block">Find a Team</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTeams.map(team => <TeamCard key={team.id} team={team} />)}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center text-slate-400 text-sm">Past</span>
                        Past Teams
                    </h2>
                    {pastTeams.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">No completed team history yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                            {pastTeams.map(team => <TeamCard key={team.id} team={team} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

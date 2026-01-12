import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Chat from "../components/Chat";

export default function ChatPage() {
    const { currentUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "teams"),
            where("members", "array-contains", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeams(teamsData);
            setLoading(false);

            // Auto-select first team if none selected
            if (teamsData.length > 0 && !selectedTeam) {
                setSelectedTeam(teamsData[0]);
            }
        });

        return unsubscribe;
    }, [currentUser]);

    if (loading) return <div className="text-center mt-10 text-white">Loading chats...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar - Team List */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:w-80 md:inset-auto md:flex-shrink-0
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full glass-panel flex flex-col rounded-2xl overflow-hidden border border-white/10">
                    <div className="p-6 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
                        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                            <span>💬</span> Messages
                        </h2>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-2">
                        {teams.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">You haven't joined any teams yet.</p>
                        ) : (
                            teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 group relative ${selectedTeam?.id === team.id
                                            ? 'bg-blue-600 shadow-lg shadow-blue-900/20 ring-1 ring-blue-400'
                                            : 'hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent hover:border-white/5'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${selectedTeam?.id === team.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-800 text-gray-400 group-hover:bg-slate-700 group-hover:text-white'
                                        }`}>
                                        {team.title[0].toUpperCase()}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className={`font-bold truncate ${selectedTeam?.id === team.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {team.title}
                                        </div>
                                        <div className={`text-xs truncate ${selectedTeam?.id === team.id ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                            {team.members.length} members
                                        </div>
                                    </div>
                                    {selectedTeam?.id === team.id && (
                                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Chat Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 mb-4 glass-panel p-4 rounded-xl">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="text-white bg-slate-800 p-2 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <span className="font-bold text-white truncate">{selectedTeam ? selectedTeam.title : "Select a team"}</span>
                </div>

                <div className="glass-panel rounded-2xl flex-grow overflow-hidden border border-white/10 flex flex-col h-full">
                    {selectedTeam ? (
                        <>
                            <div className="p-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{selectedTeam.title}</h3>
                                    <p className="text-xs text-slate-400">{selectedTeam.members.length} members • {selectedTeam.status}</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {/* Simple member avatars preview */}
                                    <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                                        {selectedTeam.members.length}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow min-h-0 bg-slate-900/30">
                                <Chat type="team" id={selectedTeam.id} members={selectedTeam.members} />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                            <p className="max-w-xs mx-auto">Choose a team from the sidebar to start chatting with your teammates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

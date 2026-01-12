import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getHonorColor, getHonorText } from "../utils/honorUtils";

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', currentUser.uid),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });

        return unsubscribe;
    }, [currentUser]);

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="glass-panel sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-display font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text flex gap-2 items-center">
                                <span className="bg-gradient-to-br from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm">HM</span>
                                HACKMATE
                            </Link>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-1">
                                    <Link to="/" className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-all">Find Teams</Link>
                                    <Link to="/chat" className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-all">Chat</Link>
                                    <Link to="/my-teams" className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-all">My Teams</Link>
                                    <Link to="/analysis" className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-all">Analysis</Link>
                                    <Link to="/create-team" className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm font-medium transition-all">Create Team</Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <Link to="/profile" className="flex items-center gap-2 group glass-card px-3 py-1.5 rounded-full hover:bg-slate-800/50 transition-all">
                                        <div className="flex flex-col items-end mr-1">
                                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                                                Honor
                                            </span>
                                            <span className="text-sm font-bold text-white leading-none">{currentUser.honorScore || 100}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-900">
                                            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                                        </div>
                                    </Link>
                                    <Link to="/notifications" className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            </span>
                                        )}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-300 hover:text-white text-sm font-medium hover:bg-white/5 px-3 py-2 rounded-lg transition-all"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="glass-button px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}

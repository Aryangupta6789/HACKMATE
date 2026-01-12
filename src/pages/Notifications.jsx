import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Notifications() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Query notifications for current user
        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const markAsRead = async (notificationId) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        const unread = notifications.filter(n => !n.read);
        unread.forEach(n => {
             const ref = doc(db, 'notifications', n.id);
             batch.update(ref, { read: true });
        });
        try {
            await batch.commit();
        } catch(e) {
            console.error("Error batch update:", e);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1 rounded bg-blue-900/20"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 bg-slate-800 rounded-lg border border-slate-700">
                        No notifications yet.
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className={`p-4 rounded-lg border transition-all ${
                                !notif.read 
                                ? 'bg-slate-800 border-blue-500/50 shadow-md shadow-blue-900/10' 
                                : 'bg-slate-900 border-slate-700 opacity-75'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className="text-gray-200 mb-2">{notif.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {notif.createdAt?.toDate().toLocaleDateString()} {notif.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {notif.teamId && (
                                        <Link 
                                            to={`/team/${notif.teamId}`}
                                            onClick={() => !notif.read && markAsRead(notif.id)}
                                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                                        >
                                            View Team
                                        </Link>
                                    )}
                                    {!notif.read && (
                                        <button 
                                            onClick={() => markAsRead(notif.id)}
                                            className="text-xs text-gray-400 hover:text-white"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

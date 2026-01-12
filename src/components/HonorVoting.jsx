import { useState, useEffect } from "react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment, query, onSnapshot, where, getDoc, arrayRemove } from "firebase/firestore";
import { sendNotification } from "../utils/notifications";

export default function HonorVoting({ teamId, members, currentUser }) {
    const [selectedMember, setSelectedMember] = useState("");
    const [reason, setReason] = useState("");
    const [creatingPoll, setCreatingPoll] = useState(false);
    const [polls, setPolls] = useState([]);
    const [loadingPolls, setLoadingPolls] = useState(true);
    const [teamData, setTeamData] = useState(null);

    // Fetch team leader info to determine if current user is leader
    useEffect(() => {
        async function fetchTeam() {
            const teamRef = doc(db, "teams", teamId);
            const snap = await getDoc(teamRef);
            if(snap.exists()) {
                setTeamData(snap.data());
            }
        }
        fetchTeam();
    }, [teamId]);

    const isLeader = teamData?.createdBy === currentUser.uid;

    // Listen to active polls
    useEffect(() => {
        const q = query(collection(db, `teams/${teamId}/polls`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPolls = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPolls(fetchedPolls.filter(p => p.status === 'active'));
            setLoadingPolls(false);
        });
        return unsubscribe;
    }, [teamId]);

    // CREATE POLL (Leader Only)
    async function handleCreatePoll(e) {
        e.preventDefault();
        setCreatingPoll(true);
        try {
            const targetUser = members.find(m => m.uid === selectedMember);
            const memberName = targetUser?.displayName || "Unknown";
            
            // 1. Create Poll
            const pollRef = await addDoc(collection(db, `teams/${teamId}/polls`), {
                type: "kick",
                targetUserId: selectedMember,
                targetUserName: memberName,
                reason: reason,
                createdBy: currentUser.uid,
                status: "active",
                createdAt: serverTimestamp(),
                votes: {}, // map of userId -> "yes" | "no"
                yesCount: 0,
                noCount: 0
            });

            // SYSTEM MSG TO CHAT
            await addDoc(collection(db, `teams/${teamId}/messages`), {
                text: `Voting started: Kick ${memberName}`,
                createdAt: serverTimestamp(),
                type: "system",
                uid: "system",
                displayName: "System",
                photoURL: ""
            });

            setSelectedMember("");
            setReason("");
        } catch (error) {
            console.error("Error creating poll:", error);
            alert("Failed to start poll");
        }
        setCreatingPoll(false);
    }

    // CAST VOTE (Members)
    async function handleVote(pollId, voteType) { // voteType: 'yes' or 'no'
        try {
            const pollRef = doc(db, `teams/${teamId}/polls`, pollId);
            const pollDoc = await getDoc(pollRef);
            
            if (!pollDoc.exists()) return;
            const pollData = pollDoc.data();

            if (pollData.votes && pollData.votes[currentUser.uid]) {
                alert("You have already voted.");
                return;
            }

            const newVotes = { ...pollData.votes, [currentUser.uid]: voteType };
            
            // Recalculate counts
            let yes = 0;
            let no = 0;
            Object.values(newVotes).forEach(v => v === 'yes' ? yes++ : no++);

            await updateDoc(pollRef, {
                votes: newVotes,
                yesCount: yes,
                noCount: no
            });
            
            checkOutcome(pollId, yes, no, pollData.targetUserId);

        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to vote");
        }
    }

    async function checkOutcome(pollId, yes, no, targetUserId) {
        // Validation: Kick logic
        // Total voters = members.length (excluding the target user ideally? Or including?)
        // Usually target user shouldn't vote on their own kick, but let's say they can't.
        // Eligible voters = All members except target user.
        
        const eligibleVoters = members.filter(m => m.uid !== targetUserId).length;
        const majority = Math.floor(eligibleVoters / 2) + 1; // Strict majority > 50%

        if (yes >= majority) {
            // EXECUTE KICK
            try {
                // 1. Decrease Honor
                await updateDoc(doc(db, "users", targetUserId), {
                    honorScore: increment(-10) 
                });

                // 2. Remove from Team
                await updateDoc(doc(db, "teams", teamId), {
                    members: arrayRemove(targetUserId)
                });

                // 3. Close Poll
                await updateDoc(doc(db, `teams/${teamId}/polls`, pollId), {
                    status: "completed",
                    outcome: "kicked"
                });
                
                // NOTIFY KICKED MEMBER
                await sendNotification(
                    targetUserId,
                    "member_kicked",
                    `You have been kicked from the team based on a majority vote.`,
                    teamId
                );

                // LOG HONOR HISTORY
                await addDoc(collection(db, `users/${targetUserId}/honorHistory`), {
                    amount: -10,
                    reason: `Kicked from team: ${teamId}`,
                    createdAt: serverTimestamp()
                });
                
                alert("Majority reached! Member kicked and honor score deduced.");

            } catch (err) {
                console.error("Error executing kick:", err);
            }
        } else if (no > (eligibleVoters - majority)) {
             // Impossible to reach yes majority
             await updateDoc(doc(db, `teams/${teamId}/polls`, pollId), {
                status: "completed",
                outcome: "kept"
            });
        }
    }

    const otherMembers = members.filter(m => m.uid !== currentUser.uid); // For leader to select

    return (
        <div className="space-y-6 mt-8">
            {/* LEADER: Create Poll Section */ }
            {isLeader && otherMembers.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-yellow-500">⚠</span>
                        Initiate Honor Vote (Kick Member)
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        As a leader, you can start a poll to kick a member. Majority vote is required.
                    </p>
                    <form onSubmit={handleCreatePoll} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Select Member to Kick</label>
                            <select 
                                required
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">-- Select --</option>
                                {otherMembers.map(m => (
                                    <option key={m.uid} value={m.uid}>{m.displayName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Reason</label>
                            <input 
                                type="text"
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Violation of rules, inactivity..."
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={creatingPoll}
                            className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            {creatingPoll ? "Starting Poll..." : "Start Voting Poll"}
                        </button>
                    </form>
                </div>
            )}

            {/* ALL MEMBERS: Active Polls List */}
            {polls.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="font-bold text-white mb-4">Active Team Polls</h3>
                    <div className="space-y-4">
                        {polls.map(poll => {
                             const hasVoted = poll.votes && poll.votes[currentUser.uid];
                             const isTarget = poll.targetUserId === currentUser.uid;
                             
                             return (
                                <div key={poll.id} className="bg-slate-900 p-4 rounded border border-slate-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-red-400">Vote to Kick: {poll.targetUserName}</h4>
                                        <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-4"><span className="text-gray-500">Reason:</span> {poll.reason}</p>
                                    
                                    {!hasVoted && !isTarget ? (
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => handleVote(poll.id, 'yes')}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition-colors"
                                            >
                                                Yes, Kick
                                            </button>
                                            <button 
                                                onClick={() => handleVote(poll.id, 'no')}
                                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold transition-colors"
                                            >
                                                No, Keep
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">
                                            {isTarget ? "You are the subject of this poll." : "You have voted."}
                                            <div className="mt-2 text-xs">
                                                Current Standings: Yes ({poll.yesCount}) - No ({poll.noCount})
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

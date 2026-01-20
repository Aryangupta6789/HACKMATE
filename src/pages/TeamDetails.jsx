import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp } from "firebase/firestore";
import { sendNotification } from "../utils/notifications";
import { useAuth } from "../contexts/AuthContext";
import Chat from "../components/Chat";
import { getHonorColor, getHonorText, getHonorBorder } from "../utils/honorUtils";
import HonorVoting from "../components/HonorVoting";

export default function TeamDetails() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applicationMsg, setApplicationMsg] = useState("");
    const [hasApplied, setHasApplied] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [membersData, setMembersData] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "teams", teamId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTeam({ id: docSnap.id, ...data });
                setIsOwner(data.createdBy === currentUser.uid);
                setIsMember(data.members.includes(currentUser.uid));
                setHasApplied(data.applicants?.includes(currentUser.uid));
            }
            setLoading(false);
        });
        return unsub;
    }, [teamId, currentUser]);

    // Fetch Applicants details if owner
    useEffect(() => {
        if (isOwner) {
            if (team?.applicants?.length > 0) {
                // In a real app, careful with querying many docs. For small teams, this is fine.
                const q = query(collection(db, "users"), where("uid", "in", team.applicants));
                getDocs(q).then(snapshot => {
                    setApplicants(snapshot.docs.map(d => d.data()));
                });
            } else {
                setApplicants([]);
            }
        }
    }, [isOwner, team?.applicants]);

    // Fetch Members details
    useEffect(() => {
        if (team?.members?.length > 0) {
            const q = query(collection(db, "users"), where("uid", "in", team.members));
            getDocs(q).then(snapshot => {
                setMembersData(snapshot.docs.map(d => d.data()));
            });
        }
    }, [team?.members]);


    async function handleApply(e) {
        e.preventDefault();
        setApplying(true);
        try {
            // Add application to 'applications' collection
            await addDoc(collection(db, "applications"), {
                teamId,
                applicantId: currentUser.uid,
                applicantName: currentUser.displayName,
                resumeUrl: "", // Need to fetch from user profile or use profile link
                message: applicationMsg,
                status: "pending",
                createdAt: serverTimestamp()
            });

            // Update team document to track applicant
            await updateDoc(doc(db, "teams", teamId), {
                applicants: arrayUnion(currentUser.uid)
            });

            // NOTIFY LEADER
            if (team.createdBy) {
                await sendNotification(
                    team.createdBy,
                    "team_request",
                    `${currentUser.displayName} has applied to join ${team.title}`,
                    teamId
                );
            }

            setHasApplied(true);
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to apply");
        }
        setApplying(false);
    }

    async function handleAccept(applicantId) {
        // Optimistic update
        setApplicants(prev => prev.filter(a => a.uid !== applicantId));

        try {
            await updateDoc(doc(db, "teams", teamId), {
                members: arrayUnion(applicantId),
                applicants: arrayRemove(applicantId)
            });

            // NOTIFY APPLICANT
            await sendNotification(
                applicantId,
                "request_accepted",
                `Your request to join ${team.title} has been accepted!`,
                teamId
            );

            // SYSTEM MSG TO CHAT
            await addDoc(collection(db, `teams/${teamId}/messages`), {
                text: `${applicant.displayName} joined the team`,
                createdAt: serverTimestamp(),
                type: "system",
                uid: "system",
                displayName: "System",
                photoURL: ""
            });
            // Also update application status logic here if needed
        } catch (error) {
            console.error("Error accepting:", error);
        }
    }

    async function handleCloseRecruitment() {
        if (!window.confirm("Are you sure you want to close recruitment? This will move the team to 'Past Teams'.")) return;
        try {
            await updateDoc(doc(db, "teams", teamId), {
                status: "Closed"
            });
            // No need to redirect, just stays on page, but status updates via snapshot
        } catch (error) {
            console.error("Error closing recruitment:", error);
            alert("Failed to close recruitment");
        }
    }

    async function handleDeleteTeam() {
        if (!window.confirm("Are you sure you want to DELETE this team? This action cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "teams", teamId));
            navigate("/my-teams");
        } catch (error) {
            console.error("Error deleting team:", error);
            alert("Failed to delete team");
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!team) return <div>Team not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="glass-panel p-8 rounded-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-display font-bold mb-2 text-white">{team.title}</h1>
                            <div className="flex gap-2">
                                <span className="bg-blue-500/10 text-blue-300 text-sm font-bold px-3 py-1 rounded-full border border-blue-500/20">{team.eventType}</span>
                                <span className={`text-sm px-3 py-1 rounded-full font-bold border ${team.status === 'Open' ? 'border-green-500/20 text-green-400 bg-green-500/10' : 'border-red-500/20 text-red-400 bg-red-500/10'}`}>
                                    {team.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right text-slate-400 text-sm">
                            <p className="mb-1">Posted by <span className="text-white font-medium">{team.creatorName}</span></p>
                            <p>{new Date(team.createdAt?.toDate()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-8">
                        <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{team.description}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-white mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {team.requiredRoles.map((role, i) => (
                                <span key={i} className="bg-slate-800/50 text-slate-200 px-3 py-1.5 rounded-lg border border-white/5 text-sm">{role}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-white mb-4">Team Members ({team.members.length}/{team.teamSize})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {membersData.map(member => (
                                <div key={member.uid} className="flex items-center gap-3 glass-card p-4 rounded-xl">
                                    <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center font-bold text-white border border-white/10">
                                        {member.displayName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{member.displayName}</p>
                                        <p className="text-xs text-yellow-500 font-medium">Honor Score: {member.honorScore}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isMember && !isOwner && !hasApplied && team.status === 'Open' && (
                        <div className="border-t border-white/10 pt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Apply to Join</h3>
                            <form onSubmit={handleApply}>
                                <textarea
                                    value={applicationMsg}
                                    onChange={(e) => setApplicationMsg(e.target.value)}
                                    placeholder="Why are you a good fit for this team? Mention your experience..."
                                    className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none mb-4"
                                    rows="3"
                                    required
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="glass-button px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                                >
                                    {applying ? "Sending..." : "Send Application"}
                                </button>
                            </form>
                        </div>
                    )}

                    {hasApplied && (
                        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-4 rounded-xl text-center font-medium backdrop-blur-sm">
                            You have applied to this team. Waiting for owner approval.
                        </div>
                    )}
                </div>

                {/* Voting Section (Only for members) */}
                {isMember && <HonorVoting teamId={teamId} members={membersData} currentUser={currentUser} />}
            </div>

            <div className="space-y-6">
                {/* Chat Section */}
                {(isMember || isOwner) && (
                    <div className="glass-panel rounded-2xl overflow-hidden h-[600px] flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
                            <h3 className="font-bold text-white">Team Chat</h3>
                        </div>
                        <Chat type="team" id={teamId} />
                    </div>
                )}

                    <div className="space-y-6">
                         {/* Admin Actions (Owner Only) */}
                        {isOwner && (
                            <div className="glass-panel p-6 rounded-2xl border border-red-500/10">
                                <h3 className="font-bold text-white mb-4">Team Management</h3>
                                <div className="space-y-3">
                                    {team.status === 'Open' && (
                                        <button 
                                            onClick={handleCloseRecruitment}
                                            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-bold transition-all border border-white/5"
                                        >
                                            Close Recruitment
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleDeleteTeam}
                                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-bold transition-all border border-red-500/20"
                                    >
                                        Delete Team
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Applicant Management (Owner Only) */}
                        {isOwner && (
                            <div className="glass-panel p-6 rounded-2xl">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    Pending Applications
                                    {applicants.length > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{applicants.length}</span>}
                                </h3>
                                {applicants.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No pending applications yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {applicants.map(applicant => (
                                            <div key={applicant.uid} className="glass-card p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-white">{applicant.displayName}</span>
                                                    <span className="text-xs text-yellow-500 font-bold border border-yellow-500/20 px-1.5 py-0.5 rounded bg-yellow-500/10">Score: {applicant.honorScore}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm mb-3">Skills: {Array.isArray(applicant.skills) ? applicant.skills.join(", ") : applicant.skills}</p>
                                                <div className="flex gap-3 text-sm mb-4">
                                                    {applicant.resumeUrl && (
                                                        <a href={applicant.resumeUrl} target="_blank" className="text-blue-400 hover:text-blue-300 font-medium">View Resume</a>
                                                    )}
                                                    {applicant.linkedinUrl && (
                                                        <a href={applicant.linkedinUrl} target="_blank" className="text-blue-400 hover:text-blue-300 font-medium">LinkedIn</a>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAccept(applicant.uid)}
                                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-green-900/20"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/5">
                                                        Ignore
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
            </div>
        </div>
    );
}

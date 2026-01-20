import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { uploadToCloudinary } from "../utils/cloudinary";

export default function Profile() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: "",
    collegeName: "",
    skills: "", 
    experienceLevel: "Beginner",
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [honorHistory, setHonorHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'honor'

  useEffect(() => {
    if (currentUser) {
        const q = query(
            collection(db, `users/${currentUser.uid}/honorHistory`),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            setHonorHistory(snap.docs.map(d => d.data()));
        });
        return unsub;
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchProfile() {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
              ...data,
              skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || ""
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [currentUser]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let downloadURL = profileData.resumeUrl;

      if (resumeFile) {
        downloadURL = await uploadToCloudinary(resumeFile);
      }

      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: profileData.displayName,
        collegeName: profileData.collegeName,
        skills: profileData.skills.split(",").map(s => s.trim()).filter(Boolean),
        experienceLevel: profileData.experienceLevel,
        linkedinUrl: profileData.linkedinUrl,
        githubUrl: profileData.githubUrl,
        resumeUrl: downloadURL
      }, { merge: true });
      
      setProfileData(prev => ({...prev, resumeUrl: downloadURL}));
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Error updating profile: " + error.message);
    }
    setSaving(false);
  }

  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                    <h3 className="font-bold text-lg text-white">Settings</h3>
                </div>
                <nav className="flex flex-col p-2 space-y-1">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`text-left px-4 py-3 rounded-md transition-colors font-medium flex items-center gap-3 ${
                            activeTab === 'profile' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        <span>👤</span> Edit Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('honor')}
                        className={`text-left px-4 py-3 rounded-md transition-colors font-medium flex items-center gap-3 ${
                            activeTab === 'honor' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        <span>🏆</span> Honor History
                    </button>
                </nav>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
            {activeTab === 'profile' && (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Edit Profile</h2>
                    {message && <div className={`p-3 rounded mb-4 ${message.includes("Error") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>{message}</div>}
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={profileData.displayName || ""}
                                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">College Name</label>
                                <input 
                                    type="text" 
                                    value={profileData.collegeName || ""}
                                    onChange={(e) => setProfileData({...profileData, collegeName: e.target.value})}
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Skills (comma separated)</label>
                            <input 
                                type="text" 
                                value={profileData.skills || ""}
                                onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                                placeholder="React, Node.js, Python..."
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Experience Level</label>
                            <select 
                                value={profileData.experienceLevel || "Beginner"}
                                onChange={(e) => setProfileData({...profileData, experienceLevel: e.target.value})}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">LinkedIn URL</label>
                                <input 
                                    type="url" 
                                    value={profileData.linkedinUrl || ""}
                                    onChange={(e) => setProfileData({...profileData, linkedinUrl: e.target.value})}
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">GitHub URL</label>
                                <input 
                                    type="url" 
                                    value={profileData.githubUrl || ""}
                                    onChange={(e) => setProfileData({...profileData, githubUrl: e.target.value})}
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-gray-400 text-sm font-bold mb-2">Resume (PDF)</label>
                             <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                            {profileData.resumeUrl ? (
                                <div className="mt-2 text-sm">
                                    <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-bold block mb-1">
                                        📄 View Current Resume (Click to Open)
                                    </a>
                                    <p className="text-xs text-gray-500 break-all p-2 bg-black/30 rounded border border-gray-700">
                                        Debug URL (Copy to verify):<br/>{profileData.resumeUrl}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 p-2 rounded">
                                    ⚠️ No resume URL found in your profile data.
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded transition-all"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'honor' && (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                     <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <span className="text-yellow-500">🏆</span> Honor History
                     </h3>
                     <div className="space-y-3">
                        {honorHistory.length === 0 ? (
                            <p className="text-gray-400 text-sm py-4 text-center">No history yet. Participate to earn honor!</p>
                        ) : (
                            honorHistory.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-slate-900 p-4 rounded border border-slate-700">
                                    <div>
                                        <p className="text-gray-200 font-medium">{item.reason}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.createdAt?.toDate().toLocaleDateString()} {item.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                    <div className={`font-bold text-lg ${item.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount}
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            )}
        </div>
    </div>
  );
}

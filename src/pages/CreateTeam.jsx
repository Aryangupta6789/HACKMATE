import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function CreateTeam() {
   const { currentUser } = useAuth();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      title: '',
      eventType: 'Hackathon',
      requiredRoles: '',
      teamSize: '4',
      description: ''
   });

   async function handleSubmit(e) {
      e.preventDefault();
      setLoading(true);

      try {
         const docRef = await addDoc(collection(db, "teams"), {
            ...formData,
            requiredRoles: formData.requiredRoles.split(',').map(r => r.trim()).filter(Boolean),
            teamSize: parseInt(formData.teamSize),
            createdBy: currentUser.uid,
            creatorName: currentUser.displayName,
            createdAt: serverTimestamp(),
            status: 'Open',
            members: [currentUser.uid], // Creator is first member
            applicants: []
         });
         navigate(`/team/${docRef.id}`);
      } catch (error) {
         console.error("Error creating team:", error);
         alert("Failed to create team");
      }
      setLoading(false);
   }

   return (
      <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl">
         <h2 className="text-3xl font-display font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Create Team Request</h2>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Team Title / Project Name</label>
               <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none transition-all"
                  placeholder="e.g. AI-Powered Task Manager"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Event Type</label>
                  <div className="relative">
                     <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none appearance-none cursor-pointer"
                     >
                        <option value="Hackathon" className="bg-slate-900">Hackathon</option>
                        <option value="Project" className="bg-slate-900">Project</option>
                        <option value="Cultural Event" className="bg-slate-900">Cultural Event</option>
                     </select>
                     <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                  </div>
               </div>
               <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Team Size</label>
                  <input
                     type="number"
                     min="2" max="10"
                     value={formData.teamSize}
                     onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                     className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none transition-all"
                  />
               </div>
            </div>

            <div>
               <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Required Roles/Skills (comma separated)</label>
               <input
                  type="text"
                  required
                  placeholder="e.g. Frontend, Backend, Designer"
                  value={formData.requiredRoles}
                  onChange={(e) => setFormData({ ...formData, requiredRoles: e.target.value })}
                  className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none transition-all"
               />
            </div>

            <div>
               <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Description</label>
               <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none transition-all"
                  placeholder="Describe your project idea and what you are looking for..."
               ></textarea>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full glass-button py-3 px-6 rounded-xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {loading ? "Creating..." : "Post Request"}
            </button>
         </form>
      </div>
   );
}

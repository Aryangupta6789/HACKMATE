import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../utils/cloudinary';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Account
        name: '',
        email: '',
        password: '',
        // Step 2: Professional
        collegeName: '',
        skills: [], // Changed to array
        experienceLevel: 'Beginner',
        // Step 3: Socials & Resume
        linkedinUrl: '',
        githubUrl: '',
    });
    const [currentSkill, setCurrentSkill] = useState(""); // For new tag input
    const [resumeFile, setResumeFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Skill Tag Logic
    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = currentSkill.trim();
            if (trimmed && !formData.skills.includes(trimmed)) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, trimmed]
                }));
                setCurrentSkill("");
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let resumeUrl = "";
            if (resumeFile) {
                resumeUrl = await uploadToCloudinary(resumeFile);
            }

            const additionalData = {
                collegeName: formData.collegeName,
                skills: formData.skills, // Already an array now
                experienceLevel: formData.experienceLevel,
                linkedinUrl: formData.linkedinUrl,
                githubUrl: formData.githubUrl,
                resumeUrl: resumeUrl
            };

            await signup(formData.email, formData.password, formData.name, additionalData);
            navigate('/');
        } catch (err) {
            setError("Signup failed: " + err.message);
        }
        setLoading(false);
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Full Name</label>
                <input 
                    name="name" type="text" value={formData.name} onChange={handleChange} required 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                <input 
                    name="email" type="email" value={formData.email} onChange={handleChange} required 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                <input 
                    name="password" type="password" value={formData.password} onChange={handleChange} required 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            <button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
                Next: Professional Details
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
             <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">College Name</label>
                <input 
                    name="collegeName" type="text" value={formData.collegeName} onChange={handleChange} required 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            
            {/* Skills Tag Input */}
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Skills</label>
                
                {/* Chip Container */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="bg-blue-600/20 border border-blue-500 text-blue-100 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                            <span>{skill}</span>
                            <button 
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-blue-300 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <input 
                    type="text" 
                    value={currentSkill} 
                    onChange={(e) => setCurrentSkill(e.target.value)} 
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type skill & press Enter (e.g., React)"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter to add a skill</p>
            </div>

            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Experience Level</label>
                <select 
                    name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={handleBack} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Back</button>
                <button onClick={handleNext} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Next: Socials & Resume</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">LinkedIn URL (Optional)</label>
                <input 
                    name="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={handleChange}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">GitHub URL (Optional)</label>
                <input 
                    name="githubUrl" type="url" value={formData.githubUrl} onChange={handleChange}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Resume (PDF)</label>
                <input 
                    type="file" accept=".pdf" 
                    onChange={(e) => {
                        console.log("File Selected:", e.target.files[0]);
                        setResumeFile(e.target.files[0]);
                    }}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={handleBack} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded">
                    {loading ? "Creating Account..." : "Complete Signup"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Sign Up</h2>
                    <div className="flex justify-center mt-4 gap-2">
                        <div className={`h-2 w-1/3 rounded ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                        <div className={`h-2 w-1/3 rounded ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                        <div className={`h-2 w-1/3 rounded ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                    </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form className="space-y-4">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </form>

                <div className="mt-4 text-center text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log In</Link>
                </div>
            </div>
        </div>
    );
}

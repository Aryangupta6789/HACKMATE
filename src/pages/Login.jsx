import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err)
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Left Side - Marketing/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 justify-center items-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 px-16 text-center lg:text-left">
          <h1 className="font-display text-5xl font-bold mb-6 leading-tight">
            <span className="text-white">Build your dream team with </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">HACKMATE.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
            Connect with students, showcase your skills, and conquer hackathons, projects, and events together.
          </p>

          <div className="flex gap-4">
            <div className="p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
              <div className="text-blue-400 text-2xl font-bold mb-1">500+</div>
              <div className="text-slate-500 text-sm">Teams Formed</div>
            </div>
            <div className="p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
              <div className="text-purple-400 text-2xl font-bold mb-1">100+</div>
              <div className="text-slate-500 text-sm">Events Conquered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">HM</div>
              <span className="text-2xl font-display font-bold text-white">HACKMATE</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-red-500 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-offset-slate-900 focus:ring-blue-500" />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account? <Link to="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Sign up for free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

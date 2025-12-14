
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Camera, Mail, CheckCircle, ArrowLeft, Lock, ShieldCheck, User } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthView = 'login' | 'signup' | 'verify' | 'forgot' | 'reset-sent';

const Auth: React.FC = () => {
    const { login, signup, resetPassword, logout, language } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if there was a page we need to return to
    const from = (location.state as any)?.from || '/';
    
    const [view, setView] = useState<AuthView>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await performLogin(email, password);
    };

    const performLogin = async (loginEmail: string, loginPass: string) => {
        setError('');
        setLoading(true);
        try {
            await login(loginEmail, loginPass);
            // Navigate back to where they came from
            navigate(from);
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password);
            const user = auth.currentUser;
            
            if (user) {
                await sendEmailVerification(user);
                await logout(); 
                setView('verify');
            }
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            setView('reset-sent');
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (err: any) => {
        console.error(err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError("Password or Email Incorrect");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("User already exists. Sign in?");
        } else if (err.code === 'auth/weak-password') {
            setError("Password should be at least 6 characters.");
        } else if (err.code === 'auth/too-many-requests') {
            setError("Too many attempts. Please try again later.");
        } else {
            setError(err.message || "An error occurred.");
        }
    };

    const renderVerificationView = () => (
        <div className="text-center">
            <div className="w-16 h-16 bg-nexus-100 dark:bg-nexus-900/50 text-nexus-600 dark:text-nexus-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
                We have sent you a verification email to <span className="font-bold">{email}</span>. Verify it and login.
            </p>
            <button 
                onClick={() => setView('login')}
                className="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 font-medium"
            >
                Login
            </button>
        </div>
    );

    const renderResetSentView = () => (
        <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your mail</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
                We sent you a password change link to <span className="font-bold">{email}</span>.
            </p>
            <button 
                onClick={() => setView('login')}
                className="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 font-medium"
            >
                Sign In
            </button>
        </div>
    );

    const renderForgotPasswordView = () => (
        <form onSubmit={handleResetPassword} className="space-y-4">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email to receive instructions.</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required 
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
                {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> : <Lock className="w-4 h-4" />}
                Get Reset Link
            </button>

            <button 
                type="button" 
                onClick={() => setView('login')}
                className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-medium flex items-center justify-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Sign In
            </button>
        </form>
    );

    const renderAuthForm = () => (
        <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{view === 'login' ? t.nav.login : 'Create Account'}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Access AI Assistant and save your chats.</p>
            </div>

            {view === 'signup' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Photo</label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                    <Camera className="w-6 h-6 mb-1 text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span></p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                        {photo && <p className="text-xs text-green-500 mt-1 text-center truncate">{photo.name}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            required 
                        />
                    </div>
                </>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required 
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                </div>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required 
                />
                {view === 'login' && (
                    <div className="flex justify-end mt-1">
                        <button type="button" onClick={() => setView('forgot')} className="text-xs text-nexus-600 dark:text-nexus-400 hover:underline">
                            Forgot password?
                        </button>
                    </div>
                )}
            </div>
            
            {view === 'signup' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repeat Password</label>
                    <input 
                        type="password" 
                        value={repeatPassword}
                        onChange={e => setRepeatPassword(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        required 
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
                {loading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                        view === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
                )}
                {view === 'login' ? t.nav.login : 'Sign Up'}
            </button>
            
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                    type="button" 
                    onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }} 
                    className="text-nexus-600 dark:text-nexus-400 font-semibold hover:underline"
                >
                    {view === 'login' ? 'Sign Up' : 'Login'}
                </button>
            </div>

            {/* DEMO ACCESS SECTION */}
            {view === 'login' && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-center text-slate-400 mb-4 uppercase tracking-wider font-semibold">Demo Access (Bypass Login)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => performLogin('guest@nexus.demo', 'demo')}
                            className="py-2 px-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <User className="w-4 h-4" /> Guest Demo
                        </button>
                        <button 
                            type="button"
                            onClick={() => performLogin('admin@edafaa.com', 'admin123')}
                            className="py-2 px-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" /> Admin Demo
                        </button>
                    </div>
                </div>
            )}
        </form>
    );

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-md transition-colors duration-200">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {view === 'verify' && renderVerificationView()}
                {view === 'reset-sent' && renderResetSentView()}
                {view === 'forgot' && renderForgotPasswordView()}
                {(view === 'login' || view === 'signup') && renderAuthForm()}
            </div>
        </div>
    );
};

export default Auth;

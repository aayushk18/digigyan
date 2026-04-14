import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '@/context/AppContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const router = useRouter();
    const { login, config, setSeries, setSeriesId } = useApp();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [covers, setCovers] = useState([]);

    useEffect(() => {
        const fetchCovers = async () => {
            const { PR_APP_KEY, PR_TOKEN } = config;
            if (!PR_APP_KEY || !PR_TOKEN) return;
            try {
                const catRes = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN } })
                });
                const catData = await catRes.json();
                if (catData.STATUS === "SUCCESS" && catData.DATA?.length > 0) {
                    setCovers(catData.DATA.slice(0, 6)); // First 6 series
                }
            } catch (err) {
                console.error("Cover fetch error:", err);
            }
        };
        fetchCovers();
    }, [config]);

    const handleSeriesSelect = (cat) => {
        setSeries(cat.PR_NAME);
        setSeriesId(cat.PR_CATEGORY_ID);
        router.push('/');
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        // Simulate login logic
        login();
        router.push('/'); // Redirect to home after login
    };

    const handleGuestView = () => {
        router.push('/'); // Redirect even as guest
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F4FF] font-sans">

            {/* --- LEFT SIDE: PLAYFUL HERO --- */}
            <div className="w-full md:w-1/2 bg-[#6C5CE7] p-8 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden md:rounded-br-[80px]">
                {/* Abstract Bubbles */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-xl animate-[floating_6s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-10 left-[-5%] w-48 h-48 bg-[#FFD93D]/20 rounded-full blur-xl animate-[floating_4s_ease-in-out_infinite]"></div>

                <div className="relative z-10 mt-8">
                    <div className="flex items-center gap-3 mb-10 bg-white/10 w-fit px-5 py-3 rounded-[20px] backdrop-blur-sm border border-white/20 shadow-sm">
                        <div className="text-3xl animate-bounce">🚀</div>
                        <span className="text-2xl font-black tracking-tight">DigiGyan</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-md">
                        Unlock Your <br /> Magic Library ✨
                    </h1>
                    <p className="text-indigo-100 mb-10 max-w-md text-lg font-bold">
                        Jump in to explore thousands of shiny new books, colorful animations, and super fun activities!
                    </p>

                    <div className="space-y-4">
                        <p className="text-sm font-black uppercase tracking-widest text-[#FFEAA7] mb-2">🌟 Premium Books</p>

                        <div className="relative h-44 flex items-center ml-2 mt-4 w-full">
                            {covers.length > 0 ? covers.map((cat, i) => {
                                const colors = ["bg-[#FF6B6B]", "bg-[#4ECDC4]", "bg-[#FFD93D]", "bg-[#A78BFA]", "bg-[#FB923C]", "bg-[#6BCB77]"];
                                const rotations = ["-rotate-12", "-rotate-6", "rotate-3", "rotate-12", "-rotate-3", "rotate-6"];
                                const zIndexes = ["z-10", "z-20", "z-30", "z-40", "z-50", "z-60"];
                                const positions = ["left-0", "left-12", "left-24", "left-36", "left-[192px]", "left-[240px]"];

                                return (
                                    <div
                                        key={cat.PR_CATEGORY_ID}
                                        onClick={() => handleSeriesSelect(cat)}
                                        className={`absolute ${positions[i] || 'left-0'} ${zIndexes[i] || 'z-10'} ${rotations[i] || ''} hover:z-[100] hover:scale-110 hover:-translate-y-4 transition-all duration-300 cursor-pointer`}
                                    >
                                        <div className={`w-28 h-36 border-4 border-white rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] ${colors[i % colors.length]} flex items-center justify-center p-3 text-center`}>
                                            <span className="text-white font-black text-sm drop-shadow-md leading-tight">{cat.PR_NAME}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="flex animate-pulse gap-0 relative w-full h-full items-center">
                                    {[1, 2, 3, 4, 5, 6].map((i, idx) => {
                                        const positions = ["left-0", "left-12", "left-24", "left-36", "left-[192px]", "left-[240px]"];
                                        const rotations = ["-rotate-12", "-rotate-6", "rotate-3", "rotate-12", "-rotate-3", "rotate-6"];
                                        return <div key={i} className={`absolute ${positions[idx]} ${rotations[idx]} w-24 h-32 bg-white/20 rounded-xl border-4 border-white/30 backdrop-blur-sm shadow-xl`}></div>
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGuestView}
                    className="relative z-10 mt-16 flex items-center gap-3 text-white font-black group w-fit hover:scale-105 transition-transform bg-white/10 px-6 py-3 rounded-full border-2 border-white/20"
                >
                    Continue as Guest
                    <span className="bg-white text-[#6C5CE7] p-2 rounded-full group-hover:bg-[#FFD93D] group-hover:text-amber-700 transition-colors shadow-sm">
                        <ArrowRight size={20} />
                    </span>
                </button>
            </div>

            {/* --- RIGHT SIDE: BUBBLY LOGIN FORM --- */}
            <div className="w-full md:w-1/2 p-8 lg:p-24 flex flex-col justify-center bg-[#F0F4FF] relative">

                {/* Floating decor */}
                <div className="hidden lg:block absolute top-[10%] right-[15%] text-6xl opacity-50 animate-[floating_3s_ease-in-out_infinite]">📖</div>

                <div className="max-w-md mx-auto w-full bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-4 border-white relative z-10">
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-[#FFEAA7] rounded-[25px] flex items-center justify-center text-4xl mb-6 mx-auto shadow-sm rotate-3">
                            👋
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h2>
                        <p className="text-slate-500 font-bold">Pop in your details to continue.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 ml-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={20} />
                                <input
                                    type="text"
                                    required
                                    placeholder="admin_priya"
                                    className="w-full pl-14 pr-5 py-4 bg-[#F0F4FF] border-4 border-transparent rounded-[20px] focus:border-[#6C5CE7]/30 outline-none transition-all font-bold text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 px-2">
                                <label className="block text-sm font-black text-slate-700">Password</label>
                                <button type="button" className="text-xs font-black text-[#6C5CE7] hover:text-indigo-800 hover:underline">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-5 py-4 bg-[#F0F4FF] border-4 border-transparent rounded-[20px] focus:border-[#6C5CE7]/30 outline-none transition-all font-bold text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#6C5CE7] text-white py-4 mt-8 rounded-[25px] font-black text-lg shadow-[0_10px_20px_rgba(108,92,231,0.3)] hover:bg-[#5a4bc8] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(108,92,231,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            Let's Go! 🚀
                        </button>
                    </form>

                    <p className="text-center mt-10 text-slate-500 font-bold">
                        Don't have an account?
                        <button className="text-[#6C5CE7] ml-2 hover:underline">Request Access</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
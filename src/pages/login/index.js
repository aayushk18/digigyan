import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { User, Lock, ArrowRight, Star, Rocket } from 'lucide-react';

// --- Background Blob Component (Hydration Safe) ---
const FloatingBlob = ({ color, size, duration, delay, x, y }) => (
    <motion.div
        initial={{ x, y }}
        animate={{
            x: [x, x + 50, x - 30, x],
            y: [y, y - 50, y + 30, y],
            scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
        style={{
            position: 'absolute',
            width: size,
            height: size,
            backgroundColor: color,
            filter: 'blur(50px)',
            borderRadius: '50%',
            opacity: 0.3,
            zIndex: 0,
        }}
    />
);

const LoginPage = () => {
    const router = useRouter();
    const { login, config, setSeries, setSeriesId } = useApp();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [covers, setCovers] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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
                    setCovers(catData.DATA.slice(0, 6));
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
        login();
        router.push('/');
    };

    // --- ANIMATION VARIANTS ---
    const bookContainerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.5 }
        }
    };

    const bookCardVars = (index) => {
        const rotations = [-15, -8, 2, 12, -4, 8];
        const rot = rotations[index % rotations.length];

        return {
            hidden: { y: 300, opacity: 0, rotate: 0 },
            visible: {
                y: [0, -10, 0], // Continuous bobbing animation
                x: index * 55,
                opacity: 1,
                rotate: rot,
                transition: {
                    y: {
                        duration: 2 + index * 0.2, // Each card bobs at a different speed
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    opacity: { duration: 0.5 },
                    rotate: { type: "spring", stiffness: 100 }
                }
            }
        };
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F4FF] font-['Nunito',_sans-serif] overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                
                .bg-mesh {
                    background: linear-gradient(-45deg, #6C5CE7, #a29bfe, #6c5ce7, #8e44ad);
                    background-size: 400% 400%;
                    animation: meshGradient 10s ease infinite;
                }
                @keyframes meshGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* --- LEFT SIDE: THE MAGIC PORTAL --- */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-1/2 bg-mesh p-8 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden md:rounded-br-[100px] shadow-2xl"
            >
                {isMounted && (
                    <>
                        <FloatingBlob color="#FFD93D" size={250} duration={10} delay={0} x={-50} y={150} />
                        <FloatingBlob color="#ffffff" size={200} duration={15} delay={2} x={400} y={-50} />
                    </>
                )}

                <div className="relative z-10 mt-8">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex items-center gap-3 mb-12 bg-white/20 w-fit px-6 py-4 rounded-[30px] backdrop-blur-md border-4 border-white/30 shadow-xl cursor-pointer"
                    >
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl">🚀</motion.div>
                        <span className="text-3xl font-black tracking-tighter italic">DigiGyan</span>
                    </motion.div>

                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-2xl"
                    >
                        Unlock Your <br />
                        <span className="text-[#FFD93D] italic">Magic</span> Library
                    </motion.h1>

                    <p className="text-indigo-100 mb-12 max-w-md text-xl font-bold">
                        Jump in to explore shiny new books, colorful animations, and super fun activities! 🌟
                    </p>

                    {/* --- CONTINUOUSLY ANIMATING CARDS --- */}
                    <motion.div
                        className="relative h-64 mt-20"
                        variants={bookContainerVars}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-sm font-black uppercase tracking-widest text-[#FFD93D] mb-10 flex items-center gap-2 relative z-10">
                            <Star size={18} fill="#FFD93D" className="animate-pulse" /> Pick a Series
                        </p>

                        <div className="flex relative">
                            {covers.map((cat, i) => (
                                <motion.div
                                    key={cat.PR_CATEGORY_ID}
                                    variants={bookCardVars(i)}
                                    whileHover={{
                                        y: -80,
                                        scale: 1.3,
                                        zIndex: 100,
                                        rotate: 0,
                                        transition: { type: "spring", stiffness: 400, damping: 12 }
                                    }}
                                    onClick={() => handleSeriesSelect(cat)}
                                    className="absolute cursor-pointer"
                                >
                                    <div className={`w-32 h-44 rounded-[25px] border-4 border-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center p-4 text-center
                                        ${i % 3 === 0 ? 'bg-[#FF7675]' : i % 3 === 1 ? 'bg-[#55EFC4]' : 'bg-[#FFD93D]'}`}
                                    >
                                        <span className="text-white font-black text-sm drop-shadow-md">{cat.PR_NAME}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.button
                    whileHover={{ x: 15, scale: 1.05 }}
                    onClick={() => router.push('/')}
                    className="relative z-10 mt-20 flex items-center gap-4 text-white font-black bg-white/20 px-8 py-4 rounded-full border-4 border-white/30 backdrop-blur-sm shadow-xl self-start group"
                >
                    Continue as Guest
                    <span className="bg-white text-[#6C5CE7] p-2 rounded-full group-hover:bg-[#FFD93D] group-hover:text-amber-800 transition-colors">
                        <ArrowRight size={20} strokeWidth={3} />
                    </span>
                </motion.button>
            </motion.div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full md:w-1/2 p-8 lg:p-24 flex flex-col justify-center bg-[#F0F4FF] relative">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md mx-auto w-full bg-white p-10 rounded-[60px] shadow-[0_30px_0_0_#E0DAFF] border-4 border-white relative z-10"
                >
                    <div className="mb-12 text-center">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-24 h-24 bg-[#FFEAA7] rounded-[30px] flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner border-4 border-white"
                        >
                            👋
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Welcome Back!</h2>
                        <p className="text-slate-500 font-bold text-lg mt-2">Let's find your magic keys!</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-8">
                        <div className="group">
                            <label className="block text-xs font-black text-[#6C5CE7] uppercase tracking-widest mb-3 ml-4">Username</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={24} />
                                <input
                                    type="text"
                                    required
                                    placeholder="admin_priya"
                                    className="w-full pl-16 pr-6 py-5 bg-[#F0F4FF] border-4 border-transparent rounded-[30px] focus:border-[#6C5CE7]/30 outline-none transition-all font-black text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex justify-between mb-3 px-4">
                                <label className="block text-xs font-black text-[#6C5CE7] uppercase tracking-widest">Password</label>
                                <button type="button" className="text-xs font-black text-[#6C5CE7] hover:underline">Forgot?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={24} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-16 pr-6 py-5 bg-[#F0F4FF] border-4 border-transparent rounded-[30px] focus:border-[#6C5CE7]/30 outline-none transition-all font-black text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-[#6C5CE7] text-white py-5 mt-10 rounded-[30px] font-black text-2xl shadow-[0_12px_0_0_#4834D4] hover:shadow-[0_4px_0_0_#4834D4] hover:translate-y-[8px] transition-all flex items-center justify-center gap-4 group"
                        >
                            Let's Go! <Rocket className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" size={28} />
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
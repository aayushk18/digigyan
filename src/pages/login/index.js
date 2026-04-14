import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { User, Lock, Rocket, Sparkles, Star, Loader2 } from 'lucide-react';

// --- Background Blob Component (Hydration Safe) ---
const FloatingBlob = ({ color, size, duration, delay, x, y }) => (
    <motion.div
        initial={{ x, y }}
        animate={{
            x: [x, x + 80, x - 40, x],
            y: [y, y - 80, y + 40, y],
            scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
        style={{
            position: 'absolute',
            width: size,
            height: size,
            backgroundColor: color,
            filter: 'blur(60px)',
            borderRadius: '50%',
            opacity: 0.35,
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
    const [loadingCovers, setLoadingCovers] = useState(true);

    const { PR_APP_KEY, PR_TOKEN } = config;

    useEffect(() => {
        setIsMounted(true);
        const fetchCoversAndBooks = async () => {
            if (!PR_APP_KEY || !PR_TOKEN) return;
            try {
                // 1. Fetch Categories
                const catRes = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN } })
                });
                const catData = await catRes.json();

                if (catData.STATUS === "SUCCESS" && catData.DATA?.length > 0) {
                    const selectedCats = catData.DATA.slice(0, 9);

                    // 2. Fetch first book for each category to get the image
                    const catsWithImages = await Promise.all(selectedCats.map(async (cat) => {
                        try {
                            const bookRes = await fetch('https://apis.tlmate.com/content-api/books-list', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    CBT_REQUEST_DATA: {
                                        PR_CLASS_ID: "1", // Use a default class to find a book
                                        PR_CATEGORY_ID: cat.PR_CATEGORY_ID.toString(),
                                        PR_TOKEN,
                                        PR_APP_KEY
                                    }
                                })
                            });
                            const bookData = await bookRes.json();
                            return {
                                ...cat,
                                firstBookImg: bookData.DATA?.[0]?.PR_URL || null
                            };
                        } catch (e) {
                            return { ...cat, firstBookImg: null };
                        }
                    }));

                    setCovers(catsWithImages);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingCovers(false);
            }
        };
        fetchCoversAndBooks();
    }, [PR_APP_KEY, PR_TOKEN]);

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
    const containerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const cardVars = {
        hidden: { y: 20, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F4FF] font-['Nunito',_sans-serif] overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                .bg-mesh {
                    background: linear-gradient(-45deg, #6C5CE7, #a29bfe, #4834D4, #6c5ce7);
                    background-size: 400% 400%;
                    animation: meshGradient 15s ease infinite;
                }
                @keyframes meshGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* --- LEFT SIDE: THE 3x3 GRID PORTAL --- */}
            <div className="w-full md:w-[55%] bg-mesh relative p-8 md:p-12 flex flex-col items-center justify-center md:rounded-br-[100px] shadow-2xl">
                {isMounted && (
                    <>
                        <FloatingBlob color="#FFD93D" size={300} duration={15} delay={0} x={-100} y={0} />
                        <FloatingBlob color="#55EFC4" size={250} duration={20} delay={2} x={300} y={400} />
                    </>
                )}

                <div className="relative z-10 w-full max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center gap-6 bg-white/20 backdrop-blur-xl px-6 py-4 rounded-[40px] border-4 border-white/30 w-fit shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                    >
                        {/* --- Logo Image Container with Highlighting --- */}
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                            animate={{
                                boxShadow: [
                                    "0 0 0px 0px rgba(255,255,255,0.4)",
                                    "0 0 20px 10px rgba(255,255,255,0.2)",
                                    "0 0 0px 0px rgba(255,255,255,0.4)"
                                ]
                            }}
                            transition={{
                                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                type: "spring",
                                stiffness: 300
                            }}
                            className="w-20 h-20 bg-white rounded-[25px] p-2 shadow-2xl border-4 border-white/50 overflow-hidden relative group"
                        >
                            {/* Animated Inner Shine */}
                            <motion.div
                                animate={{ x: [-100, 200] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] z-10"
                            />

                            <img
                                src="/logo.png"
                                alt="DigiGyan Logo"
                                className="w-full h-full object-contain relative z-20"
                            />
                        </motion.div>

                        {/* --- Text Container --- */}
                        <div className="flex flex-col">
                            <span className="text-3xl md:text-4xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                                DigiGyan
                            </span>
                            <span className="text-[10px] font-black text-[#FFD93D] uppercase tracking-[0.3em] ml-1">
                                Magic Library 📚
                            </span>
                        </div>
                    </motion.div>

                    {loadingCovers ? (
                        <div className="flex flex-col items-center justify-center h-96 bg-white/10 rounded-[50px] border-4 border-white/20 backdrop-blur-sm">
                            <Loader2 className="animate-spin text-white mb-4" size={50} />
                            <p className="text-white font-black animate-pulse uppercase tracking-widest text-xs">Unlocking the magic bookshelf...</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVars}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-3 gap-4 md:gap-6 bg-white/10 p-6 rounded-[50px] border-4 border-white/20 backdrop-blur-sm"
                        >
                            {covers.map((cat, i) => (
                                <motion.div
                                    key={cat.PR_CATEGORY_ID}
                                    variants={cardVars}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -10,
                                        transition: { type: "spring", stiffness: 400, damping: 10 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSeriesSelect(cat)}
                                    className="aspect-[3/4.5] cursor-pointer"
                                >
                                    <div className={`w-full h-full rounded-[25px] border-4 border-white shadow-xl flex flex-col items-center p-3 text-center relative overflow-hidden group
                                        ${i % 3 === 0 ? 'bg-[#FF7675]' : i % 3 === 1 ? 'bg-[#55EFC4]' : 'bg-[#FFD93D]'}`}
                                    >
                                        {/* Book Cover Container */}
                                        <div className="w-full h-2/3 bg-white/30 rounded-[15px] mb-3 overflow-hidden shadow-inner border-2 border-white/20 relative">
                                            {cat.firstBookImg ? (
                                                <img
                                                    src={cat.firstBookImg}
                                                    alt={cat.PR_NAME}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Star className="text-white opacity-40 floating" size={32} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center mt-auto">
                                            <span className="text-white font-black text-[10px] md:text-xs drop-shadow-md leading-tight uppercase tracking-wider mb-1">
                                                Series
                                            </span>
                                            <span className="text-white font-black text-xs md:text-[14px] drop-shadow-md leading-tight line-clamp-1">
                                                {cat.PR_NAME}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center text-white font-black mt-6 tracking-widest text-xs uppercase opacity-80"
                    >
                        ✨ Pick a world to start exploring ✨
                    </motion.p>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full md:w-[45%] p-8 lg:p-20 flex flex-col justify-center bg-[#F0F4FF] relative">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md mx-auto w-full bg-white p-10 md:p-14 rounded-[70px] shadow-[0_30px_0_0_#E0DAFF] border-4 border-white relative z-10"
                >
                    <div className="mb-10 text-center">
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-20 h-20 bg-[#FFEAA7] rounded-[30px] flex items-center justify-center text-5xl mb-6 mx-auto shadow-inner border-4 border-white"
                        >
                            👋
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Login</h2>
                        <p className="text-slate-500 font-bold mt-2">Welcome back to the club!</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest mb-3 ml-6">Username</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={22} />
                                <input
                                    type="text"
                                    required
                                    placeholder="your_name"
                                    className="w-full pl-14 pr-6 py-5 bg-[#F8FAFF] border-4 border-transparent rounded-[35px] focus:border-[#E0DAFF] outline-none transition-all font-black text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest mb-3 ml-6">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={22} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-5 bg-[#F8FAFF] border-4 border-transparent rounded-[35px] focus:border-[#E0DAFF] outline-none transition-all font-black text-slate-700"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-[#6C5CE7] text-white py-6 mt-6 rounded-[35px] font-black text-2xl shadow-[0_15px_0_0_#4834D4] hover:shadow-[0_5px_0_0_#4834D4] hover:translate-y-[10px] transition-all flex items-center justify-center gap-4 group"
                        >
                            GO! <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
                        </motion.button>
                    </form>

                    <div className="text-center mt-10">
                        <button
                            onClick={() => router.push('/')}
                            className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#6C5CE7] transition-colors"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
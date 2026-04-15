import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { User, Lock, Rocket, Loader2, ChevronDown } from 'lucide-react';

const LoginPage = () => {
    const router = useRouter();
    const { login, config, setSeries, setSeriesId, isLoggedIn } = useApp();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [covers, setCovers] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [loadingCovers, setLoadingCovers] = useState(true);

    const { PR_APP_KEY, PR_TOKEN } = config || {};

    useEffect(() => {
        if (!router.isReady) return;
        if (isLoggedIn === true) {
            router.replace('/');
        }
    }, [router.isReady, isLoggedIn]);

    useEffect(() => {
        setIsMounted(true);
        const fetchCoversAndBooks = async () => {
            if (!PR_APP_KEY || !PR_TOKEN) return;
            try {
                const catRes = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN } })
                });
                const catData = await catRes.json();

                if (catData.STATUS === "SUCCESS" && catData.DATA?.length > 0) {
                    const selectedCats = catData.DATA.slice(0, 9);
                    const catsWithImages = await Promise.all(selectedCats.map(async (cat) => {
                        try {
                            const bookRes = await fetch('https://apis.tlmate.com/content-api/books-list', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    CBT_REQUEST_DATA: {
                                        PR_CLASS_ID: "1",
                                        PR_CATEGORY_ID: cat.PR_CATEGORY_ID.toString(),
                                        PR_TOKEN,
                                        PR_APP_KEY
                                    }
                                })
                            });
                            const bookData = await bookRes.json();
                            return { ...cat, firstBookImg: bookData.DATA?.[0]?.PR_URL || null };
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
        router.push('/category/books');
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        login();
        router.push('/');
    };

    // --- ANIMATION VARIANTS ---
    const containerVars = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const cardVars = {
        hidden: { y: 20, opacity: 0, scale: 0.9 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
    };

    const cardStyles = [
        { bg: '#FF7675', emoji: '🎨' },
        { bg: '#55EFC4', emoji: '🧪' },
        { bg: '#FFD93D', emoji: '🔢' },
        { bg: '#A29BFE', emoji: '🌍' },
        { bg: '#FAB1A0', emoji: '📖' },
        { bg: '#74B9FF', emoji: '💻' },
        { bg: '#F8A5C2', emoji: '✨' },
        { bg: '#63CDDA', emoji: '🔬' },
        { bg: '#FF9F43', emoji: '🦁' },
    ];

    return (
        <div className="app-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                * { box-sizing: border-box; scroll-behavior: smooth; }
                
                body { margin: 0; background: #F0F4FF; }
                /* Lock scroll only on PC/Tablet to keep original layout intact */
                @media (min-width: 768px) { body { overflow: hidden; } }

                .app-container {
                    font-family: 'Nunito', sans-serif;
                    width: 100vw;
                    display: flex; flex-direction: column;
                    background: #F0F4FF;
                }

                @media (min-width: 768px) { 
                    .app-container { flex-direction: row; height: 100vh; overflow: hidden; } 
                }

                .bg-mesh {
                    background: linear-gradient(-45deg, #6C5CE7, #a29bfe, #4834D4, #6c5ce7);
                    background-size: 400% 400%;
                    animation: meshGradient 15s ease infinite;
                }
                @keyframes meshGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

                .mini-sticker-card {
                    border-radius: 30px; padding: 10px; border: 4px solid white;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column;
                    align-items: center; position: relative; overflow: hidden; cursor: pointer;
                    height: 100%;
                }
                
                @media (max-width: 767px) {
                    .mini-sticker-card { height: 180px; border-radius: 25px; }
                }
                
                .mini-image-frame {
                    width: 100%; flex: 1; background: rgba(255,255,255,0.25); border-radius: 18px;
                    border: 3px dashed rgba(255,255,255,0.5); overflow: hidden; margin-bottom: 8px;
                    display: flex; align-items: center; justify-content: center; position: relative;
                }

                .login-sticker {
                    background: white; border-radius: 50px; padding: 40px 30px;
                    border: 8px solid white; box-shadow: 0 25px 50px rgba(108, 92, 231, 0.15);
                    width: 100%; max-width: 420px;
                }

                .chunky-submit-btn {
                    background: #6C5CE7; color: white; border: 4px solid white; border-radius: 30px;
                    padding: 16px; width: 100%; font-weight: 900; font-size: 20px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    box-shadow: 0 15px 25px rgba(108, 92, 231, 0.3); transition: all 0.3s;
                }
                
                .scroll-down-btn {
                    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
                    background: white; color: #6C5CE7; padding: 14px 28px; border-radius: 50px;
                    font-weight: 900; box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                    display: flex; align-items: center; gap: 10px; z-index: 50; cursor: pointer;
                    border: 3px solid #6C5CE7;
                }
            `}</style>

            {/* --- LEFT SIDE: THE PORTAL --- */}
            <div className="w-full md:w-[55%] h-screen md:h-full bg-mesh relative p-6 md:p-10 flex flex-col items-center justify-center md:rounded-br-[60px] shadow-2xl z-10">
                <div className="relative z-10 w-full max-w-lg h-full flex flex-col">

                    {/* Header */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="mb-8 flex items-center justify-center md:justify-start gap-5 cursor-pointer drop-shadow-2xl group w-fit mx-auto md:mx-0"
                    >
                        <div className="relative bg-white/20 p-3 rounded-[24px] border-4 border-white/30 backdrop-blur-xl">
                            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md leading-none">DigiGyan</span>
                            <span className="text-[12px] font-black text-[#FFD93D] uppercase tracking-widest mt-1">Magic Library ✨</span>
                        </div>
                    </motion.div>

                    {/* Grid Area */}
                    <div className="flex-1 min-h-0 w-full relative">
                        <motion.div variants={containerVars} initial="hidden" animate="visible"
                            className="grid grid-cols-3 md:grid-cols-3 gap-4 h-[75%] md:h-full pb-10"
                        >
                            {/* Logic: 4 cards on mobile to leave space for the button, 9 on desktop */}
                            {covers.slice(0, typeof window !== 'undefined' && window.innerWidth < 768 ? 9 : 9).map((cat, i) => {
                                const style = cardStyles[i % cardStyles.length];
                                return (

                                    <motion.div
                                        key={cat.PR_CATEGORY_ID}
                                        variants={cardVars}
                                        onClick={() => handleSeriesSelect(cat)}
                                        className="mini-sticker-card"
                                        style={{ backgroundColor: style.bg }}
                                    >
                                        <div className="mini-image-frame">
                                            {cat.firstBookImg ? (
                                                <img src={cat.firstBookImg} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <span className="text-4xl">{style.emoji}</span>
                                            )}
                                        </div>
                                        <div className="text-center w-full bg-white/90 rounded-xl py-1 px-2">
                                            <p className="text-[#2D3436] font-black text-[11px] md:text-xs leading-tight truncate">{cat.PR_NAME}</p>
                                        </div>
                                    </motion.div>

                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                {/* --- MOBILE ONLY SCROLL BUTTON --- */}

                {/* 'block' for mobile, 'md:hidden' ensures it disappears on tablets and laptops */}
                <div className='md:hidden'>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                        onClick={() => document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' })}
                        className="scroll-down-btn block md:hidden"
                    >
                        Login   <ChevronDown size={22} className="animate-bounce" />
                    </motion.div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div id="login-section" className="w-full md:w-[45%] h-screen md:h-full p-6 md:p-12 flex flex-col justify-center items-center relative">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="login-sticker"
                >
                    <div className="text-center mb-8">
                        <div className="floating w-20 h-20 bg-[#FFEAA7] rounded-[28px] flex items-center justify-center text-4xl mb-4 mx-auto border-4 border-white shadow-lg">👋</div>
                        <h2 className="text-4xl font-black text-[#2D3436] tracking-tight mb-1">Login</h2>
                        <p className="text-[#6C5CE7] font-bold text-base">Join the Magic Club! ✨</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        <div className="chunky-input-wrapper flex flex-row gap-2">
                            <User className="text-[#6C5CE7]" size={22} />
                            <input type="text" required placeholder="Username" className="chunky-input" onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div className="chunky-input-wrapper flex flex-row gap-2">
                            <Lock className="text-[#6C5CE7]" size={22} />
                            <input type="password" required placeholder="Password" className="chunky-input" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <button type="submit" className="chunky-submit-btn" style={{ marginTop: '30px' }}>
                            Let's Go! <Rocket size={24} fill="currentColor" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
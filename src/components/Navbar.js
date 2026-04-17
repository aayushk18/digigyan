import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    ChevronDown,
    FileText,
    ShieldCheck,
    Info,
    LogOut,
    User,
    Lock,
    X,
    BookOpen,
    GraduationCap,
    Loader2,
    Sparkles
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/router";

const DigiGyanNav = () => {
    const { isLoggedIn, user, login, logout, Class, setClass, series, setSeries, setSeriesId, setClassId, config } = useApp();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);

    // UI States
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [showClassDropdown, setShowClassDropdown] = useState(false);
    const [loading, setLoading] = useState({ cats: false, classes: false });

    const handleSignIn = (e) => {
        e.preventDefault();
        login();
        setShowLoginModal(false);
    };

    const { PR_APP_KEY, PR_TOKEN } = config;



    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            if (!PR_APP_KEY || !PR_TOKEN) return;
            setLoading(prev => ({ ...prev, cats: true }));
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN } })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") {
                    setCategories(result.DATA);
                    if (result.DATA && result.DATA.length > 0 && !series) {
                        handleCategorySelect(result.DATA[0]);
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(prev => ({ ...prev, cats: false })); }
        };
        fetchCategories();
    }, [PR_APP_KEY, PR_TOKEN]);

    async function handleCategorySelect(cat) {
        setSeries(cat.PR_NAME);
        setSeriesId(cat.PR_CATEGORY_ID);
        setClass('');
        setClassId('');
        setShowCatDropdown(false);
        setLoading(prev => ({ ...prev, classes: true }));

        try {
            const response = await fetch('https://apis.tlmate.com/content-api/classes-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CBT_REQUEST_DATA: {
                        PR_CATEGORY_ID: cat.PR_CATEGORY_ID.toString(),
                        PR_TOKEN,
                        PR_APP_KEY
                    }
                })
            });
            const result = await response.json();
            if (result.STATUS === "SUCCESS") {
                setClasses(result.DATA);
                if (result.DATA && result.DATA.length > 0) {
                    const firstClass = result.DATA[0];
                    setClass(firstClass.PR_NAME);
                    setClassId(firstClass.PR_CLASS_ID);
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(prev => ({ ...prev, classes: false })); }
    }

    // Dropdown Animation Variants
    const dropdownVars = {
        hidden: { opacity: 0, y: 15, scale: 0.9, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        exit: { opacity: 0, scale: 0.9, y: 10 }
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="h-[80px] bg-[#6C5CE7] rounded-b-[40px] flex items-center justify-between px-6 md:px-12 sticky top-0 z-[100] shadow-[0_15px_0_0_#5a4bc8] mx-0 md:mx-4 mt-0 md:mt-2 border-x-4 border-b-4 border-white/20"
            >
                <div className="flex items-center gap-10">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05, rotate: -3 }}
                        onClick={() => router.push('/')}
                        className="text-2xl font-black text-white flex items-center gap-4 cursor-pointer drop-shadow-2xl group"
                    >
                        {/* --- Glassmorphism Logo Container with Highlight --- */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 0px 0px rgba(255,255,255,0.4)",
                                    "0 0 20px 10px rgba(255,255,255,0.2)",
                                    "0 0 0px 0px rgba(255,255,255,0.4)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-white/20 p-2.5 rounded-[22px] border-4 border-white/30 backdrop-blur-xl group-hover:bg-white transition-all overflow-hidden"
                        >
                            {/* Animated Inner Shine */}
                            <motion.div
                                animate={{ x: [-100, 150] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] z-10"
                            />

                            <img
                                src="/logo.png"
                                alt="DigiGyan Logo"
                                className="w-10 h-10 object-contain relative z-20 group-hover:scale-110 transition-transform"
                            />
                        </motion.div>

                        {/* --- Typography Container --- */}
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white italic tracking-tighter drop-shadow-md">
                                DigiGyan
                            </span>

                        </div>
                    </motion.div>

                    {/* --- DYNAMIC SELECTORS --- */}
                    {/* <nav className="hidden lg:flex items-center gap-6">
                     
                        <div className="relative">
                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCatDropdown(!showCatDropdown)}
                                className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-[20px] text-sm font-black text-[#6C5CE7] shadow-[0_8px_0_0_#E0DAFF] hover:shadow-[0_4px_0_0_#E0DAFF] transition-all border-2 border-transparent"
                            >
                                <BookOpen size={18} className="text-[#FF7675]" />
                                {(typeof series === 'object' ? series?.PR_NAME : series) || "Series"}
                                <ChevronDown size={16} className={`transition-transform duration-300 ${showCatDropdown ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {showCatDropdown && (
                                    <motion.div
                                        variants={dropdownVars}
                                        initial="hidden" animate="visible" exit="exit"
                                        className="absolute top-14 left-0 w-72 bg-white rounded-[30px] shadow-2xl p-3 z-50 border-4 border-[#E0DAFF] max-h-96 overflow-y-auto custom-scrollbar"
                                    >
                                        {loading.cats ? (
                                            <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-[#6C5CE7]" size={32} /></div>
                                        ) : (
                                            categories.map(cat => (
                                                <motion.button
                                                    key={cat.PR_CATEGORY_ID}
                                                    whileHover={{ x: 10, backgroundColor: "#F8FAFF" }}
                                                    onClick={() => handleCategorySelect(cat)}
                                                    className="w-full px-5 py-3 text-left text-sm font-black text-slate-700 rounded-2xl transition-colors"
                                                >
                                                    {cat.PR_NAME}
                                                </motion.button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                   
                        <div className={`relative ${!series && 'opacity-50 grayscale pointer-events-none'}`}>
                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowClassDropdown(!showClassDropdown)}
                                className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-[20px] text-sm font-black text-[#6C5CE7] shadow-[0_8px_0_0_#E0DAFF] hover:shadow-[0_4px_0_0_#E0DAFF] transition-all border-2 border-transparent"
                            >
                                <GraduationCap size={18} className="text-[#55EFC4]" />
                                {Class || "Class"}
                                <ChevronDown size={16} className={`transition-transform duration-300 ${showClassDropdown ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {showClassDropdown && (
                                    <motion.div
                                        variants={dropdownVars}
                                        initial="hidden" animate="visible" exit="exit"
                                        className="absolute top-14 left-0 w-56 bg-white rounded-[30px] shadow-2xl p-3 z-50 border-4 border-[#E0DAFF]"
                                    >
                                        {loading.classes ? (
                                            <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-[#55EFC4]" size={32} /></div>
                                        ) : (
                                            classes.map(cls => (
                                                <motion.button
                                                    key={cls.PR_CLASS_ID}
                                                    whileHover={{ x: 10, backgroundColor: "#F8FAFF" }}
                                                    onClick={() => { setClass(cls.PR_NAME); setClassId(cls.PR_CLASS_ID); setShowClassDropdown(false); }}
                                                    className="w-full px-5 py-3 text-left text-sm font-black text-slate-700 rounded-2xl transition-colors"
                                                >
                                                    {cls.PR_NAME}
                                                </motion.button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav> */}
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 p-2 pr-5 rounded-full bg-white/10 border-2 border-white/30 hover:bg-white/20 transition-all"
                            >
                                <div className="w-10 h-10 bg-[#FFD93D] rounded-full flex items-center justify-center text-slate-800 text-lg font-black border-2 border-white">
                                    {user?.initials || "AJ"}
                                </div>
                                <span className="text-sm font-black text-white hidden sm:inline">{user?.name}</span>
                                <ChevronDown size={16} className={`text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        variants={dropdownVars}
                                        initial="hidden" animate="visible" exit="exit"
                                        className="absolute right-0 mt-4 w-64 bg-white rounded-[35px] shadow-2xl p-3 z-50 border-4 border-[#E0DAFF]"
                                    >
                                        <div className="px-4 py-2 border-b-2 border-slate-50 mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secret Menu</p>
                                        </div>

                                        <MenuLink icon={<FileText size={18} color="#FF7675" />} label="Terms" />
                                        <MenuLink icon={<ShieldCheck size={18} color="#55EFC4" />} label="Privacy" />
                                        <MenuLink icon={<Info size={18} color="#6C5CE7" />} label="Help" />

                                        <div className="h-1 bg-slate-50 my-2 mx-2 rounded-full"></div>

                                        <motion.button
                                            whileHover={{ x: 10, backgroundColor: "#FFF5F5" }}
                                            onClick={() => { logout(); setShowDropdown(false); router.push("/login"); }}
                                            className="w-full px-5 py-3 text-left text-sm font-black text-red-500 rounded-2xl flex items-center gap-3"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowLoginModal(true)}
                            className="bg-[#FFEAA7] text-[#D6A317] px-8 py-3 rounded-full font-black text-sm shadow-[0_8px_0_0_#F9CA24] hover:shadow-[0_4px_0_0_#F9CA24] transition-all border-2 border-white"
                        >
                            Log In ✨
                        </motion.button>
                    )}
                </div>
            </motion.header>

            {/* --- CRAZY COMPACT LOGIN MODAL --- */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setShowLoginModal(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-[400px] bg-white rounded-[60px] shadow-2xl p-10 border-8 border-white"
                        >
                            <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 p-2 text-slate-300 hover:bg-slate-50 rounded-full">
                                <X size={24} />
                            </button>

                            <div className="text-center mb-10">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-20 h-20 bg-[#F0F4FF] rounded-[30px] flex items-center justify-center mx-auto mb-4 border-4 border-[#E0DAFF]"
                                >
                                    <Sparkles size={40} className="text-[#6C5CE7]" />
                                </motion.div>
                                <h2 className="text-3xl font-black text-slate-800">Hi There!</h2>
                                <p className="text-slate-400 font-bold">Time for some magic!</p>
                            </div>

                            <form onSubmit={(e) => handleSignIn(e)} className="space-y-5">
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={20} />
                                    <input type="text" placeholder="Username" required className="w-full pl-14 pr-6 py-5 bg-[#F8FAFF] rounded-[30px] outline-none border-4 border-transparent focus:border-[#E0DAFF] font-black" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={20} />
                                    <input type="password" placeholder="Password" required className="w-full pl-14 pr-6 py-5 bg-[#F8FAFF] rounded-[30px] outline-none border-4 border-transparent focus:border-[#E0DAFF] font-black" />
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-[#6C5CE7] text-white py-5 rounded-[30px] font-black text-xl shadow-[0_12px_0_0_#4834D4] hover:shadow-[0_4px_0_0_#4834D4] hover:translate-y-[8px] transition-all"
                                >
                                    Let's Go! 🚀
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

// Helper Sub-component for Menu Links
const MenuLink = ({ icon, label }) => (
    <motion.button
        whileHover={{ x: 10, backgroundColor: "#F8FAFF" }}
        className="w-full px-5 py-3 text-left text-sm font-black text-slate-600 rounded-2xl flex items-center gap-4 transition-colors"
    >
        {icon} {label}
    </motion.button>
);

export default DigiGyanNav;
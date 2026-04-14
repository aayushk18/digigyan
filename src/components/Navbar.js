import React, { useEffect, useState } from 'react';
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
    Loader2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/router";



const DigiGyanNav = ({ activeNav, setActiveNav, navItems }) => {
    const { isLoggedIn, user, login, logout, Class, setClass, series, setSeries, setSeriesId, setClassId } = useApp();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    const { config } = useApp();

    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);

    // Selection States
    const [selectedCat, setSelectedCat] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

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

    // 1. Fetch Categories on Mount
    useEffect(() => {


        const fetchCategories = async () => {
            setLoading(prev => ({ ...prev, cats: true }));
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA:
                            { PR_APP_KEY, PR_TOKEN }
                    })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") {
                    setCategories(result.DATA);
                    // Automatically select the first category if none is currently selected
                    if (result.DATA && result.DATA.length > 0 && !series) {
                        handleCategorySelect(result.DATA[0]);
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(prev => ({ ...prev, cats: false })); }
        };



        fetchCategories();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [PR_APP_KEY, PR_TOKEN]);


    async function handleCategorySelect(cat) {
        setSeries(cat.PR_NAME);
        setSeriesId(cat.PR_CATEGORY_ID);
        setSelectedCat(cat);
        setClass(''); // Reset class in context
        setClassId(''); // Reset classId in context
        setSelectedClass(null); // Reset class
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
                // Automatically select the first class of the newly selected category
                if (result.DATA && result.DATA.length > 0) {
                    const firstClass = result.DATA[0];
                    setClass(firstClass.PR_NAME);
                    setClassId(firstClass.PR_CLASS_ID);
                    setSelectedClass(firstClass);
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(prev => ({ ...prev, classes: false })); }
    };

    return (
        <>
            <header className="h-[80px] bg-[#6C5CE7] rounded-b-[30px] md:rounded-b-[40px] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 shadow-[0_10px_30px_rgba(108,92,231,0.25)] mx-0 md:mx-4 mt-0 md:mt-2">
                <div className="flex items-center gap-8">
                    <div className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
                        <div className="bg-white/20 p-2 rounded-xl">🚀</div>
                        <span>DigiGyan</span>
                    </div>

                    {/* --- DYNAMIC DROPDOWNS --- */}
                    <nav className="hidden lg:flex items-center gap-4">

                        {/* Category Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCatDropdown(!showCatDropdown)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-indigo-50 rounded-full text-sm font-black text-[#6C5CE7] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-2 border-transparent hover:border-indigo-200 hover:-translate-y-1"
                            >
                                <BookOpen size={18} className="text-[#FF6B6B]" />
                                {series ? series : "Select Series"}
                                <ChevronDown size={16} className={`transition-transform duration-300 ${showCatDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showCatDropdown && (
                                <div className="absolute top-12 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 max-h-80 overflow-y-auto custom-scrollbar">
                                    {loading.cats ? (
                                        <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>
                                    ) : (
                                        categories.map(cat => (
                                            <button
                                                key={cat.PR_CATEGORY_ID}
                                                onClick={() => handleCategorySelect(cat)}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                                {cat.PR_NAME}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Class Dropdown */}
                        <div className={`relative ${!series && 'opacity-60 pointer-events-none'}`}>
                            <button
                                onClick={() => setShowClassDropdown(!showClassDropdown)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-indigo-50 rounded-full text-sm font-black text-[#6C5CE7] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-2 border-transparent hover:border-indigo-200 hover:-translate-y-1"
                            >
                                <GraduationCap size={18} className="text-[#4ECDC4]" />
                                {Class ? Class : "Select Class"}
                                <ChevronDown size={16} className={`transition-transform duration-300 ${showClassDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showClassDropdown && (
                                <div className="absolute top-12 left-0 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                                    {loading.classes ? (
                                        <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={20} /></div>
                                    ) : (
                                        classes.map(cls => (
                                            <button
                                                key={cls.PR_CLASS_ID}
                                                onClick={() => { 
                                                    setClass(cls.PR_NAME);
                                                    setClassId(cls.PR_CLASS_ID);
                                                    setSelectedClass(cls); 
                                                    setShowClassDropdown(false); 
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                            >
                                                {cls.PR_NAME}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Settings Button - Only shows when logged in */}
                    {isLoggedIn && (
                        <button className="p-3 text-white bg-white/10 hover:bg-white/20 hover:-translate-y-1 rounded-full transition-all border border-white/20">
                            <Settings size={22} />
                        </button>
                    )}

                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                            >
                                <div className="w-10 h-10 bg-[#FFD93D] rounded-full flex items-center justify-center text-indigo-800 text-lg font-black uppercase border-2 border-white shadow-sm">
                                    {user?.initials || "AJ"}
                                </div>
                                <span className="text-sm font-black text-white hidden sm:inline drop-shadow-sm">{user?.name}</span>
                                <ChevronDown size={16} className={`text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Enhanced Dropdown */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support & Legal</p>
                                    </div>

                                    <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <FileText size={16} className="text-slate-400" />
                                        Terms & Conditions
                                    </button>

                                    <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        Privacy Policy
                                    </button>

                                    <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <Info size={16} className="text-slate-400" />
                                        Help Center
                                    </button>

                                    <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowDropdown(false);
                                            router.push("/login");

                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="bg-[#FFEAA7] text-[#D6A317] px-6 py-2.5 rounded-full font-black text-sm hover:scale-105 hover:bg-yellow-300 shadow-lg shadow-black/10 transition-all border-2 border-white/50"
                        >
                            Log In ✨
                        </button>
                    )}
                </div>
            </header>

            {/* --- COMPACT LOGIN POP-UP --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowLoginModal(false)}></div>
                    <div className="relative w-full max-w-[380px] bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                            <X size={18} />
                        </button>
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <User size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Welcome Back</h2>
                            <p className="text-sm text-slate-500 font-medium">Please sign in to continue</p>
                        </div>
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="password" placeholder="Password" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold" />
                            </div>
                            <button className="text-[11px] font-bold text-indigo-600 hover:underline block w-full text-right px-1">Forgot Password?</button>
                            <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">Sign In</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default DigiGyanNav;
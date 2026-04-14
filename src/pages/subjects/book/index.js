import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
    ArrowLeft,
    PlayCircle,
    BookOpen,
    ClipboardCheck,
    FilePlus,
    Loader2,
    Sparkles,
    Smartphone
} from 'lucide-react';

const BookHub = () => {
    const router = useRouter();
    const { bookid } = router.query;
    const { config } = useApp();

    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('book');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!router.isReady || !bookid) return;

        const fetchBookContent = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/book-content-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_BOOK_ID: parseInt(bookid),
                            PR_TOKEN: config.PR_TOKEN,
                            PR_APP_KEY: config.PR_APP_KEY
                        }
                    })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") setBookData(result.DATA);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchBookContent();
    }, [router.isReady, bookid, config]);

    if (loading || !isMounted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4FF]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 className="text-[#6C5CE7]" size={60} />
                </motion.div>
                <p className="font-black text-[#6C5CE7] mt-4 text-2xl">Opening the Hub...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'book', label: 'E-Book', icon: <BookOpen />, color: '#6C5CE7', url: bookData?.PR_EBOOK_URL },
        { id: 'video', label: 'Animations', icon: <PlayCircle />, color: '#FF7675', url: bookData?.PR_VIDEO_DATA?.length > 0 ? `/subjects/video?bookid=${bookid}` : null },
        { id: 'evaluate', label: 'Self Evaluate', icon: <ClipboardCheck />, color: '#55EFC4', url: bookData?.PR_ACTIVITY_URL },
        { id: 'tg', label: 'Test Maker', icon: <FilePlus />, color: '#A29BFE', url: bookData?.PR_TG_URL },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#F0F4FF] font-['Nunito',_sans-serif] flex flex-col">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                .phone-shadow { box-shadow: 0 50px 100px -20px rgba(108, 92, 231, 0.25); }
                .nav-shadow { box-shadow: 10px 0 30px rgba(0,0,0,0.03); }
            `}</style>

            {/* TOP BAR */}
            <motion.header
                initial={{ y: -50 }} animate={{ y: 0 }}
                className="h-20 bg-[#6C5CE7] flex items-center justify-between px-8 text-white z-50 shadow-[0_10px_0_0_#5a4bc8]"
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.back()}
                        className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <h1 className="text-2xl font-black italic tracking-tighter">DigiGyan Hub 📔</h1>
                </div>
                <div className="hidden md:block bg-white/20 px-6 py-2 rounded-full font-black text-sm">
                    {bookData?.PR_NAME}
                </div>
            </motion.header>

            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

                {/* LEFT MAGIC SIDEBAR */}
                <motion.nav
                    initial={{ x: -100 }} animate={{ x: 0 }}
                    className="w-full md:w-80 bg-white p-6 flex flex-col gap-4 nav-shadow z-40"
                >
                    <div className="mb-6 px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Navigation</p>
                        <h2 className="text-xl font-black text-slate-800">Learning Path</h2>
                    </div>

                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 p-5 rounded-[25px] transition-all relative overflow-hidden group
                                ${activeTab === tab.id
                                    ? 'bg-[#6C5CE7] text-white shadow-[0_10px_20px_rgba(108,92,231,0.3)]'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            <span className={`${activeTab === tab.id ? 'text-white' : 'text-[#6C5CE7]'} group-hover:rotate-12 transition-transform`}>
                                {tab.icon}
                            </span>
                            <span className="font-black text-sm">{tab.label}</span>
                            {!tab.url && (
                                <span className="ml-auto text-[8px] font-black bg-yellow-300 text-slate-800 px-2 py-1 rounded-lg">SOON</span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div layoutId="spark" className="absolute right-4"><Sparkles size={16} /></motion.div>
                            )}
                        </motion.button>
                    ))}

                    <div className="mt-auto p-6 bg-[#FFF9E6] rounded-[30px] border-4 border-dashed border-[#FFD93D]">
                        <p className="text-[11px] font-black text-[#947600] leading-relaxed">
                            💡 Tip: Watch the animations before doing Self Evaluation!
                        </p>
                    </div>
                </motion.nav>

                {/* RIGHT PREVIEW AREA */}
                <main className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center relative bg-[#F8FAFF]">
                    {/* Background Decorative Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6C5CE7] opacity-[0.03] blur-[100px] rounded-full" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, y: -20 }}
                            className="flex flex-col items-center gap-12 z-10 w-full max-w-4xl"
                        >
                            {/* THE PHONE PREVIEW */}
                            <div className="relative group">
                                {/* Phone Frame */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="w-[280px] h-[550px] bg-slate-800 rounded-[50px] border-[8px] border-slate-900 p-3 phone-shadow relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
                                    <div className="w-full h-full bg-white rounded-[35px] overflow-hidden flex flex-col">
                                        {/* Mock Content based on tab */}
                                        <div className="h-12 bg-[#F0F4FF] flex items-center justify-center border-b border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400">{currentTab.label} Preview</span>
                                        </div>
                                        <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center">
                                            <img src={bookData?.PR_ICON} className="w-32 h-44 rounded-xl shadow-lg mb-6" alt="Cover" />
                                            <div className="h-2 w-24 bg-slate-100 rounded-full mb-2" />
                                            <div className="h-2 w-16 bg-slate-100 rounded-full" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Badges around phone */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -right-10 text-[#FFD93D]"><Sparkles size={60} /></motion.div>
                                <div className="absolute -bottom-5 -left-10 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border-2 border-[#F0F4FF]">
                                    <div className="w-10 h-10 rounded-full bg-[#E0DAFF] flex items-center justify-center text-[#6C5CE7]"><Smartphone size={20} /></div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">Optimized for <br /> Mobile Learning</p>
                                </div>
                            </div>

                            {/* CENTER ACTION AREA */}
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-slate-800 mb-2">{currentTab.label}</h3>
                                <p className="text-slate-500 font-bold mb-8">Access the {currentTab.label.toLowerCase()} content for {bookData.PR_NAME}</p>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!currentTab.url}
                                    onClick={() => {
                                        if (currentTab.url.startsWith('/')) router.push(currentTab.url);
                                        else window.open(currentTab.url, '_blank');
                                    }}
                                    className={`px-12 py-6 rounded-[35px] font-black text-2xl flex items-center gap-4 shadow-2xl transition-all
                                        ${currentTab.url
                                            ? 'bg-[#6C5CE7] text-white shadow-[0_15px_0_0_#4834D4] hover:translate-y-2 hover:shadow-none'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {currentTab.url ? 'Open Magic ✨' : 'Coming Soon'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default BookHub;
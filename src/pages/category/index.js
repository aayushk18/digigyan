import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, BookOpen, Loader2,
    Search, Star, Rocket, Sparkles, Ghost, GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const ManualEntry = () => {
    const router = useRouter();
    const { config } = useApp();

    const [isMounted, setIsMounted] = useState(false);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [books, setBooks] = useState([]);

    const [selectedCat, setSelectedCat] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState({ cats: false, classes: false, books: false });

    const { PR_APP_KEY, PR_TOKEN } = config;

    useEffect(() => {
        setIsMounted(true);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        if (!PR_APP_KEY) return;
        setLoading(prev => ({ ...prev, cats: true }));
        try {
            const res = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN } })
            });
            const result = await res.json();
            if (result.STATUS === "SUCCESS") setCategories(result.DATA);
        } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, cats: false })); }
    };

    const handleCategorySelect = async (category) => {
        setSelectedCat(category);
        setSelectedClass(null);
        setBooks([]);
        setLoading(prev => ({ ...prev, classes: true }));
        try {
            const res = await fetch('https://apis.tlmate.com/content-api/classes-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CBT_REQUEST_DATA: { PR_CATEGORY_ID: category.PR_CATEGORY_ID.toString(), PR_TOKEN, PR_APP_KEY }
                })
            });
            const result = await res.json();
            if (result.STATUS === "SUCCESS") setClasses(result.DATA);
        } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, classes: false })); }
    };

    useEffect(() => {
        if (!selectedCat || !selectedClass) return;
        const fetchBooks = async () => {
            setLoading(prev => ({ ...prev, books: true }));
            try {
                const res = await fetch('https://apis.tlmate.com/content-api/books-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_CLASS_ID: selectedClass.PR_CLASS_ID,
                            PR_CATEGORY_ID: selectedCat.PR_CATEGORY_ID,
                            PR_TOKEN, PR_APP_KEY
                        }
                    })
                });
                const result = await res.json();
                if (result.STATUS === "SUCCESS") setBooks(result.DATA || []);
            } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, books: false })); }
        };
        fetchBooks();
    }, [selectedCat, selectedClass]);

    const filteredBooks = books.filter(book =>
        book.PR_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", color: "#2D3436" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                
                /* Compact Custom Scrollbar */
                .compact-scroll::-webkit-scrollbar { width: 5px; }
                .compact-scroll::-webkit-scrollbar-track { background: #F0F4FF; border-radius: 10px; }
                .compact-scroll::-webkit-scrollbar-thumb { background: #6C5CE7; border-radius: 10px; }
                
                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            `}</style>

            {/* --- HEADER --- */}
            <header className="h-[80px] bg-[#6C5CE7] rounded-b-[30px] md:rounded-b-[40px] flex items-center justify-between px-6 md:px-12 sticky top-0 z-[100] shadow-[0_10px_30px_rgba(108,92,231,0.25)] mx-0 md:mx-4 mt-0 md:mt-2">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.back()}
                        className="bg-white/20 p-2 rounded-xl text-white border-2 border-white/20"
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <h1 className="text-xl md:text-2xl font-black text-white italic drop-shadow-md">Setup Workshop 🛠️</h1>
                </div>
                {selectedCat && (
                    <div className="hidden lg:block bg-[#FFEAA7] px-5 py-2 rounded-full border-2 border-white text-[#D6A317] font-black text-xs shadow-sm">
                        {selectedCat.PR_NAME}
                    </div>
                )}
            </header>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                {/* --- COMPACT SIDEBAR --- */}
                <motion.aside
                    initial={{ x: -100 }} animate={{ x: 0 }}
                    className="w-full md:w-[340px] bg-white p-5 md:p-6 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-40 flex flex-col gap-5 md:h-[calc(100vh-100px)] border-r-4 border-[#F0F4FF]"
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={18} />
                        <input
                            type="text"
                            placeholder="Search magic..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFF] border-4 border-transparent rounded-[20px] focus:border-[#E0DAFF] outline-none font-black text-sm transition-all"
                        />
                    </div>

                    {/* Step 1: Series (Compact & Scrollable) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Series Shelf</label>
                        <div className="compact-scroll overflow-y-auto pr-2 flex flex-col gap-1.5 max-h-[280px] md:max-h-[350px] bg-slate-50/50 p-2 rounded-[25px] border-2 border-slate-100">
                            {loading.cats ? (
                                <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#6C5CE7]" size={20} /></div>
                            ) : (
                                categories.map(cat => (
                                    <button
                                        key={cat.PR_CATEGORY_ID}
                                        onClick={() => handleCategorySelect(cat)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[18px] font-black text-[13px] transition-all border-2
                                            ${selectedCat?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID
                                                ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md'
                                                : 'bg-white text-slate-600 border-transparent hover:border-[#E0DAFF] shadow-sm'}`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <span className="text-base">{selectedCat?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID ? '📖' : '📚'}</span>
                                            <span className="truncate">{cat.PR_NAME}</span>
                                        </div>
                                        {selectedCat?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID && <Sparkles size={12} />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Step 2: Class (Pills) */}
                    <AnimatePresence>
                        {selectedCat && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {loading.classes ? (
                                        <div className="col-span-2 py-2 flex justify-center"><Loader2 className="animate-spin text-[#55EFC4]" size={20} /></div>
                                    ) : (
                                        classes.map(cls => (
                                            <button
                                                key={cls.PR_CLASS_ID}
                                                onClick={() => setSelectedClass(cls)}
                                                className={`py-3 px-1 rounded-[15px] font-black text-xs transition-all border-2
                                                    ${selectedClass?.PR_CLASS_ID === cls.PR_CLASS_ID
                                                        ? 'bg-[#FFD93D] text-slate-800 border-[#FFD93D] shadow-sm'
                                                        : 'bg-white text-[#6C5CE7] border-[#F0F4FF] hover:border-[#FFD93D]'}`}
                                            >
                                                {cls.PR_NAME}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.aside>

                {/* --- BOOKSHELF AREA --- */}
                <main className="flex-1 p-5 md:p-10 overflow-y-auto bg-[#F8FAFF]">
                    {!selectedCat || !selectedClass ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                            <div className="text-7xl mb-4 floating grayscale opacity-40">🧭</div>
                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Select series & grade <br /> to fill the shelf</p>
                        </div>
                    ) : loading.books ? (
                        <div className="flex flex-col items-center justify-center h-[50vh]">
                            <Loader2 className="animate-spin text-[#6C5CE7]" size={48} />
                            <p className="font-black text-[#6C5CE7] mt-3 uppercase tracking-widest text-[10px]">Unlocking Library...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8">
                            <AnimatePresence>
                                {filteredBooks.map((book, idx) => (
                                    <motion.div
                                        key={book.PR_ID}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -8, rotate: idx % 2 === 0 ? 1 : -1 }}
                                        className="bg-white rounded-[30px] p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.04)] border-4 border-white flex flex-col group cursor-pointer"
                                        onClick={() => router.push(`/subjects/book?bookid=${book.PR_ID}`)}
                                    >
                                        <div className="w-full aspect-[3/4] bg-[#F0F4FF] rounded-[22px] mb-3 overflow-hidden relative border-2 border-[#F0F4FF]">
                                            <img src={book.PR_URL} alt={book.PR_NAME} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#6C5CE7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <h3 className="text-[12px] font-black text-slate-800 line-clamp-2 px-1 mb-3 leading-tight min-h-[32px]">{book.PR_NAME}</h3>
                                        <div className="w-full mt-auto py-2.5 bg-[#6C5CE7] text-white rounded-[15px] text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-[0_6px_0_0_#5a4bc8] active:shadow-none active:translate-y-1 transition-all">
                                            <Rocket size={12} /> Explore
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredBooks.length === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-300">
                                    <Ghost size={50} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-black uppercase tracking-widest text-xs">Empty dimension...</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManualEntry;
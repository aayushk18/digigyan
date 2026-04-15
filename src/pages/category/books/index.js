import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
    { id: "books", label: "Flipbooks", emoji: "📚" },
    { id: "animations", label: "Animations", emoji: "🎬" },
    { id: "tests", label: "Test", emoji: "📝" },
];

export default function DigiGyanPanel() {


    const router = useRouter();
    const { categoryId } = router.query;



    const {
        config, isLoggedIn, user,
        series, seriesId, setSeriesId,
        Class, setClass, classId, setClassId
    } = useApp();

    const [availableClasses, setAvailableClasses] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);

    const [activeNav, setActiveNav] = useState("books");
    const [filterSubject, setFilterSubject] = useState("All Subjects");
    const [search, setSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);

    // Controls the Mobile Sidebar
    const [isSidebarOpen, setSidebarOpen] = useState(false);



    useEffect(() => {
        const timer = setTimeout(() => setIsTimeout(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!router.isReady) return;

        console.log("cat", categoryId);

        // If a categoryId is in the URL and differs from context, update it & wait for re-render
        if (categoryId && String(categoryId) !== String(seriesId)) {
            setSeriesId(categoryId);
            return;
        }

        if (!seriesId || !config?.PR_TOKEN) return;

        const fetchClasses = async () => {
            setLoading(true);
            try {
                const classRes = await fetch('https://apis.tlmate.com/content-api/classes-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_CATEGORY_ID: seriesId,
                            PR_TOKEN: config.PR_TOKEN,
                            PR_APP_KEY: config.PR_APP_KEY
                        }
                    })
                });
                const classResult = await classRes.json();

                if (classResult.STATUS === "SUCCESS" && classResult.DATA?.length > 0) {
                    setAvailableClasses(classResult.DATA);

                    const isValidClass = classResult.DATA.some(c => c.PR_CLASS_ID === classId);
                    if (!classId || !isValidClass) {
                        const firstClass = classResult.DATA[0];
                        setClass(firstClass.PR_NAME);
                        setClassId(firstClass.PR_CLASS_ID);
                    }
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };

        fetchClasses();
    }, [seriesId, config, categoryId, router.isReady]);

    useEffect(() => {
        if (!seriesId || !classId || !config?.PR_TOKEN) return;

        const loadBooks = async () => {
            setLoading(true);
            setIsTimeout(false);
            const networkTimer = setTimeout(() => setIsTimeout(true), 10000);

            try {
                const res = await fetch('https://apis.tlmate.com/content-api/books-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_CLASS_ID: classId,
                            PR_CATEGORY_ID: seriesId,
                            PR_TOKEN: config.PR_TOKEN,
                            PR_APP_KEY: config.PR_APP_KEY
                        }
                    })
                });
                const result = await res.json();

                if (result.STATUS === "SUCCESS") {
                    setBooks(result.DATA || []);
                }
            } catch (error) {
                console.error("Network error while fetching books:", error);
            } finally {
                clearTimeout(networkTimer);
                setLoading(false);
            }
        };

        loadBooks();
    }, [seriesId, classId, config]);

    const handleClassChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const selectedClassObject = availableClasses.find(c => c.PR_CLASS_ID === selectedId);

        if (selectedClassObject) {
            setClassId(selectedClassObject.PR_CLASS_ID);
            setClass(selectedClassObject.PR_NAME);
        }
    };

    const uniqueSubjects = ["All Subjects", ...new Set(books.map(b => b.PR_CATEGORY?.PR_NAME).filter(Boolean))];

    const filtered = books.filter(b => {
        const bookSubj = b.PR_CATEGORY?.PR_NAME || "";
        return (
            (filterSubject === "All Subjects" || bookSubj === filterSubject) &&
            (search === "" || (b.PR_NAME || "").toLowerCase().includes(search.toLowerCase()))
        );
    });

    if (isTimeout && !seriesId) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif", padding: 20 }}>
                <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
                <div className="floating" style={{ fontSize: 90, marginBottom: 20 }}>🤔</div>
                <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 32, margin: "0 0 10px 0", textAlign: "center" }}>Whoops! Where are we?</h2>
                <button onClick={() => router.back()} style={{ marginTop: 30, background: "#FFD93D", border: "5px solid white", padding: "15px 35px", borderRadius: 50, fontSize: 18, fontWeight: 900, cursor: "pointer" }}>⬅️ Go Back</button>
            </div>
        );
    }

    if (isTimeout && loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif", padding: 20 }}>
                <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
                <div className="floating" style={{ fontSize: 90, marginBottom: 20 }}>🐌</div>
                <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 32, margin: "0 0 10px 0" }}>Taking a bit long...</h2>
                <button onClick={() => window.location.reload()} style={{ marginTop: 30, background: "#6C5CE7", border: "5px solid white", padding: "15px 35px", borderRadius: 50, fontSize: 18, fontWeight: 900, color: "white", cursor: "pointer" }}>🔄 Refresh Page</button>
            </div>
        );
    }

    if (!seriesId || loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
                <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
                <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>📚</div>
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 24 }}>Organizing...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", color: "#2D3436" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                * { box-sizing: border-box; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

                /* ANIMATED SIDEBAR */
                .sidebar { 
                    background: #6C5CE7; width: 260px; height: 100vh; position: fixed; left: 0; top: 0; z-index: 1000; 
                    display: flex; flex-direction: column; padding: 40px 25px; border-right: 8px solid white; 
                    box-shadow: 10px 0 40px rgba(108, 92, 231, 0.15);
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .nav-btn { border: 4px solid transparent; margin: 8px 0; border-radius: 25px; cursor: pointer; display: flex; align-items: center; gap: 15px; padding: 15px 20px; font-weight: 900; color: #E0DAFF; background: transparent; width: 100%; font-size: 16px; }
                .nav-btn:hover:not(.active) { background: rgba(255,255,255,0.1); transform: translateX(8px); }
                .nav-btn.active { background: white; color: #6C5CE7; transform: scale(1.05) rotate(-2deg); border: 4px solid white; box-shadow: 0 15px 25px rgba(0,0,0,0.15); }

                .main-content { margin-left: 260px; min-height: 100vh; padding-bottom: 50px; }

                /* SHARED CARD STYLES */
                .magic-card { background: white; border-radius: 40px; padding: 18px; box-shadow: 0 20px 40px rgba(108, 92, 231, 0.08); border: 6px solid white; position: relative; }
                .magic-card:hover { transform: translateY(-10px) scale(1.02) rotate(1deg); border-color: #E0DAFF; box-shadow: 0 25px 50px rgba(108, 92, 231, 0.2); }

                /* UI FRAMES */
                .image-frame { height: 200px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 4px dashed rgba(108, 92, 231, 0.2); background: #F8F9FF; display: flex; align-items: center; justify-content: center; position: relative; }
                .video-frame { height: 180px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 6px solid #2D3436; background: #000; display: flex; align-items: center; justify-content: center; position: relative; }
                .play-btn-overlay { position: absolute; font-size: 50px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5)); transition: transform 0.2s; z-index: 10; }
                .magic-card:hover .play-btn-overlay { transform: scale(1.2); }
                .quiz-frame { height: 160px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 4px solid #55EFC4; background: #E8FFF7; display: flex; align-items: center; justify-content: center; flex-direction: column; }

                .filter-select { appearance: none; border: 4px solid white; padding: 15px 30px; border-radius: 50px; background: white; font-weight: 900; color: #6C5CE7; cursor: pointer; box-shadow: 0 10px 25px rgba(108, 92, 231, 0.1); outline: none; font-size: 15px; }
                .search-container { background: white; border-radius: 50px; border: 6px solid white; box-shadow: 0 15px 35px rgba(108, 92, 231, 0.1); display: flex; align-items: center; padding: 5px 25px; flex: 1; transition: border-color 0.3s; }
                .search-input { border: none; outline: none; font-weight: 800; font-size: 16px; width: 100%; color: #2D3436; padding: 12px 0 12px 15px; }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

                .bouncy-btn { font-weight: 900; border: none; padding: 8px 16px; border-radius: 12px; cursor: pointer; transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; }
                .bouncy-btn:hover { transform: scale(1.05); }

                /* MOBILE SPECIFIC CSS */
                .mobile-header { 
                    display: none; background: #6C5CE7; padding: 15px 20px; color: white; 
                    align-items: center; justify-content: space-between; position: sticky; 
                    top: 0; z-index: 900; border-bottom: 6px solid white; 
                }
                .sidebar-backdrop {
                    display: none; position: fixed; inset: 0; background: rgba(45, 52, 54, 0.6); 
                    backdrop-filter: blur(4px); z-index: 995; opacity: 0; transition: opacity 0.3s;
                }
                .sidebar-backdrop.open { display: block; opacity: 1; }
                .mobile-close-btn { display: none; }

                @media (max-width: 1024px) { 
                    .sidebar { transform: translateX(${isSidebarOpen ? "0" : "-100%"}); border-right: none; } 
                    .main-content { margin-left: 0; } 
                    .mobile-header { display: flex; } 
                    .desktop-header-title { display: none; } 
                    .mobile-close-btn { 
                        display: flex; position: absolute; top: 20px; right: 20px; 
                        background: rgba(255,255,255,0.2); border: none; color: white; 
                        width: 40px; height: 40px; border-radius: 15px; align-items: center; 
                        justify-content: center; font-size: 20px; cursor: pointer;
                    }
                }
            `}</style>

            {/* MOBILE HEADER */}
            <div className="mobile-header">
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{ background: "#FFD93D", border: "4px solid white", width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", boxShadow: "0 5px 15px rgba(0,0,0,0.1)", color: "#2D3436" }}
                    >
                        🍔
                    </button>

                    {/* Logo & Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push('/')}>
                        <div style={{ background: "white", padding: "6px", borderRadius: "14px", display: "flex", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                            <img src="/logo.png" alt="logo" style={{ width: 26, height: 26, objectFit: "contain" }} />
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px" }}>DigiGyan</span>
                    </div>
                </div>

                {/* Right Side Avatar/Login */}
                {user ? (
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "4px solid white", cursor: "pointer", fontWeight: 900, color: "#2D3436", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                        {user.initials}
                    </div>
                ) : (
                    <button onClick={() => router.push('/login')} style={{ background: "#FFEAA7", color: "#D6A317", border: "4px solid white", padding: "8px 18px", borderRadius: "16px", fontWeight: 900, cursor: "pointer", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                        Login
                    </button>
                )}
            </div>

            {/* SIDEBAR BACKDROP (For closing on mobile) */}
            <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* SIDEBAR */}
            <div className="sidebar">
                {/* Mobile Close X Button */}
                <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>

                {/* Header Area */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    onClick={() => router.push('/')}
                    className="mb-8 flex flex-col items-center justify-center gap-4 cursor-pointer drop-shadow-2xl group w-fit mx-auto md:mx-0"
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
                        className="relative bg-white/20 p-4 rounded-[28px] border-4 border-white/30 backdrop-blur-xl group-hover:bg-white transition-all overflow-hidden"
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
                            className="w-16 h-16 object-contain relative z-20 group-hover:scale-110 transition-transform"
                        />
                    </motion.div>

                    {/* --- Typography Container --- */}
                    <div className="flex flex-col items-center text-center mt-1">
                        <span className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md leading-none">
                            DigiGyan
                        </span>
                        <span className="text-[12px] font-black text-[#FFD93D] uppercase tracking-widest mt-2 drop-shadow-md">
                            Magic Library ✨
                        </span>
                    </div>
                </motion.div>
                <nav style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-btn ${activeNav === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveNav(item.id);
                                setSidebarOpen(false); // Auto-close sidebar on mobile after clicking
                            }}
                        >
                            <span style={{ fontSize: 24 }}>{item.emoji}</span> {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* MAIN PANEL */}
            <div className="main-content">
                <header style={{ padding: "40px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "25px" }}>
                    <div className="desktop-header-title">
                        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                            {series && <span style={{ background: "#E0DAFF", color: "#6C5CE7", padding: "6px 16px", borderRadius: "50px", fontSize: 13, fontWeight: 900, border: "3px solid white" }}>📚 Series: {series.PR_NAME || series}</span>}
                            {Class && <span style={{ background: "#FFD93D", color: "#2D3436", padding: "6px 16px", borderRadius: "50px", fontSize: 13, fontWeight: 900, border: "3px solid white" }}>🏫 {Class.PR_NAME || Class}</span>}
                        </div>
                        <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, color: "#2D3436" }}>Hi, {user?.name?.split(' ')[0] || 'Friend'}! 👑</h2>
                        <p style={{ margin: "8px 0 0 0", color: "#6C5CE7", fontWeight: 800, fontSize: 18 }}>Ready to build some brilliant minds today?</p>
                    </div>

                    <div style={{ display: "flex", gap: 20, alignItems: "center", width: "100%", maxWidth: "500px" }}>
                        <select className="filter-select" value={classId || ""} onChange={handleClassChange}>
                            {availableClasses.map(c => <option key={c.PR_CLASS_ID} value={c.PR_CLASS_ID}>{c.PR_NAME}</option>)}
                        </select>
                        <div className="search-container">
                            <span style={{ fontSize: "22px" }}>🔍</span>
                            <input className="search-input" placeholder="Find magic..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>

                        {/* Desktop Avatar Profile (Hidden on Mobile) */}
                        <div className="desktop-header-title">
                            {user ? (
                                <div style={{ width: 65, height: 65, borderRadius: 22, background: "#FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: "6px solid white", cursor: "pointer" }}>{user.initials}</div>
                            ) : (
                                <button onClick={() => router.push('/login')} style={{ background: "#6C5CE7", color: "white", border: "6px solid white", padding: "12px 28px", borderRadius: "50px", fontWeight: 900, cursor: "pointer" }}>Login ✨</button>
                            )}
                        </div>
                    </div>
                </header>

                {/* DYNAMIC GRID RENDERING BASED ON ACTIVE TAB */}
                <div style={{ padding: "0 50px", display: "grid", gridTemplateColumns: activeNav === 'animations' ? "repeat(auto-fill, minmax(320px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 40 }}>
                    {filtered.length > 0 ? filtered.map(book => (
                        <div key={book.PR_ID} className="magic-card" onClick={() => setSelectedBook(book)} style={{ cursor: "pointer" }}>

                            {/* --- VIEW 1: FLIPBOOKS UI --- */}
                            {activeNav === "books" && (
                                <>
                                    <div className="image-frame">
                                        {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
                                        <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7" }}>Book</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 20, fontWeight: 900, color: "#2D3436", lineHeight: 1.2, height: "48px", overflow: "hidden" }}>{book.PR_NAME}</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <button className="bouncy-btn" style={{ background: "#F1F2F6", color: "#636E72" }} onClick={(e) => e.stopPropagation()}>View 👀</button>
                                        <button className="bouncy-btn" style={{ background: "#E0DAFF", color: "#6C5CE7" }} onClick={(e) => e.stopPropagation()}>Download ⬇️</button>
                                    </div>
                                </>
                            )}

                            {/* --- VIEW 2: ANIMATIONS UI --- */}
                            {activeNav === "animations" && (
                                <Link href={`/subjects/video?bookid=${book.PR_ID}`} >
                                    <div className="video-frame">
                                        {book.PR_URL && <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />}
                                        <div className="play-btn-overlay">▶️</div>
                                        <span style={{ position: "absolute", top: 10, left: 10, background: "#FF6B6B", padding: "4px 10px", borderRadius: 10, fontSize: 10, fontWeight: 900, color: "white" }}>HD Video</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} - Toon</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <button className="bouncy-btn" style={{ background: "#FF6B6B", color: "white" }} onClick={(e) => e.stopPropagation()}>Watch Now 🍿</button>
                                    </div>
                                </Link>
                            )}

                            {/* --- VIEW 3: TESTS UI --- */}
                            {activeNav === "tests" && (
                                <>
                                    <div className="quiz-frame">
                                        <span className="floating" style={{ fontSize: 50, marginBottom: 5 }}>🏆</span>
                                        <span style={{ fontWeight: 900, color: "#00B894", fontSize: 14 }}>10 Questions</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} Quiz</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <button className="bouncy-btn" style={{ background: "#00B894", color: "white" }} onClick={(e) => e.stopPropagation()}>Start Mission ⏱️</button>
                                    </div>
                                </>
                            )}

                        </div>
                    )) : (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "white", borderRadius: "40px", border: "4px dashed #E0DAFF" }}>
                            <div className="floating" style={{ fontSize: 60, marginBottom: 15 }}>🧐</div>
                            <h2 style={{ fontWeight: 900, color: "#2D3436" }}>No magic found!</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

const CategoriesPage = () => {
    const router = useRouter();
    const { config, setSeries, setSeriesId } = useApp();
    const [covers, setCovers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const { PR_APP_KEY, PR_TOKEN } = config || {};

    // --- Data Fetching ---
    useEffect(() => {
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
                    const catsWithImages = await Promise.all(catData.DATA.map(async (cat) => {
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
                setLoading(false);
            }
        };
        fetchCoversAndBooks();
    }, [PR_APP_KEY, PR_TOKEN]);

    // --- Search Logic ---
    const filteredCovers = useMemo(() => {
        return covers.filter(cat =>
            cat.PR_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, covers]);

    const handleSeriesSelect = (cat) => {
        setSeries(cat); // Saving the whole object or name
        setSeriesId(cat.PR_CATEGORY_ID);
        router.push(`/category/books?categoryId=${cat.PR_CATEGORY_ID}`); // Assuming this routes to your DigiGyanPanel
    };

    // Changed to raw Hex codes for easier inline styling with the chunky borders
    const cardStyles = [
        { bg: '#FF7675', emoji: '🎨' },
        { bg: '#55EFC4', emoji: '🧪' },
        { bg: '#FFD93D', emoji: '🔢' },
        { bg: '#A29BFE', emoji: '🌍' },
        { bg: '#FAB1A0', emoji: '📖' },
        { bg: '#74B9FF', emoji: '💻' },
    ];

    return (
        <div className="app-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                body { margin: 0; background: #F0F4FF; }

                .app-container {
                    font-family: 'Nunito', sans-serif;
                    min-height: 100vh;
                    background: #F0F4FF;
                    color: #2D3436;
                    display: flex;
                    flex-direction: column;
                }

                /* CHUNKY NAVBAR */
                .navbar {
                    background: #6C5CE7;
                    padding: 20px 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 8px solid white;
                    flex-wrap: wrap;
                    gap: 20px;
                    box-shadow: 0 15px 30px rgba(108, 92, 231, 0.15);
                }

                .logo-btn {
                    background: #FFD93D;
                    border: 4px solid white;
                    width: 55px;
                    height: 55px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    cursor: pointer;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .logo-btn:hover { transform: scale(1.1) rotate(-10deg); }

                /* SEARCH PILL */
                .search-container {
                    background: white; border-radius: 50px; border: 6px solid white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center;
                    padding: 8px 25px; width: 100%; max-width: 450px; transition: border-color 0.3s;
                }
                .search-container:focus-within { border-color: #FFD93D; transform: scale(1.02); }
                .search-input { 
                    border: none; outline: none; font-weight: 800; font-size: 16px; 
                    width: 100%; color: #2D3436; padding: 10px 0 10px 15px; 
                }

                /* EXTREME STICKER CARDS */
                .series-card {
                    border-radius: 45px;
                    padding: 20px;
                    border: 6px solid white;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                    transform-origin: center;
                }

                .image-frame {
                    background: rgba(255,255,255,0.25);
                    border: 4px dashed rgba(255,255,255,0.5);
                    border-radius: 25px;
                    aspect-ratio: 4/5;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    margin-bottom: 15px;
                }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

                @media (max-width: 768px) {
                    .navbar { padding: 15px 20px; flex-direction: column; align-items: stretch; border-bottom-width: 6px; }
                    .search-container { max-width: 100%; }
                }
            `}</style>

            {/* --- CHUNKY NAVBAR --- */}
            <nav className="navbar">
                {/* Header Area */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    onClick={() => router.push('/')}
                    // Removed mb-8, reduced gap from 5 to 3
                    className="flex items-center justify-center md:justify-start gap-3 cursor-pointer drop-shadow-2xl group w-fit mx-auto md:mx-0"
                >
                    {/* --- Glassmorphism Logo Container with Highlight --- */}
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 0px 0px rgba(255,255,255,0.4)",
                                "0 0 15px 8px rgba(255,255,255,0.2)",
                                "0 0 0px 0px rgba(255,255,255,0.4)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        // Reduced padding, border thickness, and border-radius
                        className="relative bg-white/20 p-2 rounded-[18px] border-[3px] border-white/30 backdrop-blur-xl group-hover:bg-white transition-all overflow-hidden"
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
                            // Reduced image size from w-12/h-12 to w-8/h-8
                            className="w-8 h-8 object-contain relative z-20 group-hover:scale-110 transition-transform"
                        />
                    </motion.div>

                    {/* --- Typography Container --- */}
                    <div className="flex flex-col">
                        {/* Reduced text size from 4xl/5xl to 2xl/3xl */}
                        <span className="text-2xl md:text-3xl font-black text-white italic tracking-tighter drop-shadow-md leading-none">
                            DigiGyan
                        </span>
                        {/* Reduced subtitle text size and margin */}
                        <span className="text-[9px] font-black text-[#FFD93D] uppercase tracking-widest mt-0.5 drop-shadow-md">
                            Magic in your Hands ✨
                        </span>
                    </div>
                </motion.div>

                <div className="search-container">
                    <span style={{ fontSize: "18px" }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search series..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "50px 30px", width: "100%" }}>
                <header style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: 40, fontWeight: 900, color: "#2D3436", margin: "0 0 5px 0", letterSpacing: "-1px" }}>
                        Explore All Series <span className="floating" style={{ display: "inline-block" }}>✨</span>
                    </h2>
                    <p style={{ color: "#6C5CE7", fontWeight: 800, fontSize: 18, margin: 0 }}>Pick a topic and start your journey!</p>
                </header>

                {/* LOADING STATE */}
                {loading ? (
                    <div style={{ padding: "80px 20px", textAlign: "center" }}>
                        <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>🛸</div>
                        <Loader2 className="animate-spin text-indigo-500 mb-4 mx-auto" size={40} />
                        <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 24 }}>Unlocking the library...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "35px" }}
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredCovers.map((cat, i) => {
                                const style = cardStyles[i % cardStyles.length];
                                return (
                                    <motion.div
                                        key={cat.PR_CATEGORY_ID}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        whileHover={{ y: -15, scale: 1.05, rotate: (i % 2 === 0 ? 2 : -2) }}
                                        onClick={() => handleSeriesSelect(cat)}
                                        className="series-card"
                                        style={{ backgroundColor: style.bg }}
                                    >
                                        {/* Background Emoji Watermark */}
                                        <span style={{ position: "absolute", top: -10, right: -10, fontSize: 80, opacity: 0.2, filter: "blur(2px)", pointerEvents: "none" }}>
                                            {style.emoji}
                                        </span>

                                        {/* Image Frame */}
                                        <div className="image-frame">
                                            {cat.firstBookImg ? (
                                                <img
                                                    src={cat.firstBookImg}
                                                    alt={cat.PR_NAME}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }}
                                                />
                                            ) : cat.PR_ICON ? (
                                                /* Added PR_ICON fallback here */
                                                <img
                                                    src={cat.PR_ICON}
                                                    alt={cat.PR_NAME}
                                                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "20px", padding: "10px" }}
                                                />
                                            ) : (
                                                <span className="floating" style={{ fontSize: 60, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))" }}>
                                                    {style.emoji}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title Badge */}
                                        <div style={{ textAlign: "center", background: "white", padding: "10px 15px", borderRadius: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>
                                                {cat.PR_NAME}
                                            </h3>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* EMPTY STATE */}
                {!loading && filteredCovers.length === 0 && (
                    <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "50px", border: "6px dashed #E0DAFF", marginTop: "20px" }}>
                        <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>🧐</div>
                        <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 32, margin: "0 0 10px 0" }}>No magic found!</h2>
                        <p style={{ color: "#6C5CE7", fontWeight: 800, fontSize: 18 }}>We couldn't find any series matching "{searchTerm}".</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoriesPage;
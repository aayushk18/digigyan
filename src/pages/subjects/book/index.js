import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

const BookDetail = () => {
    const router = useRouter();
    const { bookid } = router.query;


    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(true);


    const { config, isLoggedIn } = useApp();


    useEffect(() => {
        if (!router.isReady) return;

        // If explicitly logged out, bounce them to login immediately
        if (isLoggedIn === false) {
            router.replace('/login');
            return; // Stop execution
        }
    }, [router.isReady, isLoggedIn]);


    // 3. Your existing fetch logic
    useEffect(() => {
        // Wait until we are sure they are logged in and we have a bookid
        if (!router.isReady || !bookid || isLoggedIn === false) return;

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
                if (result.STATUS === "SUCCESS") {
                    setBookData(result.DATA);
                }
            } catch (error) {
                console.error("Error fetching book content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookContent();
    }, [router.isReady, bookid, config, isLoggedIn]);


    useEffect(() => {
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
                if (result.STATUS === "SUCCESS") {
                    setBookData(result.DATA);
                }
            } catch (error) {
                console.error("Error fetching book content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookContent();
    }, [router.isReady, bookid, config]);

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
                <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
                <div className="floating" style={{ fontSize: 60, marginBottom: 15 }}>🛸</div>
                <Loader2 className="animate-spin text-indigo-500 mb-3" size={28} />
                <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 18 }}>Beaming up your book...</p>
            </div>
        );
    }

    if (!bookData) return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
            <div style={{ fontSize: 60, marginBottom: 15 }}>🕵️‍♂️</div>
            <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 22 }}>Book not found!</h2>
        </div>
    );

    const actionButtons = [
        { id: 'video', label: 'Watch Video', emoji: '🎬', themeColor: '#FF6B6B', url: bookData.PR_VIDEO_DATA?.length > 0 ? `/subjects/video?bookid=${bookid}` : null },
        { id: 'flipbook', label: 'Flipbook', emoji: '📖', themeColor: '#4D96FF', url: bookData.PR_EBOOK_URL },
        { id: 'evaluate', label: 'Self Evaluate', emoji: '📝', themeColor: '#6BCB77', url: bookData.PR_ACTIVITY_URL },
        { id: 'tg', label: 'Test Generator', emoji: '🎯', themeColor: '#A78BFA', url: bookData.PR_TG_URL },
    ];

    return (
        <div className="app-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                
                body { margin: 0; overflow-x: hidden; }

                .app-container {
                    font-family: 'Nunito', sans-serif; 
                    height: 100vh; 
                    background: #F0F4FF;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* COMPACT HEADER */
                .header-bar {
                    background: #6C5CE7; padding: 10px 20px; display: flex; alignItems: center; gap: 15px; 
                    border-bottom: 4px solid white; flex-shrink: 0; height: 65px;
                }

                .back-btn {
                    background: #FFD93D; border: 3px solid white; width: 40px; height: 40px; 
                    border-radius: 14px; cursor: pointer; color: #2D3436; font-size: 18px; 
                    font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
                    display: flex; align-items: center; justify-content: center; transition: transform 0.2s;
                }
                .back-btn:hover { transform: scale(1.1) rotate(-5deg); }

                /* SINGLE SCREEN WRAPPER */
                .main-wrapper {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    padding: 15px; overflow: hidden;
                }

                .detail-card { 
                    background: white; border-radius: 40px; overflow: hidden;
                    box-shadow: 0 15px 35px rgba(108, 92, 231, 0.15); 
                    border: 6px solid white; display: flex; flex-direction: row;
                    width: 100%; max-width: 1000px; height: 100%; max-height: 600px; /* Slightly taller for 2x2 grid */
                }

                /* CHUNKY ASIDE - SCROLLABLE IF NEEDED */
                .book-aside {
                    background: #F8F9FF; padding: 25px 20px; border-radius: 30px;
                    margin: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    text-align: center; border: 4px dashed #E0DAFF; flex: 0 0 280px; overflow-y: auto;
                }

                .image-frame {
                    width: 100%; max-width: 160px; aspect-ratio: 3/4; border-radius: 20px; overflow: hidden; 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-bottom: 20px;
                    border: 4px solid white; background: white; flex-shrink: 0;
                }

                /* RIGHT ACTIONS PANEL */
                .right-panel {
                    flex: 1; padding: 20px 30px; display: flex; flex-direction: column; justify-content: center;
                    overflow-y: auto;
                }

                /* STRICT 2x2 GRID FOR ALL VIEWS */
                .resource-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;
                }

                .resource-btn {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 20px 10px; border-radius: 25px; border: 4px solid; cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    font-weight: 900; background: white; position: relative; font-size: 14px;
                    box-shadow: 0 8px 15px rgba(0,0,0,0.05); text-align: center;
                }
                .resource-btn:not(:disabled):hover { transform: translateY(-6px) scale(1.03) rotate(1deg); }
                .resource-btn:disabled { opacity: 0.6; cursor: not-allowed; border-color: #E0DAFF !important; background: #F8F9FF !important; filter: grayscale(0.5); }

                .badge-soon {
                    position: absolute; top: -8px; right: -8px; background: #FFD93D; color: #2D3436;
                    padding: 4px 10px; border-radius: 20px; font-weight: 900; font-size: 10px;
                    border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transform: rotate(10deg);
                }

                .info-box {
                    margin-top: 20px; padding: 15px 20px; background: #FFF9E6; border-radius: 25px; 
                    border: 3px dashed #FFD93D; display: flex; gap: 15px; align-items: center;
                }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

                /* CUSTOM SCROLLBAR */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E0DAFF; border-radius: 10px; }

                /* MOBILE OPTIMIZATION */
                @media (max-width: 850px) {
                    .app-container { height: auto; min-height: 100vh; overflow-y: auto; }
                    .main-wrapper { height: auto; padding: 15px; display: block; overflow: visible; }
                    .detail-card { flex-direction: column; max-height: none; height: auto; border-radius: 35px; border-width: 4px; }
                    .book-aside { flex: none; margin: 10px; padding: 25px 20px; }
                    .image-frame { max-width: 140px; margin-bottom: 15px; }
                    .right-panel { padding: 15px 20px 30px 20px; }
                    .resource-grid { gap: 12px; } /* Retains 2x2 grid, just tighter gaps */
                    .info-box { flex-direction: column; text-align: center; gap: 10px; padding: 15px; margin-top: 25px; }
                }
            `}</style>

            {/* HEADER */}
            <div className="header-bar">
                <button onClick={() => router.back()} className="back-btn">⬅️</button>
                <h1 style={{ color: "white", fontSize: 20, fontWeight: 900, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Book Details ✨
                </h1>
            </div>

            {/* SINGLE SCREEN MAIN CONTENT */}
            <main className="main-wrapper">
                <div className="detail-card">

                    {/* LEFT: BOOK INFO */}
                    <div className="book-aside">
                        <div className="image-frame">
                            <img src={bookData.PR_ICON} alt={bookData.PR_NAME} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ background: "#FFD93D", color: "#2D3436", padding: "6px 16px", borderRadius: "50px", fontSize: 12, fontWeight: 900, marginBottom: 12, border: "2px solid white", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}>
                            {bookData.PR_CLASS?.PR_NAME}
                        </span>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2D3436", margin: "0 0 5px 0", lineHeight: 1.2 }}>
                            {bookData.PR_NAME}
                        </h2>
                        <p style={{ color: "#6C5CE7", fontWeight: 800, margin: 0, fontSize: 14 }}>{bookData.PR_CATEGORY?.PR_NAME}</p>
                    </div>

                    {/* RIGHT: ACTIONS DASHBOARD */}
                    <div className="right-panel">
                        <div style={{ marginBottom: 25 }}>
                            <h3 style={{ fontSize: 26, fontWeight: 900, color: "#2D3436", margin: "0 0 5px 0" }}>Learning Resources 🚀</h3>
                            <p style={{ color: "#636E72", fontWeight: 700, fontSize: 14, margin: 0 }}>Choose your adventure and start learning!</p>
                        </div>

                        {/* STRICT 2x2 GRID */}
                        <div className="resource-grid">
                            {actionButtons.map((btn) => (
                                <button
                                    key={btn.id}
                                    disabled={!btn.url}
                                    onClick={() => {
                                        if (!btn.url) return;
                                        if (btn.url.startsWith('/')) router.push(btn.url);
                                        else window.open(btn.url, '_blank');
                                    }}
                                    className="resource-btn"
                                    style={{ borderColor: btn.url ? btn.themeColor : '#E0DAFF', color: btn.url ? btn.themeColor : '#A29BFE' }}
                                    onMouseOver={(e) => {
                                        if (btn.url) {
                                            e.currentTarget.style.boxShadow = `0 10px 20px ${btn.themeColor}40`;
                                            e.currentTarget.style.background = btn.themeColor;
                                            e.currentTarget.style.color = "white";
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (btn.url) {
                                            e.currentTarget.style.boxShadow = `0 8px 15px rgba(0,0,0,0.05)`;
                                            e.currentTarget.style.background = "white";
                                            e.currentTarget.style.color = btn.themeColor;
                                        }
                                    }}
                                >
                                    <div style={{ fontSize: 36, marginBottom: 10 }} className={btn.url ? "floating" : ""}>
                                        {btn.emoji}
                                    </div>
                                    <span>{btn.label}</span>

                                    {!btn.url && <div className="badge-soon">SOON ⏳</div>}
                                </button>
                            ))}
                        </div>

                        {/* INFO BOX */}
                        <div className="info-box">
                            <span className="floating" style={{ fontSize: 30, filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.1))", flexShrink: 0 }}>💡</span>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#B89200", lineHeight: 1.5 }}>
                                Resources update regularly! If a button is grayed out, our wizards are busy adding magic. Check back soon!
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default BookDetail;
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '@/context/AppContext';
import {
    ArrowLeft,
    PlayCircle,
    BookOpen,
    ClipboardCheck,
    FilePlus,
    Loader2,
    Info
} from 'lucide-react';

const BookDetail = () => {
    const router = useRouter();
    const { bookid } = router.query;
    const { config } = useApp(); // Using context for tokens

    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
                <p className="font-medium">Loading book contents...</p>
            </div>
        );
    }

    if (!bookData) return <div className="p-10 text-center">Book not found.</div>;

    const actionButtons = [
        { id: 'video', label: 'Watch Video', icon: <PlayCircle size={24} />, color: 'bg-red-50 text-red-600 hover:bg-red-600', url: bookData.PR_VIDEO_DATA?.length > 0 ? `/subjects/video?bookid=${bookid}` : null },
        { id: 'flipbook', label: 'Flipbook', icon: <BookOpen size={24} />, color: 'bg-blue-50 text-blue-600 hover:bg-blue-600', url: bookData.PR_EBOOK_URL },
        { id: 'evaluate', label: 'Self Evaluate', icon: <ClipboardCheck size={24} />, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600', url: bookData.PR_ACTIVITY_URL },
        { id: 'tg', label: 'Test Generator', icon: <FilePlus size={24} />, color: 'bg-purple-50 text-purple-600 hover:bg-purple-600', url: bookData.PR_TG_URL },
    ];

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF" }}>
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
    
    .detail-card { 
      background: white; border-radius: 45px; overflow: hidden;
      box-shadow: 0 20px 40px rgba(108, 92, 231, 0.1); 
      border: 6px solid white; display: flex; flex-direction: column;
    }

    @media (min-width: 768px) { .detail-card { flex-direction: row; } }

    .book-aside {
      background: #F8F9FF; padding: 40px; border-radius: 40px;
      margin: 15px; display: flex; flex-direction: column; align-items: center;
      text-align: center; border: 2px solid #E0DAFF;
    }

    .resource-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 30px 20px; border-radius: 30px; border: none; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight: 900;
      box-shadow: 0 8px 15px rgba(0,0,0,0.05); position: relative;
    }

    .resource-btn:not(:disabled):hover { 
      transform: translateY(-8px) scale(1.02); 
      box-shadow: 0 15px 25px rgba(108, 92, 231, 0.2);
    }

    .resource-btn:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }

    .floating { animation: floating 3s ease-in-out infinite; }
    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  `}</style>

            {/* STICKY HEADER */}
            <div style={{ background: "#6C5CE7", padding: "15px 30px", display: "flex", alignItems: "center", gap: "20px", position: "sticky", top: 0, zIndex: 100 }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", width: 45, height: 45, borderRadius: "15px", cursor: "pointer", color: "white", fontSize: 20 }}
                >
                    ⬅️
                </button>
                <h1 style={{ color: "white", fontSize: 22, fontWeight: 900, margin: 0 }}>Book Details 📔</h1>
            </div>

            <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
                <div className="detail-card">

                    {/* LEFT: BOOK INFO */}
                    <div className="book-aside" style={{ flex: "0 0 350px" }}>
                        <div style={{ width: "100%", borderRadius: "25px", overflow: "hidden", boxShadow: "0 15px 30px rgba(0,0,0,0.1)", marginBottom: 25 }}>
                            <img
                                src={bookData.PR_ICON}
                                alt={bookData.PR_NAME}
                                style={{ width: "100%", display: "block", objectFit: "cover" }}
                            />
                        </div>

                        <span style={{ background: "#FFD93D", color: "#2D3436", padding: "5px 15px", borderRadius: "50px", fontSize: 12, fontWeight: 900, marginBottom: 10 }}>
                            {bookData.PR_CLASS?.PR_NAME}
                        </span>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2D3436", margin: "0 0 5px 0", lineHeight: 1.2 }}>
                            {bookData.PR_NAME}
                        </h2>
                        <p style={{ color: "#6C5CE7", fontWeight: 700, margin: 0 }}>{bookData.PR_CATEGORY?.PR_NAME}</p>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div style={{ flex: 1, padding: "40px" }}>
                        <div style={{ marginBottom: 35 }}>
                            <h3 style={{ fontSize: 28, fontWeight: 900, color: "#2D3436", margin: "0 0 10px 0" }}>Learning Resources ✨</h3>
                            <p style={{ color: "#636E72", fontWeight: 700 }}>Choose your adventure and start learning!</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px" }}>
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
                                    style={{
                                        background: btn.url ? "white" : "#F1F2F6",
                                        border: btn.url ? `3px solid ${btn.color || '#E0DAFF'}` : "3px solid #E0DAFF",
                                        color: "#2D3436"
                                    }}
                                >
                                    <div style={{ fontSize: 40, marginBottom: 12 }} className={btn.url ? "floating" : ""}>
                                        {btn.icon || '📖'}
                                    </div>
                                    <span style={{ fontSize: 14 }}>{btn.label}</span>

                                    {!btn.url && (
                                        <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, background: "#E0DAFF", padding: "2px 8px", borderRadius: "8px", fontWeight: 900 }}>
                                            SOON
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* INFO BOX */}
                        <div style={{ marginTop: 40, padding: 25, background: "#FFF9E6", borderRadius: "30px", border: "3px dashed #FFD93D", display: "flex", gap: 15, alignItems: "start" }}>
                            <span style={{ fontSize: 24 }}>💡</span>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#947600", lineHeight: 1.6 }}>
                                Resources are updated regularly! If a button is grayed out, our team is busy adding magic to that section. Check back soon!
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default BookDetail;
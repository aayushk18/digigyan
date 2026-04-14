import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Loader2, PlayCircle, Clock, Video } from 'lucide-react';

const VideoPlayerPage = () => {
    const router = useRouter();
    const { bookid } = router.query;
    const { config } = useApp();

    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

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
                if (result.STATUS === "SUCCESS" && result.DATA) {
                    setBookData(result.DATA);
                    // Automatically set the first video as active if available
                    if (result.DATA.PR_VIDEO_DATA && result.DATA.PR_VIDEO_DATA.length > 0) {
                        setActiveVideo(result.DATA.PR_VIDEO_DATA[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching video content:", error);
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
                <p className="font-medium">Loading premium media content...</p>
            </div>
        );
    }

    if (!bookData || !bookData.PR_VIDEO_DATA?.length) {
        return (
            <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", padding: "40px 20px" }}>
                <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
    
    .empty-card { 
      background: white; border-radius: 45px; padding: 60px 40px;
      box-shadow: 0 20px 40px rgba(108, 92, 231, 0.08); 
      border: 4px dashed #E0DAFF; text-align: center;
      max-width: 600px; margin: 0 auto;
    }

    .back-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: #6C5CE7; color: white; border: none;
      padding: 12px 25px; border-radius: 20px; font-weight: 900;
      cursor: pointer; transition: all 0.3s; margin-bottom: 30px;
      box-shadow: 0 8px 15px rgba(108, 92, 231, 0.3);
    }

    .back-btn:hover { transform: translateX(-5px); background: #5649c0; }

    .floating { animation: floating 3s ease-in-out infinite; }
    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
  `}</style>

                <div style={{ maxWidth: "800px", mx: "auto" }}>
                    {/* BACK BUTTON */}
                    <button onClick={() => router.back()} className="back-btn">
                        <span>⬅️</span> Go Back
                    </button>

                    {/* EMPTY STATE CONTAINER */}
                    <div className="empty-card">
                        <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>
                            🎥✨
                        </div>

                        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#2D3436", margin: "0 0 15px 0" }}>
                            Quiet on the Set! 🎬
                        </h2>

                        <p style={{ fontSize: 18, color: "#636E72", fontWeight: 700, lineHeight: 1.6, margin: "0 auto 30px auto", maxWidth: "450px" }}>
                            It looks like our video editors are still adding magic to
                            <span style={{ color: "#6C5CE7" }}> "{bookData?.PR_NAME || "this book"}"</span>.
                        </p>

                        <div style={{ background: "#F8F9FF", padding: "20px", borderRadius: "25px", border: "2px solid #E0DAFF" }}>
                            <p style={{ margin: 0, fontWeight: 800, color: "#6C5CE7" }}>
                                Don't worry! You can still explore the 📖 Flipbooks and other resources in the meantime!
                            </p>
                        </div>

                        <button
                            onClick={() => router.back()}
                            style={{
                                marginTop: 30, background: "transparent", border: "none",
                                color: "#A29BFE", fontWeight: 900, cursor: "pointer", fontSize: 16
                            }}
                        >
                            Click here to try another book 🚀
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to extract YouTube ID if it is a tube link
    const extractYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
        }
        if (url.includes('youtu.be/')) {
            return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
        }
        return url; // return as is if not matching perfectly, though iframe might fail
    };

    const isYouTube = activeVideo?.PR_URL?.includes('youtube.com') || activeVideo?.PR_URL?.includes('youtu.be');

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", paddingBottom: "80px" }}>
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');

    .video-frame {
      background: #000; border-radius: 40px; overflow: hidden;
      border: 6px solid white; box-shadow: 0 25px 50px rgba(108, 92, 231, 0.15);
      position: relative; aspect-ratio: 16/9;
    }

    .playlist-card {
      background: white; border-radius: 40px; padding: 35px;
      border: 4px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.03);
    }

    .video-item {
      text-align: left; display: flex; flex-direction: column; padding: 15px;
      border-radius: 30px; border: 3px solid transparent; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: #F8F9FF;
    }

    .video-item.active {
      background: #E0DAFF; border-color: #6C5CE7; transform: scale(1.03);
    }

    .video-item:hover:not(.active) {
      transform: translateY(-5px); border-color: #6C5CE733; background: white;
    }

    .thumb-container {
      width: 100%; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden;
      margin-bottom: 12px; position: relative; background: #2D3436;
    }

    .status-pill {
      font-size: 10px; font-weight: 900; text-transform: uppercase;
      padding: 4px 10px; border-radius: 50px; display: inline-flex;
      align-items: center; gap: 5px; margin-top: 10px;
    }

    .floating { animation: floating 3s ease-in-out infinite; }
    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  `}</style>

            {/* HEADER */}
            <div style={{ background: "#6C5CE7", padding: "15px 30px", display: "flex", alignItems: "center", gap: "20px", position: "sticky", top: 0, zIndex: 100 }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", width: 45, height: 45, borderRadius: "15px", cursor: "pointer", color: "white", fontSize: 20 }}
                >
                    ⬅️
                </button>
                <div style={{ overflow: "hidden" }}>
                    <h1 style={{ color: "white", fontSize: 18, fontWeight: 900, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {bookData.PR_NAME}
                    </h1>
                    <p style={{ color: "#E0DAFF", fontSize: 11, fontWeight: 700, margin: 0 }}>
                        {bookData.PR_CATEGORY?.PR_NAME} • {bookData.PR_CLASS?.PR_NAME}
                    </p>
                </div>
            </div>

            <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>

                {/* CINEMA PLAYER SECTION */}
                {activeVideo && (
                    <section style={{ marginBottom: "50px" }}>
                        <div className="video-frame">
                            {isYouTube ? (
                                <iframe
                                    src={extractYoutubeEmbedUrl(activeVideo.PR_URL)}
                                    style={{ width: "100%", height: "100%", border: "none" }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={activeVideo.PR_URL}
                                    controls
                                    autoPlay
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: 20, padding: "0 10px" }}>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2D3436", margin: 0 }}>
                                🚀 Now Watching: {activeVideo.PR_NAME || "Resource Video"}
                            </h2>
                        </div>
                    </section>
                )}

                {/* PLAYLIST SECTION */}
                <section className="playlist-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                        <div>
                            <h3 style={{ fontSize: 26, fontWeight: 900, color: "#2D3436", margin: 0 }}>Available Episodes 🎬</h3>
                            <p style={{ color: "#636E72", fontWeight: 700, margin: "5px 0 0 0" }}>Pick a part and start learning!</p>
                        </div>
                        <div style={{ background: "#6C5CE7", color: "white", padding: "8px 20px", borderRadius: "50px", fontWeight: 900, fontSize: 14 }}>
                            {bookData.PR_VIDEO_DATA.length} Parts
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" }}>
                        {bookData.PR_VIDEO_DATA.map((video, idx) => {
                            const isPlaying = activeVideo?.PR_ID === video.PR_ID || activeVideo === video;

                            return (
                                <button
                                    key={video.PR_ID || idx}
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setActiveVideo(video);
                                    }}
                                    className={`video-item ${isPlaying ? 'active' : ''}`}
                                >
                                    <div className="thumb-container">
                                        <img
                                            src={video.PR_THUMBNAIL_URL || bookData.PR_ICON}
                                            alt="thumbnail"
                                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                                        />
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                                            <span style={{ fontSize: 40 }} className={isPlaying ? "floating" : ""}>
                                                {isPlaying ? "⏺️" : "▶️"}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: 14, fontWeight: 900, margin: 0, color: isPlaying ? "#6C5CE7" : "#2D3436", lineHeight: 1.3 }}>
                                        {video.PR_NAME || `Part ${idx + 1}`}
                                    </h4>

                                    <div className="status-pill" style={{
                                        background: isPlaying ? "#6C5CE7" : "#FFEAA7",
                                        color: isPlaying ? "white" : "#D6A317"
                                    }}>
                                        {isPlaying ? "⚡ Playing" : "📂 Episode"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VideoPlayerPage;

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';
import { motion } from "framer-motion";

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

                console.log(result);


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

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
                <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
                <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>🎬</div>
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 24 }}>Setting up the projector...</p>
            </div>
        );
    }

    // --- EMPTY STATE ---
    if (!bookData || !bookData.PR_VIDEO_DATA?.length) {
        return (
            <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                    .floating { animation: floating 3s ease-in-out infinite; }
                    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                `}</style>
                <button
                    onClick={() => router.back()}
                    style={{ alignSelf: "flex-start", background: "#FFD93D", border: "4px solid white", color: "#2D3436", padding: "10px 25px", borderRadius: "20px", fontWeight: 900, fontSize: 18, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", marginBottom: 40, transition: "transform 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.05) rotate(-2deg)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    ⬅️ Go Back
                </button>
                <div style={{ background: "white", borderRadius: "50px", padding: "60px 40px", border: "6px dashed #E0DAFF", textAlign: "center", maxWidth: "600px", boxShadow: "0 20px 40px rgba(108, 92, 231, 0.08)" }}>
                    <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>🎥✨</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: "#2D3436", margin: "0 0 15px 0" }}>Quiet on the Set! 🎬</h2>
                    <p style={{ fontSize: 18, color: "#636E72", fontWeight: 700, lineHeight: 1.6, margin: "0 auto 30px auto" }}>
                        It looks like our video editors are still adding magic to <span style={{ color: "#6C5CE7" }}>"{bookData?.PR_NAME || "this book"}"</span>.
                    </p>
                    <div style={{ background: "#F8F9FF", padding: "20px", borderRadius: "25px", border: "3px solid #E0DAFF" }}>
                        <p style={{ margin: 0, fontWeight: 800, color: "#6C5CE7" }}>Don't worry! You can still explore the 📖 Flipbooks and other resources.</p>
                    </div>
                </div>
            </div>
        );
    }

    const extractYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
        if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
        return url;
    };



    const handleDownload = async (url, title) => {
        try {

            console.log(url, title);

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            // Sets the filename (e.g., "SongTitle.mp3")
            link.download = `${title || 'download'}.mp3`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: just open the link if fetch fails
            window.open(url, '_blank');
        }
    };
    const isYouTube = activeVideo?.PR_VIDEO_URL?.includes('youtube.com') || activeVideo?.PR_VIDEO_URL?.includes('youtu.be');

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", display: "flex", flexDirection: "column" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                body { margin: 0; }

                /* HEADER STYLES */
                .sticky-header {
                    background: #6C5CE7; padding: 15px 30px; display: flex; alignItems: center; gap: 20px; 
                    position: sticky; top: 0; z-index: 100; border-bottom: 6px solid white;
                    box-shadow: 0 10px 20px rgba(108, 92, 231, 0.15);
                }

                .back-btn-header {
                    background: #FFD93D; border: 4px solid white; width: 48px; height: 48px; 
                    border-radius: 18px; cursor: pointer; color: #2D3436; font-size: 20px; 
                    font-weight: 900; box-shadow: 0 5px 10px rgba(0,0,0,0.1); 
                    display: flex; align-items: center; justify-content: center; transition: transform 0.2s;
                }
                .back-btn-header:hover { transform: scale(1.1) rotate(-5deg); }

                /* MAIN LAYOUT (LEFT PLAYER, RIGHT PLAYLIST) */
                .layout-wrapper {
                    display: flex; flex-direction: column; gap: 30px; padding: 30px 20px;
                    max-width: 1400px; margin: 0 auto; width: 100%; flex: 1;
                }

                @media (min-width: 1024px) {
                    .layout-wrapper { flex-direction: row; align-items: flex-start; height: calc(100vh - 85px); padding: 40px 30px; overflow: hidden; }
                    .player-section { flex: 1; overflow-y: auto; padding-right: 15px; }
                    .playlist-section { width: 420px; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; }
                }

                /* CINEMA PLAYER */
                .video-card {
                    background: white; border-radius: 40px; padding: 15px; border: 6px solid white;
                    box-shadow: 0 20px 40px rgba(108, 92, 231, 0.1); margin-bottom: 20px;
                }
                .video-frame {
                    background: #000; border-radius: 25px; overflow: hidden; position: relative; 
                    aspect-ratio: 16/9; border: 4px dashed rgba(108, 92, 231, 0.3);
                }

                /* PLAYLIST SIDEBAR */
                .playlist-card {
                    background: white; border-radius: 40px; padding: 25px; border: 6px solid white;
                    box-shadow: 0 20px 40px rgba(108, 92, 231, 0.1); display: flex; flex-direction: column;
                    height: 100%; max-height: 600px; /* limits mobile height */
                }

                /* CUSTOM SCROLLBAR FOR PLAYLIST */
                .scrollable-list {
                    flex: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 15px;
                }
                .scrollable-list::-webkit-scrollbar { width: 8px; }
                .scrollable-list::-webkit-scrollbar-track { background: transparent; }
                .scrollable-list::-webkit-scrollbar-thumb { background: #E0DAFF; border-radius: 10px; }
                .scrollable-list::-webkit-scrollbar-thumb:hover { background: #6C5CE7; }

                /* HORIZONTAL PLAYLIST ITEM */
                .playlist-item {
                    display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 25px;
                    background: #F8F9FF; border: 4px solid transparent; cursor: pointer; text-align: left;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); width: 100%;
                }
                .playlist-item.active { background: #E0DAFF; border-color: #6C5CE7; transform: scale(1.02); }
                .playlist-item:hover:not(.active) { transform: translateY(-3px) scale(1.01); background: white; border-color: #E0DAFF; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

                .item-thumb {
                    width: 110px; flex-shrink: 0; aspect-ratio: 16/9; border-radius: 15px; overflow: hidden;
                    position: relative; background: #2D3436; border: 3px solid rgba(255,255,255,0.5);
                }
                
                .item-details { flex: 1; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }

                .status-pill {
                    font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; 
                    border-radius: 50px; display: inline-block; width: max-content;
                }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

                /* Left Side Scrollbar Hide (Desktop) */
                .player-section::-webkit-scrollbar { display: none; }
            `}</style>

            {/* HEADER */}
            <div className="sticky-header">
                <button onClick={() => router.back()} className="back-btn-header">⬅️</button>
                <div style={{ overflow: "hidden" }}>
                    <h1 style={{ color: "white", fontSize: 20, fontWeight: 900, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {bookData.PR_NAME}
                    </h1>
                    <p style={{ color: "#FFD93D", fontSize: 12, fontWeight: 900, margin: "2px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {bookData.PR_CATEGORY?.PR_NAME}
                    </p>
                </div>
            </div>

            <main className="layout-wrapper">

                {/* --- LEFT: CINEMA PLAYER --- */}
                <div className="player-section">
                    {activeVideo && (
                        <>
                            <div className="video-card">
                                <div className="video-frame">
                                    {isYouTube ? (
                                        <iframe
                                            src={extractYoutubeEmbedUrl(activeVideo.PR_VIDEO_URL)}
                                            style={{ width: "100%", height: "100%", border: "none" }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={activeVideo.PR_VIDEO_URL}
                                            controls
                                            autoPlay
                                            className='media'
                                            type='video/mp4'
                                            muted // Add this line!
                                            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                                        />
                                    )}
                                </div>
                            </div>


                            {/* TV BUTTON */}

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-5 p-5 md:px-[30px] md:py-[25px] bg-white border-[6px] border-white rounded-[25px] md:rounded-[35px] shadow-[0_15px_30px_rgba(108,92,231,0.08)] mb-5">

                                <span style={{
                                    background: "linear-gradient(145deg, #ffcbcbff, #e78a8aff)",
                                }} className="text-white px-[18px] py-2 rounded-xl text-[10px] font-[900] uppercase tracking-wider border border-white/20 whitespace-nowrap">
                                    Now Playing ▶️
                                </span>

                                <span className="w-full md:w-auto md:flex-1 text-[#2d3436] px-4 py-3 md:mx-5 text-sm md:text-base font-extrabold font-mono bg-[#e3e8ec] rounded-lg text-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)] break-words">
                                    {activeVideo.PR_TITLE}
                                </span>



                                <motion.button
                                    onClick={() => handleDownload(activeVideo.PR_VIDEO_URL, activeVideo.PR_TITLE)}

                                    // 1. Initial & Hover states
                                    initial={{ scale: 1 }}
                                    whileHover={{
                                        scale: 1.05,
                                        filter: "brightness(1.1)",
                                    }}

                                    // 2. The "Physical Click" animation
                                    whileTap={{
                                        scale: 0.95,
                                        translateY: 4, // Sinks into the "shadow"
                                        boxShadow: "0 0px 0 #b33939, 0 2px 5px rgba(255, 107, 107, 0.2)" // Shadow disappears as it's pressed
                                    }}

                                    style={{
                                        position: "relative",
                                        overflow: "hidden", // Keeps the shimmer inside
                                        boxShadow: "0 4px 0 #b33939, 0 8px 15px rgba(255, 107, 107, 0.4)",
                                        background: "linear-gradient(145deg, #ff7676, #e66060)",
                                        cursor: "pointer",
                                        transition: "box-shadow 0.1s ease" // Smooth shadow transition
                                    }}
                                    className="text-white px-[18px] py-2 rounded-xl text-[10px] font-[900] uppercase tracking-wider border border-white/20 whitespace-nowrap outline-none"
                                >
                                    {/* 3. Subtle Scanning Shimmer Effect */}
                                    <motion.div
                                        animate={{ x: [-100, 200] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: "linear"
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "30%",
                                            height: "100%",
                                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                            transform: "skewX(-25deg)",
                                        }}
                                    />

                                    {/* 4. The Content */}
                                    <span style={{ position: "relative", zIndex: 1 }}>
                                        DOWNLOAD ⬇️
                                    </span>

                                    {/* 5. Pulsing Glow (Optional background ring) */}
                                    <motion.div
                                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: "inherit",
                                            background: "white",
                                            mixBlendMode: "overlay",
                                            pointerEvents: "none"
                                        }}
                                    />
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>

                {/* --- RIGHT: PLAYLIST SIDEBAR --- */}
                <div className="playlist-section">
                    <div className="playlist-card">
                        {/* Playlist Header */}
                        <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "4px dashed #F0F4FF" }}>
                            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#2D3436", margin: "0 0 5px 0" }}>Animations 🎬</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ color: "#636E72", fontWeight: 700, margin: 0, fontSize: 14 }}>Pick your next adventure!</p>
                                <span style={{ background: "#6C5CE7", color: "white", padding: "4px 12px", borderRadius: "50px", fontWeight: 900, fontSize: 12 }}>
                                    {bookData.PR_VIDEO_DATA.length} Parts
                                </span>
                            </div>
                        </div>

                        {/* Scrollable List */}
                        <div className="scrollable-list">
                            {bookData.PR_VIDEO_DATA.map((video, idx) => {
                                const isPlaying = activeVideo?.PR_ID === video.PR_ID || activeVideo === video;

                                return (
                                    <button
                                        key={video.PR_ID || idx}
                                        onClick={() => {
                                            // On mobile, scroll to top so they see the video change. On desktop, no need.
                                            if (window.innerWidth < 1024) {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                            setActiveVideo(video);
                                        }}
                                        className={`playlist-item ${isPlaying ? 'active' : ''}`}
                                    >
                                        <div className="item-thumb">
                                            <img
                                                src={video.PR_THUMBNAIL_URL || bookData.PR_ICON}
                                                alt="thumbnail"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isPlaying ? 1 : 0.8 }}
                                            />
                                            {isPlaying && (
                                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(108, 92, 231, 0.4)" }}>
                                                    <span className="floating" style={{ fontSize: 24 }}>▶️</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="item-details">
                                            <h4 style={{ fontSize: 15, fontWeight: 900, margin: 0, color: isPlaying ? "#6C5CE7" : "#2D3436", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {video.PR_NAME || `Part ${idx + 1}`}
                                            </h4>

                                            <div className="status-pill" style={{ background: isPlaying ? "#6C5CE7" : "#FFEAA7", color: isPlaying ? "white" : "#D6A317" }}>
                                                {isPlaying ? "⚡ Playing" : "📂 Play"}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main >
        </div >
    );
};

export default VideoPlayerPage;
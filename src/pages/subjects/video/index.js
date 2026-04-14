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
             <div className="min-h-screen bg-slate-50 py-10 px-6 max-w-4xl mx-auto">
                 <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold">
                    <ArrowLeft size={18} /> Back
                 </button>
                 <div className="bg-white p-12 rounded-[2.5rem] text-center max-w-2xl mx-auto shadow-sm border border-slate-100">
                     <Video size={56} className="mx-auto text-slate-300 mb-6" />
                     <h2 className="text-2xl font-bold text-slate-700">No Videos Found</h2>
                     <p className="text-slate-500 mt-2 font-medium">There currently are no video resources available for '{bookData?.PR_NAME || "this book"}'. You can explore flipbooks and other resources instead.</p>
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
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">{bookData.PR_NAME}</h1>
                    <p className="text-xs text-slate-500 font-medium truncate">{bookData.PR_CATEGORY?.PR_NAME} • {bookData.PR_CLASS?.PR_NAME}</p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-10">
                
                {/* Active Video Player Section */}
                {activeVideo && (
                    <section className="bg-black rounded-3xl overflow-hidden shadow-2xl relative w-full aspect-video border-4 border-slate-900 group">
                        {isYouTube ? (
                            <iframe 
                                src={extractYoutubeEmbedUrl(activeVideo.PR_URL)}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video 
                                src={activeVideo.PR_URL}
                                controls
                                controlsList="nodownload"
                                autoPlay
                                className="w-full h-full object-contain bg-black outline-none"
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                        
                        <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                             <h2 className="text-white font-bold text-lg md:text-xl drop-shadow-md truncate">
                                 {activeVideo.PR_NAME || activeVideo.PR_TITLE || "Resource Video"}
                             </h2>
                        </div>
                    </section>
                )}

                {/* Video Playlist Gallery */}
                <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                                <PlayCircle className="text-indigo-600" size={28} />
                                Available Episodes
                            </h3>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Select a video to start playing</p>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shrink-0">
                            {bookData.PR_VIDEO_DATA.length} items
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {bookData.PR_VIDEO_DATA.map((video, idx) => {
                            const isPlaying = activeVideo?.PR_ID === video.PR_ID || activeVideo === video;
                            
                            return (
                                <button 
                                    key={video.PR_ID || idx}
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setActiveVideo(video);
                                    }}
                                    className={`text-left flex flex-col p-4 rounded-3xl transition-all duration-300 border-2 outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${isPlaying ? 'bg-indigo-50/50 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-slate-50/50 border-transparent shadow-sm hover:shadow-lg hover:border-indigo-200 hover:bg-white'}`}
                                >
                                    <div className="w-full aspect-video bg-slate-900 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                                        {video.PR_THUMBNAIL_URL || bookData.PR_ICON ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={video.PR_THUMBNAIL_URL || bookData.PR_ICON} alt="thumbnail" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                                        ) : null}
                                        <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${isPlaying ? 'bg-indigo-900/30' : 'bg-black/30 group-hover:bg-black/10'}`}>
                                            <PlayCircle size={40} className={`drop-shadow-lg transition-transform duration-300 ${isPlaying ? 'text-indigo-400 scale-110' : 'text-white/90 group-hover:scale-110'}`} />
                                        </div>
                                    </div>
                                    <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${isPlaying ? 'text-indigo-700' : 'text-slate-800'}`}>
                                        {video.PR_NAME || video.PR_TITLE || `Video Part ${idx + 1}`}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-auto pt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {isPlaying ? (
                                             <span className="flex items-center gap-1.5 text-indigo-600">
                                                 <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                                 </span>
                                                 Now Playing
                                             </span>
                                        ) : (
                                            <>
                                                <Clock size={12} />
                                                <span>On Demand</span>
                                            </>
                                        )}
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



import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import HTMLFlipBook from "react-pageflip";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";


// Custom component for individual pages to handle per-page loading states
// React.forwardRef is strictly required for HTMLFlipBook children
const FlipbookPage = React.forwardRef(({ imageUrl, index }, ref) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    return (
        <div ref={ref} className="bg-white overflow-hidden h-full w-full relative">
            {/* Per-page loading indicator */}
            {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Loading...</span>
                </div>
            )}

            <img
                src={imageUrl}
                alt={`Page ${index + 1}`}
                className={`w-full h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)} // Hides loader if image fails
                loading={index < 3 ? "eager" : "lazy"}
            />
        </div>
    );
});

// Set display name for debugging
FlipbookPage.displayName = "FlipbookPage";


export default function FlipbookReader() {
    const router = useRouter();

    const { id } = router.query;


    const bookRef = useRef(null);

    // API & Data States
    const [bookConfig, setBookConfig] = useState(null);
    const [isApiLoading, setIsApiLoading] = useState(true);

    // UI States
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 1. Fetch Book Data
    useEffect(() => {
        if (!router.isReady) return;
        if (!id) return;

        const fetchBookDetails = async () => {
            try {
                const apiUrl = "https://publication-engine.workobservers.com/apis/ebook";

                console.log(id, typeof id);


                const payload = {
                    PR_BOOK_ID: 348
                };

                console.log(payload);


                const response = await axios.post(apiUrl, payload);


                const configData = response.data.PR_EBOOK_DATA[0].config;
                setBookConfig(configData);
                setTotalPages(configData.totalPages);

            } catch (err) {
                console.error("Failed to fetch book data:", err);
            } finally {
                setIsApiLoading(false);
            }
        };

        fetchBookDetails();
    }, [router.isReady, id]);

    // 2. Handle Responsive Dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            const headerHeight = 45;
            const footerHeight = 65;
            const availableHeight = window.innerHeight - (headerHeight + footerHeight);
            const availableWidth = window.innerWidth;

            const padding = mobile ? 10 : 30;
            const maxHeight = availableHeight - padding;
            const maxWidth = availableWidth - padding;

            if (mobile) {
                let w = maxWidth;
                let h = w * 1.4;

                if (h > maxHeight) {
                    h = maxHeight;
                    w = h / 1.4;
                }

                setDimensions({
                    width: Math.floor(w),
                    height: Math.floor(h)
                });
            } else {
                let h = maxHeight;
                let w = h * 1.41;

                if (w > maxWidth) {
                    w = maxWidth;
                    h = w / 1.41;
                }

                setDimensions({
                    width: Math.floor(w / 2),
                    height: Math.floor(h)
                });
            }
        };

        // Only run dimension logic on the client
        if (typeof window !== "undefined") {
            updateDimensions();
            window.addEventListener("resize", updateDimensions);
            return () => window.removeEventListener("resize", updateDimensions);
        }
    }, []);

    // Helper to generate the correct image URL from the API config
    const getPageImg = (index) => {
        if (!bookConfig) return "";
        // Appends the page number + .jpg and fixes backslashes
        return `${bookConfig.ebookPageName}${index + 1}.jpg`.replace(/\\/g, '/');
    };

    // --- Loading State for API ---
    if (isApiLoading) {
        return (
            <div className="fixed inset-0 h-screen w-screen bg-[#1a1a1a] flex flex-col items-center justify-center font-comic">
                <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                <p className="text-white uppercase font-bold text-sm tracking-widest">Loading Book...</p>
            </div>
        );
    }

    // --- Main UI ---
    return (
        <div className="fixed inset-0 h-screen w-screen bg-[#1a1a1a] font-comic flex flex-col overflow-hidden">

            {/* 1. Header (45px) */}
            <header className="h-[45px] flex-shrink-0 z-30 flex items-center justify-between px-4 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <motion.button whileTap={{ scale: 0.9 }} className="p-1 bg-white rounded-lg border-2 border-gray-800">
                            <ArrowLeft className="text-gray-800 h-4 w-4" />
                        </motion.button>
                    </Link>
                    <span className="text-white text-xs font-black uppercase truncate max-w-[200px] md:max-w-[400px]">
                        {bookConfig ? bookConfig["book-name"] : "Book"}
                    </span>
                </div>
                <div className="text-white text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">
                    {currentPage + 1} / {totalPages || 0}
                </div>
            </header>

            {/* 2. Main Reader Area (STRICT FIT) */}
            <main className="flex-grow flex items-center justify-center relative bg-[#222] overflow-hidden">
                {!isMobile && totalPages > 0 && (
                    <>
                        <div onClick={() => bookRef.current?.pageFlip().flipPrev()}
                            className="absolute left-0 inset-y-0 w-12 z-20 cursor-pointer flex items-center justify-center group bg-gradient-to-r from-black/20 to-transparent">
                            <ChevronLeft className="text-white/20 group-hover:text-white/80" size={30} />
                        </div>
                        <div onClick={() => bookRef.current?.pageFlip().flipNext()}
                            className="absolute right-0 inset-y-0 w-12 z-20 cursor-pointer flex items-center justify-center group bg-gradient-to-l from-black/20 to-transparent">
                            <ChevronRight className="text-white/20 group-hover:text-white/80" size={30} />
                        </div>
                    </>
                )}

                {/* Wrapper to block overflow */}
                <div className="relative flex items-center justify-center overflow-hidden w-full h-full p-2">
                    {dimensions.width > 0 && totalPages > 0 && (
                        <HTMLFlipBook
                            width={dimensions.width}
                            height={dimensions.height}
                            size="fixed"
                            minWidth={100}
                            maxWidth={2000}
                            minHeight={100}
                            maxHeight={2000}
                            maxShadowOpacity={0.5}
                            showCover={true}
                            onFlip={(e) => setCurrentPage(e.data)}
                            ref={bookRef}
                            className="flipbook-container"
                        >
                            {[...Array(totalPages)].map((_, i) => (
                                <FlipbookPage
                                    key={i}
                                    index={i}
                                    imageUrl={getPageImg(i)}
                                />
                            ))}
                        </HTMLFlipBook>
                    )}
                </div>
            </main>

            {/* 3. Footer (65px) */}
            <footer className="h-[65px] flex-shrink-0 z-30 flex justify-center items-center gap-4 bg-black/90 backdrop-blur-md">
                <button onClick={() => bookRef.current?.pageFlip().turnToPage(0)} className="nav-btn"><ChevronsLeft size={18} /></button>
                <button onClick={() => bookRef.current?.pageFlip().flipPrev()} className="nav-btn"><ChevronLeft size={18} /></button>
                <button onClick={() => bookRef.current?.pageFlip().flipNext()} className="nav-btn"><ChevronRight size={18} /></button>
                <button onClick={() => bookRef.current?.pageFlip().turnToPage(totalPages - 1)} className="nav-btn"><ChevronsRight size={18} /></button>
            </footer>

            <style jsx>{`
                .nav-btn {
                    background: white;
                    color: #333;
                    padding: 8px 12px;
                    border-radius: 10px;
                    border-bottom: 3px solid #ccc;
                    display: flex;
                    align-items: center;
                }
                .nav-btn:active {
                    transform: translateY(2px);
                    border-bottom-width: 0;
                }
            `}</style>

            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    overflow: hidden !important;
                    background-color: #1a1a1a;
                }
                .font-comic { font-family: 'Fredoka', cursive; }
                
                .flipbook-container {
                   box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                   display: block;
                   margin: 0 auto;
                }

                .stf__block {
                    background-color: #fff !important;
                }
            `}</style>
        </div>
    );
}
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, FileText, ShieldCheck, Info, LogOut } from "lucide-react";

const navItems = [
    { id: "books", label: "Flipbooks", emoji: "📚" },
    { id: "animations", label: "Animations", emoji: "🎬" },
    { id: "tests", label: "Test", emoji: "📝" },
];

// Helper Component for Dropdown Menu Items
const MenuLink = ({ icon, label }) => (
    <motion.button
        whileHover={{ x: 10, backgroundColor: "#F0F4FF" }}
        style={{
            width: "100%", padding: "12px 20px", textAlign: "left", fontSize: 15,
            fontWeight: 900, color: "#2D3436", background: "transparent",
            borderRadius: "20px", display: "flex", alignItems: "center", gap: "12px",
            cursor: "pointer", border: "2px solid transparent", outline: "none", transition: "border-color 0.2s"
        }}
    >
        {icon} {label}
    </motion.button>
);

export default function DigiGyanPanel() {
    const router = useRouter();
    const { categoryId } = router.query;

    const {
        config, isLoggedIn, user, logout,
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentBookName, setCurrentBookName] = useState("");


    // Add these to your state declarations
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [videoList, setVideoList] = useState([]);
    const [isFetchingVideos, setIsFetchingVideos] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({}); // Stores % for each video by ID
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [folderHandle, setFolderHandle] = useState(null);


    const selectDownloadFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker();
            setFolderHandle(handle);
            return handle;
        } catch (err) {
            console.warn("Folder selection cancelled");
            return null;
        }
    };

    const openDownloadModal = async (bookId, bookName) => {
        setDownloadModalOpen(true);
        setIsFetchingVideos(true);
        setVideoList([]); // Reset list
        setDownloadProgress({}); // Reset progress

        setCurrentBookName(bookName);

        try {
            const response = await fetch('https://apis.tlmate.com/content-api/book-content-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CBT_REQUEST_DATA: {
                        PR_BOOK_ID: parseInt(bookId),
                        PR_TOKEN: config.PR_TOKEN,
                        PR_APP_KEY: config.PR_APP_KEY
                    }
                })
            });
            const result = await response.json();

            if (result.STATUS === "SUCCESS" && result.DATA?.PR_VIDEO_DATA) {
                setVideoList(result.DATA.PR_VIDEO_DATA);
            }
        } catch (error) {
            console.error("Error fetching video content:", error);
        } finally {
            setIsFetchingVideos(false);
        }
    };

    const downloadSingleVideoToFolder = (fileUrl, filename, id, baseFolder) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open("POST", "https://apis.tlmate.com/content-api/video-file-download", true);
            xhr.responseType = "blob";
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);

                    setDownloadProgress(prev => ({
                        ...prev,
                        [id]: percent
                    }));
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    const blob = xhr.response;

                    const fileHandle = await baseFolder.getFileHandle(
                        `${filename || id}.mp4`,
                        { create: true }
                    );

                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    setDownloadProgress(prev => ({
                        ...prev,
                        [id]: 100
                    }));

                    resolve();
                } else {
                    reject("Download failed");
                }
            };

            xhr.onerror = () => reject("Network error");

            xhr.send(JSON.stringify({
                CBT_REQUEST_DATA: {
                    PR_TOKEN: config.PR_TOKEN,
                    PR_APP_KEY: config.PR_APP_KEY,
                    PR_FILE_URL: fileUrl
                }
            }));
        });
    };

    // const downloadAllVideos = async () => {
    //     if (isDownloadingAll || videoList.length === 0) return;

    //     setIsDownloadingAll(true);
    //     for (const video of videoList) {
    //         try {
    //             const videoUrl = video.PR_VIDEO_URL?.split("?")[0]
    //             console.log("Video url", videoUrl)

    //             await downloadSingleVideo(video.PR_VIDEO_URL, video.PR_TITLE, video.PR_ID);
    //         } catch (error) {
    //             console.error(`Failed to download ${video.PR_NAME}:`, error);
    //             // Optionally, you could set an error state here for the specific video
    //         }
    //     }
    //     setIsDownloadingAll(false);
    // };

    const downloadAllVideos = async () => {
        if (isDownloadingAll || videoList.length === 0) return;

        setIsDownloadingAll(true);

        // STEP 1: ensure folder selected
        let baseFolder = folderHandle;

        if (!baseFolder) {
            baseFolder = await selectDownloadFolder();
            if (!baseFolder) {
                setIsDownloadingAll(false);
                return;
            }
        }

        // STEP 2: create custom subfolder (book/series name)
        // const seriesName = videoList?.[0]?.PR_BOOK_NAME || "DigiGyan_Videos";
        const seriesName = currentBookName;

        const seriesFolder = await baseFolder.getDirectoryHandle(seriesName, {
            create: true,
        });

        // STEP 3: download sequentially into folder
        for (const video of videoList) {
            try {
                const videoUrl = video.PR_VIDEO_URL?.split("?")[0];

                await downloadSingleVideoToFolder(
                    video.PR_VIDEO_URL,
                    video.PR_TITLE,
                    video.PR_ID,
                    seriesFolder
                );

                setDownloadProgress(prev => ({
                    ...prev,
                    [video.PR_ID]: 100
                }));

            } catch (error) {
                console.error("Download failed:", error);
            }
        }

        setIsDownloadingAll(false);
    };



    // Dropdown Animation Variants
    const dropdownVars = {
        hidden: { opacity: 0, y: -20, scale: 0.9, transformOrigin: "top right" },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsTimeout(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!router.isReady) return;

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
            const networkTimer = setTimeout(() => setIsTimeout(true), 15000); // Bumped to 15s to allow nested fetching

            try {
                // 1. Fetch the basic book list
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
                    const basicBooks = result.DATA || [];

                    // 2. Fetch specific URLs for each book concurrently
                    const enrichedBooks = await Promise.all(basicBooks.map(async (book) => {
                        try {
                            const detailRes = await fetch('https://apis.tlmate.com/content-api/book-content-data', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    CBT_REQUEST_DATA: {
                                        PR_BOOK_ID: parseInt(book.PR_ID),
                                        PR_TOKEN: config.PR_TOKEN,
                                        PR_APP_KEY: config.PR_APP_KEY
                                    }
                                })
                            });
                            const detailResult = await detailRes.json();

                            // 3. Merge the URLs (EBOOK, TG, VIDEO) into the main book object
                            if (detailResult.STATUS === "SUCCESS" && detailResult.DATA) {
                                return { ...book, ...detailResult.DATA };
                            }
                            return book;
                        } catch (e) {
                            console.error(`Failed to fetch details for book ${book.PR_ID}`);
                            return book;
                        }
                    }));

                    setBooks(enrichedBooks);
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

                .bouncy-btn { font-weight: 900; border: none; padding: 8px 16px; border-radius: 12px; cursor: pointer; transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; text-decoration: none; }
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



                    <motion.button
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open Menu"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{
                            scale: 1.05,
                            rotate: -3,
                            backgroundColor: "#ffffff",
                            color: "#bebebe"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className=" bg-white/20"
                        style={{
                            position: "relative",
                            border: "4px solid white",
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#ffffffff",
                            overflow: "hidden", // Clips the shimmer effect
                            transition: "background-color 0.3s ease",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        {/* 1. Pulsing Glow Effect */}
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 12,
                                pointerEvents: "none"
                            }}
                            animate={{
                                boxShadow: [
                                    "0 0 0px 0px rgba(255,255,255,0.4)",
                                    "0 0 20px 10px rgba(255,255,255,0.2)",
                                    "0 0 0px 0px rgba(255,255,255,0.4)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* 2. Sliding Shimmer/Sheen */}
                        <motion.div
                            animate={{ x: [-100, 150] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 4,
                                ease: "easeInOut"
                            }}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "50%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                                transform: "skewX(-20deg)",
                                zIndex: 1
                            }}
                        />

                        {/* 3. The Hamburger Icon */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ position: "relative", zIndex: 2 }}
                        >
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </motion.button>



                    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push('/')}>
                        <div style={{ background: "white", padding: "6px", borderRadius: "14px", display: "flex", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                            <img src="/logo.png" alt="logo" style={{ width: 26, height: 26, objectFit: "contain" }} />
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px" }}>DigiGyan</span>
                    </div>
                </div>

                {user ? (
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "4px solid white", cursor: "pointer", fontWeight: 900, color: "#2D3436", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }} onClick={() => setShowDropdown(!showDropdown)}>
                        {user.initials}
                    </div>
                ) : (
                    <button onClick={() => router.push('/login')} style={{ background: "#FFEAA7", color: "#D6A317", border: "4px solid white", padding: "8px 18px", borderRadius: "16px", fontWeight: 900, cursor: "pointer", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                        Login
                    </button>
                )}
            </div>

            {/* SIDEBAR BACKDROP */}
            <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* SIDEBAR */}
            <div className="sidebar">
                <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    onClick={() => router.push('/')}
                    className="mb-8 flex flex-col items-center justify-center gap-4 cursor-pointer drop-shadow-2xl group w-fit mx-auto md:mx-0"
                >
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
                        <motion.div
                            animate={{ x: [-100, 150] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] z-10"
                        />
                        <img src="/logo.png" alt="DigiGyan Logo" className="w-16 h-16 object-contain relative z-20 group-hover:scale-110 transition-transform" />
                    </motion.div>

                    <div className="flex flex-col items-center text-center mt-1">
                        <span className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md leading-none">DigiGyan</span>
                        <span className="text-[12px] font-black text-[#FFD93D] uppercase tracking-widest mt-2 drop-shadow-md">Magic Library ✨</span>
                    </div>
                </motion.div>

                <nav style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-btn ${activeNav === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveNav(item.id);
                                setSidebarOpen(false);
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

                        {/* Desktop Avatar Profile Dropdown */}
                        <div className="desktop-header-title" style={{ position: "relative" }}>
                            {isLoggedIn && user ? (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05, rotate: -2 }}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        style={{
                                            background: "white", border: "6px solid white", borderRadius: "50px",
                                            padding: "6px 16px 6px 6px", display: "flex", alignItems: "center", gap: "10px",
                                            cursor: "pointer", boxShadow: "0 10px 25px rgba(108, 92, 231, 0.15)", outline: "none"
                                        }}
                                    >
                                        <div style={{ width: 45, height: 45, background: "#FFD93D", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#2D3436" }}>
                                            {user?.initials || "AJ"}
                                        </div>
                                        <span style={{ fontSize: 16, fontWeight: 900, color: "#2D3436", display: "none", "@media (min-width: 768px)": { display: "block" } }}>
                                            {user?.name?.split(' ')[0] || "Admin"}
                                        </span>
                                        <ChevronDown size={20} color="#6C5CE7" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {showDropdown && (
                                            <motion.div
                                                variants={dropdownVars}
                                                initial="hidden" animate="visible" exit="exit"
                                                style={{
                                                    position: "absolute", right: 0, top: "calc(100% + 15px)", width: "240px",
                                                    background: "white", borderRadius: "40px", padding: "15px",
                                                    border: "6px solid white", boxShadow: "0 25px 50px rgba(108, 92, 231, 0.2)", zIndex: 50
                                                }}
                                            >
                                                <div style={{ padding: "10px 15px", borderBottom: "4px dashed #F0F4FF", marginBottom: "10px" }}>
                                                    <p style={{ fontSize: 11, fontWeight: 900, color: "#A29BFE", textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>Secret Menu 🤫</p>
                                                </div>

                                                <MenuLink icon={<FileText size={20} color="#FF7675" />} label="Terms" />
                                                <MenuLink icon={<ShieldCheck size={20} color="#55EFC4" />} label="Privacy" />
                                                <MenuLink icon={<Info size={20} color="#6C5CE7" />} label="Help" />

                                                <div style={{ height: "4px", background: "#F0F4FF", margin: "10px", borderRadius: "10px" }}></div>

                                                <motion.button
                                                    whileHover={{ x: 10, backgroundColor: "#FFF0F0", borderColor: "#FFD2D2" }}
                                                    onClick={() => { logout(); setShowDropdown(false); router.push("/login"); }}
                                                    style={{
                                                        width: "100%", padding: "12px 20px", textAlign: "left", fontSize: 15,
                                                        fontWeight: 900, color: "#FF6B6B", background: "transparent", borderRadius: "20px",
                                                        display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
                                                        border: "2px solid transparent", outline: "none", transition: "all 0.2s"
                                                    }}
                                                >
                                                    <LogOut size={20} /> Sign Out
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.08, rotate: 3 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/login')}
                                    style={{
                                        background: "#FFEAA7", color: "#D6A317", border: "6px solid white", padding: "12px 30px",
                                        borderRadius: "50px", fontSize: "18px", fontWeight: 900, cursor: "pointer",
                                        boxShadow: "0 10px 0 0 #F9CA24, 0 15px 25px rgba(249, 202, 36, 0.4)",
                                        outline: "none", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginTop: "-5px"
                                    }}
                                >
                                    Log In ✨
                                </motion.button>
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
                                        <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 20, fontWeight: 900, color: "#2D3436", lineHeight: 1.2, height: "48px", overflow: "hidden" }}>{book.PR_NAME}</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <a href={book.PR_EBOOK_URL || "#"} target="_blank" rel="noopener noreferrer" className="bouncy-btn" style={{ background: "#F1F2F6", color: "#636E72", opacity: book.PR_EBOOK_URL ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (!book.PR_EBOOK_URL) e.preventDefault(); }}>View 👀</a>
                                        <button className="bouncy-btn" style={{ background: "#E0DAFF", color: "#6C5CE7" }} onClick={(e) => e.stopPropagation()}>Download ⬇️</button>
                                    </div>
                                </>
                            )}

                            {/* --- VIEW 2: ANIMATIONS UI --- */}
                            {/* --- VIEW 2: ANIMATIONS UI --- */}
                            {activeNav === "animations" && (
                                <>
                                    <div className="image-frame">
                                        {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
                                        <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} - Toon</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <button className="bouncy-btn" style={{ background: "#FF6B6B", color: "white", opacity: book.PR_VIDEO_DATA?.length > 0 ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (book.PR_VIDEO_DATA?.length > 0) router.push(`/subjects/video?bookid=${book.PR_ID}`); }}>Watch 🍿</button>

                                        {/* UPDATED BUTTON HERE */}
                                        <button
                                            className="bouncy-btn"
                                            style={{ background: "#fff7f7ff", color: "#FF6B6B" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDownloadModal(book.PR_ID, book.PR_NAME);
                                                console.log("bookId", book.PR_ID);

                                            }}
                                        >
                                            Download ⬇️
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* --- VIEW 3: TESTS UI --- */}
                            {activeNav === "tests" && (
                                <>
                                    <div className="image-frame">
                                        {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
                                        <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
                                    </div>
                                    <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} Quiz</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
                                        <a href={book.PR_TG_URL || "#"} target="_blank" rel="noopener noreferrer" className="bouncy-btn" style={{ background: "#00B894", color: "white", opacity: book.PR_TG_URL ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (!book.PR_TG_URL) e.preventDefault(); }}>Generate ⏱️</a>
                                        <button className="bouncy-btn" style={{ background: "#fff7f7ff", color: "#FF6B6B" }} onClick={(e) => e.stopPropagation()}>Download ⬇️</button>
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




                {/* DOWNLOAD MODAL */}
                <AnimatePresence>
                    {downloadModalOpen && (
                        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                            {/* Backdrop Blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isDownloadingAll && setDownloadModalOpen(false)}
                                style={{ position: "absolute", inset: 0, background: "rgba(45, 52, 54, 0.4)", backdropFilter: "blur(8px)" }}
                            />

                            {/* Modal Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                style={{
                                    position: "relative", width: "100%", maxWidth: "500px", background: "white",
                                    borderRadius: "32px", padding: "30px", border: "6px solid white",
                                    boxShadow: "0 25px 50px rgba(108, 92, 231, 0.25)", overflow: "hidden",
                                    display: "flex", flexDirection: "column", maxHeight: "80vh"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px dashed #F0F4FF", paddingBottom: "15px", marginBottom: "20px" }}>
                                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#2D3436" }}>📥 Download Magic</h2>
                                    {!isDownloadingAll && (
                                        <button onClick={() => setDownloadModalOpen(false)} style={{ background: "#F1F2F6", border: "none", width: 36, height: 36, borderRadius: "12px", cursor: "pointer", fontWeight: 900, color: "#636E72" }}>✕</button>
                                    )}
                                </div>

                                {isFetchingVideos ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                                        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                                        <p style={{ fontWeight: 800, color: "#6C5CE7" }}>Gathering videos...</p>
                                    </div>
                                ) : videoList.length > 0 ? (
                                    <>
                                        <div style={{ overflowY: "auto", paddingRight: "10px", flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>

                                            {videoList.map((vid, index) => {
                                                const progress = downloadProgress[vid.PR_ID] || 0;
                                                return (
                                                    <motion.div
                                                        key={vid.PR_ID}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 300,
                                                            damping: 24,
                                                            delay: index * 0.1 // Staggers each item by 0.1s
                                                        }}
                                                        // Added flex and items-center here
                                                        className="relative flex items-center overflow-hidden rounded-[20px] border-[3px] border-[#E0DAFF] bg-[#F8F9FF] p-[15px]"
                                                    >
                                                        {/* Progress Bar Background */}
                                                        <div
                                                            className="absolute left-0 top-0 z-0 h-full bg-[#E8FFF7] transition-all duration-300 ease-in-out"
                                                            style={{ width: `${progress}%` }}
                                                        />

                                                        {/* Added w-full here to stretch across the flex parent */}
                                                        <div className="relative z-10 flex w-full items-center justify-between">
                                                            {/* Added flex items-center and leading-none to ensure the emoji and text align perfectly */}
                                                            <p className="m-0 flex max-w-[70%] items-center truncate text-[15px] font-extrabold leading-none text-[#2D3436]">
                                                                🎬 <span className="ml-2 truncate">{vid.PR_TITLE || "Animation Video"}</span>
                                                            </p>

                                                            {progress > 0 && progress < 100 ? (
                                                                <span className="text-[14px] font-black leading-none text-[#00B894]">{progress}%</span>
                                                            ) : progress === 100 ? (
                                                                <span className="text-[14px] font-black leading-none text-[#00B894]">✅ Done</span>
                                                            ) : (
                                                                <span className="text-[14px] font-black leading-none text-[#A29BFE]">Wait</span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: isDownloadingAll ? 1 : 1.03 }}
                                            whileTap={{ scale: isDownloadingAll ? 1 : 0.97 }}
                                            onClick={downloadAllVideos}
                                            disabled={isDownloadingAll}
                                            style={{
                                                background: isDownloadingAll ? "#B2BEC3" : "#6C5CE7", color: "white", border: "4px solid white",
                                                padding: "16px", borderRadius: "50px", fontSize: "18px", fontWeight: 900, cursor: isDownloadingAll ? "not-allowed" : "pointer",
                                                boxShadow: isDownloadingAll ? "none" : "0 10px 0 0 #5f4ed1, 0 15px 25px rgba(108, 92, 231, 0.4)",
                                                outline: "none", width: "100%", transition: "background 0.3s"
                                            }}
                                        >
                                            {isDownloadingAll ? "Downloading Magic... ⏳" : "Download All 🚀"}
                                        </motion.button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                                        <span style={{ fontSize: 40 }}>🤷‍♂️</span>
                                        <p style={{ fontWeight: 800, color: "#2D3436", marginTop: 10 }}>No animations found in this book!</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


            </div >






        </div >
    );
}




























// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { useApp } from "@/context/AppContext";
// import { motion, AnimatePresence } from "framer-motion";
// import { Loader2, ChevronDown, FileText, ShieldCheck, Info, LogOut } from "lucide-react";

// const navItems = [
//     { id: "books", label: "Flipbooks", emoji: "📚" },
//     { id: "animations", label: "Animations", emoji: "🎬" },
//     { id: "tests", label: "Test", emoji: "📝" },
// ];

// // Helper Component for Dropdown Menu Items
// const MenuLink = ({ icon, label }) => (
//     <motion.button
//         whileHover={{ x: 10, backgroundColor: "#F0F4FF" }}
//         style={{
//             width: "100%", padding: "12px 20px", textAlign: "left", fontSize: 15,
//             fontWeight: 900, color: "#2D3436", background: "transparent",
//             borderRadius: "20px", display: "flex", alignItems: "center", gap: "12px",
//             cursor: "pointer", border: "2px solid transparent", outline: "none", transition: "border-color 0.2s"
//         }}
//     >
//         {icon} {label}
//     </motion.button>
// );

// export default function DigiGyanPanel() {
//     const router = useRouter();
//     const { categoryId } = router.query;

//     const {
//         config, isLoggedIn, user, logout,
//         series, seriesId, setSeriesId,
//         Class, setClass, classId, setClassId
//     } = useApp();

//     const [availableClasses, setAvailableClasses] = useState([]);
//     const [books, setBooks] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [isTimeout, setIsTimeout] = useState(false);

//     const [activeNav, setActiveNav] = useState("books");
//     const [filterSubject, setFilterSubject] = useState("All Subjects");
//     const [search, setSearch] = useState("");
//     const [selectedBook, setSelectedBook] = useState(null);
//     const [isSidebarOpen, setSidebarOpen] = useState(false);
//     const [showDropdown, setShowDropdown] = useState(false);


//     // Add these to your state declarations
//     const [downloadModalOpen, setDownloadModalOpen] = useState(false);
//     const [videoList, setVideoList] = useState([]);
//     const [isFetchingVideos, setIsFetchingVideos] = useState(false);
//     const [downloadProgress, setDownloadProgress] = useState({}); // Stores % for each video by ID
//     const [isDownloadingAll, setIsDownloadingAll] = useState(false);


//     const openDownloadModal = async (bookId) => {
//         setDownloadModalOpen(true);
//         setIsFetchingVideos(true);
//         setVideoList([]); // Reset list
//         setDownloadProgress({}); // Reset progress

//         console.log("bookId");


//         try {
//             const response = await fetch('https://apis.tlmate.com/content-api/book-content-data', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     CBT_REQUEST_DATA: {
//                         PR_BOOK_ID: parseInt(bookId),
//                         PR_TOKEN: config.PR_TOKEN,
//                         PR_APP_KEY: config.PR_APP_KEY
//                     }
//                 })
//             });
//             const result = await response.json();

//             if (result.STATUS === "SUCCESS" && result.DATA?.PR_VIDEO_DATA) {
//                 setVideoList(result.DATA.PR_VIDEO_DATA);
//             }
//         } catch (error) {
//             console.error("Error fetching video content:", error);
//         } finally {
//             setIsFetchingVideos(false);
//         }
//     };

//     const downloadSingleVideo = (url, filename, id) => {
//         return new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.open('GET', url, true);
//             xhr.responseType = 'blob'; // Important for file downloads

//             xhr.onprogress = (event) => {
//                 if (event.lengthComputable) {
//                     const percentComplete = Math.round((event.loaded / event.total) * 100);
//                     setDownloadProgress(prev => ({ ...prev, [id]: percentComplete }));
//                 }
//             };

//             xhr.onload = () => {
//                 if (xhr.status === 200) {
//                     const blob = xhr.response;
//                     const downloadUrl = window.URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = downloadUrl;
//                     a.download = filename ? `${filename}.mp4` : `Video_${id}.mp4`;
//                     document.body.appendChild(a);
//                     a.click();
//                     document.body.removeChild(a);
//                     window.URL.revokeObjectURL(downloadUrl);
//                     resolve();
//                 } else {
//                     reject('Download failed');
//                 }
//             };

//             xhr.onerror = () => reject('Network error');
//             xhr.send();
//         });
//     };

//     const downloadAllVideos = async () => {
//         if (isDownloadingAll || videoList.length === 0) return;

//         setIsDownloadingAll(true);
//         for (const video of videoList) {
//             try {
//                 await downloadSingleVideo(video.PR_URL, video.PR_NAME, video.PR_ID);
//             } catch (error) {
//                 console.error(`Failed to download ${video.PR_NAME}:`, error);
//                 // Optionally, you could set an error state here for the specific video
//             }
//         }
//         setIsDownloadingAll(false);
//     };



//     // Dropdown Animation Variants
//     const dropdownVars = {
//         hidden: { opacity: 0, y: -20, scale: 0.9, transformOrigin: "top right" },
//         visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
//         exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
//     };

//     useEffect(() => {
//         const timer = setTimeout(() => setIsTimeout(true), 5000);
//         return () => clearTimeout(timer);
//     }, []);

//     useEffect(() => {
//         if (!router.isReady) return;

//         if (categoryId && String(categoryId) !== String(seriesId)) {
//             setSeriesId(categoryId);
//             return;
//         }

//         if (!seriesId || !config?.PR_TOKEN) return;

//         const fetchClasses = async () => {
//             setLoading(true);
//             try {
//                 const classRes = await fetch('https://apis.tlmate.com/content-api/classes-list', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         CBT_REQUEST_DATA: {
//                             PR_CATEGORY_ID: seriesId,
//                             PR_TOKEN: config.PR_TOKEN,
//                             PR_APP_KEY: config.PR_APP_KEY
//                         }
//                     })
//                 });
//                 const classResult = await classRes.json();

//                 if (classResult.STATUS === "SUCCESS" && classResult.DATA?.length > 0) {
//                     setAvailableClasses(classResult.DATA);

//                     const isValidClass = classResult.DATA.some(c => c.PR_CLASS_ID === classId);
//                     if (!classId || !isValidClass) {
//                         const firstClass = classResult.DATA[0];
//                         setClass(firstClass.PR_NAME);
//                         setClassId(firstClass.PR_CLASS_ID);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error fetching classes:", error);
//             }
//         };

//         fetchClasses();
//     }, [seriesId, config, categoryId, router.isReady]);

//     useEffect(() => {
//         if (!seriesId || !classId || !config?.PR_TOKEN) return;

//         const loadBooks = async () => {
//             setLoading(true);
//             setIsTimeout(false);
//             const networkTimer = setTimeout(() => setIsTimeout(true), 15000); // Bumped to 15s to allow nested fetching

//             try {
//                 // 1. Fetch the basic book list
//                 const res = await fetch('https://apis.tlmate.com/content-api/books-list', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         CBT_REQUEST_DATA: {
//                             PR_CLASS_ID: classId,
//                             PR_CATEGORY_ID: seriesId,
//                             PR_TOKEN: config.PR_TOKEN,
//                             PR_APP_KEY: config.PR_APP_KEY
//                         }
//                     })
//                 });
//                 const result = await res.json();

//                 if (result.STATUS === "SUCCESS") {
//                     const basicBooks = result.DATA || [];

//                     // 2. Fetch specific URLs for each book concurrently
//                     const enrichedBooks = await Promise.all(basicBooks.map(async (book) => {
//                         try {
//                             const detailRes = await fetch('https://apis.tlmate.com/content-api/book-content-data', {
//                                 method: 'POST',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({
//                                     CBT_REQUEST_DATA: {
//                                         PR_BOOK_ID: parseInt(book.PR_ID),
//                                         PR_TOKEN: config.PR_TOKEN,
//                                         PR_APP_KEY: config.PR_APP_KEY
//                                     }
//                                 })
//                             });
//                             const detailResult = await detailRes.json();

//                             // 3. Merge the URLs (EBOOK, TG, VIDEO) into the main book object
//                             if (detailResult.STATUS === "SUCCESS" && detailResult.DATA) {
//                                 return { ...book, ...detailResult.DATA };
//                             }
//                             return book;
//                         } catch (e) {
//                             console.error(`Failed to fetch details for book ${book.PR_ID}`);
//                             return book;
//                         }
//                     }));

//                     setBooks(enrichedBooks);
//                 }
//             } catch (error) {
//                 console.error("Network error while fetching books:", error);
//             } finally {
//                 clearTimeout(networkTimer);
//                 setLoading(false);
//             }
//         };

//         loadBooks();
//     }, [seriesId, classId, config]);

//     const handleClassChange = (e) => {
//         const selectedId = parseInt(e.target.value);
//         const selectedClassObject = availableClasses.find(c => c.PR_CLASS_ID === selectedId);

//         if (selectedClassObject) {
//             setClassId(selectedClassObject.PR_CLASS_ID);
//             setClass(selectedClassObject.PR_NAME);
//         }
//     };

//     const uniqueSubjects = ["All Subjects", ...new Set(books.map(b => b.PR_CATEGORY?.PR_NAME).filter(Boolean))];

//     const filtered = books.filter(b => {
//         const bookSubj = b.PR_CATEGORY?.PR_NAME || "";
//         return (
//             (filterSubject === "All Subjects" || bookSubj === filterSubject) &&
//             (search === "" || (b.PR_NAME || "").toLowerCase().includes(search.toLowerCase()))
//         );
//     });

//     if (isTimeout && !seriesId) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif", padding: 20 }}>
//                 <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
//                 <div className="floating" style={{ fontSize: 90, marginBottom: 20 }}>🤔</div>
//                 <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 32, margin: "0 0 10px 0", textAlign: "center" }}>Whoops! Where are we?</h2>
//                 <button onClick={() => router.back()} style={{ marginTop: 30, background: "#FFD93D", border: "5px solid white", padding: "15px 35px", borderRadius: 50, fontSize: 18, fontWeight: 900, cursor: "pointer" }}>⬅️ Go Back</button>
//             </div>
//         );
//     }

//     if (isTimeout && loading) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif", padding: 20 }}>
//                 <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
//                 <div className="floating" style={{ fontSize: 90, marginBottom: 20 }}>🐌</div>
//                 <h2 style={{ fontWeight: 900, color: "#2D3436", fontSize: 32, margin: "0 0 10px 0" }}>Taking a bit long...</h2>
//                 <button onClick={() => window.location.reload()} style={{ marginTop: 30, background: "#6C5CE7", border: "5px solid white", padding: "15px 35px", borderRadius: 50, fontSize: 18, fontWeight: 900, color: "white", cursor: "pointer" }}>🔄 Refresh Page</button>
//             </div>
//         );
//     }

//     if (!seriesId || loading) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
//                 <style>{`.floating { animation: floating 3s ease-in-out infinite; } @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`}</style>
//                 <div className="floating" style={{ fontSize: 80, marginBottom: 20 }}>📚</div>
//                 <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
//                 <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 24 }}>Organizing...</p>
//             </div>
//         );
//     }


//     return (
//         <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", color: "#2D3436" }}>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
//                 * { box-sizing: border-box; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

//                 /* ANIMATED SIDEBAR */
//                 .sidebar { 
//                     background: #6C5CE7; width: 260px; height: 100vh; position: fixed; left: 0; top: 0; z-index: 1000; 
//                     display: flex; flex-direction: column; padding: 40px 25px; border-right: 8px solid white; 
//                     box-shadow: 10px 0 40px rgba(108, 92, 231, 0.15);
//                     transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//                 }
//                 .nav-btn { border: 4px solid transparent; margin: 8px 0; border-radius: 25px; cursor: pointer; display: flex; align-items: center; gap: 15px; padding: 15px 20px; font-weight: 900; color: #E0DAFF; background: transparent; width: 100%; font-size: 16px; }
//                 .nav-btn:hover:not(.active) { background: rgba(255,255,255,0.1); transform: translateX(8px); }
//                 .nav-btn.active { background: white; color: #6C5CE7; transform: scale(1.05) rotate(-2deg); border: 4px solid white; box-shadow: 0 15px 25px rgba(0,0,0,0.15); }

//                 .main-content { margin-left: 260px; min-height: 100vh; padding-bottom: 50px; }

//                 /* SHARED CARD STYLES */
//                 .magic-card { background: white; border-radius: 40px; padding: 18px; box-shadow: 0 20px 40px rgba(108, 92, 231, 0.08); border: 6px solid white; position: relative; }
//                 .magic-card:hover { transform: translateY(-10px) scale(1.02) rotate(1deg); border-color: #E0DAFF; box-shadow: 0 25px 50px rgba(108, 92, 231, 0.2); }

//                 /* UI FRAMES */
//                 .image-frame { height: 200px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 4px dashed rgba(108, 92, 231, 0.2); background: #F8F9FF; display: flex; align-items: center; justify-content: center; position: relative; }
//                 .video-frame { height: 180px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 6px solid #2D3436; background: #000; display: flex; align-items: center; justify-content: center; position: relative; }
//                 .play-btn-overlay { position: absolute; font-size: 50px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5)); transition: transform 0.2s; z-index: 10; }
//                 .magic-card:hover .play-btn-overlay { transform: scale(1.2); }
//                 .quiz-frame { height: 160px; border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 4px solid #55EFC4; background: #E8FFF7; display: flex; align-items: center; justify-content: center; flex-direction: column; }

//                 .filter-select { appearance: none; border: 4px solid white; padding: 15px 30px; border-radius: 50px; background: white; font-weight: 900; color: #6C5CE7; cursor: pointer; box-shadow: 0 10px 25px rgba(108, 92, 231, 0.1); outline: none; font-size: 15px; }
//                 .search-container { background: white; border-radius: 50px; border: 6px solid white; box-shadow: 0 15px 35px rgba(108, 92, 231, 0.1); display: flex; align-items: center; padding: 5px 25px; flex: 1; transition: border-color 0.3s; }
//                 .search-input { border: none; outline: none; font-weight: 800; font-size: 16px; width: 100%; color: #2D3436; padding: 12px 0 12px 15px; }

//                 .floating { animation: floating 3s ease-in-out infinite; }
//                 @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

//                 .bouncy-btn { font-weight: 900; border: none; padding: 8px 16px; border-radius: 12px; cursor: pointer; transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; text-decoration: none; }
//                 .bouncy-btn:hover { transform: scale(1.05); }

//                 /* MOBILE SPECIFIC CSS */
//                 .mobile-header { 
//                     display: none; background: #6C5CE7; padding: 15px 20px; color: white; 
//                     align-items: center; justify-content: space-between; position: sticky; 
//                     top: 0; z-index: 900; border-bottom: 6px solid white; 
//                 }
//                 .sidebar-backdrop {
//                     display: none; position: fixed; inset: 0; background: rgba(45, 52, 54, 0.6); 
//                     backdrop-filter: blur(4px); z-index: 995; opacity: 0; transition: opacity 0.3s;
//                 }
//                 .sidebar-backdrop.open { display: block; opacity: 1; }
//                 .mobile-close-btn { display: none; }

//                 @media (max-width: 1024px) { 
//                     .sidebar { transform: translateX(${isSidebarOpen ? "0" : "-100%"}); border-right: none; } 
//                     .main-content { margin-left: 0; } 
//                     .mobile-header { display: flex; } 
//                     .desktop-header-title { display: none; } 
//                     .mobile-close-btn { 
//                         display: flex; position: absolute; top: 20px; right: 20px; 
//                         background: rgba(255,255,255,0.2); border: none; color: white; 
//                         width: 40px; height: 40px; border-radius: 15px; align-items: center; 
//                         justify-content: center; font-size: 20px; cursor: pointer;
//                     }
//                 }
//             `}</style>

//             {/* MOBILE HEADER */}
//             <div className="mobile-header">
//                 <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>



//                     <motion.button
//                         onClick={() => setSidebarOpen(true)}
//                         aria-label="Open Menu"
//                         initial={{ y: -50, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         whileHover={{
//                             scale: 1.05,
//                             rotate: -3,
//                             backgroundColor: "#ffffff",
//                             color: "#bebebe"
//                         }}
//                         whileTap={{ scale: 0.95 }}
//                         className=" bg-white/20"
//                         style={{

//                             position: "relative",

//                             border: "4px solid white",
//                             width: 48,
//                             height: 48,
//                             borderRadius: 16,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             cursor: "pointer",
//                             color: "#ffffffff",
//                             overflow: "hidden", // Clips the shimmer effect
//                             transition: "background-color 0.3s ease",
//                             boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
//                         }}
//                     >
//                         {/* 1. Pulsing Glow Effect */}
//                         <motion.div
//                             style={{
//                                 position: "absolute",
//                                 inset: 0,
//                                 borderRadius: 12,
//                                 pointerEvents: "none"
//                             }}
//                             animate={{
//                                 boxShadow: [
//                                     "0 0 0px 0px rgba(255,255,255,0.4)",
//                                     "0 0 20px 10px rgba(255,255,255,0.2)",
//                                     "0 0 0px 0px rgba(255,255,255,0.4)"
//                                 ]
//                             }}
//                             transition={{
//                                 duration: 3,
//                                 repeat: Infinity,
//                                 ease: "easeInOut"
//                             }}
//                         />

//                         {/* 2. Sliding Shimmer/Sheen */}
//                         <motion.div
//                             animate={{ x: [-100, 150] }}
//                             transition={{
//                                 duration: 1.5,
//                                 repeat: Infinity,
//                                 repeatDelay: 4,
//                                 ease: "easeInOut"
//                             }}
//                             style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "50%",
//                                 height: "100%",
//                                 background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
//                                 transform: "skewX(-20deg)",
//                                 zIndex: 1
//                             }}
//                         />

//                         {/* 3. The Hamburger Icon */}
//                         <svg
//                             width="24"
//                             height="24"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             style={{ position: "relative", zIndex: 2 }}
//                         >
//                             <line x1="3" y1="12" x2="21" y2="12"></line>
//                             <line x1="3" y1="6" x2="21" y2="6"></line>
//                             <line x1="3" y1="18" x2="21" y2="18"></line>
//                         </svg>
//                     </motion.button>



//                     <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push('/')}>
//                         <div style={{ background: "white", padding: "6px", borderRadius: "14px", display: "flex", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
//                             <img src="/logo.png" alt="logo" style={{ width: 26, height: 26, objectFit: "contain" }} />
//                         </div>
//                         <span style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px" }}>DigiGyan</span>
//                     </div>
//                 </div>

//                 {user ? (
//                     <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "4px solid white", cursor: "pointer", fontWeight: 900, color: "#2D3436", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }} onClick={() => setShowDropdown(!showDropdown)}>
//                         {user.initials}
//                     </div>
//                 ) : (
//                     <button onClick={() => router.push('/login')} style={{ background: "#FFEAA7", color: "#D6A317", border: "4px solid white", padding: "8px 18px", borderRadius: "16px", fontWeight: 900, cursor: "pointer", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
//                         Login
//                     </button>
//                 )}
//             </div>

//             {/* SIDEBAR BACKDROP */}
//             <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

//             {/* SIDEBAR */}
//             <div className="sidebar">
//                 <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>

//                 <motion.div
//                     initial={{ y: -50, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     whileHover={{ scale: 1.05, rotate: -3 }}
//                     onClick={() => router.push('/')}
//                     className="mb-8 flex flex-col items-center justify-center gap-4 cursor-pointer drop-shadow-2xl group w-fit mx-auto md:mx-0"
//                 >
//                     <motion.div
//                         animate={{
//                             boxShadow: [
//                                 "0 0 0px 0px rgba(255,255,255,0.4)",
//                                 "0 0 20px 10px rgba(255,255,255,0.2)",
//                                 "0 0 0px 0px rgba(255,255,255,0.4)"
//                             ]
//                         }}
//                         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//                         className="relative bg-white/20 p-4 rounded-[28px] border-4 border-white/30 backdrop-blur-xl group-hover:bg-white transition-all overflow-hidden"
//                     >
//                         <motion.div
//                             animate={{ x: [-100, 150] }}
//                             transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
//                             className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] z-10"
//                         />
//                         <img src="/logo.png" alt="DigiGyan Logo" className="w-16 h-16 object-contain relative z-20 group-hover:scale-110 transition-transform" />
//                     </motion.div>

//                     <div className="flex flex-col items-center text-center mt-1">
//                         <span className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md leading-none">DigiGyan</span>
//                         <span className="text-[12px] font-black text-[#FFD93D] uppercase tracking-widest mt-2 drop-shadow-md">Magic Library ✨</span>
//                     </div>
//                 </motion.div>

//                 <nav style={{ flex: 1 }}>
//                     {navItems.map(item => (
//                         <button
//                             key={item.id}
//                             className={`nav-btn ${activeNav === item.id ? 'active' : ''}`}
//                             onClick={() => {
//                                 setActiveNav(item.id);
//                                 setSidebarOpen(false);
//                             }}
//                         >
//                             <span style={{ fontSize: 24 }}>{item.emoji}</span> {item.label}
//                         </button>
//                     ))}
//                 </nav>
//             </div>

//             {/* MAIN PANEL */}
//             <div className="main-content">
//                 <header style={{ padding: "40px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "25px" }}>
//                     <div className="desktop-header-title">
//                         <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
//                             {series && <span style={{ background: "#E0DAFF", color: "#6C5CE7", padding: "6px 16px", borderRadius: "50px", fontSize: 13, fontWeight: 900, border: "3px solid white" }}>📚 Series: {series.PR_NAME || series}</span>}
//                             {Class && <span style={{ background: "#FFD93D", color: "#2D3436", padding: "6px 16px", borderRadius: "50px", fontSize: 13, fontWeight: 900, border: "3px solid white" }}>🏫 {Class.PR_NAME || Class}</span>}
//                         </div>
//                         <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, color: "#2D3436" }}>Hi, {user?.name?.split(' ')[0] || 'Friend'}! 👑</h2>
//                         <p style={{ margin: "8px 0 0 0", color: "#6C5CE7", fontWeight: 800, fontSize: 18 }}>Ready to build some brilliant minds today?</p>
//                     </div>

//                     <div style={{ display: "flex", gap: 20, alignItems: "center", width: "100%", maxWidth: "500px" }}>
//                         <select className="filter-select" value={classId || ""} onChange={handleClassChange}>
//                             {availableClasses.map(c => <option key={c.PR_CLASS_ID} value={c.PR_CLASS_ID}>{c.PR_NAME}</option>)}
//                         </select>
//                         <div className="search-container">
//                             <span style={{ fontSize: "22px" }}>🔍</span>
//                             <input className="search-input" placeholder="Find magic..." value={search} onChange={(e) => setSearch(e.target.value)} />
//                         </div>

//                         {/* Desktop Avatar Profile Dropdown */}
//                         <div className="desktop-header-title" style={{ position: "relative" }}>
//                             {isLoggedIn && user ? (
//                                 <>
//                                     <motion.button
//                                         whileHover={{ scale: 1.05, rotate: -2 }}
//                                         onClick={() => setShowDropdown(!showDropdown)}
//                                         style={{
//                                             background: "white", border: "6px solid white", borderRadius: "50px",
//                                             padding: "6px 16px 6px 6px", display: "flex", alignItems: "center", gap: "10px",
//                                             cursor: "pointer", boxShadow: "0 10px 25px rgba(108, 92, 231, 0.15)", outline: "none"
//                                         }}
//                                     >
//                                         <div style={{ width: 45, height: 45, background: "#FFD93D", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#2D3436" }}>
//                                             {user?.initials || "AJ"}
//                                         </div>
//                                         <span style={{ fontSize: 16, fontWeight: 900, color: "#2D3436", display: "none", "@media (min-width: 768px)": { display: "block" } }}>
//                                             {user?.name?.split(' ')[0] || "Admin"}
//                                         </span>
//                                         <ChevronDown size={20} color="#6C5CE7" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
//                                     </motion.button>

//                                     <AnimatePresence>
//                                         {showDropdown && (
//                                             <motion.div
//                                                 variants={dropdownVars}
//                                                 initial="hidden" animate="visible" exit="exit"
//                                                 style={{
//                                                     position: "absolute", right: 0, top: "calc(100% + 15px)", width: "240px",
//                                                     background: "white", borderRadius: "40px", padding: "15px",
//                                                     border: "6px solid white", boxShadow: "0 25px 50px rgba(108, 92, 231, 0.2)", zIndex: 50
//                                                 }}
//                                             >
//                                                 <div style={{ padding: "10px 15px", borderBottom: "4px dashed #F0F4FF", marginBottom: "10px" }}>
//                                                     <p style={{ fontSize: 11, fontWeight: 900, color: "#A29BFE", textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>Secret Menu 🤫</p>
//                                                 </div>

//                                                 <MenuLink icon={<FileText size={20} color="#FF7675" />} label="Terms" />
//                                                 <MenuLink icon={<ShieldCheck size={20} color="#55EFC4" />} label="Privacy" />
//                                                 <MenuLink icon={<Info size={20} color="#6C5CE7" />} label="Help" />

//                                                 <div style={{ height: "4px", background: "#F0F4FF", margin: "10px", borderRadius: "10px" }}></div>

//                                                 <motion.button
//                                                     whileHover={{ x: 10, backgroundColor: "#FFF0F0", borderColor: "#FFD2D2" }}
//                                                     onClick={() => { logout(); setShowDropdown(false); router.push("/login"); }}
//                                                     style={{
//                                                         width: "100%", padding: "12px 20px", textAlign: "left", fontSize: 15,
//                                                         fontWeight: 900, color: "#FF6B6B", background: "transparent", borderRadius: "20px",
//                                                         display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
//                                                         border: "2px solid transparent", outline: "none", transition: "all 0.2s"
//                                                     }}
//                                                 >
//                                                     <LogOut size={20} /> Sign Out
//                                                 </motion.button>
//                                             </motion.div>
//                                         )}
//                                     </AnimatePresence>
//                                 </>
//                             ) : (
//                                 <motion.button
//                                     whileHover={{ scale: 1.08, rotate: 3 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={() => router.push('/login')}
//                                     style={{
//                                         background: "#FFEAA7", color: "#D6A317", border: "6px solid white", padding: "12px 30px",
//                                         borderRadius: "50px", fontSize: "18px", fontWeight: 900, cursor: "pointer",
//                                         boxShadow: "0 10px 0 0 #F9CA24, 0 15px 25px rgba(249, 202, 36, 0.4)",
//                                         outline: "none", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginTop: "-5px"
//                                     }}
//                                 >
//                                     Log In ✨
//                                 </motion.button>
//                             )}
//                         </div>
//                     </div>
//                 </header>

//                 {/* DYNAMIC GRID RENDERING BASED ON ACTIVE TAB */}
//                 <div style={{ padding: "0 50px", display: "grid", gridTemplateColumns: activeNav === 'animations' ? "repeat(auto-fill, minmax(320px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 40 }}>
//                     {filtered.length > 0 ? filtered.map(book => (
//                         <div key={book.PR_ID} className="magic-card" onClick={() => setSelectedBook(book)} style={{ cursor: "pointer" }}>

//                             {/* --- VIEW 1: FLIPBOOKS UI --- */}
//                             {activeNav === "books" && (
//                                 <>
//                                     <div className="image-frame">
//                                         {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
//                                         <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
//                                     </div>
//                                     <h3 style={{ margin: "0 0 10px 0", fontSize: 20, fontWeight: 900, color: "#2D3436", lineHeight: 1.2, height: "48px", overflow: "hidden" }}>{book.PR_NAME}</h3>
//                                     <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
//                                         <a href={book.PR_EBOOK_URL || "#"} target="_blank" rel="noopener noreferrer" className="bouncy-btn" style={{ background: "#F1F2F6", color: "#636E72", opacity: book.PR_EBOOK_URL ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (!book.PR_EBOOK_URL) e.preventDefault(); }}>View 👀</a>
//                                         <button className="bouncy-btn" style={{ background: "#E0DAFF", color: "#6C5CE7" }} onClick={(e) => e.stopPropagation()}>Download ⬇️</button>
//                                     </div>
//                                 </>
//                             )}

//                             {/* --- VIEW 2: ANIMATIONS UI --- */}
//                             {/* --- VIEW 2: ANIMATIONS UI --- */}
//                             {activeNav === "animations" && (
//                                 <>
//                                     <div className="image-frame">
//                                         {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
//                                         <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
//                                     </div>
//                                     <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} - Toon</h3>
//                                     <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
//                                         <button className="bouncy-btn" style={{ background: "#FF6B6B", color: "white", opacity: book.PR_VIDEO_DATA?.length > 0 ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (book.PR_VIDEO_DATA?.length > 0) router.push(`/subjects/video?bookid=${book.PR_ID}`); }}>Watch 🍿</button>

//                                         {/* UPDATED BUTTON HERE */}
//                                         <button
//                                             className="bouncy-btn"
//                                             style={{ background: "#fff7f7ff", color: "#FF6B6B" }}
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 openDownloadModal(book.PR_ID);
//                                                 console.log("bookId", book.PR_ID);

//                                             }}
//                                         >
//                                             Download ⬇️
//                                         </button>
//                                     </div>
//                                 </>
//                             )}

//                             {/* --- VIEW 3: TESTS UI --- */}
//                             {activeNav === "tests" && (
//                                 <>
//                                     <div className="image-frame">
//                                         {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
//                                         <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7", boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}>{book.PR_TYPE || "Book"}</span>
//                                     </div>
//                                     <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} Quiz</h3>
//                                     <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15 }}>
//                                         <a href={book.PR_TG_URL || "#"} target="_blank" rel="noopener noreferrer" className="bouncy-btn" style={{ background: "#00B894", color: "white", opacity: book.PR_TG_URL ? 1 : 0.5 }} onClick={(e) => { e.stopPropagation(); if (!book.PR_TG_URL) e.preventDefault(); }}>Generate ⏱️</a>
//                                         <button className="bouncy-btn" style={{ background: "#fff7f7ff", color: "#FF6B6B" }} onClick={(e) => e.stopPropagation()}>Download ⬇️</button>
//                                     </div>
//                                 </>
//                             )}

//                         </div>
//                     )) : (
//                         <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "white", borderRadius: "40px", border: "4px dashed #E0DAFF" }}>
//                             <div className="floating" style={{ fontSize: 60, marginBottom: 15 }}>🧐</div>
//                             <h2 style={{ fontWeight: 900, color: "#2D3436" }}>No magic found!</h2>
//                         </div>
//                     )}
//                 </div>




//                 {/* DOWNLOAD MODAL */}
//                 <AnimatePresence>
//                     {downloadModalOpen && (
//                         <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
//                             {/* Backdrop Blur */}
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 onClick={() => !isDownloadingAll && setDownloadModalOpen(false)}
//                                 style={{ position: "absolute", inset: 0, background: "rgba(45, 52, 54, 0.4)", backdropFilter: "blur(8px)" }}
//                             />

//                             {/* Modal Card */}
//                             <motion.div
//                                 initial={{ opacity: 0, y: 50, scale: 0.9 }}
//                                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                                 exit={{ opacity: 0, y: 20, scale: 0.9 }}
//                                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                                 style={{
//                                     position: "relative", width: "100%", maxWidth: "500px", background: "white",
//                                     borderRadius: "32px", padding: "30px", border: "6px solid white",
//                                     boxShadow: "0 25px 50px rgba(108, 92, 231, 0.25)", overflow: "hidden",
//                                     display: "flex", flexDirection: "column", maxHeight: "80vh"
//                                 }}
//                             >
//                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px dashed #F0F4FF", paddingBottom: "15px", marginBottom: "20px" }}>
//                                     <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#2D3436" }}>📥 Download Magic</h2>
//                                     {!isDownloadingAll && (
//                                         <button onClick={() => setDownloadModalOpen(false)} style={{ background: "#F1F2F6", border: "none", width: 36, height: 36, borderRadius: "12px", cursor: "pointer", fontWeight: 900, color: "#636E72" }}>✕</button>
//                                     )}
//                                 </div>

//                                 {isFetchingVideos ? (
//                                     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
//                                         <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
//                                         <p style={{ fontWeight: 800, color: "#6C5CE7" }}>Gathering videos...</p>
//                                     </div>
//                                 ) : videoList.length > 0 ? (
//                                     <>
//                                         <div style={{ overflowY: "auto", paddingRight: "10px", flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>

//                                             {videoList.map((vid, index) => {
//                                                 const progress = downloadProgress[vid.PR_ID] || 0;
//                                                 return (
//                                                     <motion.div
//                                                         key={vid.PR_ID}
//                                                         initial={{ opacity: 0, x: -30 }}
//                                                         animate={{ opacity: 1, x: 0 }}
//                                                         transition={{
//                                                             type: "spring",
//                                                             stiffness: 300,
//                                                             damping: 24,
//                                                             delay: index * 0.1 // Staggers each item by 0.1s
//                                                         }}
//                                                         // Added flex and items-center here
//                                                         className="relative flex items-center overflow-hidden rounded-[20px] border-[3px] border-[#E0DAFF] bg-[#F8F9FF] p-[15px]"
//                                                     >
//                                                         {/* Progress Bar Background */}
//                                                         <div
//                                                             className="absolute left-0 top-0 z-0 h-full bg-[#E8FFF7] transition-all duration-300 ease-in-out"
//                                                             style={{ width: `${progress}%` }}
//                                                         />

//                                                         {/* Added w-full here to stretch across the flex parent */}
//                                                         <div className="relative z-10 flex w-full items-center justify-between">
//                                                             {/* Added flex items-center and leading-none to ensure the emoji and text align perfectly */}
//                                                             <p className="m-0 flex max-w-[70%] items-center truncate text-[15px] font-extrabold leading-none text-[#2D3436]">
//                                                                 🎬 <span className="ml-2 truncate">{vid.PR_TITLE || "Animation Video"}</span>
//                                                             </p>

//                                                             {progress > 0 && progress < 100 ? (
//                                                                 <span className="text-[14px] font-black leading-none text-[#00B894]">{progress}%</span>
//                                                             ) : progress === 100 ? (
//                                                                 <span className="text-[14px] font-black leading-none text-[#00B894]">✅ Done</span>
//                                                             ) : (
//                                                                 <span className="text-[14px] font-black leading-none text-[#A29BFE]">Wait</span>
//                                                             )}
//                                                         </div>
//                                                     </motion.div>
//                                                 );
//                                             })}
//                                         </div>

//                                         <motion.button
//                                             whileHover={{ scale: isDownloadingAll ? 1 : 1.03 }}
//                                             whileTap={{ scale: isDownloadingAll ? 1 : 0.97 }}
//                                             onClick={downloadAllVideos}
//                                             disabled={isDownloadingAll}
//                                             style={{
//                                                 background: isDownloadingAll ? "#B2BEC3" : "#6C5CE7", color: "white", border: "4px solid white",
//                                                 padding: "16px", borderRadius: "50px", fontSize: "18px", fontWeight: 900, cursor: isDownloadingAll ? "not-allowed" : "pointer",
//                                                 boxShadow: isDownloadingAll ? "none" : "0 10px 0 0 #5f4ed1, 0 15px 25px rgba(108, 92, 231, 0.4)",
//                                                 outline: "none", width: "100%", transition: "background 0.3s"
//                                             }}
//                                         >
//                                             {isDownloadingAll ? "Downloading Magic... ⏳" : "Download All 🚀"}
//                                         </motion.button>
//                                     </>
//                                 ) : (
//                                     <div style={{ textAlign: "center", padding: "30px 0" }}>
//                                         <span style={{ fontSize: 40 }}>🤷‍♂️</span>
//                                         <p style={{ fontWeight: 800, color: "#2D3436", marginTop: 10 }}>No animations found in this book!</p>
//                                     </div>
//                                 )}
//                             </motion.div>
//                         </div>
//                     )}
//                 </AnimatePresence>


//             </div >






//         </div >
//     );
// }
// "use client";
// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import QrScanner from '@/components/QrScanner';



// export default function ScanPage() {
//     const [scanResult, setScanResult] = useState(null);




//     const bookId = scanResult?.split("/")[scanResult.split("/").length - 1];

//     const qrUrl = "https://apis.tlmate.com/content-api/book-scan-by-qrcode"



//     const fetchbook = async () => {


//         const payload = {
//             CBT_REQUEST_DATA: {
//                 PR_TOKEN: "809e607e-0b71-4f24-b43e-4f3b36dbac63",
//                 PR_APP_KEY: "digigyan",
//                 PR_QR_CODE: bookId
//             }
//         }

//         const res = await fetch(qrUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(payload),
//         });

//         const data = await res.json();
//         console.log(data);

//     }

//     if (scanResult) {
//         fetchbook();
//     }



//     // if (scanResult) {


//     // after this i will get the data  like this

//     // {
//     //     "STATUS": "SUCCESS",
//     //         "MESSAGE": "",
//     //             "PAGE_COUNT": 0,
//     //                 "DATA": {
//     //         "PR_ID": 1758,
//     //             "PR_NAME": "Magic of Science 3 (CL)",
//     //                 "PR_URL": "https://apis.advisorconnect.in/media/book-cover-page/2026-04-06/CL Series TItle _Magic of Science-3.jpg"
//     //     }
//     // }

//     // take the name and url for displaying the book name and Pic

//     // then keep the id to redirect to / subjects / book ? bookid =







//     //     }



//     return (
//         <main className="flex flex-col items-center p-10">
//             <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

//             {!scanResult ? (
//                 <QrScanner onResult={(res) => setScanResult(res)} />
//             ) : (
//                 <div className="text-center">
//                     <p className="bg-green-100 p-4 rounded text-green-800 mb-4">
//                         <strong>Scanned:</strong> {scanResult}
//                     </p>
//                     <button
//                         onClick={() => setScanResult(null)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded"
//                     >
//                         Scan Again
//                     </button>
//                 </div>
//             )}
//         </main>
//     );
// }
















"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [bookData, setBookData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const { syncToken } = useApp();
    const token = syncToken();

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!scanResult) return;

            setIsLoading(true);
            setErrorMsg("");

            try {
                const parts = scanResult.split("/");
                const bookIdFromQr = parts[parts.length - 1];

                const qrUrl = "https://apis.tlmate.com/content-api/book-scan-by-qrcode";
                const payload = {
                    "CBT_REQUEST_DATA": {
                        "PR_TOKEN": token,
                        "PR_APP_KEY": "digigyan",
                        "PR_QR_CODE": bookIdFromQr
                    }
                };

                const res = await fetch(qrUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const json = await res.json();

                if (json.STATUS === "SUCCESS" && json.DATA) {
                    setBookData(json.DATA);
                } else {
                    setErrorMsg(json.MESSAGE || "Whoops! Magic book not found.");
                }
            } catch (error) {
                console.error("API Error:", error);
                setErrorMsg("Network error. The magic connection is lost!");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [scanResult, token]);


    // Animation Variants
    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.9, rotate: -2 },
        visible: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
        exit: { opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }
    };




    const resetScanner = () => {
        setScanResult(null);
        setBookData(null);
        setErrorMsg("");
    };




    return (

        <main className="flex min-h-screen flex-col items-center bg-[#F0F4FF] p-6 pb-20 font-['Nunito',sans-serif] text-[#2D3436]">

            {/* Navigation Bar / Back Button */}
            <div className="w-full max-w-md mb-2 flex justify-start">
                <motion.button
                    whileHover={{ scale: 1.1, x: -10 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-[20px] px-5 py-3 text-sm font-black outline-none transition-all bg-blue-600 border-[4px] border-white text-white shadow-[0_10px_25px_rgba(59,130,246,0.3)]"
                >
                    <span className="text-xl leading-none">⬅️</span> Back
                </motion.button>
            </div>

            {/* Playful Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 mt-2 flex flex-col items-center text-center"
            >
                <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="mb-2 text-6xl drop-shadow-lg"
                >
                    🪄
                </motion.div>
                <h1 className="text-4xl font-black italic tracking-tight text-[#2D3436]">Magic Scanner</h1>
                <p className="mt-2 text-[16px] font-extrabold text-[#6C5CE7]">Point your camera at a book's QR code!</p>
            </motion.div>

            <div className="w-full max-w-md relative flex justify-center">
                <AnimatePresence mode="wait">

                    {/* 1. Show Scanner */}
                    {!scanResult && !isLoading && !errorMsg && (
                        <motion.div
                            key="scanner"
                            variants={cardVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="w-full overflow-hidden rounded-[40px] border-[6px] border-white bg-white p-4 shadow-[0_20px_40px_rgba(108,92,231,0.15)]"
                        >
                            <div className="overflow-hidden rounded-[24px] border-[4px] border-dashed border-[#E0DAFF] bg-[#F8F9FF]">
                                <QrScanner onResult={(res) => setScanResult(res)} />
                            </div>
                            <p className="mt-4 text-center font-extrabold text-[#A29BFE]">Scanning for magic...</p>
                        </motion.div>
                    )}

                    {/* 2. Show Loading State */}
                    {isLoading && (
                        <motion.div
                            key="loading"
                            variants={cardVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="flex w-full flex-col items-center rounded-[40px] border-[6px] border-white bg-white p-10 shadow-[0_20px_40px_rgba(108,92,231,0.15)]"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="text-6xl"
                            >
                                ⏳
                            </motion.div>
                            <h2 className="mt-6 text-2xl font-black text-[#6C5CE7]">Verifying...</h2>
                            <p className="mt-2 font-bold text-[#A29BFE]">Dusting off the pages</p>
                        </motion.div>
                    )}

                    {/* 3. Show Error Message */}
                    {errorMsg && (
                        <motion.div
                            key="error"
                            variants={cardVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="flex w-full flex-col items-center rounded-[40px] border-[6px] border-white bg-[#FFF0F0] p-8 text-center shadow-[0_20px_40px_rgba(255,118,117,0.15)]"
                        >
                            <div className="text-6xl">🙈</div>
                            <h2 className="mt-4 text-2xl font-black text-[#FF7675]">Oh No!</h2>
                            <p className="mb-6 mt-2 font-bold text-[#D63031]">{errorMsg}</p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetScanner}
                                className="flex items-center gap-2 rounded-[20px] bg-[#FF7675] px-8 py-4 text-lg font-black text-white shadow-[0_8px_0_0_#d63031,0_15px_20px_rgba(255,118,117,0.4)] transition-all active:translate-y-[8px] active:shadow-none"
                            >
                                🔄 Try Again
                            </motion.button>
                        </motion.div>
                    )}

                    {/* 4. Show Result Card */}
                    {bookData && !isLoading && !errorMsg && (
                        <motion.div
                            key="success"
                            variants={cardVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="flex w-full flex-col items-center rounded-[40px] border-[6px] border-white bg-white p-6 shadow-[0_25px_50px_rgba(108,92,231,0.2)]"
                        >
                            <div className="relative mb-6 flex h-[280px] w-full items-center justify-center overflow-hidden rounded-[28px] border-[4px] border-dashed border-[#E0DAFF] bg-[#F8F9FF]">
                                {bookData.PR_URL ? (
                                    <img
                                        src={bookData.PR_URL}
                                        alt={bookData.PR_NAME}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
                                    />
                                ) : (
                                    <span className="text-6xl">📖</span>
                                )}
                                <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[#00B894] shadow-md">
                                    ✅ Found
                                </span>
                            </div>

                            <h2 className="mb-6 text-center text-2xl font-black leading-tight text-[#2D3436]">
                                {bookData.PR_NAME}
                            </h2>

                            <div className="flex w-full flex-col gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => router.push(`/subjects/book?bookid=${bookData.PR_ID}`)}
                                    className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#6C5CE7] px-6 py-4 text-lg font-black text-white shadow-[0_8px_0_0_#5f4ed1,0_15px_20px_rgba(108,92,231,0.4)] outline-none transition-all active:translate-y-[8px] active:shadow-none"
                                >
                                    Open Book ✨
                                </motion.button>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );

}
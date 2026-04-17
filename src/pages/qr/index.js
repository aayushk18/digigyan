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

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [bookData, setBookData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(""); // Track error messages

    const { syncToken } = useApp();
    const token = syncToken()

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!scanResult) return;

            setIsLoading(true);
            setErrorMsg(""); // Reset errors on new attempt

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
                    // Instead of alert, set error state
                    setErrorMsg(json.MESSAGE || "Book not found or invalid QR code.");
                }
            } catch (error) {
                console.error("API Error:", error);
                setErrorMsg("Network error. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [scanResult, token]); // Added token to dependency array

    const resetScanner = () => {
        setScanResult(null);
        setBookData(null);
        setErrorMsg("");
    };

    return (
        <main className="flex flex-col items-center p-10 min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">QR Code Scanner</h1>

            {/* 1. Show Scanner if no data and no error */}
            {!scanResult && !isLoading && !errorMsg && (
                <div className="w-full max-w-md border-4 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                    <QrScanner onResult={(res) => setScanResult(res)} />
                </div>
            )}

            {/* 2. Show Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center mt-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Verifying book...</p>
                </div>
            )}

            {/* 3. Show Error Message instead of alert */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-sm">
                    <p className="mb-4 font-semibold">{errorMsg}</p>
                    <button
                        onClick={resetScanner}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* 4. Show Result Card */}
            {bookData && !isLoading && !errorMsg && (
                <div className="bg-white shadow-xl rounded-xl p-6 flex flex-col items-center w-full max-w-sm border border-gray-100">
                    <img
                        src={bookData.PR_URL}
                        alt={bookData.PR_NAME}
                        className="w-48 h-64 object-cover rounded-md shadow-md mb-4"
                        // Fallback if image fails to load
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
                    />
                    <h2 className="text-xl font-bold text-center mb-6 text-gray-900">{bookData.PR_NAME}</h2>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => router.push(`/subjects/book?bookid=${bookData.PR_ID}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
                        >
                            Open Book Details
                        </button>
                        <button
                            onClick={resetScanner}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-lg transition"
                        >
                            Scan Another
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
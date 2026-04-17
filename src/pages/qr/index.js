// "use client";
// import { useState } from 'react';
// import dynamic from 'next/dynamic';
// import QrScanner from '@/components/QrScanner';



// export default function ScanPage() {
//     const [scanResult, setScanResult] = useState(null);



//     // if (scanResult) {

//     //     const bookId = scanResult.split("/")[scanResult.split("/").length - 1];

//     //     const qrUrl = "https://apis.tlmate.com/content-api/book-scan-by-qrcode"


//     //     const payload = {
//     //         "CBT_REQUEST_DATA": {
//     //             "PR_TOKEN": "809e607e-0b71-4f24-b43e-4f3b36dbac63",
//     //             "PR_APP_KEY": "digigyan",
//     //             "PR_QR_CODE": bookId
//     //         }
//     //     }

//     //     const res = await fetch(qrUrl, {
//     //         method: "POST",
//     //         headers: {
//     //             "Content-Type": "application/json",
//     //         },
//     //         body: JSON.stringify(payload),
//     //     });

//     //     const data = await res.json();
//     //     console.log(data);


//     // after this i will get the data  like this

//     {
//         "STATUS": "SUCCESS",
//             "MESSAGE": "",
//                 "PAGE_COUNT": 0,
//                     "DATA": {
//             "PR_ID": 1758,
//                 "PR_NAME": "Magic of Science 3 (CL)",
//                     "PR_URL": "https://apis.advisorconnect.in/media/book-cover-page/2026-04-06/CL Series TItle _Magic of Science-3.jpg"
//         }
//     }

// take the name and url for displaying the book name and Pic

// then keep the id to redirect to / subjects / book ? bookid =







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
import Image from 'next/image';

// Use dynamic import for the scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [bookData, setBookData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!scanResult) return;

            setIsLoading(true);
            try {
                // Extracting ID: e.g., "https://site.com/123" -> "123"
                const parts = scanResult.split("/");
                const bookIdFromQr = parts[parts.length - 1];

                const qrUrl = "https://apis.tlmate.com/content-api/book-scan-by-qrcode";
                const payload = {
                    "CBT_REQUEST_DATA": {
                        "PR_TOKEN": "809e607e-0b71-4f24-b43e-4f3b36dbac63",
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

                if (json.STATUS === "SUCCESS") {
                    setBookData(json.DATA);
                } else {
                    alert("Book not found or invalid QR");
                    setScanResult(null);
                }
            } catch (error) {
                console.error("API Error:", error);
                alert("Failed to fetch book data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [scanResult]);

    const handleRedirect = () => {
        if (bookData?.PR_ID) {
            router.push(`/subjects/book?bookid=${bookData.PR_ID}`);
        }
    };

    return (
        <main className="flex flex-col items-center p-10 min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">QR Code Scanner</h1>

            {/* 1. Show Scanner if nothing is scanned yet */}
            {!scanResult && !isLoading && (
                <div className="w-full max-w-md border-4 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                    <QrScanner onResult={(res) => setScanResult(res)} />
                </div>
            )}

            {/* 2. Show Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center mt-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Fetching book details...</p>
                </div>
            )}

            {/* 3. Show Result Card */}
            {bookData && !isLoading && (
                <div className="bg-white shadow-xl rounded-xl p-6 flex flex-col items-center w-full max-w-sm">
                    <img
                        src={bookData.PR_URL}
                        alt={bookData.PR_NAME}
                        className="w-48 h-64 object-cover rounded-md shadow-md mb-4"
                    />
                    <h2 className="text-xl font-semibold text-center mb-4">{bookData.PR_NAME}</h2>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleRedirect}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                        >
                            View Book
                        </button>
                        <button
                            onClick={() => { setScanResult(null); setBookData(null); }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                        >
                            Scan New
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
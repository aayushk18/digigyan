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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 truncate">Book Details</h1>
            </div>

            <main className="max-w-4xl mx-auto p-6 lg:p-10">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col md:flex-row">

                    {/* Left: Book Cover & Info */}
                    <div className="w-full md:w-2/5 bg-slate-100 p-8 flex flex-col items-center text-center">
                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6">
                            <img
                                src={bookData.PR_ICON}
                                alt={bookData.PR_NAME}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest mb-2">
                            {bookData.PR_CLASS?.PR_NAME}
                        </span>
                        <h2 className="text-lg font-black text-slate-800 leading-tight">
                            {bookData.PR_NAME}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">{bookData.PR_CATEGORY?.PR_NAME}</p>
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Learning Resources</h3>
                            <p className="text-slate-500 text-sm">Select an option below to start teaching or learning.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {actionButtons.map((btn) => (
                                <button
                                    key={btn.id}
                                    disabled={!btn.url}
                                    onClick={() => {
                                        if (!btn.url) return;
                                        if (btn.url.startsWith('/')) router.push(btn.url);
                                        else window.open(btn.url, '_blank');
                                    }}
                                    className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 group relative border border-transparent 
                    ${btn.url ? `${btn.color} hover:text-white hover:scale-[1.02] shadow-sm hover:shadow-lg` : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'}
                  `}
                                >
                                    <div className="mb-3 transition-transform group-hover:scale-110">
                                        {btn.icon}
                                    </div>
                                    <span className="font-bold text-sm">{btn.label}</span>
                                    {!btn.url && (
                                        <span className="absolute top-2 right-2 text-[8px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                            N/A
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <Info size={18} className="text-amber-600 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed italic">
                                Resources are updated periodically. If an option is grayed out, it means the content is currently being processed for this specific title.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookDetail;
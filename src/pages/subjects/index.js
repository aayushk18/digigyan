'use client'; // Required for hooks in Next.js App Router

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Book, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

const BookList = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Get params using .get()
    const categoryId = searchParams.get('categoryid');
    const classId = searchParams.get('classid');

    const { config } = useApp();

    const PR_APP_KEY = config.PR_APP_KEY;
    const PR_TOKEN = config.PR_TOKEN;

    useEffect(() => {
        const fetchBooks = async () => {
            if (!categoryId || !classId) return;

            setLoading(true);
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/books-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_CLASS_ID: classId,
                            PR_CATEGORY_ID: categoryId,
                            PR_TOKEN,
                            PR_APP_KEY
                        }
                    })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") {
                    setBooks(result.DATA || []);
                }
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [categoryId, classId]);

    const filteredBooks = books.filter(book =>
        book.PR_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()} // Next.js back navigation
                        className="p-2 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Available Books</h1>
                        <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            Cat: {categoryId} • Class: {classId}
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 text-slate-400">
                        <Loader2 className="animate-spin mb-3 text-indigo-600" size={40} />
                        <p className="font-medium">Curating your book collection...</p>
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => (
                            <div
                                key={book.PR_ID}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-slate-200 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={book.PR_URL}
                                        alt={book.PR_NAME}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-indigo-700 shadow-sm border border-indigo-100">
                                            {book.PR_TYPE}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] mb-4 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                                        {book.PR_NAME}
                                    </h3>
                                    <Link href={`/subjects/book?bookid=${book.PR_ID}`} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:shadow-indigo-200">
                                        <Book size={14} />
                                        Open Publication
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No books match your criteria.</p>
                        <button onClick={() => router.back()} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">Go back and try another class</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;
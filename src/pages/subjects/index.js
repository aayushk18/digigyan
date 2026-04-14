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
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", padding: "40px 20px" }}>
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
    
    .book-card { 
      background: white; border-radius: 35px; overflow: hidden;
      box-shadow: 0 15px 35px rgba(108, 92, 231, 0.08); 
      border: 4px solid white; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    
    .book-card:hover { transform: translateY(-10px) rotate(1deg); border-color: #6C5CE733; }

    .image-container {
      aspect-ratio: 3/4; overflow: hidden; background: #E0DAFF;
      position: relative; margin: 12px; border-radius: 25px;
    }

    .type-badge {
      position: absolute; top: 12px; right: 12px;
      background: #FFD93D; color: #2D3436; padding: 5px 12px;
      border-radius: 12px; font-weight: 900; font-size: 10px;
      box-shadow: 0 5px 10px rgba(0,0,0,0.1);
    }

    .open-btn {
      width: 100%; padding: 15px; border-radius: 20px; border: none;
      background: #6C5CE7; color: white; font-weight: 900;
      cursor: pointer; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 8px 20px rgba(108, 92, 231, 0.3);
    }

    .open-btn:hover { background: #5649c0; transform: scale(1.02); }

    .search-pill {
      padding: 12px 25px 12px 45px; border-radius: 50px; border: none;
      width: 100%; font-weight: 700; outline: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05); color: #2D3436;
    }

    .floating { animation: floating 3s ease-in-out infinite; }
    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  `}</style>

            {/* HEADER SECTION */}
            <div style={{ maxWidth: "1200px", margin: "0 auto 40px auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "25px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: "white", border: "none", width: 50, height: 50, borderRadius: "18px", cursor: "pointer", fontSize: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}
                    >
                        ⬅️
                    </button>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2D3436", margin: 0 }}>Available Books 📚</h1>
                        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                            <span style={{ background: "#E0DAFF", color: "#6C5CE7", padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 800 }}>
                                Series: {categoryId}
                            </span>
                            <span style={{ background: "#FFF3C4", color: "#D6A317", padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 800 }}>
                                Class: {classId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SEARCH */}
                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>🔍</span>
                    <input
                        className="search-pill"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}>
                        <div className="floating" style={{ fontSize: 60 }}>📖</div>
                        <p style={{ fontWeight: 900, color: "#6C5CE7", fontSize: 20, marginTop: 20 }}>Curating your collection...</p>
                    </div>
                ) : filteredBooks.length > 0 ? (
                    /* GRID */
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "30px" }}>
                        {filteredBooks.map((book) => (
                            <div key={book.PR_ID} className="book-card">
                                <div className="image-container">
                                    <img
                                        src={book.PR_URL}
                                        alt={book.PR_NAME}
                                        style={{ width: "100%", height: "100%", objectCover: "cover" }}
                                    />
                                    <div className="type-badge">{book.PR_TYPE}</div>
                                </div>

                                <div style={{ padding: "0 20px 25px 20px" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#2D3436", margin: "0 0 20px 0", height: "40px", overflow: "hidden" }}>
                                        {book.PR_NAME}
                                    </h3>

                                    <Link href={`/subjects/book?bookid=${book.PR_ID}`} style={{ textDecoration: 'none' }}>
                                        <button className="open-btn">
                                            <span>📖</span> Open Publication
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div style={{ background: "white", padding: "80px 40px", borderRadius: "40px", textAlign: "center", border: "4px dashed #E0DAFF" }}>
                        <div style={{ fontSize: 60, marginBottom: 20 }}>🧐</div>
                        <h2 style={{ fontWeight: 900, color: "#2D3436" }}>Oops! No books found here.</h2>
                        <p style={{ color: "#636E72", fontWeight: 700 }}>Try searching for something else or check another class!</p>
                        <button
                            onClick={() => router.back()}
                            style={{ background: "transparent", color: "#6C5CE7", border: "none", fontWeight: 900, cursor: "pointer", marginTop: 15, fontSize: 16 }}
                        >
                            ✨ Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;
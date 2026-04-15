// import { useState, useEffect } from "react";

// const books = [
//   { id: 1, title: "Fun with Numbers", subject: "Mathematics", class: "Class 3", board: "CBSE", type: "Textbook", color: "#FF6B6B", emoji: "🔢", author: "R.K. Bansal", pages: 220 },
//   { id: 2, title: "English Grammar Stars", subject: "English", class: "Class 4", board: "CBSE", type: "Workbook", color: "#4ECDC4", emoji: "✏️", author: "Wren & Martin Jr.", pages: 180 },
//   { id: 3, title: "Explore Science!", subject: "Science", class: "Class 5", board: "ICSE", type: "Textbook", color: "#FFD93D", emoji: "🔬", author: "S.K. Agarwal", pages: 260 },
//   { id: 4, title: "Hindi Sagar", subject: "Hindi", class: "Class 3", board: "CBSE", type: "Textbook", color: "#A78BFA", emoji: "📖", author: "Mahesh Sharma", pages: 195 },
//   { id: 5, title: "Social Studies Explorer", subject: "Social Studies", class: "Class 4", board: "ICSE", type: "Textbook", color: "#FB923C", emoji: "🌍", author: "T.R. Gupta", pages: 240 },
//   { id: 6, title: "Maths Magic", subject: "Mathematics", class: "Class 5", board: "CBSE", type: "Workbook", color: "#6BCB77", emoji: "✨", author: "R.D. Sharma Jr.", pages: 150 },
//   { id: 7, title: "Computer Wizards", subject: "Computer", class: "Class 3", board: "CBSE", type: "Textbook", color: "#4D96FF", emoji: "💻", author: "Reena Arora", pages: 140 },
//   { id: 8, title: "Drawing & Art Fun", subject: "Art", class: "Class 4", board: "ICSE", type: "Activity Book", color: "#F472B6", emoji: "🎨", author: "Meera Pillai", pages: 120 },
//   { id: 9, title: "EVS Around Us", subject: "EVS", class: "Class 5", board: "CBSE", type: "Textbook", color: "#FFB319", emoji: "🌿", author: "S.P. Mishra", pages: 200 },
//   { id: 10, title: "English Literature Gems", subject: "English", class: "Class 5", board: "ICSE", type: "Literature", color: "#FF6B6B", emoji: "📚", author: "Leela Nair", pages: 210 },
//   { id: 11, title: "Science Activity Book", subject: "Science", class: "Class 3", board: "CBSE", type: "Activity Book", color: "#2DD4BF", emoji: "🧪", author: "P.K. Joshi", pages: 130 },
//   { id: 12, title: "Hindi Vyakaran", subject: "Hindi", class: "Class 4", board: "ICSE", type: "Workbook", color: "#C084FC", emoji: "🖊️", author: "Asha Gupta", pages: 160 },
// ];

// const subjects = ["All Subjects", "Mathematics", "English", "Science", "Hindi", "Social Studies", "Computer", "Art", "EVS"];
// const classes = ["All Classes", "Class 3", "Class 4", "Class 5"];
// const boards = ["All Boards", "CBSE", "ICSE"];

// const navItems = [
//   { id: "books", label: "Books", emoji: "📚" },
//   { id: "animations", label: "Animations", emoji: "🎬" },
//   { id: "tests", label: "Tests", emoji: "📝" },
//   { id: "assignments", label: "Assignments", emoji: "📋" },
// ];

// export default function DigiGyanPanel() {
//   const [activeNav, setActiveNav] = useState("books");
//   const [filterSubject, setFilterSubject] = useState("All Subjects");
//   const [filterClass, setFilterClass] = useState("All Classes");
//   const [filterBoard, setFilterBoard] = useState("All Boards");
//   const [search, setSearch] = useState("");
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [isSidebarOpen, setSidebarOpen] = useState(false);

//   const filtered = books.filter(b => {
//     return (
//       (filterSubject === "All Subjects" || b.subject === filterSubject) &&
//       (filterClass === "All Classes" || b.class === filterClass) &&
//       (filterBoard === "All Boards" || b.board === filterBoard) &&
//       (search === "" || b.title.toLowerCase().includes(search.toLowerCase()))
//     );
//   });

//   return (
//     <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", color: "#2D3436" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
//         * { box-sizing: border-box; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }

//         .sidebar { 
//           background: #6C5CE7; 
//           width: 240px; 
//           height: 100vh; 
//           position: fixed; 
//           left: 0; 
//           top: 0; 
//           z-index: 1000;
//           display: flex; 
//           flex-direction: column; 
//           padding: 40px 20px;
//         }

//         .nav-btn { 
//           border: none; margin: 5px 0; border-radius: 20px; cursor: pointer;
//           display: flex; align-items: center; gap: 12px; padding: 12px 20px;
//           font-weight: 700; color: #E0DAFF; background: transparent; width: 100%;
//         }
//         .nav-btn.active { background: white; color: #6C5CE7; transform: scale(1.05); }

//         .main-content { margin-left: 240px; min-height: 100vh; }

//         .book-card { 
//           background: white; border-radius: 30px; padding: 15px;
//           box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 4px solid white;
//         }
//         .book-card:hover { transform: translateY(-8px) rotate(1deg); border-color: #6C5CE733; }

//         .filter-select {
//           appearance: none; border: none; padding: 10px 20px; border-radius: 50px;
//           background: white; font-weight: 800; color: #6C5CE7; cursor: pointer;
//           box-shadow: 0 5px 15px rgba(0,0,0,0.05); outline: none;
//         }

//         .mobile-header { display: none; background: #6C5CE7; padding: 15px 20px; color: white; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 999; }

//         .floating { animation: floating 3s ease-in-out infinite; }
//         @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

//         @media (max-width: 1024px) {
//           .sidebar { transform: translateX(${isSidebarOpen ? "0" : "-100%"}); box-shadow: 20px 0 50px rgba(0,0,0,0.2); }
//           .main-content { margin-left: 0; }
//           .mobile-header { display: flex; }
//           .desktop-header-title { display: none; }
//         }

//         @media (max-width: 600px) {
//           .grid-container { grid-template-columns: 1fr !important; padding: 20px !important; }
//           .filter-bar { padding: 0 20px 20px 20px !important; }
//           .search-input { width: 100% !important; }
//           .header-right { display: none !important; }
//         }
//       `}</style>

//       {/* MOBILE HEADER */}
//       <div className="mobile-header">
//         <div style={{ fontSize: 24, fontWeight: 900 }}>DigiGyan 🚀</div>
//         <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "8px 15px", borderRadius: "12px", fontWeight: 900 }}>
//           {isSidebarOpen ? "Close ✕" : "Menu ☰"}
//         </button>
//       </div>

//       {/* SIDEBAR */}
//       <div className="sidebar" onClick={() => { if (window.innerWidth <= 1024) setSidebarOpen(false) }}>
//         <div className="floating" style={{ fontSize: 50, textAlign: "center", marginBottom: 10 }}>🚀</div>
//         <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, textAlign: "center", margin: "0 0 40px 0" }}>DigiGyan</h1>

//         <nav style={{ flex: 1 }}>
//           {navItems.map(item => (
//             <button key={item.id} className={`nav-btn ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
//               <span style={{ fontSize: 20 }}>{item.emoji}</span> {item.label}
//             </button>
//           ))}
//         </nav>

//         <div style={{ background: "rgba(255,255,255,0.1)", padding: 20, borderRadius: 25, textAlign: "center" }}>
//           <p style={{ color: "#E0DAFF", fontSize: 11, fontWeight: 700, margin: "0 0 5px 0" }}>DAILY GOAL</p>
//           <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 5 }}>
//             <div style={{ width: "70%", height: "100%", background: "#FFD93D", borderRadius: 5 }}></div>
//           </div>
//         </div>
//       </div>

//       {/* MAIN PANEL */}
//       <div className="main-content">
//         <header style={{ padding: "30px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
//           <div className="desktop-header-title">
//             <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Hello, Admin Priya! 👋</h2>
//             <p style={{ margin: 0, color: "#636E72", fontWeight: 600 }}>Let's organize some books today!</p>
//           </div>

//           <div style={{ display: "flex", gap: 15, alignItems: "center", width: "100%", maxWidth: "450px" }}>
//             <div style={{ position: "relative", flex: 1 }}>
//               <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
//               <input
//                 className="search-input"
//                 placeholder="Search..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 style={{ padding: "12px 20px 12px 45px", borderRadius: 50, border: "none", width: "100%", fontWeight: 700, boxShadow: "0 10px 20px rgba(0,0,0,0.05)", outline: "none" }}
//               />
//             </div>
//             <div className="header-right" style={{ width: 45, height: 45, borderRadius: 15, background: "#FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👸</div>
//           </div>
//         </header>

//         {/* FILTERS AREA */}
//         <div className="filter-bar" style={{ padding: "0 40px 30px 40px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//           <select className="filter-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
//             {subjects.map(s => <option key={s}>{s}</option>)}
//           </select>
//           <select className="filter-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
//             {classes.map(c => <option key={c}>{c}</option>)}
//           </select>
//           <select className="filter-select" value={filterBoard} onChange={(e) => setFilterBoard(e.target.value)}>
//             {boards.map(b => <option key={b}>{b}</option>)}
//           </select>
//           <button
//             onClick={() => { setFilterSubject("All Subjects"); setFilterClass("All Classes"); setFilterBoard("All Boards"); setSearch("") }}
//             style={{ border: "none", background: "#FFEAA7", color: "#D6A317", padding: "10px 20px", borderRadius: 50, fontWeight: 800, cursor: "pointer" }}
//           >Reset ✨</button>
//         </div>

//         {/* GRID */}
//         <div className="grid-container" style={{ padding: "0 40px 40px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 25 }}>
//           {filtered.map(book => (
//             <div key={book.id} className="book-card" onClick={() => setSelectedBook(book)} style={{ cursor: "pointer" }}>
//               <div style={{ height: 140, background: book.color, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, marginBottom: 12, position: "relative" }}>
//                 <span className="floating">{book.emoji}</span>
//               </div>
//               <h3 style={{ margin: "0 0 5px 0", fontSize: 15, fontWeight: 900 }}>{book.title}</h3>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
//                 <span style={{ fontWeight: 700, color: "#636E72" }}>{book.subject}</span>
//                 <span style={{ fontWeight: 900, color: "#6C5CE7", background: "#E0DAFF", padding: "2px 8px", borderRadius: 5 }}>{book.class}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* MODAL */}
//       {selectedBook && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }} onClick={() => setSelectedBook(null)}>
//           <div style={{ background: "white", width: "100%", maxWidth: 400, borderRadius: 35, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
//             <div style={{ height: 160, background: selectedBook.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>{selectedBook.emoji}</div>
//             <div style={{ padding: 30, textAlign: "center" }}>
//               <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px 0" }}>{selectedBook.title}</h2>
//               <p style={{ color: "#636E72", fontWeight: 700, marginBottom: 20 }}>By {selectedBook.author}</p>
//               <button style={{ width: "100%", background: "#6C5CE7", color: "white", border: "none", padding: "15px", borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(108, 92, 231, 0.3)" }}>Open Library 📖</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import React, { useState, useEffect } from 'react';
// import {
//   Settings,
//   LogOut,
//   User,


//   ChevronDown,



//   ScanLine, FileEdit, FileText, Loader2, BookOpen, Lock

// } from 'lucide-react';

// import Link from 'next/link';
// import DigiGyanTopNav from './panel';
// import DigiGyanNav from '@/components/Navbar';
// import { useApp } from '@/context/AppContext';

// const UserPanel = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const { config, seriesId, classId, series, Class, isLoggedIn } = useApp();
//   const [books, setBooks] = useState([]);
//   const [loadingBooks, setLoadingBooks] = useState(false);

//   const { PR_APP_KEY, PR_TOKEN } = config;

//   useEffect(() => {
//     const fetchBooks = async () => {
//       if (!seriesId || !classId) {
//         setBooks([]);
//         return;
//       }

//       setLoadingBooks(true);
//       try {
//         const response = await fetch('https://apis.tlmate.com/content-api/books-list', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             CBT_REQUEST_DATA: {
//               PR_CLASS_ID: classId.toString(),
//               PR_CATEGORY_ID: seriesId.toString(),
//               PR_TOKEN,
//               PR_APP_KEY
//             }
//           })
//         });
//         const result = await response.json();
//         if (result.STATUS === "SUCCESS") {
//           setBooks(result.DATA || []);
//         } else {
//           setBooks([]);
//         }
//       } catch (error) {
//         console.error("Error fetching books:", error);
//       } finally {
//         setLoadingBooks(false);
//       }
//     };

//     fetchBooks();
//   }, [seriesId, classId, PR_APP_KEY, PR_TOKEN]);

//   return (
//     <div className="min-h-screen bg-[#F0F4FF] flex flex-col font-sans text-slate-800">
//       {/* --- Top Navigation Header --- */}
//       <DigiGyanNav />
//       <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", color: "#2D3436", overflowX: 'hidden' }}>
//         <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');

//         /* Bouncy Float Animation */
//         .floating { animation: floating 3s ease-in-out infinite; }
//         @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

//         /* Staggered Entrance for Cards */
//         .fade-in-up {
//           animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
//           opacity: 0;
//         }

//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(30px) scale(0.9); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }

//         /* Hover Wiggle */
//         .hover-wiggle:hover .icon-target {
//           animation: wiggle 0.5s ease-in-out;
//         }

//         @keyframes wiggle {
//           0%, 100% { transform: rotate(0deg); }
//           25% { transform: rotate(-10deg); }
//           75% { transform: rotate(10deg); }
//         }

//         .action-card {
//           background: white; border-radius: 30px; padding: 24px;
//           box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 4px solid white;
//           transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//         }
//         .action-card:hover { transform: translateY(-12px) scale(1.02); border-color: #6C5CE733; }

//         .book-card {
//           background: white; border-radius: 25px; padding: 16px;
//           box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 4px solid white;
//           transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//         }
//         .book-card:not(.locked):hover { transform: translateY(-8px) rotate(2deg); border-color: #6C5CE744; }

//         .btn-primary {
//           background: #6C5CE7; color: white; border: none; border-radius: 15px;
//           font-weight: 900; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;
//         }
//         .btn-primary:hover { background: #5a4bc8; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(108, 92, 231, 0.4); }
//       `}</style>

//         <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
//           {/* --- Header Section --- */}
//           <div className="mb-12 text-center md:text-left mt-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
//             <h1 className="text-3xl md:text-[44px] font-black text-slate-800 tracking-tight leading-tight">
//               Welcome to <span className="text-[#6C5CE7] inline-block floating">DigiGyan</span> <br className="md:hidden" /> Book Publications 🚀
//             </h1>
//             <p className="text-[#636E72] font-bold text-lg mt-2">Let's make learning awesome today!</p>
//           </div>

//           {/* --- Quick Actions Section --- */}
//           {isLoggedIn && (
//             <section className="mb-16">
//               <h2 className="text-xs font-black text-[#6C5CE7] uppercase tracking-[0.2em] mb-6 px-2 fade-in-up" style={{ animationDelay: '0.2s' }}>Quick Tools 🛠️</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

//                 <div className="action-card group cursor-pointer hover-wiggle fade-in-up" style={{ animationDelay: '0.3s' }}>
//                   <div className="w-16 h-16 bg-blue-100 text-[#4D96FF] rounded-[22px] flex items-center justify-center mb-5 group-hover:bg-[#4D96FF] group-hover:text-white transition-colors duration-300 icon-target">
//                     <ScanLine size={32} />
//                   </div>
//                   <h3 className="text-2xl font-black text-slate-800">Scan Option</h3>
//                   <p className="text-[#636E72] font-bold text-sm mt-2">Quickly scan book covers or QR codes.</p>
//                 </div>

//                 <Link href="/category" className="action-card group no-underline hover-wiggle fade-in-up" style={{ animationDelay: '0.4s' }}>
//                   <div className="w-16 h-16 bg-emerald-100 text-[#2DD4BF] rounded-[22px] flex items-center justify-center mb-5 group-hover:bg-[#2DD4BF] group-hover:text-white transition-colors duration-300 icon-target">
//                     <FileEdit size={32} />
//                   </div>
//                   <h3 className="text-2xl font-black text-slate-800">Manual Entry</h3>
//                   <p className="text-[#636E72] font-bold text-sm mt-2">Input publication data and metadata.</p>
//                 </Link>

//                 <div className="action-card group cursor-pointer hover-wiggle fade-in-up" style={{ animationDelay: '0.5s' }}>
//                   <div className="w-16 h-16 bg-purple-100 text-[#C084FC] rounded-[22px] flex items-center justify-center mb-5 group-hover:bg-[#C084FC] group-hover:text-white transition-colors duration-300 icon-target">
//                     <FileText size={32} />
//                   </div>
//                   <h3 className="text-2xl font-black text-slate-800">Test Generator</h3>
//                   <p className="text-[#636E72] font-bold text-sm mt-2">Generate automated test papers.</p>
//                 </div>
//               </div>
//             </section>
//           )}

//           {/* --- Books Section --- */}
//           <section className="mb-16">
//             <div className="flex items-center justify-between mb-8 fade-in-up" style={{ animationDelay: '0.6s' }}>
//               <h2 className="text-xs font-black text-[#6C5CE7] uppercase tracking-[0.2em] px-2">
//                 {series && Class ? `Library: ${series} — ${Class}` : 'Explore Bookshelf'} 📚
//               </h2>
//             </div>

//             {loadingBooks ? (
//               <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] shadow-sm border-4 border-white fade-in-up">
//                 <Loader2 className="animate-spin text-[#6C5CE7] mb-4" size={48} />
//                 <p className="font-black text-[#6C5CE7] animate-pulse">Magical things are loading...</p>
//               </div>
//             ) : books.length > 0 ? (
//               <>
//                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
//                   {(isLoggedIn ? books : books.slice(0, 6)).map((book, index, arr) => {
//                     const lockedThreshold = Math.min(4, arr.length - 1);
//                     const isLocked = !isLoggedIn && index >= lockedThreshold;

//                     return (
//                       <div
//                         key={book.PR_ID}
//                         className={`book-card flex flex-col fade-in-up ${isLocked ? 'locked' : ''}`}
//                         style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
//                       >
//                         <div className="w-full aspect-[3/4] bg-[#F8FAFF] rounded-[20px] mb-4 overflow-hidden relative border-2 border-[#F0F4FF]">
//                           {isLocked ? (
//                             <div className="absolute inset-0 bg-[#2D3436]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white p-4">
//                               <Lock size={40} className="mb-2 text-[#FFD93D] floating" />
//                               <span className="text-[10px] font-black uppercase tracking-widest text-center">Unlock Premium</span>
//                             </div>
//                           ) : book.PR_URL ? (
//                             <img
//                               src={book.PR_URL}
//                               alt={book.PR_NAME}
//                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-5xl bg-[#E0DAFF]">📖</div>
//                           )}
//                         </div>

//                         <h3 className="text-sm font-black text-slate-800 line-clamp-2 px-1 mb-2 min-h-[40px]">{book.PR_NAME}</h3>

//                         {!isLocked ? (
//                           <Link
//                             href={`/subjects/book?bookid=${book.PR_ID}`}
//                             className="btn-primary w-full py-2.5 text-xs no-underline mt-auto"
//                           >
//                             <BookOpen size={14} /> Open Book
//                           </Link>
//                         ) : (
//                           <div className="w-full py-2.5 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-400 text-center uppercase mt-auto">
//                             Locked
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {!isLoggedIn && (
//                   <div className="mt-16 bg-[#6C5CE7] p-10 rounded-[40px] shadow-2xl text-center max-w-3xl mx-auto relative overflow-hidden fade-in-up" style={{ animationDelay: '0.8s' }}>
//                     <div className="absolute top-[-20px] right-[-20px] text-9xl opacity-10 rotate-12 floating">📚</div>
//                     <div className="relative z-10 flex flex-col items-center">
//                       <div className="w-20 h-20 bg-[#FFD93D] rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg floating">🎁</div>
//                       <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Unlock the Full Library!</h3>
//                       <p className="text-[#E0DAFF] font-bold mb-8 text-lg max-w-lg">
//                         Sign in to access over 100+ interactive books, assignments, and the AI test generator.
//                       </p>
//                       <Link href="/login" className="bg-white text-[#6C5CE7] hover:bg-[#F0F4FF] font-black tracking-wide py-4 px-12 rounded-full shadow-xl transition-all hover:scale-110 flex items-center gap-3 text-lg no-underline active:scale-95">
//                         <Lock size={20} />
//                         Login Now
//                       </Link>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="bg-white border-4 border-dashed border-[#E0DAFF] rounded-[40px] h-72 flex flex-col items-center justify-center p-6 fade-in-up">
//                 <span className="text-7xl mb-4 floating">🧭</span>
//                 <p className="text-slate-400 font-black text-xl">No books found here yet!</p>
//               </div>
//             )}
//           </section>

//           {/* --- Recent Scans Section --- */}
//           {isLoggedIn && (
//             <section className="mb-20 fade-in-up" style={{ animationDelay: '0.9s' }}>
//               <h2 className="text-xs font-black text-[#6C5CE7] uppercase tracking-[0.2em] mb-6 px-2">Recent Scans 📸</h2>
//               <div className="bg-white border-4 border-dashed border-[#F0F4FF] rounded-[35px] h-48 flex flex-col items-center justify-center group overflow-hidden">
//                 <div className="bg-[#F8FAFF] p-4 rounded-full mb-2 group-hover:scale-125 transition-transform duration-500">
//                   <ScanLine size={32} className="text-slate-300" />
//                 </div>
//                 <span className="text-slate-400 font-black italic tracking-widest text-sm uppercase animate-pulse">Coming Soon</span>
//               </div>
//             </section>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default UserPanel;













import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileEdit, FileText, Loader2, BookOpen, Lock,
  Sparkles, Star, Rocket, Ghost, Cloud, Sun, Heart, Clock
} from 'lucide-react';
import Link from 'next/link';
import DigiGyanNav from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/router';

// --- Bouncing Background Object Component ---
const FloatingBlob = ({ color, size, duration, delay, x, y }) => (
  <motion.div
    initial={{ x, y }}
    animate={{
      x: [x, x + 100, x - 50, x],
      y: [y, y - 100, y + 50, y],
      scale: [1, 1.2, 0.9, 1],
      rotate: [0, 90, 180, 360],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      backgroundColor: color,
      filter: 'blur(60px)',
      borderRadius: '50%',
      opacity: 0.4,
      zIndex: 0,
    }}
  />
);

const UserPanel = () => {
  const { config, seriesId, classId, series, Class, isLoggedIn } = useApp();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { PR_APP_KEY, PR_TOKEN } = config;

  // --- Data States ---
  const [activeTab, setActiveTab] = useState('favorite'); // 'all', 'favorite', 'recent'
  const [activeNav, setActiveNav] = useState('books'); // Toggle state: 'books' or 'animations'

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loadingFav, setLoadingFav] = useState(false);

  const [recentBooks, setRecentBooks] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (isLoggedIn === false) {
      router.replace('/login');
      return;
    }
  }, [router.isReady, isLoggedIn]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    hidden: { y: 50, opacity: 0, scale: 0.5 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  // --- API Fetchers ---
  useEffect(() => {
    const fetchBooks = async () => {
      if (!seriesId || !classId) return;
      setLoadingBooks(true);
      try {
        const response = await fetch('https://apis.tlmate.com/content-api/books-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CBT_REQUEST_DATA: {
              PR_CLASS_ID: classId.toString(),
              PR_CATEGORY_ID: seriesId.toString(),
              PR_TOKEN,
              PR_APP_KEY
            }
          })
        });
        const result = await response.json();
        if (result.STATUS === "SUCCESS") setBooks(result.DATA || []);
      } catch (error) { console.error(error); } finally { setLoadingBooks(false); }
    };
    fetchBooks();
  }, [seriesId, classId, PR_APP_KEY, PR_TOKEN]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn || !PR_TOKEN) return;
      setLoadingFav(true);
      try {
        const response = await fetch('https://apis.tlmate.com/content-api/favorite-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CBT_REQUEST_DATA: { PR_TOKEN, PR_CONTENT_TYPE: "book", PR_APP_KEY }
          })
        });
        const result = await response.json();
        if (result.STATUS === "SUCCESS") setFavoriteBooks(result.DATA || []);
      } catch (error) { console.error(error); } finally { setLoadingFav(false); }
    };
    fetchFavorites();
  }, [isLoggedIn, PR_APP_KEY, PR_TOKEN]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!isLoggedIn || !PR_TOKEN) return;
      setLoadingRecent(true);
      try {
        const response = await fetch('https://apis.tlmate.com/content-api/recent-track-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CBT_REQUEST_DATA: { PR_TOKEN, PR_CONTENT_TYPE: "book", PR_APP_KEY }
          })
        });
        const result = await response.json();
        if (result.STATUS === "SUCCESS") setRecentBooks(result.DATA || []);
      } catch (error) { console.error(error); } finally { setLoadingRecent(false); }
    };
    fetchRecent();
  }, [isLoggedIn, PR_APP_KEY, PR_TOKEN]);

  // --- Determine which list to display ---
  let displayBooks = [];
  let isDisplayLoading = false;

  if (activeTab === 'all') {
    displayBooks = books;
    isDisplayLoading = loadingBooks;
  } else if (activeTab === 'favorite') {
    displayBooks = favoriteBooks;
    isDisplayLoading = loadingFav;
  } else if (activeTab === 'recent') {
    displayBooks = recentBooks;
    isDisplayLoading = loadingRecent;
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-['Nunito',_sans-serif] bg-[#F0F4FF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        
        .bg-animated {
          background: linear-gradient(-45deg, #f0f4ff, #e0daff, #ffeaa7, #fab1a0);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Added Classes for Dynamic UI Cards */
        .image-frame {
          width: 100%;
          aspect-ratio: 3/4;
          background: #F0F4FF;
          border-radius: 35px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          border: 4px solid #F0F4FF;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .video-frame {
          width: 100%;
          aspect-ratio: 16/9;
          background: #2D3436;
          border-radius: 25px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play-btn-overlay {
          position: absolute;
          font-size: 40px;
          z-index: 10;
          pointer-events: none;
        }

        .bouncy-btn {
          flex: 1;
          padding: 12px;
          border-radius: 20px;
          font-weight: 900;
          font-size: 12px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .bouncy-btn:active {
          transform: scale(0.9);
        }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 bg-animated -z-10">
        {isMounted && (
          <>
            <FloatingBlob color="#6C5CE7" size={400} duration={20} delay={0} x={-100} y={-100} />
            <FloatingBlob color="#FF7675" size={300} duration={25} delay={2} x={800} y={200} />
            <FloatingBlob color="#55EFC4" size={350} duration={18} delay={5} x={200} y={600} />
            <FloatingBlob color="#FFEAA7" size={250} duration={22} delay={1} x={600} y={-50} />

            <motion.div
              animate={{ x: [-200, 1600] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 opacity-30 text-white"
            >
              <Cloud size={100} fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute top-10 right-20 opacity-20 text-yellow-500"
            >
              <Sun size={120} fill="currentColor" />
            </motion.div>
          </>
        )}
      </div>

      <DigiGyanNav />

      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 text-center md:text-left mt-6 backdrop-blur-md bg-white/30 p-8 rounded-[50px] border border-white/50 shadow-2xl"
        >
          <h1 className="text-4xl md:text-[64px] font-black text-slate-800 tracking-tight leading-tight">
            Hi! Welcome to <br />
            <motion.span
              animate={{
                color: ['#6C5CE7', '#E84393', '#00B894', '#6C5CE7'],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block"
            >
              DigiGyan World!
            </motion.span>
            <motion.span
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block ml-4"
            >
              🌈
            </motion.span>
          </h1>
          <p className="text-slate-700 font-black text-xl mt-4 bg-yellow-300 inline-block px-6 py-2 rounded-full shadow-lg">
            Let's find your magic book! ✨
          </p>
        </motion.div>

        {isLoggedIn && (
          <motion.section
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-xs font-black text-[#6C5CE7] uppercase tracking-[0.5em] mb-8 px-4">Magic Toolbar 🎨</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ActionCard icon={<ScanLine size={40} />} title="Magic Scan" color="bg-[#4834D4]" />
              <Link href="/subjects" className="no-underline">
                <ActionCard icon={<FileEdit size={40} />} title="Manual Select" color="bg-[#00B894]" />
              </Link >
              <Link href="/category" className="no-underline">
                <ActionCard icon={<FileText size={40} />} title="All Content" color="bg-[#E84393]" />
              </Link>
            </div>
          </motion.section>
        )}

        {/* --- BOOK TABS --- */}
        {isLoggedIn && (
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {[
              { id: 'favorite', label: '❤️ My Favorites' },
              { id: 'recent', label: '🕒 Recently Read' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 rounded-[25px] font-black text-lg transition-all border-4 flex items-center gap-2 ${activeTab === tab.id
                  ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-[0_8px_0_0_#4834D4]'
                  : 'bg-white text-slate-500 border-white shadow-[0_8px_0_0_#E0DAFF] hover:-translate-y-1'
                  }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        )}

        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8 px-4">
            <div className="h-1 flex-1 bg-white/40 rounded-full" />
            <h2 className="text-sm font-black text-slate-600 uppercase tracking-widest">
              {activeTab === 'all' && ((typeof series === 'object' ? series?.PR_NAME : series) || 'All Books')}
              {activeTab === 'favorite' && 'Your Favorite Collection'}
              {activeTab === 'recent' && 'Jump Back In'}
            </h2>
            <div className="h-1 flex-1 bg-white/40 rounded-full" />
          </div>

          {isDisplayLoading ? (
            <div className="flex flex-col items-center p-20">
              <Loader2 className="text-[#6C5CE7] animate-spin" size={80} />
              <p className="font-black text-2xl text-[#6C5CE7] mt-6">Summoning Books...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab + activeNav} // Forces re-animation when switching tabs or view format
              variants={containerVars}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8"
            >
              {displayBooks.length > 0 ? (
                (isLoggedIn ? displayBooks : displayBooks.slice(0, 6)).map((book, idx) => {
                  const isLocked = !isLoggedIn && idx >= 4;
                  return (
                    <motion.div
                      key={book.PR_ID}
                      variants={itemVars}
                      whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                      className="relative bg-white rounded-[45px] p-5 shadow-[0_15px_0_0_#E0DAFF] border-4 border-white flex flex-col group overflow-hidden"
                    >
                      {/* Favorite Badge Global Overlay */}
                      {book.PR_IS_FAVORITE && (
                        <div className="absolute top-6 right-6 z-20 bg-white p-2 rounded-full shadow-lg">
                          <Heart size={16} className="text-red-500 fill-red-500" />
                        </div>
                      )}

                      {isLocked ? (
                        <>
                          <div className="w-full aspect-[3/4] bg-[#F0F4FF] rounded-[35px] mb-4 overflow-hidden relative border-4 border-[#F0F4FF]">
                            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white p-4">
                              <Lock size={40} className="text-yellow-400 mb-2 floating" />
                              <span className="font-black text-[10px] tracking-widest uppercase text-yellow-400">Locked!</span>
                            </div>
                          </div>
                          <h3 className="text-base font-black text-slate-800 line-clamp-2 mb-4 leading-tight min-h-[48px] px-1 uppercase tracking-tight">
                            {book.PR_NAME}
                          </h3>
                          <div className="w-full py-6 mt-auto bg-slate-100 rounded-[25px] text-slate-300 font-black text-xs text-center uppercase tracking-widest border-2 border-dashed border-slate-200">
                            No Access 🛑
                          </div>
                        </>
                      ) : (
                        <>
                          {/* --- VIEW 1: FLIPBOOKS UI --- */}
                          {activeNav === "books" && (
                            <>
                              <div className="image-frame">
                                {book.PR_URL ? <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="floating" style={{ fontSize: 60 }}>📖</span>}
                                <span style={{ position: "absolute", top: 10, right: 10, background: "white", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, color: "#6C5CE7" }}>Book</span>
                              </div>
                              <h3 style={{ margin: "0 0 10px 0", fontSize: 20, fontWeight: 900, color: "#2D3436", lineHeight: 1.2, height: "48px", overflow: "hidden" }}>{book.PR_NAME}</h3>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: "auto" }}>
                                <button className="bouncy-btn" style={{ background: "#F1F2F6", color: "#636E72" }} onClick={(e) => { e.preventDefault(); router.push(`/subjects/book?bookid=${book.PR_ID}`); }}>View 👀</button>
                                <button className="bouncy-btn" style={{ background: "#E0DAFF", color: "#6C5CE7" }} onClick={(e) => { e.preventDefault(); if (book.PR_EBOOK_URL) window.open(book.PR_EBOOK_URL, '_blank'); }}>Download ⬇️</button>
                              </div>
                            </>
                          )}

                          {/* --- VIEW 2: ANIMATIONS UI --- */}
                          {activeNav === "animations" && (
                            <Link href={`/subjects/video?bookid=${book.PR_ID}`} className="no-underline flex flex-col h-full">
                              <div className="video-frame">
                                {book.PR_URL && <img src={book.PR_URL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />}
                                <div className="play-btn-overlay">▶️</div>
                                <span style={{ position: "absolute", top: 10, left: 10, background: "#FF6B6B", padding: "4px 10px", borderRadius: 10, fontSize: 10, fontWeight: 900, color: "white" }}>HD Video</span>
                              </div>
                              <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 900, color: "#2D3436", lineHeight: 1.2 }}>{book.PR_NAME} - Toon</h3>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: "auto" }}>
                                <button className="bouncy-btn" style={{ background: "#FF6B6B", color: "white", width: "100%" }} onClick={(e) => e.stopPropagation()}>Watch Now 🍿</button>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center">
                  <Ghost size={60} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-black text-slate-400">No content found in this dimension.</p>
                </div>
              )}
            </motion.div>
          )}
        </section>

        {!isLoggedIn && (
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            whileInView={{ scale: 1, y: 0 }}
            className="mt-32 p-12 rounded-[70px] bg-[#6C5CE7] text-white text-center shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col items-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl mb-6">🛸</motion.div>
              <h3 className="text-4xl md:text-5xl font-black mb-6">Wanna see more <br /> magic?</h3>
              <Link href="/login" className="no-underline">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="bg-[#FFEAA7] text-[#6C5CE7] px-12 py-5 rounded-[30px] font-black text-2xl shadow-[0_10px_0_0_#F9CA24]"
                >
                  SIGN IN! 🚀
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      {/* --- FIXED TOGGLE SWITCH --- */}
      <div className="fixed bottom-6 right-6 z-50 bg-white/40 backdrop-blur-2xl p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 flex items-center gap-1">
        <button
          onClick={() => setActiveNav('books')}
          className={`px-4 py-2 rounded-full font-extrabold text-xs tracking-wide transition-all duration-300 flex items-center gap-1.5 ${activeNav === 'books'
              ? 'bg-[#6C5CE7] text-white shadow-[0_2px_10px_rgba(108,92,231,0.4)]'
              : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
        >
          <span className="text-sm">📚</span> Books
        </button>
        <button
          onClick={() => setActiveNav('animations')}
          className={`px-4 py-2 rounded-full font-extrabold text-xs tracking-wide transition-all duration-300 flex items-center gap-1.5 ${activeNav === 'animations'
              ? 'bg-[#FF6B6B] text-white shadow-[0_2px_10px_rgba(255,107,107,0.4)]'
              : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
        >
          <span className="text-sm">🍿</span> Animations
        </button>
      </div>

    </div>
  );
};

const ActionCard = ({ icon, title, color }) => (
  <motion.div
    variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white p-8 rounded-[50px] shadow-[0_15px_0_0_#E0DAFF] border-4 border-white flex flex-col items-center group cursor-pointer"
  >
    <div className={`w-20 h-20 ${color} text-white rounded-[30px] flex items-center justify-center mb-4 shadow-xl group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <span className="font-black text-2xl text-slate-800">{title}</span>
  </motion.div>
);

export default UserPanel;
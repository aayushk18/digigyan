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



import React, { useState, useEffect } from 'react';
import {
  Settings,
  LogOut,
  User,
  ScanLine,
  FileEdit,
  FileText,
  ChevronDown,
  Loader2,
  BookOpen,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import DigiGyanTopNav from './panel';
import DigiGyanNav from '@/components/Navbar';
import { useApp } from '@/context/AppContext';

const UserPanel = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { config, seriesId, classId, series, Class, isLoggedIn } = useApp();
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const { PR_APP_KEY, PR_TOKEN } = config;

  useEffect(() => {
    const fetchBooks = async () => {
      if (!seriesId || !classId) {
        setBooks([]);
        return;
      }

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
        if (result.STATUS === "SUCCESS") {
          setBooks(result.DATA || []);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [seriesId, classId, PR_APP_KEY, PR_TOKEN]);

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col font-sans text-slate-800">
      {/* --- Top Navigation Header --- */}
      <DigiGyanNav />

      <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center md:text-left mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl md:text-[40px] font-black text-slate-800 tracking-tight leading-tight">
            Welcome to <span className="text-[#6C5CE7]">DigiGyan</span> Book Publications 🚀
          </h1>
        </div>

        {/* --- Quick Actions Section --- */}
        {isLoggedIn && (
          <section className="mb-12">
            <h2 className="text-sm font-black text-[#636E72] uppercase tracking-wider mb-6 px-2">Tools & Actions 🛠️</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Scan Option */}
              <div className="group cursor-pointer bg-white p-6 rounded-[30px] border-4 border-white shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-100 hover:-translate-y-2 hover:rotate-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100/50 text-[#4D96FF] rounded-[20px] flex items-center justify-center mb-4 group-hover:bg-[#4D96FF] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ScanLine size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Scan Option</h3>
                <p className="text-[#636E72] font-semibold text-sm mt-1.5">Quickly scan book covers or QR codes.</p>
              </div>

              {/* Manual Option */}
              <Link href="/category" className="group cursor-pointer bg-white p-6 rounded-[30px] border-4 border-white shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-100 hover:-translate-y-2 hover:-rotate-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100/50 text-[#2DD4BF] rounded-[20px] flex items-center justify-center mb-4 group-hover:bg-[#2DD4BF] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <FileEdit size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Manual Entry</h3>
                <p className="text-[#636E72] font-semibold text-sm mt-1.5">Manually input publication data and metadata.</p>
              </Link>

              {/* TG Option */}
              <div className="group cursor-pointer bg-white p-6 rounded-[30px] border-4 border-white shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-purple-100 hover:-translate-y-2 hover:rotate-1 transition-all duration-300">
                <div className="w-14 h-14 bg-purple-100/50 text-[#C084FC] rounded-[20px] flex items-center justify-center mb-4 group-hover:bg-[#C084FC] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Test Generator</h3>
                <p className="text-[#636E72] font-semibold text-sm mt-1.5">Generate automated test papers for books.</p>
              </div>

            </div>
          </section>
        )}

        {/* --- Books Section --- */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Books {series && Class ? `for ${series} - ${Class}` : ''}
            </h2>
          </div>

          {loadingBooks ? (
            <div className="flex justify-center p-16 bg-white rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-4 border-white">
              <Loader2 className="animate-spin text-[#6C5CE7]" size={40} />
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 xl:gap-8">
                {(isLoggedIn ? books : books.slice(0, 6)).map((book, index, arr) => {
                  const lockedThreshold = Math.min(4, arr.length - 1);
                  const isLocked = !isLoggedIn && index >= lockedThreshold;
                  return (
                    <div key={book.PR_BOOK_ID || book.PR_NAME} className={`bg-white rounded-[30px] p-4 md:p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-4 border-white flex flex-col group ${isLocked ? 'relative overflow-hidden opacity-95 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2 hover:rotate-1 hover:border-[#6C5CE7]/20 transition-all duration-300'}`}>
                      <div className="w-full aspect-[3/4] bg-[#F0F4FF] rounded-[20px] flex items-center justify-center mb-4 overflow-hidden relative border-2 border-transparent">
                        {isLocked ? (
                          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-10 text-white p-4">
                            <Lock size={48} className="mb-3 text-[#E0DAFF] drop-shadow-lg" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#E0DAFF]">Locked</span>
                          </div>
                        ) : book.PR_URL ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={book.PR_URL} alt={book.PR_NAME} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="text-6xl animate-pulse opacity-50">📖</div>
                        )}
                        {!isLocked && <div className="absolute inset-0 bg-gradient-to-t from-[#6C5CE7]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                      </div>
                                <h3 className="text-base font-black text-slate-800 line-clamp-2 px-1 mb-1 leading-tight">{book.PR_NAME}</h3>
                                {!isLocked && (
                                    <div className="flex items-center justify-between px-1 mb-3 mt-1 text-xs">
                                        <span className="font-bold text-[#636E72] line-clamp-1">{book.PR_PUBLISHER || 'DigiGyan'}</span>
                                    </div>
                                )}
                                
                                {!isLocked && (
                                     <div className="w-full mt-auto pt-2">
                                         <Link href={`/subjects/book?bookid=${book.PR_ID}`} className="w-full py-3 bg-[#6C5CE7] tracking-wide text-white rounded-2xl text-xs font-black hover:bg-[#5a4bc8] hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                             <BookOpen size={16} />
                                             Open
                                         </Link>
                                     </div>
                                )}
                    </div>
                  );
                })}
              </div>
              {!isLoggedIn && (
                <div className="mt-16 bg-white/60 p-10 rounded-[40px] border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-center max-w-2xl mx-auto flex flex-col items-center backdrop-blur-sm">
                  <div className="w-16 h-16 bg-[#FFEAA7] text-[#D6A317] rounded-[20px] flex items-center justify-center text-4xl mb-6 shadow-sm hover:rotate-12 transition-transform cursor-pointer">🎁</div>
                  <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Unlock Your Full Potential</h3>
                  <p className="text-[#636E72] font-bold mb-8 text-lg leading-relaxed">
                    Sign in to get unlimited access to our entire library of premium educational resources, interactive tools, and assignments.
                  </p>
                  <Link href="/login" className="bg-[#6C5CE7] text-white hover:bg-[#5a4bc8] font-black tracking-wide py-4 px-12 rounded-full shadow-[0_10px_20px_rgba(108,92,231,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 text-lg">
                    <Lock size={20} />
                    Login to unlock all other books
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border-4 border-dashed border-[#E0DAFF] rounded-[40px] h-64 flex flex-col items-center justify-center p-6 shadow-sm">
              <span className="text-6xl mb-4 opacity-75">🧭</span>
              <p className="text-slate-500 font-black text-xl">No books found in this section.</p>
            </div>
          )}
        </section>

        {/* --- Recent Scans Section --- */}
        {isLoggedIn && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Scans</h2>
            </div>
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl h-64 flex flex-col items-center justify-center">
              <div className="bg-slate-100 p-4 rounded-full mb-3">
                <ScanLine size={32} className="text-slate-400" />
              </div>
              <span className="text-slate-400 font-medium italic text-lg tracking-wide">Coming Soon</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default UserPanel;
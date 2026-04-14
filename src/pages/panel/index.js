import { useState } from "react";
import {
    User,

    LogOut,
    ChevronDown,
    Search,
    Book,
    PlayCircle,

    ClipboardList,
    ShieldCheck,
    Info,
    X,

    Lock,
    Settings,


    FileText,

} from "lucide-react";

import { useApp } from "@/context/AppContext";
import DigiGyanNav from "@/components/Navbar";

const books = [
    { id: 1, title: "Fun with Numbers", subject: "Mathematics", class: "Class 3", board: "CBSE", type: "Textbook", color: "#FF6B6B", emoji: "🔢", author: "R.K. Bansal" },
    { id: 2, title: "English Grammar Stars", subject: "English", class: "Class 4", board: "CBSE", type: "Workbook", color: "#4ECDC4", emoji: "✏️", author: "Wren & Martin Jr." },
    { id: 3, title: "Explore Science!", subject: "Science", class: "Class 5", board: "ICSE", type: "Textbook", color: "#FFD93D", emoji: "🔬", author: "S.K. Agarwal" },
    { id: 4, title: "Hindi Sagar", subject: "Hindi", class: "Class 3", board: "CBSE", type: "Textbook", color: "#A78BFA", emoji: "📖", author: "Mahesh Sharma" },
    { id: 11, title: "Science Activity", subject: "Science", class: "Class 3", board: "CBSE", type: "Activity", color: "#2DD4BF", emoji: "🧪", author: "P.K. Joshi" },
];

const navItems = [
    { id: "books", label: "Books", icon: <Book size={18} /> },
    { id: "animations", label: "Animations", icon: <PlayCircle size={18} />, locked: true },
    { id: "tests", label: "Tests", icon: <FileText size={18} />, locked: true },
    { id: "assignments", label: "Assignments", icon: <ClipboardList size={18} />, locked: true },
];

export default function DigiGyanTopNav() {

    const [activeNav, setActiveNav] = useState("books");
    const [search, setSearch] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { isLoggedIn, user, login, logout } = useApp();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { Class, series } = useApp();


    const handleFinalLogin = (e) => {
        e.preventDefault();
        login(); // Context function
        setShowLoginModal(false); // Close modal
    };

    // Filter books (Simple version for demo)
    const filtered = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowUserDropdown(false);
        setActiveNav("books");
    };

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F8FAFC" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        * { box-sizing: border-box; transition: all 0.2s ease-in-out; }
        
        .top-nav {
          height: 70px; background: white; border-bottom: 1px solid #E2E8F0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; sticky top: 0; z-index: 50;
        }

        .nav-links { display: flex; gap: 10px; }
        .nav-item {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 12px; font-weight: 700; font-size: 14px;
          cursor: pointer; border: none; background: transparent; color: #64748B;
        }
        .nav-item.active { background: #EEF2FF; color: #6366F1; }
        .nav-item.locked { opacity: 0.5; cursor: not-allowed; }

        .user-profile {
          display: flex; align-items: center; gap: 10px; padding: 6px 12px;
          border-radius: 50px; cursor: pointer; border: 1px solid #E2E8F0;
          position: relative;
        }
        .user-profile:hover { background: #F1F5F9; }

        .dropdown-menu {
          position: absolute; top: 50px; right: 0; width: 200px;
          background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #E2E8F0; overflow: hidden; padding: 8px;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border-radius: 8px; font-size: 14px; font-weight: 600; color: #475569;
          cursor: pointer; width: 100%; border: none; background: transparent;
        }
        .dropdown-item:hover { background: #F8FAFC; color: #6366F1; }
      `}</style>


            <DigiGyanNav />


            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                        onClick={() => setShowLoginModal(false)}
                    ></div>

                    {/* Small Modal Card */}
                    <div className="relative w-full max-w-[380px] bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100">

                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <User size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Welcome Back</h2>
                            <p className="text-sm text-slate-500 font-medium">Enter your details to sign in</p>
                        </div>

                        <form className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-semibold"
                                    />
                                </div>
                                <div className="text-right">
                                    <button type="button" className="text-[11px] font-bold text-indigo-600 hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            <button onClick={
                                (e) => {
                                    e.preventDefault();
                                    login()
                                    setShowLoginModal(false)
                                }}

                                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98] mt-2"
                            >
                                Sign In
                            </button>
                        </form>

                        <p className="text-center mt-6 text-xs text-slate-400 font-bold">
                            New here? <span className="text-indigo-600 cursor-pointer hover:underline">Request access</span>
                        </p>
                    </div>
                </div>
            )}


            <main style={{ padding: "40px" }}>
                <div style={{ marginBottom: 30 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1E293B" }}>
                        {isLoggedIn ? "Welcome back, Aakash! 👋" : "Public Library 📖"}
                    </h2>
                    <p style={{ color: "#64748B", fontSize: 14 }}>
                        {isLoggedIn
                            ? "You have full access to your teaching materials and student tests."
                            : "Login to unlock animations, tests, and personal assignments."}
                    </p>
                </div>


                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                    {filtered.map(book => (
                        <div key={book.id} style={{ background: "white", padding: 20, borderRadius: 20, border: "1px solid #E2E8F0" }}>
                            <div style={{ height: 120, background: book.color + "20", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 15 }}>
                                {book.emoji}
                            </div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{book.title}</h3>
                            <p style={{ margin: "4px 0 15px 0", fontSize: 12, color: "#64748B" }}>{book.subject} • {book.class}</p>

                            <button
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                onClick={() => !isLoggedIn && alert("Please login to view book content!")}
                            >
                                {isLoggedIn ? "View Content" : "Login to Read"}
                            </button>
                        </div>
                    ))}


                    {!isLoggedIn && (
                        <div style={{ background: "#F1F5F9", padding: 20, borderRadius: 20, border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
                            <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>15+ More Hidden</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
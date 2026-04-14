import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation'; // For App Router (Next.js 13/14+)
import { useApp } from '@/context/AppContext';

const ManualEntry = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);

    const { config } = useApp();

    const PR_APP_KEY = config.PR_APP_KEY;
    const PR_TOKEN = config.PR_TOKEN;

    // 1. Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN }
                    })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") {
                    setCategories(result.DATA);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // 2. Fetch Classes when Category is Selected
    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        setSelectedClass(null);
        setClasses([]);
        setLoadingClasses(true);

        try {
            const response = await fetch('https://apis.tlmate.com/content-api/classes-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CBT_REQUEST_DATA: {
                        PR_CATEGORY_ID: category.PR_CATEGORY_ID.toString(),
                        PR_TOKEN,
                        PR_APP_KEY
                    }
                })
            });
            const result = await response.json();
            if (result.STATUS === "SUCCESS") {
                setClasses(result.DATA);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoadingClasses(false);
        }
    };




    // Inside your ManualEntry component:
    const router = useRouter();

    const handleContinue = () => {
        if (selectedCategory && selectedClass) {
            // In Next.js, we use router.push()
            router.push(`/subjects?categoryid=${selectedCategory.PR_CATEGORY_ID}&classid=${selectedClass.PR_CLASS_ID}`);
        }
    };

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#F0F4FF", padding: "40px 20px" }}>
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
    
    .setup-card { 
      background: white; border-radius: 35px; padding: 30px;
      box-shadow: 0 15px 35px rgba(108, 92, 231, 0.08); 
      border: 4px solid white; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .option-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 18px 25px; border-radius: 20px; border: 2px solid #F0F4FF;
      background: #F8F9FF; cursor: pointer; transition: all 0.2s ease;
      font-weight: 800; color: #2D3436; margin-bottom: 12px;
    }

    .option-btn:hover { transform: translateX(8px); background: white; border-color: #6C5CE733; }
    
    .option-btn.selected { 
      background: #6C5CE7; color: white; border-color: #6C5CE7;
      box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3);
    }

    .class-pill {
      padding: 15px; border-radius: 20px; border: 2px solid #F0F4FF;
      background: white; font-weight: 800; color: #6C5CE7; cursor: pointer;
      text-align: center; transition: all 0.2s ease;
    }

    .class-pill:hover { transform: scale(1.05); border-color: #6C5CE7; }
    .class-pill.selected { background: #FFD93D; color: #2D3436; border-color: #FFD93D; }

    .step-badge {
      width: 40px; height: 40px; border-radius: 12px; display: flex; 
      align-items: center; justify-content: center; font-weight: 900; font-size: 18px;
    }

    .floating { animation: floating 3s ease-in-out infinite; }
    @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  `}</style>

            {/* HEADER */}
            <div style={{ maxWidth: "1000px", margin: "0 auto 40px auto", display: "flex", alignItems: "center", gap: "20px" }}>
                <button
                    onClick={onBack}
                    style={{ background: "white", border: "none", width: 50, height: 50, borderRadius: "18px", cursor: "pointer", fontSize: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}
                >
                    ⬅️
                </button>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2D3436", margin: 0 }}>Manual Entry Setup 🛠️</h1>
                    <p style={{ margin: 0, color: "#6C5CE7", fontWeight: 700 }}>Step by step, let's add some magic!</p>
                </div>
            </div>

            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>

                {/* STEP 1: SERIES */}
                <div className="setup-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
                        <div className="step-badge" style={{ background: "#E0DAFF", color: "#6C5CE7" }}>1</div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Select Book Series</h2>
                    </div>

                    <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: "10px" }}>
                        {loadingCategories ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#6C5CE7" }}>
                                <div className="floating" style={{ fontSize: 40 }}>🌀</div>
                                <p style={{ fontWeight: 800 }}>Loading series...</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <button
                                    key={cat.PR_CATEGORY_ID}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`option-btn ${selectedCategory?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID ? 'selected' : ''}`}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                                        <span style={{ fontSize: 22 }}>📚</span>
                                        <span>{cat.PR_NAME}</span>
                                    </div>
                                    <span>{selectedCategory?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID ? '✅' : '✨'}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* STEP 2: CLASS */}
                <div className="setup-card" style={{ opacity: !selectedCategory ? 0.6 : 1, pointerEvents: !selectedCategory ? 'none' : 'auto' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
                        <div className="step-badge" style={{ background: "#FFF3C4", color: "#D6A317" }}>2</div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Select Class</h2>
                    </div>

                    {loadingClasses ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#D6A317" }}>
                            <div className="floating" style={{ fontSize: 40 }}>🚀</div>
                            <p style={{ fontWeight: 800 }}>Fetching classes...</p>
                        </div>
                    ) : selectedCategory ? (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
                                {classes.map((cls) => (
                                    <button
                                        key={cls.PR_CLASS_ID}
                                        onClick={() => setSelectedClass(cls)}
                                        className={`class-pill ${selectedClass?.PR_CLASS_ID === cls.PR_CLASS_ID ? 'selected' : ''}`}
                                    >
                                        {cls.PR_NAME}
                                    </button>
                                ))}
                            </div>

                            {selectedClass && (
                                <button
                                    onClick={handleContinue}
                                    style={{
                                        width: "100%", marginTop: 40, background: "#6C5CE7", color: "white",
                                        padding: "20px", borderRadius: "25px", fontSize: 18, fontWeight: 900,
                                        border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(108, 92, 231, 0.4)",
                                        transition: "all 0.3s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    Let's Go with {selectedClass.PR_NAME}! 🚀
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#A29BFE", fontStyle: "italic", fontWeight: 700 }}>
                            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>☝️</div>
                            Pick a series first!
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManualEntry;
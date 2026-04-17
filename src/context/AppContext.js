// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {

//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [user, setUser] = useState(null);
//     const [series, setSeries] = useState('');
//     const [Class, setClass] = useState('');

//     const [classId, setClassId] = useState('');
//     const [seriesId, setSeriesId] = useState('');

//     const [config] = useState({
//         PR_APP_KEY: "digigyan",
//         PR_TOKEN: "02e81bd0-5be0-4694-b117-7870471128ce"
//     });

//     const [userSelection, setUserSelection] = useState({
//         category: null,
//         class: null
//     });

//     // 1. CHECK STORAGE ON INITIAL LOAD
//     useEffect(() => {
//         // We do this inside useEffect so it only runs on the client (browser)
//         const storedUser = localStorage.getItem('digigyan_user');

//         if (storedUser) {
//             try {
//                 const parsedUser = JSON.parse(storedUser);
//                 setUser(parsedUser);
//                 setIsLoggedIn(true);
//             } catch (error) {
//                 console.error("Failed to parse user from local storage", error);
//                 localStorage.removeItem('digigyan_user'); // Clean up bad data
//             }
//         }
//     }, []);

//     // 2. UPDATE LOGIN TO SAVE TO STORAGE
//     const login = (user) => {

//         setIsLoggedIn(true);
//         setUser(user);

//         // Save to browser storage
//         localStorage.setItem('digigyan_user', JSON.stringify(user));
//     };

//     // 3. UPDATE LOGOUT TO CLEAR STORAGE
//     const logout = () => {
//         setIsLoggedIn(false);
//         setUser(null);

//         // Remove from browser storage
//         localStorage.removeItem('digigyan_user');
//         localStorage.removeItem("PR_TOKEN");

//     };

//     return (
//         <AppContext.Provider value={{
//             isLoggedIn, user, login, logout,
//             config, userSelection, setUserSelection,
//             seriesId, setSeriesId, classId, setClassId,
//             series, setSeries, Class, setClass
//         }}>
//             {children}
//         </AppContext.Provider>
//     );
// };

// export const useApp = () => useContext(AppContext);









import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [series, setSeries] = useState('');
    const [Class, setClass] = useState('');

    // Initialize token state
    const [token, setToken] = useState('');

    const [classId, setClassId] = useState('');
    const [seriesId, setSeriesId] = useState('');

    const [userSelection, setUserSelection] = useState({
        category: null,
        class: null
    });

    // Function to clean and set token from storage
    const syncToken = () => {
        if (typeof window !== 'undefined') {
            const rawToken = localStorage.getItem("PR_TOKEN");
            if (rawToken) {
                try {
                    // If it's stored as a JSON string (with quotes), this cleans it
                    // If it's a plain string, we catch the error or handle it
                    const cleanToken = rawToken.startsWith('"') ? JSON.parse(rawToken) : rawToken;
                    setToken(cleanToken);
                    return cleanToken;
                } catch (e) {
                    // Fallback for non-JSON strings
                    setToken(rawToken);
                    return rawToken;
                }
            }
        }
        return "";
    };

    // 1. INITIAL LOAD: Check user and token
    useEffect(() => {
        // Sync User
        const storedUser = localStorage.getItem('digigyan_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsLoggedIn(true);
            } catch (error) {
                localStorage.removeItem('digigyan_user');
            }
        }

        // Sync Token
        syncToken();
    }, []);

    const login = (userData, receivedToken) => {
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem('digigyan_user', JSON.stringify(userData));

        if (receivedToken) {
            // Save exactly as provided
            localStorage.setItem('PR_TOKEN', receivedToken);
            setToken(receivedToken);
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setToken('');
        localStorage.removeItem('digigyan_user');
        localStorage.removeItem("PR_TOKEN");
    };

    // Construct config dynamically based on current state
    const config = {
        PR_APP_KEY: "digigyan",
        PR_TOKEN: token ? token : "02e81bd0-5be0-4694-b117-7870471128ce"
    };

    return (
        <AppContext.Provider value={{
            isLoggedIn, user, login, logout,
            config, token, // Exporting token directly is easier
            userSelection, setUserSelection,
            seriesId, setSeriesId, classId, setClassId,
            series, setSeries, Class, setClass,
            syncToken // Export if you need to refresh it manually
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
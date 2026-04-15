import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [series, setSeries] = useState('');
    const [Class, setClass] = useState('');

    const [classId, setClassId] = useState('');
    const [seriesId, setSeriesId] = useState('');

    const [config] = useState({
        PR_APP_KEY: "digigyan",
        PR_TOKEN: "02e81bd0-5be0-4694-b117-7870471128ce"
    });

    const [userSelection, setUserSelection] = useState({
        category: null,
        class: null
    });

    // 1. CHECK STORAGE ON INITIAL LOAD
    useEffect(() => {
        // We do this inside useEffect so it only runs on the client (browser)
        const storedUser = localStorage.getItem('digigyan_user');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsLoggedIn(true);
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
                localStorage.removeItem('digigyan_user'); // Clean up bad data
            }
        }
    }, []);

    // 2. UPDATE LOGIN TO SAVE TO STORAGE
    const login = () => {
        const userData = { name: "Aakash Jha", initials: "AJ", role: "Admin" };

        setIsLoggedIn(true);
        setUser(userData);

        // Save to browser storage
        localStorage.setItem('digigyan_user', JSON.stringify(userData));
    };

    // 3. UPDATE LOGOUT TO CLEAR STORAGE
    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);

        // Remove from browser storage
        localStorage.removeItem('digigyan_user');
    };

    return (
        <AppContext.Provider value={{
            isLoggedIn, user, login, logout,
            config, userSelection, setUserSelection,
            seriesId, setSeriesId, classId, setClassId,
            series, setSeries, Class, setClass
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
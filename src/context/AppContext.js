import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [series, setSeries] = useState('');
    const [Class, setClass] = useState('');

    const [classId, setClassId] = useState('');
    const [seriesId, setSeriesId] = useState('');



    const login = () => {
        setIsLoggedIn(true);
        setUser({ name: "Aakash Jha", initials: "AJ", role: "Admin" });
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const [config] = useState({
        PR_APP_KEY: "digigyan",
        PR_TOKEN: "02e81bd0-5be0-4694-b117-7870471128ce"
    });


    const [userSelection, setUserSelection] = useState({
        category: null,
        class: null
    });

    return (
        <AppContext.Provider value={{ isLoggedIn, user, login, logout, config, userSelection, setUserSelection, seriesId, setSeriesId, classId, setClassId, series, setSeries, Class, setClass }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
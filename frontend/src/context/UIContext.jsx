import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
    return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
    const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
    const [authDrawerMode, setAuthDrawerMode] = useState('login');

    const openAuthDrawer = (mode = 'login') => {
        setAuthDrawerMode(mode);
        setIsAuthDrawerOpen(true);
    };

    const closeAuthDrawer = () => {
        setIsAuthDrawerOpen(false);
    };

    const value = {
        isAuthDrawerOpen,
        authDrawerMode,
        openAuthDrawer,
        closeAuthDrawer,
        setAuthDrawerMode
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

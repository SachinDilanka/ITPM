import { createContext, useState, useContext } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const clearNotification = () => setNotification(null);

    return (
        <AppContext.Provider value={{ notification, showNotification, clearNotification }}>
            {/* Global Notification Toast */}
            {notification && (
                <div
                    className={`global-toast ${notification.type}`}
                    onClick={clearNotification}
                >
                    <span>{notification.message}</span>
                    <button className="toast-close">×</button>
                </div>
            )}
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

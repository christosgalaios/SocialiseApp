import { createContext, useContext, useState, useCallback } from 'react';

/**
 * MangoContext - App-wide state for the Mango kitten assistant
 * 
 * Controls Mango's pose, visibility, and triggers reactions to user actions
 */

const MangoContext = createContext(null);

export const MangoProvider = ({ children }) => {
    const [pose, setPose] = useState('wave');
    const [isVisible, setIsVisible] = useState(true);
    const [message, setMessage] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [position, setPosition] = useState('bottom-left'); // Default: above Home button
    const [coords, setCoords] = useState({ x: 0, y: 0 }); // Functionally persistent drag coordinates

    // Trigger celebration (e.g., when user joins an event). Optional message shows in bubble.
    const celebrate = useCallback((msg = null) => {
        setPose('celebrate');
        setIsVisible(true);
        if (msg) setMessage(msg);

        setTimeout(() => {
            setPose('wave');
            if (msg) setMessage(null);
        }, 3000);
    }, []);

    // Show curiosity (e.g., during loading or exploration)
    const showCuriosity = useCallback(() => {
        setPose('curious');
        setIsVisible(true);
    }, []);

    // Show loneliness (e.g., empty states)
    const showLonely = useCallback(() => {
        setPose('lonely');
        setIsVisible(true);
    }, []);

    // Wave greeting (e.g., home screen, after login)
    const wave = useCallback(() => {
        setPose('wave');
        setIsVisible(true);
    }, []);

    // Peek from edge (e.g., near Create button)
    const peek = useCallback(() => {
        setPose('peek');
        setIsVisible(true);
    }, []);

    // Sleep (e.g., idle state)
    const sleep = useCallback(() => {
        setPose('sleep');
        setMessage(null);
        setIsVisible(true);
    }, []);

    // Hide Mango
    const hide = useCallback(() => {
        setIsVisible(false);
        setMessage(null);
    }, []);

    // Show Mango with specific settings
    const show = useCallback((options = {}) => {
        if (options.pose) setPose(options.pose);
        if (options.message !== undefined) setMessage(options.message);
        if (options.position) setPosition(options.position);
        setIsVisible(true);
    }, []);

    const value = {
        pose,
        isVisible,
        message,
        position,
        coords,
        // Actions
        celebrate,
        showCuriosity,
        showLonely,
        wave,
        peek,
        sleep,
        hide,
        show,
        setPose,
        setMessage,
        setPosition,
        setCoords,
        setIsVisible,
        // Chat
        isChatOpen,
        hasNotification,
        setIsChatOpen,
        setHasNotification,
        toggleChat: () => {
            setIsChatOpen(prev => {
                if (prev) setPose('wave');
                return !prev;
            });
            setHasNotification(false);
        }
    };

    return (
        <MangoContext.Provider value={value}>
            {children}
        </MangoContext.Provider>
    );
};

export const useMango = () => {
    const context = useContext(MangoContext);
    if (!context) {
        throw new Error('useMango must be used within a MangoProvider');
    }
    return context;
};

export default MangoContext;

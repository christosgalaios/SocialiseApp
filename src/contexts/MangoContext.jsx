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
    const [position, setPosition] = useState('bottom-left'); // Default: above Home button
    const [coords, setCoords] = useState({ x: 0, y: 0 }); // Functionally persistent drag coordinates

    // Trigger celebration (e.g., when user joins an event)
    const celebrate = useCallback((customMessage = null) => {
        setPose('celebrate');
        setMessage(customMessage || "Yay! 🎉");
        setIsVisible(true);

        // Reset after animation
        setTimeout(() => {
            setMessage(null);
            setPose('wave');
        }, 3000);
    }, []);

    // Show curiosity (e.g., during loading or exploration)
    const showCuriosity = useCallback((customMessage = null) => {
        setPose('curious');
        setMessage(customMessage);
        setIsVisible(true);
    }, []);

    // Show loneliness (e.g., empty states)
    const showLonely = useCallback((customMessage = null) => {
        setPose('lonely');
        setMessage(customMessage || "It's quiet here...");
        setIsVisible(true);
    }, []);

    // Wave greeting (e.g., home screen, after login)
    const wave = useCallback((customMessage = null) => {
        setPose('wave');
        setMessage(customMessage);
        setIsVisible(true);

        // Clear message after a bit
        if (customMessage) {
            setTimeout(() => setMessage(null), 4000);
        }
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

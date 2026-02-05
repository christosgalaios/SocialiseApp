import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Mango from '../components/Mango';
import { useMango } from '../contexts/MangoContext';

/**
 * MangoAssistant - Renders Mango wherever needed based on context state
 * 
 * Place this component once in App.jsx and it will show/hide Mango
 * based on the global MangoContext state
 */
const MangoAssistant = () => {
    const { pose, isVisible, message, position } = useMango();

    return (
        <AnimatePresence>
            {isVisible && (
                <Mango
                    pose={pose}
                    message={message}
                    position={position}
                    size={70}
                />
            )}
        </AnimatePresence>
    );
};

export default MangoAssistant;

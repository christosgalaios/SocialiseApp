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
    const { pose, isVisible, message, position, coords, setCoords } = useMango();

    // Determine effective visibility - default to true if we want her to "live" on the screen
    // But allow context to hide her explicitly
    const show = isVisible !== false;

    return (
        <AnimatePresence>
            {show && (
                <Mango
                    pose={pose}
                    message={message}
                    // If we have manual coords, they will override the CSS position class in visual terms
                    // but we still pass the base position for initial placement
                    position={position}
                    size={70}
                    // Pass persistence props
                    initialCoords={coords}
                    onPositionChange={setCoords}
                />
            )}
        </AnimatePresence>
    );
};

export default MangoAssistant;

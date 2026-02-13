import { AnimatePresence } from 'framer-motion';
import Mango from './Mango';
import { useMango } from '../contexts/MangoContext';

/**
 * MangoAssistant - Renders Mango based on context state. Message bubble is rendered inside Mango so it moves with the cat.
 */
const MangoAssistant = () => {
    const { pose, isVisible, message, position, coords, setCoords, setPose } = useMango();
    const show = isVisible !== false;

    return (
        <AnimatePresence>
            {show && (
                <Mango
                    pose={pose}
                    message={message}
                    position={position}
                    size={70}
                    initialCoords={coords}
                    onPositionChange={setCoords}
                    onPoseChange={setPose}
                />
            )}
        </AnimatePresence>
    );
};

export default MangoAssistant;

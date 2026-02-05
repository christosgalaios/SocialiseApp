import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Confetti - Lightweight celebration burst animation
 * Uses CSS-based particles for performance
 */

const PARTICLE_COUNT = 30;
const COLORS = ['#E2725B', '#2D5F5D', '#F4B942', '#E8A090', '#5D8E8C'];

const Particle = ({ index, color, delay }) => {
    const randomX = Math.random() * 200 - 100; // -100 to 100
    const randomY = Math.random() * -300 - 100; // -100 to -400 (upward)
    const randomRotate = Math.random() * 720 - 360;
    const randomScale = 0.5 + Math.random() * 0.5;
    const duration = 1 + Math.random() * 1;

    return (
        <motion.div
            className="absolute w-3 h-3 rounded-sm"
            style={{
                backgroundColor: color,
                left: '50%',
                top: '50%',
            }}
            initial={{
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                opacity: 1
            }}
            animate={{
                x: randomX,
                y: randomY,
                scale: randomScale,
                rotate: randomRotate,
                opacity: 0
            }}
            transition={{
                duration,
                delay: delay + index * 0.02,
                ease: "easeOut"
            }}
        />
    );
};

const Confetti = ({ active = false, onComplete = () => { } }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (active) {
            // Generate particles
            const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
                id: i,
                color: COLORS[i % COLORS.length],
                delay: 0
            }));
            setParticles(newParticles);

            // Cleanup after animation
            const timer = setTimeout(() => {
                setParticles([]);
                onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    return (
        <AnimatePresence>
            {particles.length > 0 && (
                <motion.div
                    className="fixed inset-0 pointer-events-none z-[1000] flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {particles.map((particle) => (
                        <Particle
                            key={particle.id}
                            index={particle.id}
                            color={particle.color}
                            delay={particle.delay}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Confetti;

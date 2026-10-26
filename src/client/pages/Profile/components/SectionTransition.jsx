import React from 'react';
import { motion } from 'framer-motion';

/**
 * SectionTransition provides a smooth ease-in-ease-out side sliding animation
 * for all sub-sections when switching between tabs.
 */
export const SectionTransition = ({ 
    children, 
    direction = 1, 
    className = '' 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 20 }}
            transition={{
                duration: 0.26,
                ease: [0.25, 0.1, 0.25, 1.0] // cubic-bezier ease-in-out
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default SectionTransition;


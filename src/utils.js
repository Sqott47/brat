/**
 * Utility functions for easing and common helpers.
 */

// cubic-bezier(0.215, 0.61, 0.355, 1) - easeOutCubic approximation
// The user requested easeOutCubic. Standard formula: 1 - pow(1 - x, 3)
const easeOutCubic = (x) => {
    return 1 - Math.pow(1 - x, 3);
};

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

module.exports = {
    easeOutCubic,
    formatTime,
};

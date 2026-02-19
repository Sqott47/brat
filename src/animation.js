const { easeOutCubic } = require('./utils');

/**
 * Calculates the state of every character for a given frame.
 * @param {Array<Object>} flatChars Array of character objects { char, x, y }
 * @param {number} frame Current frame index
 * @param {Object} config { fps, charsPerSecond, revealFrames, revealOffsetPx }
 * @returns {Array<{ char: string, opacity: number, xOffset: number, x: number, y: number }>}
 */
const getFrameState = (flatChars, frame, config) => {
    const { fps, charsPerSecond = 60, revealFrames, revealOffsetPx } = config;
    const time = frame / fps;

    // Total characters meant to be visible or animating
    const visibleIndexRaw = time * charsPerSecond;

    const charStates = [];

    for (let i = 0; i < flatChars.length; i++) {
        const charObj = flatChars[i];

        // Start time for this specific character
        const charStartTime = i / charsPerSecond;
        const charStartFrame = charStartTime * fps;

        // How far into the animation is this character?
        // If frame < charStartFrame, it hasn't started appearing.
        // If frame >= charStartFrame, it starts appearing.

        const progress = (frame - charStartFrame) / revealFrames;

        if (progress >= 1) {
            // Fully visible
            charStates.push({ ...charObj, opacity: 1, xOffset: 0 });
        } else if (progress > 0) {
            // Animating
            const eased = easeOutCubic(progress);
            charStates.push({
                ...charObj,
                opacity: eased,
                xOffset: revealOffsetPx * (1 - eased)
            });
        } else {
            // Not visible yet
            // We can skip pushing it, or push with opacity 0 if needed for some reason.
            // Renderer skips if not present.
        }
    }

    return charStates;
};

const getTotalDuration = (totalChars, config) => {
    const { charsPerSecond = 60, endHold } = config;
    const appearTime = totalChars / charsPerSecond;
    return appearTime + endHold;
};

module.exports = {
    getFrameState,
    getTotalDuration
};

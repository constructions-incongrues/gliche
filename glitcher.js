import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { GifReader, GifWriter } from 'omggif';
import { Buffer } from 'node:buffer';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PIXELS = 1000 * 1000; // 1MP
const MAX_GIF_FRAMES = 30;

function createRng(seed) {
    if (seed === undefined || seed === null || seed === '') {
        return Math.random;
    }
    // Simple hash to get initial state from string/number
    let s = 123456;
    const str = seed.toString();
    for (let i = 0; i < str.length; i++) {
        s = Math.imul(31, s) + str.charCodeAt(i) | 0;
    }

    // Mulberry32
    return function () {
        s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

/**
 * Glitches a buffer by manipulating pixel data.
 * @param {Uint8Array} buffer - Input buffer
 * @param {string} contentType - Mime type of the image
 * @param {number} amount - Intensity (0-100)
 * @param {string|number} seed - Optional seed
 * @param {string} mode - Glitch mode: 'auto', 'sort', 'shift', 'invert'
 * @returns {Promise<Uint8Array>} - Glitched buffer
 */
export async function glitch(buffer, contentType, amount, seed, mode = 'auto') {
    if (amount <= 0 && mode !== 'rotate') return buffer;

    const rng = createRng(seed);

    // Safety Check: File Size
    if (buffer.length > MAX_FILE_SIZE) {
        console.warn(`File too large (${buffer.length} bytes). Falling back to naive glitch.`);
        return naiveGlitch(buffer, amount, rng);
    }

    const buf = Buffer.from(buffer);

    try {
        if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
            return glitchJpeg(buf, amount, mode, rng);
        } else if (contentType === 'image/png') {
            return await glitchPng(buf, amount, mode, rng);
        } else if (contentType === 'image/gif') {
            return glitchGif(buf, amount, mode, rng);
        } else {
            return naiveGlitch(buffer, amount, rng);
        }
    } catch (e) {
        console.error("Glitch failed, falling back to naive:", e);
        return naiveGlitch(buffer, amount, rng);
    }
}

function glitchJpeg(buffer, amount, mode, rng) {
    let raw = jpeg.decode(buffer, { useTArray: true });

    // Safety Check: Dimensions
    if (raw.width * raw.height > MAX_PIXELS) {
        console.warn(`JPEG too large (${raw.width}x${raw.height}). Falling back to naive glitch.`);
        return naiveGlitch(buffer, amount, rng);
    }

    if (mode === 'auto' || mode === 'rotate') {
        if (rng() > 0.5 || mode === 'rotate') {
            const steps = Math.floor(rng() * 3) + 1;
            const rotated = rotate(raw.data, raw.width, raw.height, steps);
            raw.data = rotated.data;
            raw.width = rotated.width;
            raw.height = rotated.height;
        }
    }

    manipulatePixels(raw.data, raw.width, raw.height, amount, mode, rng);
    const newJpeg = jpeg.encode(raw, 50 + rng() * 50);
    return new Uint8Array(newJpeg.data);
}

function glitchPng(buffer, amount, mode, rng) {
    return new Promise((resolve, reject) => {
        new PNG({ filterType: 4 }).parse(buffer, function (error, data) {
            if (error) {
                reject(error);
                return;
            }
            // Safety Check: Dimensions
            if (data.width * data.height > MAX_PIXELS) {
                console.warn(`PNG too large (${data.width}x${data.height}). Falling back to naive glitch.`);
                resolve(naiveGlitch(buffer, amount, rng));
                return;
            }

            if (mode === 'auto' || mode === 'rotate') {
                if (rng() > 0.5 || mode === 'rotate') {
                    const steps = Math.floor(rng() * 3) + 1;
                    const rotated = rotate(data.data, data.width, data.height, steps);
                    data.data = rotated.data;
                    data.width = rotated.width;
                    data.height = rotated.height;
                }
            }

            manipulatePixels(data.data, data.width, data.height, amount, mode, rng);
            const options = { colorType: 6 };
            const packed = PNG.sync.write(data, options);
            resolve(new Uint8Array(packed));
        });
    });
}

function glitchGif(buffer, amount, mode, rng) {
    try {
        const reader = new GifReader(buffer);
        const width = reader.width;
        const height = reader.height;
        const numFrames = reader.numFrames();

        // Safety Check: Dimensions & Frames
        if (width * height > MAX_PIXELS || numFrames > MAX_GIF_FRAMES) {
            console.warn(`GIF too complex (${width}x${height}, ${numFrames} frames). Falling back to naive glitch.`);
            return naiveGlitch(buffer, amount, rng);
        }

        // Output buffer: allocate enough space
        const outputBuffer = new Uint8Array(buffer.length * 3 + 2 * 1024 * 1024);
        const frameInfo = new Uint8Array(width * height * 4);

        // Random rotation for the whole GIF
        let steps = 0;
        let currentWidth = width;
        let currentHeight = height;
        if (mode === 'auto' || mode === 'rotate') {
            if (rng() > 0.5 || mode === 'rotate') {
                steps = Math.floor(rng() * 3) + 1;
                if (steps % 2 !== 0) {
                    currentWidth = height;
                    currentHeight = width;
                }
            }
        }

        const writer = new GifWriter(outputBuffer, currentWidth, currentHeight, { loop: reader.loopCount() });

        for (let k = 0; k < numFrames; k++) {
            const frame = reader.frameInfo(k);

            // 1. Decode frame to RGBA
            reader.decodeAndBlitFrameRGBA(k, frameInfo);

            // 2. Glitch & Rotate
            let processedFrame = { data: frameInfo, width: width, height: height };
            if (steps > 0) {
                processedFrame = rotate(frameInfo, width, height, steps);
            }

            if (rng() > 0.3) {
                manipulatePixels(processedFrame.data, processedFrame.width, processedFrame.height, amount, mode, rng);
            }

            // 3. Extract Palette
            let palette = [];
            const reversePalette = new Map();

            // Try local palette
            let pOffset = frame.palette_offset;
            let pSize = frame.palette_size;

            // Fallback to Global Palette if local is missing
            if (pOffset === null && reader.global_palette_offset !== undefined) {
                // Note: omggif 'frame.palette_offset' should already point to global if local is missing.
            }

            if (pOffset !== null && pSize > 0) {
                for (let i = 0; i < pSize; i++) {
                    // Check bounds
                    if (pOffset + i * 3 + 2 < buffer.length) {
                        const r = buffer[pOffset + i * 3];
                        const g = buffer[pOffset + i * 3 + 1];
                        const b = buffer[pOffset + i * 3 + 2];
                        const val = (r << 16) | (g << 8) | b;
                        palette.push(val);
                        if (!reversePalette.has(val)) reversePalette.set(val, i);
                    }
                }
            }

            // If still no palette (grayscale or error), generate a fallback grayscale palette
            if (palette.length === 0) {
                for (let i = 0; i < 256; i++) {
                    const c = (i << 16) | (i << 8) | i;
                    palette.push(c);
                    reversePalette.set(c, i);
                }
            }

            const pixels = new Uint8Array(processedFrame.width * processedFrame.height);
            for (let i = 0; i < processedFrame.width * processedFrame.height; i++) {
                const r = processedFrame.data[i * 4];
                const g = processedFrame.data[i * 4 + 1];
                const b = processedFrame.data[i * 4 + 2];
                const key = (r << 16) | (g << 8) | b;
                let idx = reversePalette.get(key);

                if (idx === undefined) {
                    // Find nearest? Random for glitch.
                    idx = Math.floor(rng() * palette.length);
                }
                pixels[i] = idx;
            }

            writer.addFrame(0, 0, processedFrame.width, processedFrame.height, pixels, {
                palette: palette,
                delay: frame.delay,
                disposal: frame.disposal,
                transparent: frame.transparent_index
            });
        }

        return outputBuffer.slice(0, writer.end());
    } catch (e) {
        console.error("GIF Glitch inner failed:", e);
        throw e; // trigger fallback to naive
    }
}

function manipulatePixels(data, width, height, amount, mode, rng) {
    const len = data.length;

    // Auto Mode: Mix of all effects
    const doShift = mode === 'auto' || mode === 'shift';
    const doSort = mode === 'auto' || mode === 'sort';
    const doInvert = mode === 'auto' || mode === 'invert';

    // Effect 1: Random Channel Shift
    if (doShift) {
        const intensity = Math.floor((amount / 100) * 50);
        if (intensity > 0) {
            const offset = Math.floor(rng() * intensity * 4);
            for (let i = 0; i < len - offset; i += 4) {
                if (rng() > 0.5) data[i] = data[i + offset]; // R
                if (rng() > 0.5) data[i + 2] = data[i + offset + 2]; // B
            }
        }
    }

    // Effect 2: Random Pixel sorting / Smearing
    if (doSort) {
        const numChunks = Math.floor(amount / 2);
        for (let n = 0; n < numChunks; n++) {
            const idx = Math.floor(rng() * (len - 1000));
            const chunkLen = Math.floor(rng() * 500) + 10;
            const target = Math.floor(rng() * (len - 1000));

            for (let i = 0; i < chunkLen; i++) {
                if (idx + i < len && target + i < len) {
                    data[target + i] = data[idx + i];
                }
            }
        }
    }

    // Effect 3: Color inversion
    if (doInvert) {
        // In 'invert' mode, invert more often
        const threshold = mode === 'invert' ? 0.05 : 0.1;
        if (amount > 10) {
            for (let i = 0; i < len; i += 4) {
                if (rng() < (amount / 100) * threshold) {
                    data[i] = 255 - data[i];     // R
                    data[i + 1] = 255 - data[i + 1]; // G
                    data[i + 2] = 255 - data[i + 2]; // B
                }
            }
        }
    }

    // Effect 4: Scanline Jitter (Horizontal tearing)
    // Applies if Auto, or if Shift (adds texture)
    if (mode === 'auto' || mode === 'shift' || amount > 60) {
        const numLines = Math.floor(height * (amount / 200));
        for (let n = 0; n < numLines; n++) {
            const y = Math.floor(rng() * height);
            const rowStart = y * width * 4;
            const shift = Math.floor((rng() - 0.5) * (amount * 2)); // Shift left or right

            // Smear/Shift segment
            if (Math.abs(shift) > 0) {
                const lenToCopy = (width - Math.abs(shift)) * 4;
                if (lenToCopy > 0) {
                    // Check bounds
                    if (rowStart + lenToCopy < data.length && rowStart + Math.abs(shift) + lenToCopy < data.length) {
                        const byteShift = shift * 4;
                        const rowEnd = (y + 1) * width * 4;

                        if (byteShift > 0) {
                            data.copyWithin(rowStart + byteShift, rowStart, rowEnd - byteShift);
                        } else {
                            data.copyWithin(rowStart, rowStart - byteShift, rowEnd);
                        }
                    }
                }
            }
        }
    }
}

function naiveGlitch(buffer, amount, rng) {
    const newBuffer = new Uint8Array(buffer);
    const headerSafeZone = 100;
    if (newBuffer.length <= headerSafeZone) return newBuffer;
    const prob = (amount / 100) * 0.05;
    for (let i = headerSafeZone; i < newBuffer.length; i++) {
        if (rng() < prob) {
            newBuffer[i] = Math.floor(rng() * 256);
        }
    }
    return newBuffer;
}

/**
 * Rotates RGBA pixel data in 90-degree increments
 */
function rotate(data, width, height, steps) {
    steps = steps % 4;
    if (steps === 0) return { data, width, height };

    let currentData = data;
    let currentWidth = width;
    let currentHeight = height;

    for (let s = 0; s < steps; s++) {
        const nextWidth = currentHeight;
        const nextHeight = currentWidth;
        const newData = new Uint8Array(currentData.length);

        for (let y = 0; y < currentHeight; y++) {
            for (let x = 0; x < currentWidth; x++) {
                const oldIdx = (y * currentWidth + x) * 4;
                const newX = currentHeight - 1 - y;
                const newY = x;
                const newIdx = (newY * nextWidth + newX) * 4;

                newData[newIdx] = currentData[oldIdx];
                newData[newIdx + 1] = currentData[oldIdx + 1];
                newData[newIdx + 2] = currentData[oldIdx + 2];
                newData[newIdx + 3] = currentData[oldIdx + 3];
            }
        }
        currentData = newData;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
    }

    return { data: currentData, width: currentWidth, height: currentHeight };
}

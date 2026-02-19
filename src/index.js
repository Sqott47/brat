#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs-extra');
const { createCanvas } = require('@napi-rs/canvas');
const presets = require('./presets');
const { renderVideo, renderSegmentToStream, loadFonts } = require('./renderer');
const { spawnFfmpeg } = require('./ffmpeg');

const argv = yargs(hideBin(process.argv))
    .option('text', { type: 'string', describe: 'Text to animate' })
    .option('output', { alias: 'o', type: 'string', describe: 'Output file path', default: 'output.mp4' })
    .option('preset', { alias: 'p', type: 'string', describe: 'Preset name', default: 'green_chroma' })
    .option('batch', { type: 'string', describe: 'Path to batch JSON file' })
    .help()
    .argv;

const run = async () => {
    const fontName = loadFonts(path.join(__dirname, '../assets/fonts/Inter-Medium.ttf'));

    if (argv.batch) {
        const batchPath = path.resolve(argv.batch);
        if (!fs.existsSync(batchPath)) {
            console.error(`Batch file not found: ${batchPath}`);
            process.exit(1);
        }

        const batchData = await fs.readJson(batchPath);
        const { width, height, fps, preset: batchPresetName, segments } = batchData;
        const basePreset = presets[batchPresetName || 'green_chroma'] || presets.green_chroma;

        const config = {
            ...basePreset,
            width: width || 720,
            height: height || 720,
            fps: fps || 30,
            fontBase: fontName
        };

        console.log(`Starting Batch Render: ${segments.length} segments`);

        const ffmpegProcess = spawnFfmpeg(config, argv.output);
        const canvas = createCanvas(config.width, config.height);
        const ctx = canvas.getContext('2d');

        try {
            for (const segment of segments) {
                // Merge segment overrides
                const segmentConfig = { ...config, ...segment };
                await renderSegmentToStream(ctx, canvas, segment.text, segmentConfig, ffmpegProcess.stdin);
            }
            ffmpegProcess.stdin.end();
        } catch (err) {
            console.error("Error during batch render:", err);
            ffmpegProcess.kill();
            process.exit(1);
        }

        await new Promise((resolve, reject) => {
            ffmpegProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`FFmpeg exited with code ${code}`));
            });
        });
        console.log("Batch render complete.");

    } else {
        if (!argv.text) {
            console.error("Please provide --text or --batch");
            process.exit(1);
        }

        const config = {
            ...presets[argv.preset] || presets.green_chroma,
            fontBase: fontName,
            width: 720,
            height: 720
        };

        try {
            await renderVideo(argv.text, config, argv.output);
        } catch (e) {
            console.error("Render failed:", e);
            process.exit(1);
        }
    }
};

run().catch(e => console.error(e));

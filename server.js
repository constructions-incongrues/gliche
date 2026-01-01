import express from 'express';
import axios from 'axios';
import { glitch } from './glitcher.js';
import { html } from './frontend.js';
import { Buffer } from 'node:buffer';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve Frontend
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// JSON API
app.get('/glitch', async (req, res) => {
    const { url, amount, seed, mode } = req.query;

    if (!url) {
        return res.status(400).send('Missing "url" query parameter');
    }

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const contentType = response.headers['content-type'];
        const inputBuffer = Buffer.from(response.data);

        // Parse amount (0-100), default to 10
        const glitchAmount = amount ? parseInt(amount, 10) : 10;
        const glitchMode = mode || 'auto';

        const glitchedBuffer = await glitch(inputBuffer, contentType, glitchAmount, seed, glitchMode);

        res.set('Content-Type', contentType);
        res.send(glitchedBuffer);

    } catch (error) {
        console.error('Error fetching or processing image:', error.message);
        res.status(500).send(`Error processing image: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

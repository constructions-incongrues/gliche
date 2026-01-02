const sampleImages = [
    'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
    'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif',
    'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg'
];

export const getHtml = (params = {}) => {
    const title = params.title || 'Gliche - Digital Image Glitcher';
    const description = params.description || 'Professional, serverless API and Web App for applying digital glitch effects to images and animated GIFs.';
    const imageUrl = params.imageUrl || 'https://gliche.constructions-incongrues.net/glitch?url=https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png&amount=50&mode=auto';
    const siteUrl = params.siteUrl || 'https://gliche.constructions-incongrues.net/';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>\${title}</title>
    <meta name="title" content="\${title}">
    <meta name="description" content="\${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="\${siteUrl}">
    <meta property="og:title" content="\${title}">
    <meta property="og:description" content="\${description}">
    <meta property="og:image" content="\${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="\${siteUrl}">
    <meta property="twitter:title" content="\${title}">
    <meta property="twitter:description" content="\${description}">
    <meta property="twitter:image" content="\${imageUrl}">

    <style>
        :root {
            --bg: #0a0a0a;
            --text: #f0f0f0;
            --primary: #00ff41; 
            --secondary: #ff00ff;
            --accent: #00e5ff; 
        }
        
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        h1 {
            font-size: 3rem;
            text-transform: uppercase;
            text-shadow: 2px 2px var(--secondary), -2px -2px var(--primary);
            animation: glitch 1s infinite alternate;
            margin-bottom: 30px;
            text-align: center;
        }

        .container {
            width: 100%;
            max-width: 800px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .controls {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border: 1px solid var(--primary);
            box-shadow: 0 0 10px var(--primary);
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .input-group {
            display: flex;
            gap: 10px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            color: var(--accent);
            font-weight: bold;
        }

        input[type="text"], select {
            width: 100%;
            padding: 10px;
            background: #000;
            border: 1px solid var(--text);
            color: var(--primary);
            font-family: inherit;
            box-sizing: border-box;
            font-size: 1rem;
        }
        
        /* Mobile adjust */
        @media (max-width: 600px) {
            .input-group { flex-direction: column; }
            .row { flex-direction: column !important; }
        }

        .row {
            display: flex;
            gap: 20px;
        }

        input[type="range"] {
            width: 100%;
            accent-color: var(--secondary);
        }

        .actions {
            display: flex;
            gap: 10px;
        }

        button {
            background: var(--primary);
            color: #000;
            border: none;
            padding: 15px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.1s;
            flex: 1;
        }

        button.icon-btn {
            flex: 0 0 50px;
            font-size: 1.5rem;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        button.secondary {
            background: transparent;
            border: 1px solid var(--secondary);
            color: var(--secondary);
        }

        button:hover {
            background: var(--text);
            box-shadow: 0 0 20px var(--text);
            color: #000;
        }
        
        button.secondary:hover {
            background: var(--secondary);
            color: #000;
            box-shadow: 0 0 20px var(--secondary);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .preview {
            border: 2px dashed var(--secondary);
            min-height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            background: #000;
            overflow: hidden;
        }

        .preview img {
            max-width: 100%;
            height: auto;
            display: block;
        }

        .loading {
            color: var(--primary);
            font-size: 2rem;
            display: none;
        }

        @keyframes glitch {
            0% { text-shadow: 2px 2px var(--secondary), -2px -2px var(--primary); }
            25% { text-shadow: -2px 2px var(--secondary), 2px -2px var(--primary); }
            50% { text-shadow: 2px -2px var(--secondary), -2px 2px var(--primary); }
            75% { text-shadow: -2px -2px var(--secondary), 2px 2px var(--primary); }
            100% { text-shadow: 2px 2px var(--secondary), -2px -2px var(--primary); }
        }
    </style>
</head>
<body>
    <h1>GLICHE</h1>
    
    <div class="container">
        <div class="controls">
            <div>
                <label for="url">IMAGE URL</label>
                <div class="input-group">
                    <input type="text" id="url" placeholder="https://..." value="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png">
                    <button id="randomBtn" class="icon-btn" title="Random Image">🎲</button>
                </div>
            </div>
            
            <div class="row">
                <div style="flex: 1;">
                    <label for="amount">GLITCH AMOUNT: <span id="amountDisplay">20</span></label>
                    <input type="range" id="amount" min="1" max="100" value="20">
                </div>
                <div style="flex: 1;">
                    <label for="mode">MODE</label>
                    <select id="mode">
                        <option value="auto">AUTO (RANDOM)</option>
                        <option value="sort">PIXEL SORT</option>
                        <option value="shift">CHANNEL SHIFT</option>
                        <option value="invert">INVERT</option>
                        <option value="rotate">ROTATE</option>
                    </select>
                </div>
            </div>

             <div>
                <label for="seed">SEED (Optional)</label>
                <input type="text" id="seed" placeholder="Random">
            </div>

            <div class="actions">
                <button id="glitchBtn">/// GLITCH ///</button>
                <button id="downloadBtn" class="secondary" disabled>DOWNLOAD</button>
            </div>
        </div>

        <div class="preview" id="previewContainer">
            <span class="loading" id="loading">PROCESSING...</span>
            <img id="resultImage" src="" alt="" style="display:none">
        </div>
    </div>

    <script>
        const samples = ${JSON.stringify(sampleImages)};
        const urlInput = document.getElementById('url');
        const amountInput = document.getElementById('amount');
        const amountDisplay = document.getElementById('amountDisplay');
        const modeInput = document.getElementById('mode');
        const seedInput = document.getElementById('seed');
        const glitchBtn = document.getElementById('glitchBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const randomBtn = document.getElementById('randomBtn');
        const resultImage = document.getElementById('resultImage');
        const loading = document.getElementById('loading');
        
        let currentBlobUrl = null;

        amountInput.addEventListener('input', () => {
            amountDisplay.innerText = amountInput.value;
        });
        
        randomBtn.addEventListener('click', () => {
            const r = samples[Math.floor(Math.random() * samples.length)];
            urlInput.value = r;
        });

        // Initialize from URL parameters
        const params = new URLSearchParams(window.location.search);
        if (params.has('url')) urlInput.value = params.get('url');
        if (params.has('amount')) {
            amountInput.value = params.get('amount');
            amountDisplay.innerText = params.get('amount');
        }
        if (params.has('mode')) modeInput.value = params.get('mode');
        if (params.has('seed')) seedInput.value = params.get('seed');

        // Auto-glitch if URL is provided
        if (params.has('url')) {
            window.addEventListener('load', () => glitchBtn.click());
        }

        glitchBtn.addEventListener('click', async () => {
            const url = urlInput.value;
            if(!url) return alert('ENTER URL');
            
            const amount = amountInput.value;
            const seed = seedInput.value;
            const mode = modeInput.value;

            // Update URL for shareability
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('url', url);
            newUrl.searchParams.set('amount', amount);
            newUrl.searchParams.set('mode', mode);
            if (seed) newUrl.searchParams.set('seed', seed);
            else newUrl.searchParams.delete('seed');
            window.history.pushState({}, '', newUrl);

            loading.style.display = 'block';
            resultImage.style.display = 'none';
            glitchBtn.disabled = true;
            downloadBtn.disabled = true;
            glitchBtn.innerText = 'CALCULATING...';

            if(currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);

            // Construct API URL
            const apiUrl = \`/glitch?url=\${encodeURIComponent(url)}&amount=\${amount}&mode=\${mode}\${seed ? '&seed='+encodeURIComponent(seed) : ''}\`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Glitch Failed');
                
                const blob = await response.blob();
                currentBlobUrl = URL.createObjectURL(blob);
                
                resultImage.src = currentBlobUrl;
                resultImage.style.display = 'block';
                downloadBtn.disabled = false;
            } catch (e) {
                alert('ERROR: ' + e.message);
            } finally {
                loading.style.display = 'none';
                glitchBtn.disabled = false;
                glitchBtn.innerText = '/// GLITCH ///';
            }
        });

        downloadBtn.addEventListener('click', () => {
            if(!currentBlobUrl) return;
            const a = document.createElement('a');
            a.href = currentBlobUrl;
            a.download = 'glitched_image.png'; // Todo: detect ext
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    </script>
</body>
</html>
    `;
};

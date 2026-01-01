# Gliche 👁️‍🗨️

**Gliche** is a robust, serverless API and Web App for applying digital glitch effects to images and animated GIFs. Built with Node.js and deployed on Cloudflare Workers.

## Features

- **Multi-Format Support**: Glitches JPEGs, PNGs, and Animated GIFs.
- **Glitch Modes**:
  - `auto`: Random mix of effects (Sort, Shift, Invert, Scanlines).
  - `sort`: Pixel sorting/melting effect.
  - `shift`: RGB channel separation.
  - `invert`: Random color inversion.
- **Deterministic**: Pass a `seed` to get reproducible results.
- **Efficient**: Edge caching and automatic resource limiting for large files.
- **Cyberpunk UI**: Built-in interactive frontend.

## Installation (Local Development)

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/constructions-incongrues/gliche.git
    cd gliche
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run locally**:
    ```bash
    node server.js
    # Open http://localhost:3000
    ```
    *Alternatively, use `npx wrangler dev` to simulate the Cloudflare Worker environment.*

## Deployment

Deploy to Cloudflare Workers:
```bash
npx wrangler deploy
```

## API Usage

**Endpoint**: `GET /glitch`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | **Required** | URL of the image/gif to glitch. |
| `amount` | `number` | `10` | Intensity of glitch (0-100). |
| `seed` | `string` | `null` | Seed for deterministic precision. |
| `mode` | `string` | `auto` | Effect mode: `auto`, `sort`, `shift`, `invert`. |

**Example**:
```bash
curl "https://your-worker.workers.dev/glitch?url=...&amount=50&mode=sort" -o glitch.jpg
```

## License

MIT

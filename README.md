# HypeHub Supply (Mock Storefront)

Static demo storefront for **HypeHub Supply** – a youth-focused wholesale concept where "deals meet hype."  
Includes a fully front-end cart + checkout summary mockup and is ready to deploy on **Vercel** using GitHub.

## Pages

- `index.html` – Landing page with hero, feature grid, and featured items.
- `items.html` – Product catalog with size, color, and quantity controls plus Add to Cart.
- `cart.html` – Cart and checkout summary mockup (Buy 2, get 10% off).
- `about.html` – Brand story and concept notes.

## Tech

- Pure HTML, CSS, and vanilla JavaScript.
- Cart stored in `localStorage` under the key `hypehubCart`.
- No backend or real payments – safe for demo/portfolio use.

## Deploying to Vercel via GitHub

1. Create a new GitHub repository and add these files.
2. Push the repo to GitHub.
3. Go to [Vercel](https://vercel.com), import the GitHub repository.
4. Choose **Framework Preset: Other** or **Static** (no build command needed).
5. Set the output directory to the repo root (where `index.html` lives).
6. Deploy – Vercel will host your static site globally.

You can customize styles in `styles.css` and logic in `script.js` as needed.

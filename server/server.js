const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const downloadImage = async (url, filepath) => {
    const response = await axios({ url, method: 'GET', responseType: 'stream', timeout: 10000 });
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

// --- ROUTE 1: FILE UPLOAD ---
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file');
    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(__dirname, 'uploads', 'trans_' + req.file.filename);

    try {
        await axios.post('http://127.0.0.1:8000/process', { input_path: inputPath, output_path: outputPath });
        res.json({ images: [`http://localhost:5000/uploads/trans_${req.file.filename}`] });
    } catch (e) {
        res.status(500).json({ error: "AI Failed" });
    }
});

// --- ROUTE 2: SMART SCRAPER (With Screenshot Fallback) ---
app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;
    const sessionId = Date.now();
    const sessionDir = path.join(__dirname, 'uploads', String(sessionId));
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    let browser;
    try {
        console.log(`Navigating to: ${url}`);
        browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1080'] 
        });
        
        const page = await browser.newPage();
        // Set a large viewport to capture high-quality manga pages
        await page.setViewport({ width: 1280, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // find standard images
        let imageUrls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.startsWith('http'))
                .filter(src => {
                    const el = document.querySelector(`img[src="${src}"]`);
                    return el && el.naturalHeight > 500; 
                });
        });

        // --- SCREENSHOT FALLBACK ---
        // If no images found take SCREENSHOT.
        if (imageUrls.length === 0) {
            console.log("No standard images found. Switching to Screenshot Mode...");
            
            // Wait a second for any animations
            await new Promise(r => setTimeout(r, 2000));
            
            const screenshotPath = path.join(sessionDir, 'page_screenshot.jpg');
            await page.screenshot({ path: screenshotPath, fullPage: false }); // false = viewport only
            
            // Process this single screenshot
            const outPath = path.join(sessionDir, 'trans_screenshot.jpg');
            await axios.post('http://127.0.0.1:8000/process', { 
                input_path: screenshotPath, 
                output_path: outPath 
            });
            
            await browser.close();
            return res.json({ 
                images: [`http://localhost:5000/uploads/${sessionId}/trans_screenshot.jpg`] 
            });
        }

        // Standard processing if images WERE found
        const processLimit = imageUrls.slice(0, 5);
        const resultUrls = [];

        for (let i = 0; i < processLimit.length; i++) {
            const localPath = path.join(sessionDir, `page_${i}.jpg`);
            const outPath = path.join(sessionDir, `trans_${i}.jpg`);
            try {
                await downloadImage(processLimit[i], localPath);
                await axios.post('http://127.0.0.1:8000/process', { input_path: localPath, output_path: outPath });
                resultUrls.push(`http://localhost:5000/uploads/${sessionId}/trans_${i}.jpg`);
            } catch (e) { console.error(`Skipped page ${i}`); }
        }

        await browser.close();
        res.json({ images: resultUrls });

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Scraping failed: " + error.message });
    }
});

app.listen(5000, () => console.log("Node Server on Port 5000"));
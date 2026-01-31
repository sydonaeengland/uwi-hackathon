import express from 'express';
import multer from 'multer';
import { scanText, scanUrl, extractTextFromImage } from '../utils/scanners.js';
import { db } from '../config/database.js';
import { reports } from '../../schema.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/scan/text', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await scanText(text);
    console.log(result,"yea")
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scan/url', async (req, res) => {
  try {
    const { url } = req.body;
    const result = scanUrl(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scan/image', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const extractedText = await extractTextFromImage(imagePath);
    const result = scanText(extractedText);
    result.extractedText = extractedText; // Include for debugging
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-scams', async (req, res) => {
  try {
    // Mock data for top scams - in real app, query DB
    const topScams = [
      { category: 'Scholarship scams', count: 45 },
      { category: 'Job/internship scams', count: 32 },
      { category: 'Account verification scams', count: 28 },
      { category: 'Delivery scams', count: 15 },
    ];
    res.json(topScams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/report', async (req, res) => {
  try {
    const { type, content, riskScore } = req.body;
    await db.insert(reports).values({ type, content, riskScore });
    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/endpoints', (req, res) => {
  const endpoints = [
    { method: 'POST', path: '/scan/text', description: 'Scan pasted text for scams' },
    { method: 'POST', path: '/scan/url', description: 'Scan URL for suspicious patterns' },
    { method: 'POST', path: '/scan/image', description: 'Upload and scan image for scams' },
    { method: 'GET', path: '/top-scams', description: 'Get top scam categories' },
    { method: 'POST', path: '/report', description: 'Submit a scam report' },
    { method: 'GET', path: '/api/auth/google/login', description: 'Initiate Google OAuth login' },
    { method: 'GET', path: '/api/auth/google/callback', description: 'Handle OAuth callback' },
    { method: 'GET', path: '/api/emails', description: 'Fetch user emails (requires auth)' },
    { method: 'POST', path: '/api/scan/email', description: 'Scan specific email (requires auth)' },
    { method: 'GET', path: '/api/demo/emails', description: 'Get demo email list' },
    { method: 'POST', path: '/api/demo/scan/email', description: 'Scan demo email' },
  ];
  res.json(endpoints);
});

export default router;
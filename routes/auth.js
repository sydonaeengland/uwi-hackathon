import express from 'express';
import { oauth2Client } from '../config/google.js';

const router = express.Router();

// Google Integration
const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

router.get('/auth/google/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.accessToken = tokens.access_token;
    res.redirect('http://localhost:3001/inbox'); // Assuming frontend on 3001
  } catch (error) {
    console.log(error);
    res.status(500).send('Error acquiring token');
  }
});

export default router;
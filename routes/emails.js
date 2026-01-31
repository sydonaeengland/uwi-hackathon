import express from 'express';
import { google } from 'googleapis';
import { scanText } from '../utils/scanners.js';

const router = express.Router();

router.get('/emails', async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.session.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(messages.map(async (msg) => {
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = msgData.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const snippet = msgData.data.snippet || '';

      // Extract body (simplified)
      let body = '';
      if (msgData.data.payload.parts) {
        const textPart = msgData.data.payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (msgData.data.payload.body.data) {
        body = Buffer.from(msgData.data.payload.body.data, 'base64').toString();
      }

      return {
        id: msg.id,
        sender: from,
        subject,
        snippet,
        receivedDate: date,
        body,
      };
    }));

    // Add risk badges
    const emailsWithRisk = await Promise.all(emails.map(async (email) => {
      const scanResult = await scanText(email.subject + ' ' + email.snippet);
      return { ...email, riskLevel: scanResult.riskLevel };
    }));

    res.json(emailsWithRisk);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error fetching emails' });
  }
});

router.post('/scan/email', async (req, res) => {
  const { emailId } = req.body;
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.session.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const msgData = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full',
    });

    const headers = msgData.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const snippet = msgData.data.snippet || '';

    let body = '';
    if (msgData.data.payload.parts) {
      const textPart = msgData.data.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (msgData.data.payload.body.data) {
      body = Buffer.from(msgData.data.payload.body.data, 'base64').toString();
    }

    const content = subject + ' ' + snippet + ' ' + body;
    const result = await scanText(content);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error scanning email' });
  }
});

export default router;
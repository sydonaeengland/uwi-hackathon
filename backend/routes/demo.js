import express from 'express';

const router = express.Router();

// Demo Inbox
router.get('/demo/emails', (req, res) => {
  const demoEmails = [
    {
      id: '1',
      sender: 'scholarships@university.edu',
      subject: 'Congratulations! You won a scholarship',
      snippet: 'Claim your $5000 scholarship now!',
      receivedDate: '2023-10-01T10:00:00Z',
      riskLevel: 'High',
    },
    {
      id: '2',
      sender: 'amazon@support.com',
      subject: 'Your package is delayed',
      snippet: 'Click here to track your order.',
      receivedDate: '2023-10-02T11:00:00Z',
      riskLevel: 'Medium',
    },
    // Add more mock emails
  ];
  res.json(demoEmails);
});

router.post('/demo/scan/email', (req, res) => {
  const { emailId } = req.body;
  // Mock scan result
  const result = {
    riskScore: 75,
    riskLevel: 'High',
    redFlags: ['Urgency language', 'Too good to be true offers'],
    explanation: 'This email uses urgent language and promises unrealistic rewards.',
    advice: 'Do not click any links. Verify through official channels.',
  };
  res.json(result);
});

export default router;
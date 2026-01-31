import 'dotenv/config';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Scanning functions
export async function scanText(text) {
  if (openai) {
    try {
      const prompt = `Analyze the following text for potential scam or phishing indicators. Return a JSON object with exactly these keys: riskScore (number 0-100), riskLevel (string: 'Low', 'Medium', or 'High'), redFlags (array of strings describing suspicious elements), explanation (string explaining the analysis), advice (string with recommendations).

Text to analyze: "${text}"`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const result = JSON.parse(response.choices[0].message.content.trim());
      return result;
    } catch (error) {
      console.log('OpenAI error, falling back to rule-based:', error.message);
    }
  }

  // Fallback to rule-based scanning
  let score = 0;
  let flags = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('urgent') || lowerText.includes('immediate')) {
    score += 20;
    flags.push('Urgency language');
  }
  if (lowerText.includes('free money') || lowerText.includes('win prize')) {
    score += 25;
    flags.push('Too good to be true offers');
  }
  if (lowerText.includes('verify account') || lowerText.includes('confirm identity')) {
    score += 15;
    flags.push('Account verification requests');
  }
  if (lowerText.includes('click here') || lowerText.includes('download now')) {
    score += 10;
    flags.push('Suspicious links or attachments');
  }

  let level = score >= 70 ? 'High' : score >= 30 ? 'Medium' : 'Low';
  const explanation = `This message scored ${score} points based on common scam indicators like urgency, unrealistic offers, and suspicious requests.`;
  const advice = 'Do not click links or provide personal information. Verify the sender independently and report to your university IT department.';

  return { riskScore: score, riskLevel: level, redFlags: flags, explanation, advice };
}

export async function scanUrl(url) {
  if (openai) {
    try {
      const prompt = `Analyze the following URL for potential scam or phishing indicators. Return a JSON object with exactly these keys: riskScore (number 0-100), riskLevel (string: 'Low', 'Medium', or 'High'), redFlags (array of strings describing suspicious elements), explanation (string explaining the analysis), advice (string with recommendations).

URL to analyze: "${url}"`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const result = JSON.parse(response.choices[0].message.content.trim());
      return result;
    } catch (error) {
      console.log('OpenAI error, falling back to rule-based:', error.message);
    }
  }

  // Fallback to rule-based scanning
  let score = 0;
  let flags = [];

  if (url.includes('bit.ly') || url.includes('tinyurl.com')) {
    score += 30;
    flags.push('Shortened link');
  }
  if (url.includes('.xyz') || url.includes('.top') || url.includes('.club')) {
    score += 20;
    flags.push('Suspicious TLD');
  }
  if (url.length > 100) {
    score += 15;
    flags.push('Overly long URL');
  }
  // Check for domain mismatch (simplified)
  if (url.includes('bank') && !url.includes('bank.com')) {
    score += 25;
    flags.push('Domain mismatch');
  }

  let level = score >= 70 ? 'High' : score >= 30 ? 'Medium' : 'Low';
  const explanation = `This URL scored ${score} points based on link shortening, unusual domains, and length.`;
  const advice = 'Do not click the link. Hover over it to check the real URL, and verify the website directly.';

  return { riskScore: score, riskLevel: level, redFlags: flags, explanation, advice };
}

export async function extractTextFromImage(imagePath) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.reinitialize('eng');
  const { data: { text } } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}

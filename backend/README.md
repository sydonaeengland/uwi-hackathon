# Backend Base with Express and Drizzle

This is a backend for a student-focused scam and phishing detection platform using Express.js and Drizzle ORM with MySQL.

## Setup

1. Ensure MySQL is installed and running on your system.
2. Create a database named `test` in MySQL.
3. Update the database credentials in `drizzle.config.js` and `index.js` if needed.
4. Run `npm run db:push` to create the tables.

## Installation

```bash
npm install
```

## Database Setup

Push the schema to the database:

```bash
npm run db:push
```

## Running the Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will run on http://localhost:3000

## API Endpoints

### Scanning
- `POST /api/scan/text` - Scan text message for scams
  - Body: `{ "text": "message content" }`
  - Response: Risk analysis with score, level, flags, explanation, advice

- `POST /api/scan/url` - Scan URL for phishing
  - Body: `{ "url": "http://example.com" }`
  - Response: Risk analysis

- `POST /api/scan/image` - Upload and scan screenshot
  - Form data: `image` file
  - Response: Extracted text and risk analysis

### Reports
- `GET /api/top-scams` - Get top scam categories with counts
- `POST /api/report` - Report a detected scam
  - Body: `{ "type": "text", "content": "...", "riskScore": 75 }`

### Legacy (from base setup)
- `GET /` - Hello World
- `GET /users` - Get all users
- `POST /users` - Create a user

## Notes

- Default MySQL credentials: host=localhost, port=3306, user=root, password='', database=test
- OCR for images is mocked; integrate with OCR.space API for production
- Update credentials as per your MySQL setup.
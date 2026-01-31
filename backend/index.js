import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emails.js';
import demoRoutes from './routes/demo.js';
import apiRoutes from './routes/api.js';

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET, // Change in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true in production with HTTPS
}));



// Mount routes correctly
app.use('/auth', authRoutes);      
app.use('/emails', emailRoutes);   
app.use('/demo', demoRoutes);      
app.use('/api', apiRoutes);        

app.get('/', (req,res) => {
  console.log(`Test server running`);
  res.send('Server is running');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
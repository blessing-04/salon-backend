// server.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Make sure you have this to parse JSON bodies
// Supabase client with service role key (never expose this to frontend)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route: Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/book', async (req, res) => {
  const { fullname, email, service, appointment_date, appointment_time } = req.body;

  if (!fullname || !email || !service || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .insert([{ fullname, email, service, appointment_date, appointment_time }]);

    if (error) {
      return res.status(500).json({ error: 'Insert failed', details: error });
    }

    res.status(200).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// ===== AUTH ENDPOINT =====
//app.use(express.json()); // Make sure you have this to parse JSON bodies

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send back the access token and user info
    res.status(200).json({
      token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});





app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
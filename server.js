const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// ============================================================
//  Gemini Chat API — using raw REST call (bypasses SDK issues)
// ============================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_gemini')) {
      return res.json({ reply: '[Mock Mode] No API key configured.' });
    }

    const payload = {
      system_instruction: {
        parts: [{ text: 'You are an Expert Indian Election Assistant. You specialize in the Indian electoral system — Lok Sabha, Rajya Sabha, Vidhan Sabha, Panchayat elections, ECI (Election Commission of India), EVMs, VVPAT, NOTA, Model Code of Conduct, voter ID (EPIC), and Indian constitutional provisions related to elections. Answer questions related to Indian elections, voting rights, and democratic processes. If asked about unrelated topics, politely decline and redirect to Indian election topics. Keep answers concise, accurate, and informative. Use Indian context and examples.' }]
      },
      contents: [{ parts: [{ text: message }] }]
    };

    const response = await axios.post(GEMINI_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      res.json({ reply: text });
    } else {
      console.error('Gemini unexpected response:', JSON.stringify(response.data));
      res.json({ reply: 'I received your question but could not generate a response. Please try again.' });
    }
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.json({ reply: '[Error] Could not reach the AI service. Please check your API key and try again.' });
  }
});

// ============================================================
//  Google Civic Information API
// ============================================================
const CIVIC_API_KEY = process.env.GOOGLE_CIVIC_API_KEY;

app.post('/api/civic', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address is required' });

    // Use Gemini AI to provide accurate, location-specific civic information
    const civicPrompt = `You are an Indian civic data assistant. Given the Indian location "${address}", provide accurate election and civic information for that specific Indian state/city/constituency.

Return ONLY a valid JSON object (no markdown, no code fences, no explanation) with this exact structure:
{
  "representatives": [
    { "name": "Full Name", "office": "Position Title (e.g. MP, MLA, Mayor)", "party": "Party Name" }
  ],
  "pollingInfo": [
    { "name": "Constituency or Ward Name", "address": "Relevant details like Lok Sabha/Vidhan Sabha constituency", "hours": "Typical polling hours in India" }
  ],
  "elections": [
    { "name": "Election Name", "date": "YYYY-MM-DD or approximate", "type": "Lok Sabha / Vidhan Sabha / Municipal / Panchayat" }
  ]
}

Rules:
- Focus ONLY on Indian elections (Lok Sabha, Vidhan Sabha, Municipal, Panchayat)
- Include 2-3 current elected representatives for that Indian region (MP, MLA, CM, Mayor etc.)
- Include the Lok Sabha and Vidhan Sabha constituency name for that area
- Include 2-3 upcoming or recent Indian elections relevant to that region
- Polling hours in India are typically 7:00 AM to 6:00 PM
- Include party names like BJP, INC, AAP, TMC, etc.
- Return ONLY the JSON, no other text`;

    try {
      const response = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: civicPrompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        // Clean the response — strip markdown code fences if present
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        res.json({
          representatives: (parsed.representatives || []).map(r => ({
            name: r.name,
            office: r.office,
            party: r.party || 'Unknown'
          })),
          pollingLocations: (parsed.pollingInfo || []).map(p => ({
            address: {
              locationName: p.name || '',
              line1: p.address || '',
              city: '', state: '', zip: ''
            },
            pollingHours: p.hours || 'Contact local election office'
          })),
          elections: (parsed.elections || []).map(e => ({
            name: e.name + (e.type ? ` (${e.type})` : ''),
            electionDay: e.date || 'TBA'
          }))
        });
      } else {
        throw new Error('Empty Gemini response');
      }
    } catch (aiError) {
      console.error('Civic AI Error:', aiError.message);
      // Fallback with helpful message
      res.json({
        representatives: [
          { name: 'Could not fetch data', office: 'Please try again with a more specific address', party: 'N/A' }
        ],
        pollingLocations: [],
        elections: [
          { name: 'Could not fetch elections', electionDay: 'Try entering a city or state name' }
        ]
      });
    }
  } catch (error) {
    console.error('Civic Server Error:', error.message);
    res.status(500).json({ error: 'Failed to process civic data request' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini model: ${GEMINI_MODEL}`);
  console.log(`Gemini key: ${GEMINI_API_KEY ? '✓ configured' : '✗ missing'}`);
  console.log(`Civic key: ${CIVIC_API_KEY ? '✓ configured' : '✗ missing'}`);
});

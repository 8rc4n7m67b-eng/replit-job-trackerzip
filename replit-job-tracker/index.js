// Job tracker server
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { etag: false, lastModified: false, setHeaders: (res, filePath) => {
  if (filePath.endsWith('.html')) res.set('Cache-Control', 'no-store');
} }));

const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');

const DEFAULT_COMPANIES = [
  { name: "Lyra Health", domain: "jobs.lever.co", companyDomain: "lyrahealth.com", careersUrl: "https://jobs.lever.co/lyrahealth", group: "original", selected: true, defaultSelected: true },
  { name: "Headspace", domain: "job-boards.greenhouse.io", careersUrl: "https://job-boards.greenhouse.io/hs", group: "original", selected: true, defaultSelected: true },
  { name: "Talkspace", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/talkspace", group: "original", selected: true, defaultSelected: true },
  { name: "Spring Health", domain: "job-boards.greenhouse.io", careersUrl: "https://job-boards.greenhouse.io/springhealth66", group: "original", selected: true, defaultSelected: true },
  { name: "Alma", domain: "job-boards.greenhouse.io", careersUrl: "https://job-boards.greenhouse.io/alma", group: "original", selected: true, defaultSelected: true },
  { name: "Grow Therapy", domain: "job-boards.greenhouse.io", careersUrl: "https://job-boards.greenhouse.io/growtherapy", group: "original", selected: true, defaultSelected: true },
  { name: "Brightline", domain: "jobs.ashbyhq.com", careersUrl: "https://jobs.ashbyhq.com/hellobrightline", group: "platforms", selected: true, defaultSelected: true },
  { name: "Equip Health", domain: "jobs.lever.co", companyDomain: "equip.health", careersUrl: "https://jobs.lever.co/equiphealth", group: "platforms", selected: true, defaultSelected: true },
  { name: "Charlie Health", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/charliehealthinc", group: "platforms", selected: true, defaultSelected: true },
  { name: "Quartet Health", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/quartethealth", group: "platforms", selected: true, defaultSelected: true },
  { name: "Rula Health", domain: "jobs.ashbyhq.com", careersUrl: "https://jobs.ashbyhq.com/rula", group: "platforms", selected: true, defaultSelected: true },
  { name: "Monument", domain: "myworkdayjobs.com", careersUrl: "https://monumenthealth.wd1.myworkdayjobs.com/Goldcareers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Done Health", domain: "donefirst.com", careersUrl: "https://donefirst.com/faq/career-opportunities", group: "platforms", selected: true, defaultSelected: true },
  { name: "Osmind", domain: "jobs.lever.co", companyDomain: "osmind.org", careersUrl: "https://jobs.lever.co/Osmind", group: "ehr", selected: true, defaultSelected: true },
  { name: "Valant", domain: "valant.io", careersUrl: "https://www.valant.io/about-us/careers/", group: "ehr", selected: true, defaultSelected: true },
  { name: "Ensora Health", domain: "myworkdayjobs.com", careersUrl: "https://ensorahealth.com/careers/", group: "ehr", selected: true, defaultSelected: true },
  { name: "SonderMind", domain: "job-boards.greenhouse.io", careersUrl: "https://job-boards.greenhouse.io/sondermind", group: "original", selected: true, defaultSelected: true },
  { name: "Two Chairs", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/twochairs", group: "original", selected: true, defaultSelected: true },
  { name: "Woebot Health", domain: "jobs.ashbyhq.com", careersUrl: "https://jobs.ashbyhq.com/woebot-health", group: "original", selected: true, defaultSelected: true },
  { name: "Octave", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/octave", group: "original", selected: true, defaultSelected: true },
  { name: "NOCD", domain: "ats.rippling.com", careersUrl: "https://ats.rippling.com/nocd/jobs", group: "original", selected: true, defaultSelected: true },
  { name: "Concert Health", domain: "ats.rippling.com", careersUrl: "https://ats.rippling.com/concerthealthcareers/jobs", group: "platforms", selected: true, defaultSelected: true },
  { name: "Array Behavioral Care", domain: "jobs.ashbyhq.com", careersUrl: "https://jobs.ashbyhq.com/array-behavioral-care", group: "platforms", selected: true, defaultSelected: true },
  { name: "Talkiatry", domain: "jobs.lever.co", companyDomain: "talkiatry.com", careersUrl: "https://jobs.lever.co/talkiatry", group: "platforms", selected: true, defaultSelected: true },
  { name: "SimplePractice", domain: "boards.greenhouse.io", careersUrl: "https://boards.greenhouse.io/simplepractice55", group: "ehr", selected: true, defaultSelected: true },
];

app.get('/api/config', (req, res) => {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return res.json(parsed);
  } catch (e) {}
  res.json(DEFAULT_COMPANIES);
});

app.post('/api/config', (req, res) => {
  const companies = req.body;
  if (!Array.isArray(companies)) return res.status(400).json({ error: 'Expected array' });
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(companies, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/search', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[search] ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable not set.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[search] Anthropic API error', response.status, JSON.stringify(data));
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('[search] Unexpected error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Job tracker running on port ${PORT}`));

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');

const DEFAULT_COMPANIES = [
  { name: "Lyra Health", domain: "lyrahealth.com", careersUrl: "https://www.lyrahealth.com/company/careers/", group: "original", selected: true, defaultSelected: true },
  { name: "Headspace", domain: "headspace.com", careersUrl: "https://www.headspace.com/careers", group: "original", selected: true, defaultSelected: true },
  { name: "Talkspace", domain: "talkspace.com", careersUrl: "https://www.talkspace.com/careers", group: "original", selected: true, defaultSelected: true },
  { name: "Spring Health", domain: "springhealth.com", careersUrl: "https://www.springhealth.com/careers", group: "original", selected: true, defaultSelected: true },
  { name: "Alma", domain: "helloalma.com", careersUrl: "https://www.helloalma.com/careers/", group: "original", selected: true, defaultSelected: true },
  { name: "Grow Therapy", domain: "growtherapy.com", careersUrl: "https://growtherapy.com/careers", group: "original", selected: true, defaultSelected: true },
  { name: "Brightline", domain: "brightlinehealth.com", careersUrl: "https://www.brightlinehealth.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Equip Health", domain: "equip.health", careersUrl: "https://equip.health/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Charlie Health", domain: "charliehealth.com", careersUrl: "https://www.charliehealth.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Quartet Health", domain: "quartethealth.com", careersUrl: "https://www.quartethealth.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Rula Health", domain: "rula.com", careersUrl: "https://www.rula.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Monument", domain: "joinmonument.com", careersUrl: "https://www.joinmonument.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Done Health", domain: "donefirst.com", careersUrl: "https://donefirst.com/careers", group: "platforms", selected: true, defaultSelected: true },
  { name: "Osmind", domain: "osmind.org", careersUrl: "https://www.osmind.org/careers", group: "ehr", selected: true, defaultSelected: true },
  { name: "Valant", domain: "valant.io", careersUrl: "https://www.valant.io/careers", group: "ehr", selected: true, defaultSelected: true },
  { name: "Blueprint (Therapy Brands)", domain: "therapybrands.com", careersUrl: "https://therapybrands.com/careers", group: "ehr", selected: true, defaultSelected: true },
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
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Job tracker running on port ${PORT}`));

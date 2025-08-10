// server.js
// Simple Express server that fetches RSS feeds, tags items by topics, and serves a JSON API.

const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');

const app = express();
const parser = new Parser({ timeout: 15000 });
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // cache ~10 mins

app.use(cors());
app.use(express.static('public'));

// [SECTION: RSS FEEDS] — you can add/remove feeds here later if you want
const FEEDS = [
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-topics=world&post_type=best' },
  { name: 'AP Top Stories', url: 'https://feeds.apnews.com/apf-topnews' },
  { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'NASA News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' }
];

// [SECTION: TOPIC KEYWORDS] — lightweight heuristics for mapping items -> topics
const TOPICS = {
  israel: {
    label: 'Israel & Jerusalem',
    keywords: ['israel', 'jerusalem', 'gaza', 'west bank', 'idf', 'hezbollah', 'hamas', 'iran'],
    verses: [
      { ref: 'Zechariah 12:2-3', text: 'Behold, I will make Jerusalem a cup of trembling... all the people of the earth be gathered together against it.' },
      { ref: 'Luke 21:20', text: 'And when ye shall see Jerusalem compassed with armies, then know that the desolation thereof is nigh.' }
    ]
  },
  wars: {
    label: 'Wars & Rumours of Wars',
    keywords: ['war', 'invasion', 'missile', 'artillery', 'offensive', 'strike', 'conflict', 'troops', 'border clash'],
    verses: [
      { ref: 'Matthew 24:6-7', text: 'And ye shall hear of wars and rumours of wars... For nation shall rise against nation...' }
    ]
  },
  disasters: {
    label: 'Earthquakes & Disasters',
    keywords: ['earthquake', 'famine', 'pestilence', 'outbreak', 'pandemic', 'wildfire', 'hurricane', 'flooding', 'volcano'],
    verses: [
      { ref: 'Matthew 24:7', text: '...and there shall be famines, and pestilences, and earthquakes, in divers places.' }
    ]
  },
  persecution: {
    label: 'Persecution of Believers',
    keywords: ['church attack', 'christian', 'pastor arrested', 'blasphemy law', 'religious persecution'],
    verses: [
      { ref: 'Matthew 24:9', text: 'Then shall they deliver you up to be afflicted, and shall kill you...' },
      { ref: 'Revelation 6:9', text: 'I saw under the altar the souls of them that were slain for the word of God...' }
    ]
  },
  deception: {
    label: 'Deception & False Christs',
    keywords: ['disinformation', 'deepfake', 'false christ', 'propaganda', 'messiah claimant', 'cult leader'],
    verses: [
      { ref: 'Matthew 24:4-5', text: 'Take heed that no man deceive you. For many shall come in my name...' }
    ]
  },
  tech_control: {
    label: 'Control Tech / Economy',
    keywords: ['digital id', 'central bank digital currency', 'cbdc', 'biometric', 'surveillance', 'cashless', 'implant', 'microchip', 'mark'],
    verses: [
      { ref: 'Revelation 13:16-17', text: 'And he causeth all... to receive a mark... that no man might buy or sell, save he that had the mark...' }
    ]
  },
  globalism: {
    label: 'Global Governance',
    keywords: ['global treaty', 'world health', 'un resolution', 'global tax', 'international court', 'one world'],
    verses: [
      { ref: 'Daniel 7:23-25', text: '...the fourth beast shall be the fourth kingdom upon earth... and shall devour the whole earth...' },
      { ref: 'Revelation 13:7', text: '...power was given him over all kindreds, and tongues, and nations.' }
    ]
  }
};

function inferTopics(text) {
  const found = new Set();
  const lower = (text || '').toLowerCase();
  for (const [key, cfg] of Object.entries(TOPICS)) {
    if (cfg.keywords.some(k => lower.includes(k))) found.add(key);
  }
  return [...found];
}

async function fetchAllFeeds() {
  const cacheKey = 'ALL_NEWS';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = [];
  for (const feed of FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);
      for (const item of data.items || []) {
        const textBlob = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`;
        const topics = inferTopics(textBlob);
        results.push({
          source: feed.name,
          title: item.title || 'Untitled',
          link: item.link,
          isoDate: item.isoDate || item.pubDate || null,
          topics,
        });
      }
    } catch (e) {
      console.error('Feed error:', feed.name, e.message);
    }
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0));
  cache.set(cacheKey, results);
  return results;
}

// [SECTION: API ROUTES]
app.get('/api/news', async (req, res) => {
  try {
    const news = await fetchAllFeeds();
    res.json({ items: news });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/verses', (req, res) => {
  // Send topic -> verses (KJV public domain snippets)
  const payload = {};
  for (const [key, cfg] of Object.entries(TOPICS)) {
    payload[key] = { label: cfg.label, verses: cfg.verses };
  }
  res.json(payload);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PacMac Prophecy Watch listening on http://localhost:${PORT}`));

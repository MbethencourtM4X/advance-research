import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://advance-idan-research.vercel.app';

const COUNTRY_SLUGS = ['panama', 'costa-rica', 'nicaragua', 'el-salvador'];

export default function sitemap() {
  let lastModified = new Date().toISOString();
  try {
    const dataPath = path.join(process.cwd(), 'public', 'central-america-tenders-live.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (data.timestamp) lastModified = data.timestamp;
  } catch {
    // use default
  }

  const staticPages = [
    { url: BASE_URL, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/tenders`, lastModified, changeFrequency: 'daily', priority: 0.9 },
  ];

  const countryPages = COUNTRY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/tenders/${slug}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticPages, ...countryPages];
}

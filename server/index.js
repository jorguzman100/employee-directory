const express = require('express');
const path = require('path');

const app = express();
const port = Number.parseInt(process.env.PORT || '4000', 10);
const isProduction = process.env.NODE_ENV === 'production';

const US_CITIES = [
  { city: 'New York', state: 'New York', lat: 40.7128, lng: -74.006 },
  { city: 'Los Angeles', state: 'California', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'Illinois', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'Texas', lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix', state: 'Arizona', lat: 33.4484, lng: -112.074 },
  { city: 'Philadelphia', state: 'Pennsylvania', lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio', state: 'Texas', lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego', state: 'California', lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas', state: 'Texas', lat: 32.7767, lng: -96.797 },
  { city: 'San Jose', state: 'California', lat: 37.3382, lng: -121.8863 },
  { city: 'Austin', state: 'Texas', lat: 30.2672, lng: -97.7431 },
  { city: 'Jacksonville', state: 'Florida', lat: 30.3322, lng: -81.6557 },
  { city: 'San Francisco', state: 'California', lat: 37.7749, lng: -122.4194 },
  { city: 'Seattle', state: 'Washington', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'Colorado', lat: 39.7392, lng: -104.9903 },
  { city: 'Boston', state: 'Massachusetts', lat: 42.3601, lng: -71.0589 },
  { city: 'Miami', state: 'Florida', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta', state: 'Georgia', lat: 33.749, lng: -84.388 },
  { city: 'Portland', state: 'Oregon', lat: 45.5152, lng: -122.6784 },
  { city: 'Nashville', state: 'Tennessee', lat: 36.1627, lng: -86.7816 },
];

const FIRST_NAMES = [
  'Avery', 'Jordan', 'Taylor', 'Morgan', 'Riley',
  'Casey', 'Alex', 'Jamie', 'Cameron', 'Skyler',
  'Drew', 'Hayden', 'Parker', 'Quinn', 'Logan',
  'Emerson', 'Finley', 'Blake', 'Harper', 'Dakota',
];

const LAST_NAMES = [
  'Bennett', 'Carter', 'Diaz', 'Ellis', 'Foster',
  'Garcia', 'Hayes', 'Iverson', 'Johnson', 'Kim',
  'Lopez', 'Miller', 'Nguyen', 'Owens', 'Patel',
  'Reed', 'Sullivan', 'Turner', 'Vasquez', 'Walker',
];

const AVATAR_COLORS = ['#2563EB', '#059669', '#EA580C', '#7C3AED', '#0891B2'];

const sanitizeResults = (rawValue) => {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return 200;
  }

  return Math.min(Math.max(parsed, 1), 500);
};

const sanitizeNat = (rawValue) => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return 'us';
  }

  return rawValue.toLowerCase().replace(/[^a-z,]/g, '');
};

const makeAvatarDataUrl = (initials, color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" rx="28" fill="${color}"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const buildMockEmployee = (index) => {
  const citySeed = US_CITIES[index % US_CITIES.length];
  const firstNameIndex = index % FIRST_NAMES.length;
  const lastNameIndex = Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length;
  const firstName = FIRST_NAMES[firstNameIndex];
  const lastName = LAST_NAMES[lastNameIndex];

  const latOffset = ((index % 7) - 3) * 0.11;
  const lngOffset = ((index % 9) - 4) * 0.09;

  const lat = (citySeed.lat + latOffset).toFixed(6);
  const lng = (citySeed.lng + lngOffset).toFixed(6);

  const dob = new Date(1980 + (index % 23), (index * 2) % 12, 1 + (index % 28));
  const initials = `${firstName[0]}${lastName[0]}`;

  return {
    gender: index % 2 === 0 ? 'female' : 'male',
    name: {
      title: index % 2 === 0 ? 'Ms' : 'Mr',
      first: firstName,
      last: lastName,
    },
    location: {
      street: {
        number: 100 + index,
        name: `${citySeed.city} Ave`,
      },
      city: citySeed.city,
      state: citySeed.state,
      country: 'United States',
      coordinates: {
        latitude: String(lat),
        longitude: String(lng),
      },
      timezone: {
        offset: '-05:00',
        description: 'Eastern Time',
      },
    },
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@employeeatlas.local`,
    login: {
      uuid: `mock-${index + 1}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`,
      password: 'atlas-demo',
      salt: 'mock',
      md5: 'mock',
      sha1: 'mock',
      sha256: 'mock',
    },
    dob: {
      date: dob.toISOString(),
      age: 20 + (index % 35),
    },
    registered: {
      date: new Date(2018 + (index % 7), (index * 5) % 12, 1 + (index % 28)).toISOString(),
      age: 1 + (index % 7),
    },
    phone: `555-${String(100 + (index % 900)).padStart(3, '0')}-${String(1000 + (index % 9000)).padStart(4, '0')}`,
    cell: `555-${String(200 + (index % 700)).padStart(3, '0')}-${String(1000 + ((index * 3) % 9000)).padStart(4, '0')}`,
    id: {
      name: 'SSN',
      value: `MOCK-${String(index + 1).padStart(5, '0')}`,
    },
    picture: {
      large: makeAvatarDataUrl(initials, AVATAR_COLORS[index % AVATAR_COLORS.length]),
      medium: makeAvatarDataUrl(initials, AVATAR_COLORS[index % AVATAR_COLORS.length]),
      thumbnail: makeAvatarDataUrl(initials, AVATAR_COLORS[index % AVATAR_COLORS.length]),
    },
    nat: 'US',
  };
};

const buildMockEmployees = (count) => {
  return Array.from({ length: count }, (_unused, index) => buildMockEmployee(index));
};

if (!isProduction) {
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });
}

app.use((req, _res, next) => {
  if (!isProduction) {
    console.log(`[dev] ${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/employees', async (req, res) => {
  const results = sanitizeResults(req.query.results);
  const nat = sanitizeNat(req.query.nat);

  const query = new URLSearchParams({
    results: String(results),
    nat,
  });

  const endpoint = `https://randomuser.me/api/?${query.toString()}`;

  try {
    const upstreamResponse = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Upstream status ${upstreamResponse.status}`);
    }

    const data = await upstreamResponse.json();

    if (!data || !Array.isArray(data.results) || !data.results.length) {
      throw new Error('RandomUser empty/malformed results');
    }

    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.set('X-Employee-Source', 'randomuser');
    res.json(data);
    return;
  } catch (error) {
    console.warn('[api/employees] RandomUser unavailable, using mock fallback:', error);
  }

  const fallbackResults = buildMockEmployees(results);

  res.set('Cache-Control', 'no-store');
  res.set('X-Employee-Source', 'mock');
  res.status(200).json({
    results: fallbackResults,
    info: {
      seed: 'employee-atlas-local-fallback',
      results: fallbackResults.length,
      page: 1,
      version: '1.0',
      source: 'mock',
    },
  });
});

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));

  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('Employee Atlas API is running. Start Vite with `npm run dev` for the UI.');
  });
}

app.listen(port, () => {
  console.log(`Employee Atlas server listening on port ${port}`);
});

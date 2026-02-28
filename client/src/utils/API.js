const EMPLOYEES_URL = '/api/employees?results=200&nat=us';

const FIRST_NAMES = [
  'Avery', 'Jordan', 'Taylor', 'Morgan', 'Riley',
  'Casey', 'Alex', 'Jamie', 'Cameron', 'Skyler',
];

const LAST_NAMES = [
  'Bennett', 'Carter', 'Diaz', 'Ellis', 'Foster',
  'Garcia', 'Hayes', 'Johnson', 'Miller', 'Patel',
];

const CITY_SEEDS = [
  { city: 'New York', state: 'New York', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'California', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'Illinois', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'Texas', lat: 29.7604, lng: -95.3698 },
  { city: 'Seattle', state: 'Washington', lat: 47.6062, lng: -122.3321 },
];

const makeAvatar = (initials, color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" rx="28" fill="${color}"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const buildMockEmployee = (index) => {
  const firstNameIndex = index % FIRST_NAMES.length;
  const lastNameIndex = Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length;
  const firstName = FIRST_NAMES[firstNameIndex];
  const lastName = LAST_NAMES[lastNameIndex];
  const seed = CITY_SEEDS[index % CITY_SEEDS.length];
  const lat = (seed.lat + ((index % 5) - 2) * 0.15).toFixed(6);
  const lng = (seed.lng + ((index % 7) - 3) * 0.12).toFixed(6);
  const initials = `${firstName[0]}${lastName[0]}`;
  const color = ['#2563EB', '#059669', '#EA580C', '#7C3AED', '#0891B2'][index % 5];

  return {
    name: { first: firstName, last: lastName },
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@employeeatlas.local`,
    dob: { date: new Date(1982 + (index % 22), index % 12, 1 + (index % 27)).toISOString() },
    location: {
      street: { number: 100 + index, name: `${seed.city} Ave` },
      city: seed.city,
      state: seed.state,
      country: 'United States',
      coordinates: {
        latitude: String(lat),
        longitude: String(lng),
      },
    },
    cell: `555-${String(100 + (index % 900)).padStart(3, '0')}-${String(1000 + (index % 9000)).padStart(4, '0')}`,
    picture: {
      thumbnail: makeAvatar(initials, color),
    },
    login: {
      uuid: `mock-client-${index + 1}`,
    },
  };
};

const buildMockEmployees = (count = 200) => {
  return Array.from({ length: count }, (_unused, index) => buildMockEmployee(index));
};

const createMockResponse = (source, reason) => {
  const results = buildMockEmployees(200);
  return {
    data: {
      results,
      info: {
        source,
        reason,
      },
    },
  };
};

const parseError = async (response) => {
  const status = `${response.status} ${response.statusText}`.trim();

  try {
    const payload = await response.json();
    const details = payload.details || payload.error || '';
    return details ? `${status} - ${details}` : status || 'Request failed';
  } catch (_error) {
    try {
      const text = await response.text();
      const summary = text ? text.slice(0, 140) : '';
      return summary ? `${status} - ${summary}` : status || 'Request failed';
    } catch (_readError) {
      return status || 'Request failed';
    }
  }
};

export default {
  async search() {
    const start = Date.now();
    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort('employee-api-timeout');
    }, 9000);
    try {
      response = await fetch(EMPLOYEES_URL, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      console.error('[API.search] network failure, using local mock data:', error);
      return createMockResponse('mock-client-network', error instanceof Error ? error.message : 'network-failure');
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = response.headers.get('content-type') || 'unknown';
    console.info('[API.search] response', {
      url: EMPLOYEES_URL,
      status: response.status,
      ok: response.ok,
      contentType,
      ms: Date.now() - start,
    });

    if (!response.ok) {
      const message = await parseError(response);
      console.error('[API.search] non-OK response, using local mock data:', message);
      return createMockResponse('mock-client-status', message);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('[API.search] invalid JSON payload, using local mock data:', error);
      return createMockResponse(
        'mock-client-json',
        error instanceof Error ? error.message : 'invalid-json'
      );
    }

    if (!data || !Array.isArray(data.results) || !data.results.length) {
      console.warn('[API.search] empty/malformed results, using local mock data', data);
      return createMockResponse('mock-client-empty', 'empty-or-malformed-results');
    }

    console.info('[API.search] loaded employees', {
      count: data.results.length,
      source: data.info && data.info.source ? data.info.source : 'randomuser',
      ms: Date.now() - start,
    });

    return { data };
  },
};

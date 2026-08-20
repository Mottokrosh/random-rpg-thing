const API_URL = process.env.CRAFT_API_URL;
const COLLECTION_ID = process.env.CRAFT_COLLECTION_ID;

const UPSTREAM_TIMEOUT_MS = 10_000;
// Items change rarely, so a warm container can serve them straight from memory.
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = null;

/** Map a Craft collection item onto the field names the client already expects. */
function toItem({ id, name, properties = {} }) {
  return {
    id,
    Name: name ?? '',
    Description: properties.description ?? '',
    Source: properties.source ?? '',
    'Source SKU': properties.source_sku ?? '',
  };
}

/** Fetch every item in the Craft collection, newest response cached in memory. */
export async function getItems() {
  if (!API_URL || !COLLECTION_ID) {
    throw new Error('CRAFT_API_URL and CRAFT_COLLECTION_ID must be set');
  }

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.items;

  const url = `${API_URL}/collections/${COLLECTION_ID}/items?maxDepth=0`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Craft API responded ${response.status} ${response.statusText}`);
  }

  const { items = [] } = await response.json();
  // The collection can hold empty placeholder rows; they are not real items.
  const mapped = items.map(toItem).filter((item) => item.Name);

  cache = { at: Date.now(), items: mapped };
  return mapped;
}

export function json(body, { status = 200, cacheControl } = {}) {
  return Response.json(body, {
    status,
    headers: cacheControl ? { 'Cache-Control': cacheControl } : undefined,
  });
}

/** Wrap a handler so upstream failures surface as a 502 instead of a broken response. */
export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('Craft request failed:', error);
      return json({ error: 'Could not load items' }, { status: 502 });
    }
  };
}

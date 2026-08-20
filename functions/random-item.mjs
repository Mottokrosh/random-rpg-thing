import { getItems, json, withErrorHandling } from './lib/craft.mjs';

export default withErrorHandling(async () => {
  const items = await getItems();

  if (!items.length) {
    return json({ error: 'No items available' }, { status: 404 });
  }

  const item = items[Math.floor(Math.random() * items.length)];

  return json(item, { cacheControl: 'no-store' });
});

export const config = {
  path: '/api/items/random',
};

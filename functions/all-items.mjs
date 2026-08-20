import { getItems, json, withErrorHandling } from './lib/craft.mjs';

export default withErrorHandling(async () => {
  const items = await getItems();

  return json(items, {
    cacheControl: 'public, max-age=300, stale-while-revalidate=3600',
  });
});

export const config = {
  path: '/api/items',
};

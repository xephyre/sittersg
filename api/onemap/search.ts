import type { IncomingMessage, ServerResponse } from 'http';
import { lookupSingaporePostal } from '../../lib/onemap.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const postal = parsedUrl.searchParams.get('postal') ?? '';
  const result = await lookupSingaporePostal(postal);

  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}

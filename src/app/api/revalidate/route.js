import { revalidatePath } from 'next/cache';

/**
 * 刷新特定页面缓存
 * @param request
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET(request) {
  const path = request.nextUrl.searchParams.get('path');

  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, time: Date.now() });
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate',
  });
}

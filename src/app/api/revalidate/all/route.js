import { revalidatePath } from 'next/cache';

/**
 * 清除所有客户端路由缓存
 * @param request
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET(request) {

    revalidatePath('/', 'layout')
    return Response.json({ revalidated: true, now: Date.now() });
}

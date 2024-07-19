import fs from 'fs';
// import { headers, cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import path from 'path';

// export const dynamic = 'force-dynamic'; // defaults to auto
// export const revalidate = 1;
export async function GET(request, { params }) {
  const { pageName } = params;
  const filePath = path.join(process.cwd(), `.data/${pageName}.json`);
  console.log('filePath', filePath);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'No such file found.' });
  }
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(jsonData);
  console.log('data====>', data)
  return NextResponse.json(data);
}

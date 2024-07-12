import { put, get, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    const { blob } = await get(`timelinetracker-${userId}.json`);
    const data = await blob.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  }
}

export async function POST(request) {
  const { userId, data } = await request.json();
  
  try {
    const { url } = await put(`timelinetracker-${userId}.json`, JSON.stringify(data), {
      access: 'public',
    });
    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    await del(`timelinetracker-${userId}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
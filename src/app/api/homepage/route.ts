import { NextResponse } from 'next/server';
import { getHomepageSections } from '@/lib/homepage-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'vi';

    try {
        const sections = await getHomepageSections(locale);
        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching homepage API:', error);
        return NextResponse.json({ error: 'Failed to fetch homepage data' }, { status: 500 });
    }
}

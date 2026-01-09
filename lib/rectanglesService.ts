import { Rectangle, RectangleApiResponse, RectangleApiItem } from '@/types/rectangles';

function mapApiItemToRectangle(item: RectangleApiItem): Rectangle {
  const now = new Date();
  const validFrom = item.ValidFrom ? new Date(item.ValidFrom) : null;
  const validTo = item.ValidTo ? new Date(item.ValidTo) : null;

  const isActive = item.Show === '1' && (!validFrom || validFrom <= now) && (!validTo || validTo >= now);

  return {
    id: parseInt(item.ID),
    position: parseInt(item.Position),
    isActive,
    isCentrallyManaged: true,
    imageUrl: item.ImageSource || undefined,
    targetUrl: item.Link || undefined,
    title: item.Title || undefined,
    validFrom: item.ValidFrom,
    validTo: item.ValidTo,
    dtCreated: item.dtCreated,
    linkType: item.Link ? 'none' : 'none',
  };
}

export async function fetchRectangles(blogId: string = '1'): Promise<Rectangle[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-rectangles?blogId=${blogId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rectangles: ${response.status}`);
    }

    const data: RectangleApiResponse = await response.json();

    console.log('=== RECTANGLES API RESPONSE ===');
    console.log('Raw data:', JSON.stringify(data, null, 2));
    console.log('Total items:', data?.total);
    console.log('Items array length:', data?.items?.length);
    console.log('================================');

    const rectangles = data.items.map(mapApiItemToRectangle);
    console.log('Mapped rectangles:', rectangles);
    console.log('Active rectangles:', rectangles.filter(r => r.isActive).length);
    console.log('================================');

    const allPositions: Rectangle[] = [];
    for (let i = 1; i <= 12; i++) {
      const existing = rectangles.find(r => r.position === i);
      if (existing) {
        allPositions.push(existing);
      } else {
        allPositions.push({
          id: 1000 + i,
          position: i,
          isActive: false,
          isCentrallyManaged: false,
        });
      }
    }

    return allPositions.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching rectangles:', error);
    throw error;
  }
}

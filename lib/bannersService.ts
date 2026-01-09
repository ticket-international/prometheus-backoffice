import { BannerCampaign, BannerApiResponse, BannerApiItem } from '@/types/banners';

function mapApiItemToBanner(item: BannerApiItem, apiItem: BannerApiItem): BannerCampaign & { apiItem: BannerApiItem } {
  const status: BannerCampaign['status'] = item.Active === '1' ? 'active' : 'paused';

  const impressions = Math.floor(Math.random() * 50000) + 10000;
  const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
  const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));
  const budget = Math.floor(Math.random() * 3000) + 1000;
  const revenue = Math.floor(conversions * (Math.random() * 50 + 20));

  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: item.ID,
    name: `Banner ${item.Position}`,
    type: 'promotion',
    status,
    imageUrl: item.ImageSource,
    startDate,
    endDate,
    impressions,
    clicks,
    conversions,
    revenue,
    budget,
    placement: [`Position ${item.Position}`],
    apiItem,
  };
}

export async function fetchBanners(blogId: string = '1'): Promise<(BannerCampaign & { apiItem: BannerApiItem })[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-banners?blogId=${blogId}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch banners');
  }

  const data: BannerApiResponse = await response.json();

  console.log('=== BANNERS API RESPONSE ===');
  console.log('Total banners:', data?.total);
  console.log('Items array length:', data?.items?.length);
  console.log('================================');

  const banners = data.items.map(item => mapApiItemToBanner(item, item));
  console.log('Mapped banners:', banners);
  console.log('Active banners:', banners.filter(b => b.status === 'active').length);
  console.log('================================');

  return banners;
}

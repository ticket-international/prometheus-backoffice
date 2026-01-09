'use client';

import { FiShare2, FiTrendingUp, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const engagementData = [
  { date: "Mo", likes: 320, comments: 45, shares: 28 },
  { date: "Di", likes: 280, comments: 38, shares: 22 },
  { date: "Mi", likes: 410, comments: 52, shares: 35 },
  { date: "Do", likes: 380, comments: 48, shares: 31 },
  { date: "Fr", likes: 520, comments: 68, shares: 42 },
  { date: "Sa", likes: 680, comments: 85, shares: 58 },
  { date: "So", likes: 590, comments: 72, shares: 48 },
];

const platformData = [
  { platform: "Instagram", followers: 8500, engagement: 6.2 },
  { platform: "Facebook", followers: 6200, engagement: 4.8 },
  { platform: "TikTok", followers: 4800, engagement: 8.5 },
  { platform: "Twitter", followers: 3200, engagement: 3.2 },
];

export default function SocialMedia() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <FiShare2 className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Social Media</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Gesamt Follower</div>
          <div className="text-2xl font-semibold">22.7k</div>
          <div className="text-xs text-chart-1 mt-1">+8% diese Woche</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiHeart className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Likes</div>
          </div>
          <div className="text-2xl font-semibold">3.180</div>
          <div className="text-xs text-chart-1 mt-1">diese Woche</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiMessageCircle className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Kommentare</div>
          </div>
          <div className="text-2xl font-semibold">408</div>
          <div className="text-xs text-chart-1 mt-1">diese Woche</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Engagement Rate</div>
          <div className="text-2xl font-semibold">5.8%</div>
          <div className="text-xs text-chart-1 mt-1">+0.4% vs. Vorwoche</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiTrendingUp className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Wöchentliches Engagement</h2>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="likes"
              name="Likes"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="comments"
              name="Kommentare"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="shares"
              name="Shares"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiShare2 className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Plattform Übersicht</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="platform"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar
              dataKey="followers"
              name="Follower"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

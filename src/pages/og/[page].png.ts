import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import divesRaw from '../../data/dives.json';
import skiRaw from '../../data/ski.json';

const dives = divesRaw as any[];
const ski = skiRaw as any[];

// 各頁面的設定
const PAGE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  badge: string;
  stats: { label: string; value: string }[];
}> = {
  index: {
    title: 'blesscat.dev',
    subtitle: 'Diver · Skier · Explorer · Tinkerer',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.08)',
    badge: '🐱 個人網站',
    stats: [
      { label: '次潛水', value: String(dives.length) },
      { label: '最大深度', value: `${Math.max(...dives.map((d: any) => d.max_depth || 0)).toFixed(1)}m` },
      { label: '滑雪天數', value: String(ski.length) },
      { label: '最高速度', value: `${Math.max(...ski.map((d: any) => d.top_speed_kmh || 0)).toFixed(1)}km/h` },
    ],
  },
  dives: {
    title: '潛水紀錄',
    subtitle: '從 2024 年開始的每一支，深度曲線、地點地圖、數據分析',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.08)',
    badge: '🤿 潛水',
    stats: [
      { label: '次潛水', value: String(dives.length) },
      { label: '最大深度', value: `${Math.max(...dives.map((d: any) => d.max_depth || 0)).toFixed(1)}m` },
      { label: '水下時間', value: `${Math.floor(dives.reduce((s: number, d: any) => s + (d.bottom_time || 0), 0) / 60)}h` },
      { label: '平均深度', value: `${(dives.reduce((s: number, d: any) => s + (d.avg_depth || 0), 0) / dives.length).toFixed(1)}m` },
    ],
  },
  ski: {
    title: '滑雪紀錄',
    subtitle: '日本雪場巡禮，速度、落差、每一天的粉雪紀錄',
    accent: '#818cf8',
    accentBg: 'rgba(129,140,248,0.08)',
    badge: '⛷️ 滑雪',
    stats: [
      { label: '滑雪天數', value: String(ski.length) },
      { label: '最高速度', value: `${Math.max(...ski.map((d: any) => d.top_speed_kmh || 0)).toFixed(1)}km/h` },
      { label: '累計落差', value: `${(ski.reduce((s: number, d: any) => s + (d.vertical_m || 0), 0) / 1000).toFixed(1)}km` },
      { label: '造訪雪場', value: String(new Set(ski.map((d: any) => d.resort.split('/')[0].trim())).size) },
    ],
  },
  explore: {
    title: '探索地圖',
    subtitle: '潛水潛點 × 滑雪雪場，橫跨多個國家的探索足跡',
    accent: '#4ade80',
    accentBg: 'rgba(74,222,128,0.08)',
    badge: '🌏 探索',
    stats: [
      { label: '個潛點', value: String(new Set(dives.filter((d: any) => d.lat).map((d: any) => `${(+d.lat).toFixed(2)}_${(+(d.lon as number)).toFixed(2)}`)).size) },
      { label: '個雪場', value: String(new Set(ski.map((d: any) => d.resort.split('/')[0].trim())).size) },
      { label: '個國家', value: String(new Set([...dives.map((d: any) => (d.location || '').split(', ').pop()), ...ski.map((d: any) => d.country)]).size) },
      { label: '年探索', value: '3' },
    ],
  },
};

export function getStaticPaths() {
  return Object.keys(PAGE_CONFIG).map(page => ({ params: { page } }));
}

export const GET: APIRoute = async ({ params }) => {
  const page = params.page as string;
  const cfg = PAGE_CONFIG[page];
  if (!cfg) return new Response('Not found', { status: 404 });

  let avatarDataUrl = '';
  try {
    const buf = readFileSync(resolve(process.cwd(), 'public/zhumao-avatar.jpg'));
    avatarDataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch (_) {}

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0a0e1a',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // 背景光暈
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-100px', top: '-100px',
                width: '500px', height: '500px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${cfg.accentBg} 0%, transparent 70%)`,
              },
            },
          },
          // 頂部 header
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' },
              children: [
                avatarDataUrl ? {
                  type: 'img',
                  props: {
                    src: avatarDataUrl,
                    style: { width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${cfg.accent}`, objectFit: 'cover' },
                  },
                } : { type: 'div', props: { children: '🐱', style: { fontSize: '36px' } } },
                {
                  type: 'div',
                  props: {
                    style: { color: cfg.accent, fontSize: '18px', fontWeight: '700' },
                    children: 'blesscat.dev',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      marginLeft: '8px',
                      background: cfg.accentBg,
                      border: `1px solid ${cfg.accent}44`,
                      borderRadius: '99px',
                      padding: '4px 14px',
                      color: cfg.accent,
                      fontSize: '13px',
                      fontWeight: '600',
                    },
                    children: cfg.badge,
                  },
                },
              ],
            },
          },
          // 大標題
          {
            type: 'div',
            props: {
              style: {
                color: '#f1f5f9',
                fontSize: '72px',
                fontWeight: '900',
                letterSpacing: '-2px',
                lineHeight: '1',
                marginBottom: '16px',
              },
              children: cfg.title,
            },
          },
          // 副標題
          {
            type: 'div',
            props: {
              style: {
                color: '#64748b',
                fontSize: '22px',
                lineHeight: '1.5',
                flex: '1',
              },
              children: cfg.subtitle,
            },
          },
          // 統計數字橫排
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: '0px',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #1e2535',
              },
              children: cfg.stats.map((s, i) => ({
                type: 'div',
                props: {
                  style: {
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingRight: '24px',
                    borderRight: i < cfg.stats.length - 1 ? '1px solid #1e2535' : 'none',
                    marginRight: i < cfg.stats.length - 1 ? '24px' : '0',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { color: cfg.accent, fontSize: '32px', fontWeight: '800', lineHeight: '1' },
                        children: s.value,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' },
                        children: s.label,
                      },
                    },
                  ],
                },
              })),
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
};

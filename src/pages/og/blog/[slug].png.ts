import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id.replace(/\.md$/, '') },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;
  const title = post.data.title.replace(/^\d{4}-\d{2}-\d{2}\s+/, '');
  const date = post.data.date;
  const tags: string[] = post.data.tags || [];
  const description = post.data.description || '';

  // 讀豬毛頭像 base64
  let avatarDataUrl = '';
  try {
    const avatarPath = resolve(process.cwd(), 'public/zhumao-avatar.jpg');
    const buf = readFileSync(avatarPath);
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
          padding: '60px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // 背景裝飾圓
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-80px',
                top: '-80px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                left: '-60px',
                bottom: '-60px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)',
              },
            },
          },
          // 頂部：頭像 + 網站名
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' },
              children: [
                avatarDataUrl ? {
                  type: 'img',
                  props: {
                    src: avatarDataUrl,
                    style: {
                      width: '52px', height: '52px',
                      borderRadius: '50%',
                      border: '2px solid #38bdf8',
                      objectFit: 'cover',
                    },
                  },
                } : { type: 'div', props: { style: { width: '52px', height: '52px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }, children: '🐱' } },
                {
                  type: 'div',
                  props: {
                    style: { color: '#38bdf8', fontSize: '20px', fontWeight: '700' },
                    children: 'blesscat.dev',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      marginLeft: '8px',
                      background: 'rgba(56,189,248,0.1)',
                      border: '1px solid rgba(56,189,248,0.3)',
                      borderRadius: '99px',
                      padding: '4px 14px',
                      color: '#38bdf8',
                      fontSize: '13px',
                      fontWeight: '600',
                    },
                    children: '📝 豬毛日記',
                  },
                },
              ],
            },
          },
          // tags
          tags.length > 0 ? {
            type: 'div',
            props: {
              style: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
              children: tags.slice(0, 4).map(tag => ({
                type: 'div',
                props: {
                  style: {
                    background: '#1a1a2e',
                    color: '#818cf8',
                    borderRadius: '99px',
                    padding: '4px 14px',
                    fontSize: '14px',
                    fontWeight: '600',
                  },
                  children: `#${tag}`,
                },
              })),
            },
          } : { type: 'div', props: { style: { height: '8px' } } },
          // 標題
          {
            type: 'div',
            props: {
              style: {
                color: '#f1f5f9',
                fontSize: title.length > 30 ? '40px' : '52px',
                fontWeight: '900',
                lineHeight: '1.2',
                letterSpacing: '-1px',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
              },
              children: title,
            },
          },
          // 底部：description + 日期
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #1e2535',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      color: '#64748b',
                      fontSize: '16px',
                      maxWidth: '800px',
                      lineHeight: '1.5',
                    },
                    children: description || ' ',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#475569', fontSize: '15px', whiteSpace: 'nowrap', marginLeft: '24px' },
                    children: date,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
};

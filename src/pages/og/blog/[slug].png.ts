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
  const heroImage: string | undefined = post.data.heroImage; // e.g. /images/xxx.jpg

  // 讀豬毛頭像 base64
  let avatarDataUrl = '';
  try {
    const avatarPath = resolve(process.cwd(), 'public/zhumao-avatar.jpg');
    const buf = readFileSync(avatarPath);
    avatarDataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch (_) {}

  // 讀日記插圖 base64（heroImage 路徑如 /images/xxx.jpg）
  let heroDataUrl = '';
  if (heroImage) {
    try {
      const imgPath = resolve(process.cwd(), 'public', heroImage.replace(/^\//, ''));
      const buf = readFileSync(imgPath);
      const ext = imgPath.endsWith('.png') ? 'png' : 'jpeg';
      heroDataUrl = `data:image/${ext};base64,${buf.toString('base64')}`;
    } catch (_) {}
  }

  const hasHero = !!heroDataUrl;

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0a0e1a',
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // 背景裝飾圓（左下）
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
          // 背景裝飾圓（右上，只在沒有插圖時顯示）
          !hasHero ? {
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
          } : { type: 'div', props: { style: {} } },

          // 左側：文字區塊
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                padding: '52px 56px',
                flex: hasHero ? '0 0 680px' : '1',
                width: hasHero ? '680px' : '100%',
                boxSizing: 'border-box',
              },
              children: [
                // 頂部：頭像 + 網站名
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
                    children: [
                      avatarDataUrl ? {
                        type: 'img',
                        props: {
                          src: avatarDataUrl,
                          style: {
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            border: '2px solid #38bdf8',
                            objectFit: 'cover',
                          },
                        },
                      } : { type: 'div', props: { style: { width: '48px', height: '48px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }, children: '🐱' } },
                      {
                        type: 'div',
                        props: {
                          style: { color: '#38bdf8', fontSize: '19px', fontWeight: '700' },
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
                    style: { display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' },
                    children: tags.slice(0, 4).map(tag => ({
                      type: 'div',
                      props: {
                        style: {
                          background: '#1a1a2e',
                          color: '#818cf8',
                          borderRadius: '99px',
                          padding: '3px 12px',
                          fontSize: '13px',
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
                      fontSize: hasHero
                        ? (title.length > 20 ? '34px' : '42px')
                        : (title.length > 30 ? '40px' : '52px'),
                      fontWeight: '900',
                      lineHeight: '1.25',
                      letterSpacing: '-0.5px',
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
                      marginTop: '20px',
                      paddingTop: '18px',
                      borderTop: '1px solid #1e2535',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            color: '#64748b',
                            fontSize: '14px',
                            maxWidth: hasHero ? '500px' : '800px',
                            lineHeight: '1.5',
                            overflow: 'hidden',
                            display: '-webkit-box',
                          },
                          children: description || ' ',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { color: '#475569', fontSize: '14px', whiteSpace: 'nowrap', marginLeft: '16px' },
                          children: date,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // 右側：插圖（只在有 heroImage 時顯示）
          hasHero ? {
            type: 'div',
            props: {
              style: {
                flex: '1',
                display: 'flex',
                alignItems: 'stretch',
                position: 'relative',
                overflow: 'hidden',
              },
              children: [
                // 左側漸層遮罩（與文字區塊自然融合）
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      width: '80px',
                      height: '100%',
                      background: 'linear-gradient(to right, #0a0e1a, transparent)',
                      zIndex: '1',
                    },
                  },
                },
                {
                  type: 'img',
                  props: {
                    src: heroDataUrl,
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    },
                  },
                },
              ],
            },
          } : { type: 'div', props: { style: {} } },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
};

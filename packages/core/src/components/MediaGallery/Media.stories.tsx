import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { MediaGallery, type MediaPiece } from './MediaGallery';

const meta = {
  title: 'Components/Media',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Placeholder artwork: a flat poster of the given shape, as SVG. */
function art(label: string, width: number, height: number, hue: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#111114"/><rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.8}" height="${height * 0.55}" fill="${hue}" opacity=".85"/><rect x="${width * 0.1}" y="${height * 0.72}" width="${width * 0.5}" height="${height * 0.05}" fill="#F4F4F6"/><text x="${width * 0.1}" y="${height * 0.9}" font-family="monospace" font-size="${Math.round(width / 18)}" fill="#A2A2AD">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const piece = (id: string, title: string, width: number, height: number, hue: string, video?: number): MediaPiece => ({
  id,
  kind: video ? 'video' : 'photo',
  thumb: art(title, width, height, hue),
  // The stories have no real clips; a video opens its cover frame in the viewer
  full: video ? 'placeholder.mp4' : art(title, width, height, hue),
  alt: `Placeholder: ${title}`,
  title,
  width,
  height,
  duration: video ?? null,
});

const PIECES: MediaPiece[] = [
  piece('1', 'Festival poster', 800, 1200, '#D4006F'),
  piece('2', 'Brand launch, 15 s', 1920, 1080, '#0098C7', 15),
  piece('3', 'Album cover', 1000, 1000, '#FF4FB0'),
  piece('4', 'Web banner', 1600, 500, '#1FE0FF'),
  piece('5', 'Logo reveal', 1080, 1080, '#D4006F', 8.4),
  piece('6', 'Magazine spread', 1400, 1000, '#A2A2AD'),
];

export const Gallery: Story = {
  render: () => <MediaGallery items={PIECES} label="Graphic design" />,
  parameters: { docs: { description: { story: 'Columns keep each piece’s shape. A tile opens the viewer: photos zoom, videos play with sound; arrows step through. With a mouse, video tiles play muted on hover (not under reduced motion).' } } },
};

export const Reel: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <VideoPlayer src="placeholder.mp4" poster={art('Showreel 2026', 1920, 1080, '#D4006F')} label="Showreel 2026" ambient />
    </div>
  ),
  parameters: { docs: { description: { story: 'ambient: muted, looping and starting by itself, for a showreel; under reduced motion it waits for play. The browser’s own controls handle sound and full screen.' } } },
};

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { clock } from '../../utils/clock';
import { MediaGallery, type MediaPiece } from './MediaGallery';

const PIECES: MediaPiece[] = [
  { id: 'a', kind: 'photo', thumb: 'poster-720.webp', full: 'poster-2048.webp', alt: 'A red festival poster', title: 'Festival poster', width: 800, height: 1200 },
  { id: 'b', kind: 'video', thumb: 'launch.jpg', full: 'launch.mp4', alt: 'A logo forming out of lines', title: 'Brand launch', width: 1920, height: 1080, duration: 43 },
];

describe('MediaGallery', () => {
  it('lists the pieces, keeps their shape and marks the videos with their length', () => {
    render(<MediaGallery items={PIECES} label="Graphic design" />);
    const list = screen.getByRole('list', { name: 'Graphic design' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'A red festival poster' })).toHaveAttribute('src', 'poster-720.webp');
    expect(screen.getByRole('button', { name: 'Brand launch, video 0:43: open' })).toBeInTheDocument();
    expect(screen.getByText('0:43')).toBeInTheDocument();
  });

  it('opens a photo full screen, and steps to a video that plays', async () => {
    render(<MediaGallery items={PIECES} label="Graphic design" />);
    await userEvent.click(screen.getByRole('button', { name: 'Festival poster: open' }));
    const dialog = screen.getByRole('dialog', { name: 'Piece: Festival poster' });
    expect(within(dialog).getByRole('img', { name: 'A red festival poster' })).toHaveAttribute('src', 'poster-2048.webp');
    expect(within(dialog).getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Next piece' }));
    expect(screen.getByRole('dialog', { name: 'Piece: Brand launch' })).toBeInTheDocument();
    const video = dialog.querySelector('video')!;
    expect(video).toHaveAttribute('src', 'launch.mp4');
    expect(video).toHaveAttribute('poster', 'launch.jpg');
    expect(within(dialog).queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
  });

  it('formats lengths as m:ss', () => {
    expect(clock(43)).toBe('0:43');
    expect(clock(75.4)).toBe('1:15');
    expect(clock(8.6)).toBe('0:09');
  });
});

describe('VideoPlayer', () => {
  it('plays inline with controls; a reel loops', () => {
    const { container } = render(<VideoPlayer src="reel.mp4" poster="reel.jpg" label="Showreel" ambient />);
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('aria-label', 'Showreel');
    expect(video).toHaveAttribute('poster', 'reel.jpg');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video.loop).toBe(true);
  });

  it('only loads the start of a clip that waits for play', () => {
    const { container } = render(<VideoPlayer src="clip.mp4" label="Clip" />);
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video.loop).toBe(false);
  });
});

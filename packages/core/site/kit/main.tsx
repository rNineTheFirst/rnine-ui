import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../fonts.css';
// Tokens and element styles; the components bring their own styles (from source)
import '../../dist/tokens.css';
import '../../dist/base.css';
import './global.scss';
import { App } from './App';
import { CHAPTERS } from './chapters';
import type { SiteInfo } from '../types';

declare const __SITE__: SiteInfo;

// An old link into the kit that used to be at the root (e.g. #color) goes on
// to that theme's kit at ./<id>/, keeping its chapter
const hash = location.hash.slice(1);
const ours = hash === 'top' || CHAPTERS.some(([id]) => id === hash);
if (__SITE__.formerRoot && hash && !ours) {
  location.replace(`./${__SITE__.formerRoot}/${location.hash}`);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App site={__SITE__} />
    </StrictMode>,
  );
}

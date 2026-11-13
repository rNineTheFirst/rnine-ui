import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// What styles.css bundles, from source where it can be (the components bring their own styles)
import '../fonts.css';
import '../dist/tokens.css';
import '@rnine/core/base.css';
import '../dist/ninefold-base.css';
import './global.scss';
import { App } from './App';
import type { SiteInfo } from '../../core/site/types';

declare const __SITE__: SiteInfo;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App site={__SITE__} />
  </StrictMode>,
);

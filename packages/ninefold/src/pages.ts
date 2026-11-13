// @rnine/ninefold/pages: @rnine/core/pages in the Ninefold look (status pages,
// emails, icons, the mood boot script): its tokens, on its paper. The same
// names as core's; see there.
import { PAGE_CSS, createPages } from '@rnine/core/pages';
import { css as tokensCss, tokens } from '@rnine/ninefold/tokens';
import paperCss from './pages/paper.scss?inline';

export * from '@rnine/core/pages';

const ninefold = createPages({ tokens, css: tokensCss + PAGE_CSS + paperCss });

export const { statusPage, emailLayout, emailTheme, markIcon, moodBootScript, themeColorMeta, pageFonts } = ninefold;

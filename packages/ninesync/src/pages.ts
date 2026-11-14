// @rnine/ninesync/pages: @rnine/core/pages in the NineSync look (status
// pages, emails, icons, the mood boot script), with its tokens. The same
// names as core's; see there.
import { PAGE_CSS, createPages } from '@rnine/core/pages';
import { css as tokensCss, tokens } from '@rnine/ninesync/tokens';

export * from '@rnine/core/pages';

const ninesync = createPages({ tokens, css: tokensCss + PAGE_CSS });

export const { statusPage, emailLayout, emailTheme, markIcon, moodBootScript, themeColorMeta, pageFonts } = ninesync;

// NineSync's brand kit: one page (kit/) built to kit/dist with relative paths,
// on the brand kit shell every library's kit shares (core/site). Hosted next to
// core's kit, at ./ninesync/. Its centerpiece is the client color builder.
//
//   yarn workspace @rnine/ninesync build-kit     (after `build`: it reads dist/tokens)
//   yarn workspace @rnine/ninesync dev-kit
import { defineConfig } from 'vite';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineKit } from '../../core/site/kit-config';

const pkg = fileURLToPath(new URL('..', import.meta.url));
const src = (file: string) => join(pkg, 'src', file);

export default defineConfig({
  ...defineKit({
    pkg,
    library: { name: '@rnine/ninesync', index: src('index.ts'), motion: src('motion.ts') },
    port: 5181,
  }),
  css: {
    modules: {
      // Core's class names as the library build has them: NineSync's look
      // (src/look.scss) finds core's components by these names
      generateScopedName: 'r9-[name]_[local]_[hash:base64:5]',
    },
  },
});

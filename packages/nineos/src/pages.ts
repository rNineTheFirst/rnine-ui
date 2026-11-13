// @rnine/nineos/pages: @rnine/core/pages in the NineOS look (status pages,
// emails, icons, the mood boot script). The same names as core's; see there.
import { PAGE_CSS, createPages } from '@rnine/core/pages';
import { css as tokensCss, tokens } from '@rnine/nineos/tokens';

export * from '@rnine/core/pages';

// The title's decrypt (TextReveal's NineOS look, without React): 1 s of
// terminal symbols in the accent, letters resolving left to right. Each letter
// keeps its place; a glyph is drawn over it while it resolves. Screen readers
// get the final text (aria-label).
const DECRYPT_CSS =
  'h1 .ch{position:relative}h1 .ch[data-g]{color:transparent}' +
  'h1 .ch[data-g]::after{content:attr(data-g);position:absolute;left:0;right:0;text-align:center;color:var(--r9-accent-text)}';

const DECRYPT = `(function(){
var h=document.querySelector('[data-reveal]');
if(!h||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.getAttribute('data-motion')==='reduced')return;
var text=h.textContent,G='<>/\\\\[]{}=+*#_:;';
h.setAttribute('aria-label',text);h.textContent='';
var cells=Array.from(text).map(function(c){if(c===' '){h.appendChild(document.createTextNode(' '));return null}var s=document.createElement('span');s.className='ch';s.setAttribute('aria-hidden','true');s.textContent=c;h.appendChild(s);return s});
var n=cells.length,start=0;
function hash(a,b){var x=(Math.imul(a+1,374761393)+Math.imul(b+1,668265263))|0;x=Math.imul(x^(x>>>13),1274126177);return(x^(x>>>16))>>>0}
function step(now){if(!start)start=now;var e=now-start,p=Math.min(1,e/1000);
cells.forEach(function(s,i){if(!s)return;if(p>=0.12+(i/n)*0.88){s.removeAttribute('data-g');return}s.setAttribute('data-g',G[hash(i,Math.floor((e+hash(i,999)%70)/70))%G.length])});
if(p<1)requestAnimationFrame(step)}
requestAnimationFrame(step)})();`;

const nineos = createPages({ tokens, css: tokensCss + PAGE_CSS + DECRYPT_CSS, reveal: DECRYPT });

export const { statusPage, emailLayout, emailTheme, markIcon, moodBootScript, themeColorMeta, pageFonts } = nineos;

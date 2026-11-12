import {
  siBehance,
  siBluesky,
  siDevdotto,
  siDiscord,
  siDribbble,
  siFacebook,
  siFigma,
  siFiverr,
  siGithub,
  siGitlab,
  siHackerrank,
  siHashnode,
  siInstagram,
  siKaggle,
  siLeetcode,
  siMastodon,
  siMedium,
  siNpm,
  siReddit,
  siStackoverflow,
  siSubstack,
  siTelegram,
  siThreads,
  siTiktok,
  siTwitch,
  siUpwork,
  siWhatsapp,
  siX,
  siYoutube,
} from 'simple-icons';

/** A site's mark from Simple Icons (CC0): the parts this library draws. simple-icons is
 *  bundled into the build, so the published types don't depend on it. */
export type BrandIcon = { title: string; hex: string; path: string };

/** A known site: its name, and its mark (Simple Icons, CC0; LinkedIn is drawn here). */
export type Brand = { name: string; icon: BrandIcon | 'linkedin' };

export type ContactKind = { type: 'email' } | { type: 'phone' } | { type: 'link'; brand: Brand | null };

// Hosts (and their subdomains) -> brand
const BRANDS: [string[], Brand][] = [
  [['linkedin.com', 'lnkd.in'], { name: 'LinkedIn', icon: 'linkedin' }],
  [['github.com'], { name: 'GitHub', icon: siGithub }],
  [['gitlab.com'], { name: 'GitLab', icon: siGitlab }],
  [['x.com', 'twitter.com'], { name: 'X', icon: siX }],
  [['youtube.com', 'youtu.be'], { name: 'YouTube', icon: siYoutube }],
  [['instagram.com'], { name: 'Instagram', icon: siInstagram }],
  [['facebook.com', 'fb.com'], { name: 'Facebook', icon: siFacebook }],
  [['dribbble.com'], { name: 'Dribbble', icon: siDribbble }],
  [['behance.net'], { name: 'Behance', icon: siBehance }],
  [['discord.com', 'discord.gg'], { name: 'Discord', icon: siDiscord }],
  [['medium.com'], { name: 'Medium', icon: siMedium }],
  [['dev.to'], { name: 'DEV', icon: siDevdotto }],
  [['stackoverflow.com'], { name: 'Stack Overflow', icon: siStackoverflow }],
  [['figma.com'], { name: 'Figma', icon: siFigma }],
  [['upwork.com'], { name: 'Upwork', icon: siUpwork }],
  [['fiverr.com'], { name: 'Fiverr', icon: siFiverr }],
  [['kaggle.com'], { name: 'Kaggle', icon: siKaggle }],
  [['leetcode.com'], { name: 'LeetCode', icon: siLeetcode }],
  [['hackerrank.com'], { name: 'HackerRank', icon: siHackerrank }],
  [['twitch.tv'], { name: 'Twitch', icon: siTwitch }],
  [['threads.net', 'threads.com'], { name: 'Threads', icon: siThreads }],
  [['bsky.app'], { name: 'Bluesky', icon: siBluesky }],
  [['mastodon.social', 'mastodon.online'], { name: 'Mastodon', icon: siMastodon }],
  [['npmjs.com'], { name: 'npm', icon: siNpm }],
  [['reddit.com'], { name: 'Reddit', icon: siReddit }],
  [['tiktok.com'], { name: 'TikTok', icon: siTiktok }],
  [['t.me', 'telegram.me'], { name: 'Telegram', icon: siTelegram }],
  [['wa.me', 'whatsapp.com'], { name: 'WhatsApp', icon: siWhatsapp }],
  [['substack.com'], { name: 'Substack', icon: siSubstack }],
  [['hashnode.dev', 'hashnode.com'], { name: 'Hashnode', icon: siHashnode }],
];

/** The known site a web address belongs to, or null. Works with or without https://. */
export function brandOf(url: string | null | undefined): Brand | null {
  if (!url) return null;
  let host: string;
  try {
    host = new URL(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const [hosts, brand] of BRANDS) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) return brand;
  }
  return null;
}

/** What a contact line is, from its link: an email (mailto:), a phone (tel:) or a web link. */
export function contactKind(href: string | null | undefined): ContactKind {
  if (href && /^mailto:/i.test(href)) return { type: 'email' };
  if (href && /^tel:/i.test(href)) return { type: 'phone' };
  return { type: 'link', brand: brandOf(href) };
}

const ORDER = { email: 0, phone: 1, link: 2 } as const;

/** Contact lines grouped (emails, then phones, then links), each group in its own order. */
export function groupContacts<T extends { href?: string | null }>(lines: T[]): T[] {
  return lines
    .map((l, i) => ({ l, i, o: ORDER[contactKind(l.href).type] }))
    .sort((a, b) => a.o - b.o || a.i - b.i)
    .map(({ l }) => l);
}

// The brand kit shell: the pieces every library's brand kit shares. Not part
// of the npm package: core's kit and each library's kit (oss/packages/<id>/kit)
// import it from this folder. Styled only by the tokens and shared mixins,
// effects only through the role slots, so each kit wears its library's look.
export { KitHeader } from './KitHeader';
export { ThemeCards } from './ThemeCards';
export { ColorRoles, ContrastTable } from './ColorRoles';
export type { Role } from './ColorRoles';
export { CopyValue } from './CopyValue';
export { MoodScope } from './MoodScope';
export { contrast, grade, luminance, textPairs } from './contrast';
export type { Grade } from './contrast';
export type { SiteInfo, ThemeInfo, MoodColors } from '../types';

// @rnine/core: the components every library has, in Plain (the placeholder
// look). Motion effects are in "@rnine/core/motion". Every library exports
// these same names with the same props: an app switches libraries by import.
// Styles: import "<library>/fonts.css" and "<library>/styles.css" once.

export { ThemeProvider, useTheme } from './provider/ThemeProvider';
export type { ThemeConfig, ThemeProviderProps, ThemeSlots } from './provider/ThemeProvider';
export { MarkProvider, PLACEHOLDER_MARK, useMark } from './provider/mark';
export type { MarkArtwork, MarkProps, MarkVariant } from './provider/mark';

export { Button } from './components/Button/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/Button';

export { Text } from './components/Text/Text';
export type { TextTone, TextVariant } from './components/Text/Text';

export { Select, TextArea, TextField } from './components/Field/Field';
export type { SelectProps, TextAreaProps, TextFieldProps } from './components/Field/Field';
export { Combobox } from './components/Combobox/Combobox';
export type { ComboboxOption, ComboboxProps } from './components/Combobox/Combobox';
export { NumberField } from './components/NumberField/NumberField';
export type { NumberFieldProps } from './components/NumberField/NumberField';
export { DateField } from './components/DateField/DateField';
export type { DateFieldProps } from './components/DateField/DateField';

export { Checkbox, RadioGroup, Switch } from './components/Choice/Choice';
export type { RadioOption } from './components/Choice/Choice';

export { Card } from './components/Card/Card';
export { Status, Tag } from './components/Tag/Tag';
export type { StatusTone } from './components/Tag/Tag';
export { ContactIcon } from './components/ContactIcon/ContactIcon';
export { brandOf, contactKind, groupContacts } from './utils/contact';
export type { Brand, ContactKind } from './utils/contact';
export { Alert } from './components/Alert/Alert';
export type { AlertTone } from './components/Alert/Alert';
export { Tabs } from './components/Tabs/Tabs';
export type { TabItem } from './components/Tabs/Tabs';
export { Progress } from './components/Progress/Progress';

export { Modal } from './components/Modal/Modal';
export type { ModalProps } from './components/Modal/Modal';
export { Drawer } from './components/Drawer/Drawer';
export type { DrawerProps } from './components/Drawer/Drawer';
export { ToastProvider, useToast } from './components/Toast/Toast';
export type { ToastContextValue, ToastOptions, ToastVariant } from './components/Toast/Toast';
export { Tooltip } from './components/Tooltip/Tooltip';
export { Table } from './components/Table/Table';
export type { Column, TableProps } from './components/Table/Table';
export { Pagination } from './components/Table/Pagination';
export type { PaginationProps } from './components/Table/Pagination';
export { Breadcrumbs } from './components/Breadcrumbs/Breadcrumbs';
export type { BreadcrumbItem } from './components/Breadcrumbs/Breadcrumbs';
export { Avatar } from './components/Avatar/Avatar';
export { Skeleton } from './components/Skeleton/Skeleton';
export { BackToTop, SkipLink } from './components/PageTools/PageTools';

// Panels: glass panels over the backdrop, and the bar above one
export { Panel } from './components/Panel/Panel';
export { usePanelEnterDelay } from './components/Panel/stageContext';
export { PanelBar } from './components/Panel/PanelBar';
export { MenuRail } from './components/MenuRail/MenuRail';
export type { MenuRailItem } from './components/MenuRail/MenuRail';
export { SegmentedControl } from './components/SegmentedControl/SegmentedControl';
export type { SegmentOption } from './components/SegmentedControl/SegmentedControl';
export { ListRow, RowList } from './components/ListRow/ListRow';
export { ScreenshotCarousel } from './components/ScreenshotCarousel/ScreenshotCarousel';
export { CaseStudy } from './components/CaseStudy/CaseStudy';
export { Prose } from './components/Prose/Prose';
export type { Screenshot } from './components/ScreenshotCarousel/ScreenshotCarousel';
export { MediaGallery } from './components/MediaGallery/MediaGallery';
export type { MediaPiece } from './components/MediaGallery/MediaGallery';
export { VideoPlayer } from './components/VideoPlayer/VideoPlayer';

// App layout: internal tools and admin apps (sidebar navigation, page headers, dashboards, menus)
export { AppShell } from './components/AppShell/AppShell';
export { useAppShell } from './components/AppShell/appShellContext';
export type { AppShellContextValue } from './components/AppShell/appShellContext';
export { SideNav } from './components/AppShell/SideNav';
export type { SideNavGroup, SideNavItem } from './components/AppShell/SideNav';
export { PageHeader } from './components/PageHeader/PageHeader';
export { StatTile } from './components/StatTile/StatTile';
export type { StatChange } from './components/StatTile/StatTile';
export { EmptyState } from './components/EmptyState/EmptyState';
export { Menu } from './components/Menu/Menu';
export type { MenuEntry, MenuGroup, MenuItem, MenuSeparator } from './components/Menu/Menu';
export type { LinkProps, RenderLink } from './utils/link';

// Layout and brand: page structure, the wordmark and the mood switch
export { Container, Eyebrow, Section, Stack } from './components/Layout/Layout';
export { MoodToggle, MotionToggle, Wordmark } from './components/Brand/Brand';

// The app's mark (with the library's animation) is also in /motion; exported here because every app needs it
export { Mark } from './motion/Mark';

// Hooks: mood and motion preferences
export { DAY_STARTS, MOOD_BOOT_SCRIPT, MOOD_STORAGE_KEY, NIGHT_STARTS, applyMood, configureMood, moodBootScript, moodNames, schemeAt, setMood, systemDark, useMood } from './hooks/mood';
export { MOTION_STORAGE_KEY, applyMotion, configureMotion, setStill, useMotionSetting } from './hooks/motionSetting';
export type { AutoRule, BootScriptOptions, MoodName, MoodNames, MoodOptions, MoodSetting, Scheme } from './hooks/mood';
export { useReducedMotion, useFinePointer } from './hooks/motion';

// Color: contrast math, and client colors (a client's brand color checked and turned into the accent roles)
export { contrastRatio, hexToHsl, hslToHex, hueDistance, luminance, mixHex, parseHex } from './utils/color';
export type { Hsl } from './utils/color';
export { CLIENT_COLOR_RULES, clientAccent, paleTone, suggestColor } from './utils/clientColors';
export type { ClientAccent, ClientAccentRoles, ClientColorCheck, ClientColors, ClientPage } from './utils/clientColors';

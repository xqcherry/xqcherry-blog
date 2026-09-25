import type {
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	SponsorConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "xqcherry站点",
	subtitle: "呱~",
	startedAt: new Date("2026-09-22T00:00:00+08:00"),
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 177, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false, // Set to true and provide a src to enable the banner
		src: "", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{ src: "/favicon/favicon-light-32.png", theme: "light", sizes: "32x32" },
		{ src: "/favicon/favicon-light-192.png", theme: "light", sizes: "192x192" },
		{ src: "/favicon/favicon-dark-32.png", theme: "dark", sizes: "32x32" },
		{ src: "/favicon/favicon-dark-192.png", theme: "dark", sizes: "192x192" },
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "留言板",
			url: "/guestbook/",
			icon: "material-symbols:chat-bubble-outline-rounded",
		},
		{
			name: "关于",
			url: "/about/",
			icon: "material-symbols:person-outline-rounded",
			children: [
				{ name: "关于我", url: "/about/", icon: "material-symbols:person-outline-rounded" },
				{ name: "赞助", url: "/sponsor/", icon: "material-symbols:volunteer-activism-outline-rounded" },
			],
		},
		{
			name: "GitHub",
			url: "https://github.com/xqcherry", // Internal links should not include the base path, as it is automatically added
			icon: "fa6-brands:github",
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "xqcherry",
	bio: "物是人非事事休，欲语泪先流",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/xqcherry",
		},
		{
			name: "E-Mail",
			icon: "fa6-regular:envelope",
			url: "mailto:xqcherry@foxmail.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const commentConfig: CommentConfig = {
	enable: true,
	serverURL: "https://artalk.xqcherry.top",
	siteName: "xqcherry站点",
};

export const sponsorConfig: SponsorConfig = {
	qrCode: "/sponsor/placeholder.svg",
	entries: [],
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

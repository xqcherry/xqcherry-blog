// Adapted from Firefly (https://github.com/CuteLeaf/Firefly).
// Copyright (c) 2024 saicaca, 2025 CuteLeaf. Licensed under MIT.

const iconNamePattern = /^[\w-]+:[\w-]+$/;

export type ResolvedLinkIcon =
	| { kind: "icon"; value: string }
	| { kind: "image"; value: string }
	| { kind: "letter"; value: string };

export function resolveLinkIcon(icon: string, label: string): ResolvedLinkIcon {
	const trimmed = icon?.trim();
	if (trimmed) {
		if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) {
			return { kind: "image", value: trimmed };
		}
		if (iconNamePattern.test(trimmed)) return { kind: "icon", value: trimmed };
		return { kind: "image", value: trimmed };
	}
	return { kind: "letter", value: (label || "?").trim().charAt(0).toUpperCase() || "?" };
}

const statusMeta: Record<string, { label: string; icon: string; className: string; coverClassName: string }> = {
	planning: { label: "计划中", icon: "material-symbols:schedule-outline-rounded", className: "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/65", coverClassName: "bg-black/65 text-white" },
	developing: { label: "开发中", icon: "material-symbols:code-rounded", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", coverClassName: "bg-amber-600/90 text-white" },
	published: { label: "已发布", icon: "material-symbols:rocket-launch-outline-rounded", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", coverClassName: "bg-emerald-600/90 text-white" },
	archived: { label: "已归档", icon: "material-symbols:archive-outline-rounded", className: "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/65", coverClassName: "bg-black/65 text-white" },
};

export const projectStatusKeys = Object.keys(statusMeta);

export function getProjectStatusMeta(status: string) {
	if (!status) return null;
	return statusMeta[status] || {
		label: status,
		icon: "",
		className: "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/65",
		coverClassName: "bg-black/65 text-white",
	};
}

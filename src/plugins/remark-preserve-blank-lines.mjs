const SPACED_BLOCK_CLASS = "markdown-spaced-block";

function markSpacedChildren(node) {
	if (!Array.isArray(node.children)) return;

	for (let index = 1; index < node.children.length; index++) {
		const previous = node.children[index - 1];
		const current = node.children[index];
		const previousEnd = previous.position?.end.line;
		const currentStart = current.position?.start.line;

		if (previousEnd && currentStart && currentStart - previousEnd > 2) {
			current.data ??= {};
			current.data.hProperties ??= {};
			const className = current.data.hProperties.className ?? [];
			current.data.hProperties.className = [
				...(Array.isArray(className) ? className : [className]),
				SPACED_BLOCK_CLASS,
			];
		}
	}

	for (const child of node.children) markSpacedChildren(child);
}

/** Preserve intentional extra blank lines so page-specific CSS can render them. */
export function remarkPreserveBlankLines() {
	return (tree) => markSpacedChildren(tree);
}

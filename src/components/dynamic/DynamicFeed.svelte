<script lang="ts">
	import { onMount } from "svelte";

	let search = "";
	let year = "all";
	let page = 1;
	let perPage = 8;
	let items: HTMLElement[] = [];
	let years: string[] = [];
	let hydrated = false;

	$: filtered = items.filter((item) => {
		const matchesYear = year === "all" || item.dataset.year === year;
		const matchesSearch = !search || (item.dataset.search || "").includes(search.toLocaleLowerCase().trim());
		return matchesYear && matchesSearch;
	});
	$: totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	$: if (page > totalPages) page = totalPages;
	$: visible = new Set(filtered.slice((page - 1) * perPage, page * perPage));
	$: items.forEach((item) => { item.hidden = hydrated && !visible.has(item); });

	onMount(() => {
		items = Array.from(document.querySelectorAll<HTMLElement>("[data-dynamic-item]"));
		const feed = document.querySelector<HTMLElement>("[data-dynamic-feed]");
		perPage = Number(feed?.dataset.perPage || 8);
		years = [...new Set(items.map((item) => item.dataset.year || ""))].filter(Boolean).sort((a, b) => Number(b) - Number(a));
		const params = new URLSearchParams(window.location.search);
		page = Math.max(1, Number(params.get("page")) || 1);
		const hash = window.location.hash.slice(1);
		const target = hash && items.find((item) => item.id === hash);
		if (target) page = Math.floor(items.indexOf(target) / perPage) + 1;
		hydrated = true;
	});

	function resetPage() {
		page = 1;
		updateUrl();
	}

	function updateUrl() {
		const url = new URL(window.location.href);
		if (page > 1) url.searchParams.set("page", String(page));
		else url.searchParams.delete("page");
		history.replaceState(history.state, "", url);
	}

	function updatePage(next: number) {
		page = Math.min(Math.max(1, next), totalPages);
		updateUrl();
		document.querySelector(".dynamic-page")?.scrollIntoView({ behavior: "smooth", block: "start" });
	}
</script>

<div data-dynamic-feed data-per-page="8" class="dynamic-feed-shell">
	<div class="dynamic-toolbar card-base">
		<div class="dynamic-count"><strong>{filtered.length}</strong><span>条动态</span></div>
		<label class="dynamic-search"><span>搜索动态</span><input type="search" bind:value={search} on:input={resetPage} placeholder="搜索正文或地点" /></label>
		<label class="dynamic-year"><span>年份</span><select bind:value={year} on:change={resetPage}><option value="all">全部年份</option>{#each years as item}<option value={item}>{item}</option>{/each}</select></label>
	</div>
	<div class="dynamic-list"><slot /></div>
	{#if hydrated && filtered.length === 0}<div class="dynamic-empty card-base"><strong>没有找到匹配的动态</strong><span>换个关键词或年份试试。</span></div>{/if}
	{#if totalPages > 1}
		<nav class="dynamic-pagination" aria-label="动态分页">
			<button type="button" disabled={page === 1} on:click={() => updatePage(page - 1)}>上一页</button>
			<span>第 {page} / {totalPages} 页</span>
			<button type="button" disabled={page === totalPages} on:click={() => updatePage(page + 1)}>下一页</button>
		</nav>
	{/if}
</div>

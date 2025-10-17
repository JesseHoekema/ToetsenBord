<script lang="ts">
	import "../app.css";
	import favicon from "@/assets/logo-icon.png";
	import { ModeWatcher } from "mode-watcher";
	import { setMode } from "mode-watcher";
	import { onMount } from "svelte";
	import { Toaster } from "svelte-french-toast";
	import { page } from "$app/stores";

	const pathname = $derived(
		$page.url.pathname
			.split("/")
			.filter(Boolean)
			.map((part) =>
				part
					.replace(/-/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase()),
			)
			.join(" | "),
	);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- <title
		>{pathname ? `${pathname} | ToetsenBord` : "Home | ToetsenBord"}</title
	> -->
</svelte:head>

<ModeWatcher />
<Toaster />
{@render children?.()}

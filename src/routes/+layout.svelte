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
	<script defer src="https://umami.jessehoekema.com/script.js" data-website-id="3ade8ee6-c62a-468d-85ac-2b01da7bc5f3"></script>
</svelte:head>

<ModeWatcher defaultMode="dark" />
<Toaster />
{@render children?.()}

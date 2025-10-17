<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import ConnectIcon from "@lucide/svelte/icons/link";
    import * as Card from "$lib/components/ui/card/index.js";
    import toast from "svelte-french-toast";
    import { mode } from "mode-watcher";
    import Page from "../+page.svelte";

    const { data } = $props();
</script>
<svelte:head>
    <title>Cijfers | ToetsenBord</title>
</svelte:head>

<Sidebar.Provider>
    <AppSidebar user={data.user} />
    <Sidebar.Inset>
        <header class="flex h-14 shrink-0 items-center gap-2">
            <div class="flex flex-1 items-center gap-2 px-3">
                <Sidebar.Trigger />
                <Separator
                    orientation="vertical"
                    class="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Page class="line-clamp-1">
                                Cijfers
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <div class="flex gap-4 flex-col">
                {#each (data.grades ?? []).slice().reverse() as grade}
                    <Card.Root class="rounded-2xl min-w-fit">
                        <Card.Content>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                                        class:bg-zinc-800={mode.current ===
                                            "dark"}
                                        class:bg-muted={mode.current ===
                                            "light"}
                                    >
                                        <div>{@html grade.icon}</div>
                                    </div>
                                    <div class="flex flex-col">
                                        <h2
                                            class="text-lg font-normal mb-1 whitespace-nowrap"
                                        >
                                            {grade.vak}
                                        </h2>
                                        <p
                                            class="text-zinc-500 text-xs whitespace-nowrap"
                                        >
                                            {grade.datum} · {grade.omschrijving}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div
                                        class="text-xs font-medium text-muted-foreground mt-1"
                                    >
                                        {grade.weging}x
                                    </div>
                                    <div
                                        class="text-4xl font-medium tracking-tight {grade.type ===
                                        'onvoldoende'
                                            ? 'text-red-500'
                                            : 'text-green-500'}"
                                    >
                                        {grade.grade}
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
                {#if data.grades === null}
                    <h2 class="text-2xl font-semibold mb-2">Cijfers</h2>
                    <div class="flex flex-col gap-4">
                        <h1 class="text-lg">
                            Om cijfers en toetsen te laten zien koppel eerst somtoday!
                        </h1>
                        <a href="/somtoday-integration">
                            <Button>Koppel Somtoday</Button>
                        </a>
                    </div>
                {/if}
            </div>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>

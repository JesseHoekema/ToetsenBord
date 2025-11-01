<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import toast from "svelte-french-toast";
    import Button from "@/components/ui/button/button.svelte";

    const { data } = $props();
</script>

<svelte:head>
    <title>Huiswerk | ToetsenBord</title>
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
                                Huiswerk
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <div class="">
                <h2 class="text-2xl font-semibold mb-2">Alle Huiswerk</h2>
                <div class="flex gap-8 flex-wrap">
                    {#each (data.homework ?? []).slice().reverse() as homeworkItem}
                        <a href={homeworkItem.link}>
                            <Card.Root
                                class="w-48 h-69 p-0 flex flex-col hover:scale-101 transition-all cursor-pointer"
                            >
                                <img
                                    src={homeworkItem.imageUrl}
                                    alt="boeken"
                                    class="rounded-t-xl h-50 w-full object-cover"
                                />
                                <div class="ml-2 mt-[-20px]">
                                    <h1 class="text-2xl truncate">{homeworkItem.vak}</h1>
                                    <p class="text-sm">{homeworkItem.datum}</p>
                                </div>
                            </Card.Root>
                        </a>
                    {/each}

                    {#if !data.homework || data.homework.length === 0}
                        <div class="flex flex-col gap-4 mt-3">
                            <h1 class="text-lg">Om huiswerk te laten zien koppel eerst somtoday!</h1>
                            <a href="/somtoday-integration">
                                <Button>Koppel Somtoday</Button>
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import * as Card from "$lib/components/ui/card/index.js";
    import { goto } from "$app/navigation";

    const { data } = $props();
</script>

<svelte:head>
    <title>Boeken | ToetsenBord</title>
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
                                Mijn Boeken
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <div class="flex justify-between items-center w-full">
                <h2 class="text-2xl font-semibold mb-2">Mijn Boeken</h2>
                <Button onclick={() => goto('/books/add')}><PlusIcon />Toevoegen</Button>
            </div>
            <div class="flex gap-8">
                {#each data.books as book}
                    <a href={book.link}>
                        <Card.Root
                            class="w-48 h-69 p-0 flex flex-col hover:scale-101 transition-all cursor-pointer"
                        >
                            <img
                                src={book.image_url}
                                alt="boeken"
                                class="rounded-t-xl h-50 w-full object-cover"
                            />
                            <div class="ml-2 mt-[-20px]">
                               <h1 class="text-2xl w-fit">{book.title}</h1>
                                <!-- <p class="text-sm">{exam.formattedDate}</p> -->
                            </div>
                        </Card.Root>
                    </a>
                {/each}
            </div>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>

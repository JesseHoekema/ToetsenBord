<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import toast from "svelte-french-toast";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import EditIcon from "@lucide/svelte/icons/pencil";

    const { data } = $props();
    
    let showAddDialog = $state(false);
    let showEditDialog = $state(false);
    let newPageNumber = $state("");
    let isSubmitting = $state(false);
    let importantPages = $state(data.book.importantPages || []);
    
    let editTitle = $state("");
    let editType = $state("");
    let editOnlineBook = $state("");

    async function addPage() {
        if (!newPageNumber || newPageNumber === "") {
            toast.error("Voer een paginanummer in");
            return;
        }

        isSubmitting = true;
        try {
            const response = await fetch('/api/books/pages', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookPage: parseInt(newPageNumber.toString()),
                    bookId: data.book.id,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("Pagina toegevoegd!");
                importantPages = result.book.importantPages;
                showAddDialog = false;
                newPageNumber = "";
            } else {
                toast.error(result.error || "Er is iets misgegaan");
            }
        } catch (error) {
            console.error("Error adding page:", error);
            toast.error("Er is iets misgegaan");
        } finally {
            isSubmitting = false;
        }
    }

    async function deletePage(page: number) {
        try {
            const response = await fetch('/api/books/pages', {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookPage: page,
                    bookId: data.book.id,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("Pagina verwijderd!");
                importantPages = result.book.importantPages;
            } else {
                toast.error(result.error || "Er is iets misgegaan");
            }
        } catch (error) {
            console.error("Error removing page:", error);
            toast.error("Er is iets misgegaan");
        }
    }

    function openEditDialog() {
        editTitle = data.book.title;
        editType = data.book.type;
        editOnlineBook = data.book.onlineBook || "";
        showEditDialog = true;
    }

    async function saveBookEdit() {
        if (!editTitle || !editType) {
            toast.error("Titel en type zijn verplicht");
            return;
        }

        isSubmitting = true;
        try {
            const response = await fetch('/api/books/edit', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookId: data.book.id,
                    title: editTitle,
                    type: editType,
                    onlineBook: editOnlineBook,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("Boek bijgewerkt!");
                data.book.title = editTitle;
                data.book.type = editType;
                data.book.onlineBook = editOnlineBook;
                showEditDialog = false;
            } else {
                toast.error(result.error || "Er is iets misgegaan");
            }
        } catch (error) {
            console.error("Error updating book:", error);
            toast.error("Er is iets misgegaan");
        } finally {
            isSubmitting = false;
        }
    }
</script>
<svelte:head>
    <title>{data.book.title} | ToetsenBord</title>
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
                                {data.book.title} - {data.book.type}
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <Card.Root>
                <Card.Content class="flex flex-row items-center gap-4">
                    <img
                        src={data.book.image_url}
                        alt="book cover"
                        class="w-28 h-auto rounded-sm"
                    />
                    <div class="flex flex-col justify-center flex-1">
                        <h1 class="text-4xl font-medium">{data.book.title}</h1>
                        <p class="text-xl font-medium">
                            {data.book.type
                                .split(" ")
                                .map(
                                    (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                )
                                .join(" ")}
                        </p>
                    </div>
                    <Button onclick={openEditDialog} variant="outline">
                        <EditIcon class="w-4 h-4 mr-2" />
                        Bewerken
                    </Button>
                </Card.Content>
            </Card.Root>
            <Card.Root class="mt-5">
                <Card.Content>
                    <h1 class="text-2xl font-medium mb-3">Online Boek</h1>
                    {#if data.book.onlineBook}
                        <Button
                            onclick={() =>
                                window.open(data.book.onlineBook, "_blank")}
                        >
                            Open Online Boek
                        </Button>
                    {:else}
                        <span>Geen online boek beschikbaar</span>
                    {/if}
                </Card.Content>
            </Card.Root>
            <Card.Root class="mt-5">
                <Card.Content>
                    <div class="flex justify-between items-center w-full">
                        <h1 class="text-2xl font-medium mb-3">
                            Belangrijke Pagina's
                        </h1>
                        <Button onclick={() => (showAddDialog = true)}>
                            <PlusIcon />Toevoegen
                        </Button>
                    </div>
                    <div>
                        {#each importantPages as page}
                            <Card.Root class="mt-3 p-4 cursor-pointer">
                                <Card.Content class="px-1 flex justify-between items-center">
                                    <h1 class="hover:underline transition-all">
                                        Pagina {page}
                                    </h1>
                                    <TrashIcon
                                        onclick={() => deletePage(page)}
                                        class="w-5 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                                    />
                                </Card.Content>
                            </Card.Root>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>

<Dialog.Root bind:open={showAddDialog}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Pagina Toevoegen</Dialog.Title>
            <Dialog.Description>
                Voer het paginanummer in dat je wilt toevoegen aan belangrijke pagina's.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid gap-2">
                <label for="pageNumber" class="text-sm font-medium">
                    Paginanummer
                </label>
                <Input
                    id="pageNumber"
                    type="number"
                    bind:value={newPageNumber}
                    placeholder="Bijv. 42"
                    disabled={isSubmitting}
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => {
                    showAddDialog = false;
                    newPageNumber = "";
                }}
                disabled={isSubmitting}
            >
                Annuleren
            </Button>
            <Button onclick={addPage} disabled={isSubmitting}>
                {isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={showEditDialog}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Boek Bewerken</Dialog.Title>
            <Dialog.Description>
                Wijzig de details van het boek.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid gap-2">
                <label for="editTitle" class="text-sm font-medium">
                    Titel
                </label>
                <Input
                    id="editTitle"
                    type="text"
                    bind:value={editTitle}
                    placeholder="Boektitel"
                    disabled={isSubmitting}
                />
            </div>
            <div class="grid gap-2">
                <label for="editType" class="text-sm font-medium">
                    Type
                </label>
                <Input
                    id="editType"
                    type="text"
                    bind:value={editType}
                    placeholder="Bijv. frans"
                    disabled={isSubmitting}
                />
            </div>
            <div class="grid gap-2">
                <label for="editOnlineBook" class="text-sm font-medium">
                    Online Boek URL
                </label>
                <Input
                    id="editOnlineBook"
                    type="text"
                    bind:value={editOnlineBook}
                    placeholder="https://..."
                    disabled={isSubmitting}
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => {
                    showEditDialog = false;
                }}
                disabled={isSubmitting}
            >
                Annuleren
            </Button>
            <Button onclick={saveBookEdit} disabled={isSubmitting}>
                {isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
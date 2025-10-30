<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import BookIcon from "@lucide/svelte/icons/book";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import toast from "svelte-french-toast";
    import DropIcon from "@lucide/svelte/icons/chevron-down";
    import * as Select from "$lib/components/ui/select/index.js";
    import TrashIcon from "@lucide/svelte/icons/trash";

    const { data } = $props();

    let isEditingNotes = $state(false);
    let notesContent = $state(data.exam.notes || "");
    let originalNotes = $state(data.exam.notes || "");
    let isSaving = $state(false);
    let selectedBook = $state("");

    const books = data.books;

    let selectedIcon = $state("globe");
    let linkInput = $state("");
    let examLinks = $state([...data.exam.links]);
    let examBooks = $state([...data.exam.books]);

    function startEditing() {
        isEditingNotes = true;
        notesContent = data.exam.notes || "";
        originalNotes = data.exam.notes || "";
    }

    function cancelEditing() {
        isEditingNotes = false;
        notesContent = originalNotes;
    }

    async function saveNotes() {
        isSaving = true;
        try {
            const response = await fetch("/api/exam-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "editNotes",
                    vak: data.exam.vak,
                    dateDue: data.exam.datum,
                    content: notesContent,
                }),
            });

            if (response.ok) {
                toast.success("Notities opgeslagen");
                data.exam.notes = notesContent;
                originalNotes = notesContent;
                isEditingNotes = false;
            } else {
                toast.error("Fout bij opslaan");
            }
        } catch (error) {
            toast.error("Fout bij opslaan");
            console.error(error);
        } finally {
            isSaving = false;
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            startEditing();
        }
    }
    async function handleSaveLink() {
        if (selectedIcon === "globe" && linkInput.trim()) {
            let normalizedLink = linkInput.trim();
            if (!/^https?:\/\//i.test(normalizedLink)) {
                normalizedLink = "https://" + normalizedLink;
            }

            if (examLinks.includes(normalizedLink)) {
                toast.error("Deze link bestaat al");
                return;
            }

            const response = await fetch("/api/exam-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addLink",
                    vak: data.exam.vak,
                    dateDue: data.exam.datum,
                    content: normalizedLink,
                }),
            });

            if (response.ok) {
                toast.success("Link opgeslagen");
                examLinks = [...examLinks, normalizedLink];
                linkInput = "";
            } else {
                toast.error("Link opslaan is niet gelukt");
            }
        } else if (selectedIcon === "book" && selectedBook) {
            const book = books.find((b) => b.value === selectedBook);

            if (examBooks.some((b) => b.title === book?.label)) {
                toast.error("Dit boek is al toegevoegd");
                return;
            }

            const response = await fetch("/api/exam-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addBook",
                    vak: data.exam.vak,
                    dateDue: data.exam.datum,
                    content: book?.label,
                }),
            });

            if (response.ok) {
                toast.success("Boek toegevoegd!");

                const bookSlug = book?.label
                    .toLowerCase() // lowercase
                    .replace(/\s+/g, "-") // replace spaces with -
                    .replace(/[^\w-]/g, ""); // remove special chars

                examBooks = [
                    ...examBooks,
                    { title: book?.label || "", link: `/books/${bookSlug}` },
                ];
                selectedBook = "";
            } else {
                toast.error("Boek opslaan is niet gelukt");
            }
        } else {
            toast.error("Please Fill in all fields");
        }
    }

    function handleLinkKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            handleSaveLink();
        }
    }
    async function removeLink(link: string) {
        try {
            const response = await fetch("/api/exam-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "removeLink",
                    vak: data.exam.vak,
                    dateDue: data.exam.datum,
                    content: link,
                }),
            });

            if (response.ok) {
                toast.success("Link verwijderd");
                examLinks = examLinks.filter((l) => l !== link);
            } else {
                toast.error("Link verwijderen is niet gelukt");
            }
        } catch (error) {
            console.log(error);
            toast.error("Link verwijderen is niet gelukt");
        }
    }

    async function removeBook(bookTitle: string) {
        try {
            const response = await fetch("/api/exam-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "removeBook",
                    vak: data.exam.vak,
                    dateDue: data.exam.datum,
                    content: bookTitle,
                }),
            });

            if (response.ok) {
                toast.success("Boek verwijderd");
                examBooks = examBooks.filter((b) => b.title !== bookTitle);
            } else {
                toast.error("Boek verwijderen is niet gelukt");
            }
        } catch (error) {
            console.log(error);
            toast.error("Boek verwijderen is niet gelukt");
        }
    }
</script>

<svelte:head>
    <title>{data.exam.vak} - {data.exam.onderwerp} | ToetsenBord</title>
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
                                {data.exam.vak} - {data.exam.onderwerp}
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
                        src={data.exam.image_url}
                        alt="book cover"
                        class="w-28 h-auto rounded-sm"
                    />
                    <div class="flex flex-col justify-center">
                        <h1 class="text-4xl font-medium">{data.exam.vak}</h1>
                        <p class="text-lg font-medium">
                            {data.exam.formattedDate}
                        </p>
                    </div>
                </Card.Content>
            </Card.Root>
            <Card.Root class="mt-5">
                <Card.Content>
                    <h1 class="text-2xl font-medium mb-3">Omschrijving</h1>
                    <p class="ml-1">
                        {@html data.exam.omschrijving.replace(/\n/g, "<br>")}
                    </p>
                    <!-- <pre>{JSON.stringify(data.exam, null, 2)}</pre> -->
                </Card.Content>
            </Card.Root>
            <Card.Root class="mt-5">
                <Card.Content>
                    <div class="flex items-center justify-between mb-3">
                        <h1 class="text-2xl font-medium">Mijn Notities</h1>
                        {#if isEditingNotes && notesContent !== originalNotes}
                            <div class="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onclick={cancelEditing}
                                >
                                    Annuleren
                                </Button>
                                <Button
                                    size="sm"
                                    onclick={saveNotes}
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? "Bezig met opslaan..."
                                        : "Opslaan"}
                                </Button>
                            </div>
                        {/if}
                    </div>
                    {#if isEditingNotes}
                        <textarea
                            bind:value={notesContent}
                            class="w-full min-h-[150px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Voeg je notities toe..."
                        ></textarea>
                    {:else}
                        <div
                            class="ml-1 min-h-[50px] p-3 pl-0 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                            onclick={startEditing}
                            onkeydown={handleKeyDown}
                            role="button"
                            tabindex="0"
                        >
                            {#if data.exam.notes}
                                <p class="whitespace-pre-wrap">
                                    {data.exam.notes}
                                </p>
                            {:else}
                                <p class="text-muted-foreground">
                                    Klik om te aanpassen
                                </p>
                            {/if}
                        </div>
                    {/if}
                </Card.Content>
            </Card.Root>
            <Card.Root class="mt-5">
                <Card.Content>
                    <h1 class="text-2xl font-medium mb-3">Linkjes En Boeken</h1>
                    {#each examLinks as link}
                        <Card.Root class="mt-3 p-4 cursor-pointer">
                            <Card.Content
                                class="px-1 flex justify-between items-center"
                            >
                                <a href={link} class="flex gap-3 items-center">
                                    <GlobeIcon class="text-muted-foreground" />
                                    <h1 class="hover:underline transition-all">
                                        {link}
                                    </h1>
                                </a>
                                <TrashIcon
                                    class="w-5 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                                    onclick={() => removeLink(link)}
                                />
                            </Card.Content>
                        </Card.Root>
                    {/each}

                    {#each examBooks as book}
                        <Card.Root class="mt-3 p-4 cursor-pointer">
                            <Card.Content
                                class="px-1 flex gap-3 justify-between items-center"
                            >
                                <a
                                    href={book.link}
                                    class="flex gap-3 items-center"
                                >
                                    <BookIcon class="text-muted-foreground" />
                                    <h1 class="hover:underline transition-all">
                                        {book.title}
                                    </h1>
                                </a>
                                <TrashIcon
                                    class="w-5 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                                    onclick={() => removeBook(book.title)}
                                />
                            </Card.Content>
                        </Card.Root>
                    {/each}
                    <Card.Root class="mt-3 p-4 border-dashed">
                        <Card.Content class="px-1 flex items-center gap-3">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="flex-shrink-0 w-12"
                                    >
                                        {#if selectedIcon === "globe"}
                                            <GlobeIcon
                                                class="w-12 h-24 text-muted-foreground"
                                            />
                                            <DropIcon
                                                class="w-12 h-6 text-muted-foreground"
                                            />
                                        {:else}
                                            <BookIcon
                                                class="w-12 h-6 text-muted-foreground"
                                            />
                                            <DropIcon
                                                class="w-12 h-6 text-muted-foreground"
                                            />
                                        {/if}
                                    </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.Item
                                        onclick={() => {
                                            selectedIcon = "globe";
                                            linkInput = "";
                                        }}
                                    >
                                        <GlobeIcon
                                            class="w-12 h-5 mr-2 text-muted-foreground"
                                        />
                                        Link
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() => {
                                            selectedIcon = "book";
                                            selectedBook = "";
                                        }}
                                    >
                                        <BookIcon
                                            class="w-12 h-5 mr-2 text-muted-foreground"
                                        />
                                        Boek
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>

                            {#if selectedIcon === "globe"}
                                <Input
                                    placeholder="Voer je link in..."
                                    bind:value={linkInput}
                                    onkeypress={handleLinkKeyPress}
                                    class="flex-1"
                                />
                            {:else}
                                <Select.Root
                                    type="single"
                                    bind:value={selectedBook}
                                >
                                    <Select.Trigger
                                        class="flex-1 justify-start"
                                    >
                                        {#if selectedBook}
                                            {@const book = books.find(
                                                (b) => b.value === selectedBook,
                                            )}
                                            {book?.label}
                                        {:else}
                                            Selecteer een boek
                                        {/if}
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Group>
                                            <Select.Label>Boeken</Select.Label>
                                            {#each books as book}
                                                <Select.Item value={book.value}>
                                                    {book.label}
                                                </Select.Item>
                                            {/each}
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                            {/if}

                            <Button
                                onclick={handleSaveLink}
                                class="flex-shrink-0"
                            >
                                Opslaan
                            </Button>
                        </Card.Content>
                    </Card.Root>
                </Card.Content>
            </Card.Root>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>

<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import toast from "svelte-french-toast";
    import Label from "@/components/ui/label/label.svelte";
    import { goto } from "$app/navigation";

    const { data } = $props();

    let title = $state("");
    let vak = $state("");
    let link = $state("");

    function redirectHome() {
        goto("/books");
    }

    async function createBook() {
        if (!title || !vak) {
            toast.error("Vul alle verplichte velden in.");
            return;
        }

        try {
            const res = await fetch("/api/books/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    type: vak,
                    link,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Er is iets misgegaan bij het opslaan.");
                return;
            }

            toast.success("Boek succesvol toegevoegd!");
            goto("/books");
        } catch (err) {
            console.error("Fout bij toevoegen boek:", err);
            toast.error("Er is een fout opgetreden.");
        }
    }
</script>
<svelte:head>
    <title>Boek Toevoegen | ToetsenBord</title>
</svelte:head>

<Sidebar.Provider>
    <AppSidebar user={data.user} />
    <Sidebar.Inset>
        <header class="flex h-14 shrink-0 items-center gap-2">
            <div class="flex flex-1 items-center gap-2 px-3">
                <Sidebar.Trigger />
                <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Page class="line-clamp-1">
                                Boek Toevoegen
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <Card.Root>
                <Card.Header class="space-y-1">
                    <Card.Title class="text-2xl font-semibold">Boek Toevoegen</Card.Title>
                    <Card.Description>
                        Voer de onderstaande velden in om een nieuw boek toe te voegen.
                    </Card.Description>
                </Card.Header>

                <Card.Content class="space-y-4">
                    <div class="space-y-2">
                        <Label for="title">Titel</Label>
                        <Input id="title" bind:value={title} placeholder="Voer de titel van het boek in" />
                    </div>

                    <div class="space-y-2">
                        <Label for="vak">Vak</Label>
                        <Input id="vak" bind:value={vak} placeholder="Bijv: Frans" />
                    </div>

                    <div class="space-y-2">
                        <Label for="link">Optioneel: Online Boek Link</Label>
                        <Input id="link" bind:value={link} placeholder="https://mijnonlineboek.nl" />
                    </div>
                </Card.Content>

                <Card.Footer class="flex justify-start gap-4">
                    <Button onclick={createBook}>Opslaan</Button>
                    <Button variant="outline" onclick={redirectHome}>Annuleren</Button>
                </Card.Footer>
            </Card.Root>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>

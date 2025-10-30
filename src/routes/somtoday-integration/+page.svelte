<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import ConnectIcon from "@lucide/svelte/icons/link";
    import * as Card from "$lib/components/ui/card/index.js";   
    import toast from 'svelte-french-toast';
    import { goto } from "$app/navigation";

    const { data } = $props();
    
    let accessToken = $state('');
    let isConnecting = $state(false);

    async function handleConnect() {
        if (!accessToken.trim()) {
            toast.error('Vul eerst een geldige access token in', {
                duration: 4000,
            });
            return;
        }

        const loadingToast = toast.loading('Bezig met koppelen...', {
            duration: Infinity
        });
        isConnecting = true;

        try {
            const response = await fetch('/api/somtoday/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_token: accessToken.trim() }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Er is iets misgegaan bij het verbinden met Somtoday');
            }

            toast.success('Somtoday is succesvol gekoppeld! Je kunt nu je toetsen bekijken.', {
                duration: 5000,
            });
            accessToken = ''; 
            await goto('/start');
        } catch (error) {
            toast.error(
                error instanceof Error 
                    ? error.message 
                    : 'Er is iets misgegaan bij het verbinden met Somtoday. Probeer het opnieuw of neem contact op met de beheerder.',
                {
                    duration: 5000,
                }
            );
        } finally {
            toast.dismiss(loadingToast);
            isConnecting = false;
        }
    }
</script>
<svelte:head>
    <title>Somtoday Intergratie | ToetsenBord</title>
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
                                Somtoday Integratie
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
            <div class="ml-auto px-3"></div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 pt-2">
            <Card.Root class="mb-6">
                <Card.Header>
                    <Card.Title class="text-xl font-bold">Somtoday Integratie</Card.Title>
                    <Card.Description>Koppel je Somtoday account om automatisch toetsen te
                    synchroniseren.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <ul class="mb-4">
                        <li class="mb-2">
                            1. Ga naar somtoday en <a href="/api/somtoday/bookmark" target="_blank" class="text-blue-500 underline">open deze link</a>
                        </li>
                        <li class="mb-2">
                            2. Nadat je de link naar je bladwijzers hebt gesleept, klik je op de bookmark
                            in je browser terwijl je op de Somtoday pagina bent.
                        </li>
                        <li class="mb-2">
                            3. Er opent een nieuw tabblad en die vraagt voor Kopieer toestemming klik op toestaan.
                        </li>
                        <li class="mb-2">
                            4. Klik op de knop: "Kopieer" en klik daarna op: "Klaar"
                        </li>
                        <li class="mb-2">
                            5. Als je weer terug bent op SomToday open je weer Toetsenbord op deze pagina en vul je de access token in die zojuist is gekopieerd.
                        </li>
                    </ul>
                    <Input
                        bind:value={accessToken}
                        placeholder="Vul hier de access token in"
                        class="mt-4 mb-4 w-full max-w-xs"
                        disabled={isConnecting}
                    />
                    <Button 
                        onclick={handleConnect} 
                        disabled={isConnecting}
                    >
                        {#if isConnecting}
                            <div class="animate-spin mr-2">⋯</div>
                            Bezig met koppelen...
                        {:else}
                            <ConnectIcon class="mr-2 h-4 w-4" /> 
                            Koppel Somtoday
                        {/if}
                    </Button>
                </Card.Content>
            </Card.Root>
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
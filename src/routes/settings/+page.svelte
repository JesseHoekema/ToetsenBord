<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Account from "@lucide/svelte/icons/user";
  import Appearance from "@lucide/svelte/icons/palette";
  import AccountSettings from '$lib/components/accountSettings.svelte';
  import AppearanceSettings from '$lib/components/appearanceSettings.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const { data } = $props();

  let activeTab = $state("account");
  let activeTabTitle = $derived(activeTab === 'account' ? 'Account' : 'Uiterlijk');

  $effect(() => {
    const tab = $page.url.searchParams.get('tab');
    if (tab === 'account' || tab === 'appearance') {
      activeTab = tab;
    }
  });

  function setActive(tab: string) {
    activeTab = tab;
    activeTabTitle = activeTab === 'account' ? 'Account' : 'Uiterlijk';
    goto(`?tab=${tab}`, { replaceState: true, noScroll: true });
  }
</script>

<svelte:head>
  <title>{activeTabTitle} Instellingen | ToetsenBord</title>
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
                Instellingen
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
      <div class="ml-auto px-3"></div>
    </header>

    <main class="flex-1 overflow-y-auto p-6 pt-2">
      <nav class="border-b bg-background">
        <div class="flex h-14 items-center">
          <div class="flex items-center space-x-1">
            <button
              onclick={() => setActive("account")}
              class="relative inline-flex items-center gap-2 px-4 h-14 text-sm font-medium transition-colors border-b-2 {activeTab ===
              'account'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground'}"
            >
              <Account class="h-4 w-4" />
              <span>Account</span>
            </button>

            <button
              onclick={() => setActive("appearance")}
              class="relative inline-flex items-center gap-2 px-4 h-14 text-sm font-medium transition-colors border-b-2 {activeTab ===
              'appearance'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground'}"
            >
              <Appearance class="h-4 w-4" />
              <span>Uiterlijk</span>
            </button>
          </div>
        </div>
      </nav>

      {#if activeTab === "account"}
        <AccountSettings user={data.user} />
      {:else if activeTab === "appearance"}
        <AppearanceSettings />
      {/if}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>

<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { page } from '$app/stores';

  $: homeLink = $page.url.pathname === '/' ? '#home' : '/';
  $: waaromLink = $page.url.pathname === '/' ? '#waarom' : '/#waarom';
  $: featuresLink = $page.url.pathname === '/' ? '#features' : '/#features';
</script>

<Card.Root class="fixed top-[-3px] left-[-3px] right-[-3px] rounded-none z-50">
  <Card.Content class="relative flex items-center">
    <img src="/assets/logo-icon.png" alt="Logo" class="w-12 h-12 p-0 m-0 md:hidden" />
    <img src="/assets/logo.png" alt="Logo" class="hidden md:block w-52 p-0 m-0" />
    
    <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2">
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link>
              {#snippet child()}
                <a href={homeLink} class={navigationMenuTriggerStyle()}>Home</a>
                <a href={waaromLink} class={navigationMenuTriggerStyle()}>Waarom</a>
                <a href={featuresLink} class={navigationMenuTriggerStyle()}>Features</a>
                <a href="/team" class={navigationMenuTriggerStyle()}>Team</a>
              {/snippet}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
    
    <div class="absolute right-8">
        <Button variant="default" href="/sign-in" class="text-sm sm:text-base">Log in</Button>
    </div>
  </Card.Content>
</Card.Root>

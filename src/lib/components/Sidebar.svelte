<script lang="ts">
    import { page } from "$app/stores";
    import HomeIcon from "@lucide/svelte/icons/home";
    import TestIcon from "@lucide/svelte/icons/file-text";
    import SchoolBooks from "@lucide/svelte/icons/book";
    import HomeworkIcon from "@lucide/svelte/icons/book-open-text";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import NavUser from "./nav-user.svelte";
    import GradesIcon from '@lucide/svelte/icons/arrow-up-0-1'
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { onMount, tick, onDestroy } from "svelte";
    import { mode } from "mode-watcher";
  import { Title } from "./ui/alert-dialog";

    export let user: { name: string; email: string; avatar: string };

    const sidebar = useSidebar();
    let currentMode = mode.current;

    let logoSrc = "/assets/logo.png";
    let lastState: string;
    let logoClass = "w-58 h-auto";
    let divClass = "p-4 flex items-center justify-left border-b";

    const items = [
        { title: "Home", url: "/start", icon: HomeIcon },
        { title: "Toetsen", url: "/exams", icon: TestIcon },
        { title: "Huiswerk", url: "/homework", icon: HomeworkIcon },
        { title: "Mijn Boeken", url: "/books", icon: SchoolBooks },
        { title: "Cijfers", url: "/grades", icon: GradesIcon },
        // { title: "Mijn Woordenlijsten", url: "/results", icon: WordLists },
    ];

    function updateLogo() {
        if (sidebar.state !== lastState) {
            lastState = sidebar.state;
            if (sidebar.state === "expanded") {
                if (mode.current === "dark") {
                    logoSrc = "/assets/logo.png";
                } else {
                    logoSrc = "/assets/logo-light.png";
                }
                logoClass = "w-58 h-auto";
                divClass = "p-4 flex items-center justify-left border-b";
            } else {
                logoSrc = "/assets/logo-icon.png";
                logoClass = "w-100 h-auto";
                divClass = "p-[9px] flex items-center justify-center border-b";
            }
        }
    }

    onMount(() => {
        const interval = setInterval(() => {
            updateLogo();
        }, 50);
        const Modeinterval = setInterval(() => {
            if (mode.current !== currentMode) {
                currentMode = mode.current;
                if (currentMode === "dark") {
                    logoSrc = "/assets/logo.png";
                } else {
                    logoSrc = "/assets/logo-light.png";
                }
            }
        }, 50);

        onDestroy(() => clearInterval(Modeinterval));

        return () => clearInterval(interval);
    });
</script>

<Sidebar.Root variant="floating" collapsible="icon">
    <div class={divClass}>
        <img src={logoSrc} alt="Logo" class={logoClass} />
    </div>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.title)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                                isActive={$page.url.pathname.includes(item.url)}
                            >
                                {#snippet child({ props })}
                                    <a href={item.url} {...props}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
        <Sidebar.Menu>
            <NavUser {user} />
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>

<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import toast from "svelte-french-toast";
  import Button from "@/components/ui/button/button.svelte";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import BookIcon from "@lucide/svelte/icons/book";
  import DropIcon from "@lucide/svelte/icons/chevron-down";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Input } from "$lib/components/ui/input/index.js";
  import FileIcon from "@lucide/svelte/icons/file";

  const { data } = $props();

  let isEditingNotes = $state(false);
  let notesContent = $state(data.homeworkItem.notes || "");
  let originalNotes = $state(data.homeworkItem.notes || "");
  let isSaving = $state(false);

  let selectedIcon = $state("globe");
  let linkInput = $state("");
  let homeworkLinks = $state([...data.homeworkItem.links]);

  function startEditing() {
    isEditingNotes = true;
    notesContent = data.homeworkItem.notes || "";
    originalNotes = data.homeworkItem.notes || "";
  }

  function cancelEditing() {
    isEditingNotes = false;
    notesContent = originalNotes;
  }

  async function saveNotes() {
    isSaving = true;
    try {
      const response = await fetch("/api/homework-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "editNotes",
          vak: data.homeworkItem.vak,
          dateDue: data.homeworkItem.oldDatum,
          content: notesContent,
        }),
      });

      if (response.ok) {
        toast.success("Notities opgeslagen");
        data.homeworkItem.notes = notesContent;
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
    let normalizedLink = linkInput.trim();
    if (!/^https?:\/\//i.test(normalizedLink)) {
      normalizedLink = "https://" + normalizedLink;
    }

    if (homeworkLinks.includes(normalizedLink)) {
      toast.error("Deze link bestaat al");
      return;
    }

    const response = await fetch("/api/homework-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addLink",
        vak: data.homeworkItem.vak,
        dateDue: data.homeworkItem.oldDatum,
        content: normalizedLink,
      }),
    });

    if (response.ok) {
      toast.success("Link opgeslagen");
      homeworkLinks = [...homeworkLinks, normalizedLink];
      linkInput = "";
    } else {
      toast.error("Link opslaan is niet gelukt");
    }
  }

  function handleLinkKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleSaveLink();
    }
  }
  async function removeLink(link: string) {
    try {
      const response = await fetch("/api/homework-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "removeLink",
          vak: data.homeworkItem.vak,
          dateDue: data.homeworkItem.oldDatum,
          content: link,
        }),
      });

      if (response.ok) {
        toast.success("Link verwijderd");
        homeworkLinks = homeworkLinks.filter((l) => l !== link);
      } else {
        toast.error("Link verwijderen is niet gelukt");
      }
    } catch (error) {
      console.log(error);
      toast.error("Link verwijderen is niet gelukt");
    }
  }
</script>

<svelte:head>
  <title
    >{data.homeworkItem.vak} - {data.homeworkItem.onderwerp} | ToetsenBord</title
  >
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
                {data.homeworkItem.vak} - {data.homeworkItem.onderwerp}
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
            src={data.homeworkItem.image_url}
            alt="homework cover"
            class="w-28 h-auto rounded-sm"
          />
          <div class="flex flex-col justify-center">
            <h1 class="text-4xl font-medium">{data.homeworkItem.vak} - {data.homeworkItem.onderwerp}</h1>
            <p class="text-lg font-medium">
              {data.homeworkItem.formattedDate}
            </p>
          </div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="mt-5">
        <Card.Content>
          <h1 class="text-2xl font-medium mb-3">Omschrijving</h1>
          <p class="ml-1">
            {@html data.homeworkItem.omschrijving.replace(/\n/g, "<br>")}
          </p>
        </Card.Content>
      </Card.Root>
      {#if data.homeworkItem.bijlagen.length > 0}
        <Card.Root class="mt-5">
          <Card.Content>
            <h1 class="text-2xl font-medium mb-3">Bijlagen</h1>
            {#each data.homeworkItem.bijlagen as bijlage}
              <Card.Root class="mt-3 p-4 cursor-pointer">
                <Card.Content class="px-1 flex justify-between items-center">
                  <a
                    href={bijlage.url}
                    class="flex gap-3 items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileIcon class="text-muted-foreground" />
                    <h1 class="hover:underline transition-all">
                      {bijlage.name}
                    </h1>
                  </a>
                </Card.Content>
              </Card.Root>
            {/each}
          </Card.Content>
        </Card.Root>
      {/if}
      <Card.Root class="mt-5">
        <Card.Content>
          <div class="flex items-center justify-between mb-3">
            <h1 class="text-2xl font-medium">Mijn Notities</h1>
            {#if isEditingNotes && notesContent !== originalNotes}
              <div class="flex gap-2">
                <Button variant="outline" size="sm" onclick={cancelEditing}>
                  Annuleren
                </Button>
                <Button size="sm" onclick={saveNotes} disabled={isSaving}>
                  {isSaving ? "Bezig met opslaan..." : "Opslaan"}
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
              {#if data.homeworkItem.notes}
                <p class="whitespace-pre-wrap">
                  {data.homeworkItem.notes}
                </p>
              {:else}
                <p class="text-muted-foreground">Klik om te aanpassen</p>
              {/if}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
      <Card.Root class="mt-5">
        <Card.Content>
          <h1 class="text-2xl font-medium mb-3">Linkjes</h1>
          {#each homeworkLinks as link}
            <Card.Root class="mt-3 p-4 cursor-pointer">
              <Card.Content class="px-1 flex justify-between items-center">
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
          <Card.Root class="mt-3 p-4 border-dashed">
            <Card.Content class="px-1 flex items-center gap-3">
              <Input
                placeholder="Voer je link in..."
                bind:value={linkInput}
                onkeypress={handleLinkKeyPress}
                class="flex-1"
              />

              <Button onclick={handleSaveLink} class="flex-shrink-0">
                Opslaan
              </Button>
            </Card.Content>
          </Card.Root>
        </Card.Content>
      </Card.Root>
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>

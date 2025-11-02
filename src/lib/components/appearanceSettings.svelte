<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { mode, setMode } from "mode-watcher";

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" }
  ];

  let selectedTheme = $state(mode.current || "system");

  const triggerContent = $derived(
    themes.find((t) => t.value === selectedTheme)?.label ?? "Select a theme"
  );

  function handleThemeChange(value: string | undefined) {
    if (value) {
      selectedTheme = value;
      setMode(value as "light" | "dark" | "system");
    }
  }
</script>

<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>Kleuren Thema</Card.Title>
    <Card.Description>
      Pas de uitstraling van de applicatie aan naar jouw voorkeur.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Select.Root type="single" onValueChange={handleThemeChange} value={selectedTheme}>
      <Select.Trigger class="w-[200px]">
        <p class="text-foreground">{triggerContent}</p>
      </Select.Trigger>
      <Select.Content>
        {#each themes as theme (theme.value)}
          <Select.Item value={theme.value} label={theme.label}>
            {theme.label}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </Card.Content>
</Card.Root>
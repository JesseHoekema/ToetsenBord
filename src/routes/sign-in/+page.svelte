<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import toast from "svelte-french-toast";
  import { goto } from "$app/navigation";
  import { mode } from "mode-watcher";
  import DarkMode from "@/components/DarkMode.svelte";

  let email = "";
  let password = "";
  let isLoading = false;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Er is iets misgegaan bij het inloggen");
      }

      await goto("/start");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Er is iets misgegaan bij het inloggen",
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
    <title>Inloggen | ToetsenBord</title>
</svelte:head>

<Card.Root class="w-full max-w-sm mx-auto mt-20">
  <Card.Header class="p-6 pb-0 justify-center align-center pt-0 mt-0">
    {#if mode.current === "dark"}
      <img
        src="/assets/logo.png"
        alt="Logo"
        class="w-75 justify-center align-center"
      />
    {:else}
      <img
        src="/assets/logo-light.png"
        alt="Logo"
        class="w-75 justify-center align-center"
      />
    {/if}
    <Card.Title class="text-3xl text-center">Inloggen</Card.Title>
  </Card.Header>
  <Card.Content class="p-6 pt-2">
    <form class="space-y-4" on:submit={handleSubmit}>
      <div>
        <Label for="email" class="block mb-1 text-sm font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="mijn@email.com"
          class="w-full"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label for="password" class="block mb-1 text-sm font-medium">
          Wachtwoord
        </Label>
        <Input
          id="password"
          type="password"
          bind:value={password}
          placeholder="············"
          class="w-full"
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" class="w-full mt-4" disabled={isLoading}>
        {#if isLoading}
          Bezig met inloggen...
        {:else}
          Inloggen
        {/if}
      </Button>
      <p class="text-center text-base">
        Geen Account? <a href="/sign-up" class="text-blue-500 underline"
          >Maak er een!</a
        >
      </p>
    </form>
  </Card.Content>
</Card.Root>

<div class="fixed top-4 right-4">
  <DarkMode />
</div>
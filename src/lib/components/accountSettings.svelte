<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import toast from "svelte-french-toast";
  import { goto } from "$app/navigation";
  import Eye from "@lucide/svelte/icons/eye";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import DestructiveIcon from "@lucide/svelte/icons/triangle-alert";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  let { user }: { user: { id: number; name: string; email: string, avatar: string } } = $props();

  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);
  let userName = $state(user.name);
  let userEmail = $state(user.email);
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");

  let isUpdatingInfo = $state(false);
  let isChangingPassword = $state(false);
  let isDeletingAccount = $state(false);

  async function updateUserInfo() {
    if (!userName || !userEmail) {
      toast.error("Naam en e-mailadres zijn verplicht.", { duration: 4000 });
      return;
    }

    isUpdatingInfo = true;
    try {
      const response = await fetch("/api/account/change-name-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Persoonlijke informatie bijgewerkt!", { duration: 4000 });
        user.name = userName;
        user.email = userEmail;
      } else {
        toast.error(data.error || "Kon gegevens niet bijwerken.", { duration: 4000 });
      }
    } catch (error) {
      toast.error("Er is een fout opgetreden.", { duration: 4000 });
    } finally {
      isUpdatingInfo = false;
    }
  }

  async function updatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Alle wachtwoordvelden zijn verplicht.", { duration: 4000 });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Nieuwe wachtwoorden komen niet overeen.", { duration: 4000 });
      return;
    }
    
    isChangingPassword = true;
    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Wachtwoord succesvol gewijzigd!", { duration: 4000 });
        currentPassword = "";
        newPassword = "";
        confirmPassword = "";
      } else {
        toast.error(data.error || "Kon wachtwoord niet wijzigen.", { duration: 4000 });
      }
    } catch (error) {
      toast.error("Er is een fout opgetreden.", { duration: 4000 });
    } finally {
      isChangingPassword = false;
    }
  }

  async function deleteAccount() {
    isDeletingAccount = true;
    try {
      const response = await fetch("/api/account/delete-account", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account succesvol verwijderd. Je wordt uitgelogd...", { duration: 3000 });
        setTimeout(() => {
          goto("/sign-in");
        }, 2000);
      } else {
        toast.error(data.error || "Kon account niet verwijderen.", { duration: 4000 });
      }
    } catch (error) {
      toast.error("Er is een fout opgetreden.", { duration: 4000 });
    } finally {
      isDeletingAccount = false;
    }
  }
</script>

<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>Persoonlijke informatie</Card.Title>
    <Card.Description>
      Beheer je persoonlijke gegevens zoals naam en e-mailadres.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Label for="name" class="mb-2">Naam</Label>
    <Input id="name" type="text" placeholder="Jouw naam" required bind:value={userName} />
    <Label for="email" class="mb-2 mt-4">E-mailadres</Label>
    <Input id="email" type="email" placeholder="Jouw e-mailadres" required bind:value={userEmail} />

    <Button class="mt-4" onclick={updateUserInfo} disabled={isUpdatingInfo}>
      {isUpdatingInfo ? "Opslaan..." : "Opslaan"}
    </Button>
  </Card.Content>
</Card.Root>
<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>Wachtwoord wijzigen</Card.Title>
    <Card.Description>
      Update je wachtwoord om je account te beveiligen.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="relative">
      <Label for="current-password" class="mb-2">Huidig wachtwoord</Label>
      <div class="relative">
        <Input
          id="current-password"
          class="placeholder:font-bold pr-10"
          type={showCurrentPassword ? "text" : "password"}
          placeholder="·············"
          required
          bind:value={currentPassword}
        />
        <button
          type="button"
          onclick={() => (showCurrentPassword = !showCurrentPassword)}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {#if showCurrentPassword}
            <Eye class="h-4 w-4" />
          {:else}
            <EyeOff class="h-4 w-4" />
          {/if}
        </button>
      </div>
    </div>

    <div class="relative mt-4">
      <Label for="new-password" class="mb-2">Nieuw wachtwoord</Label>
      <div class="relative">
        <Input
          id="new-password"
          class="placeholder:font-bold pr-10"
          type={showNewPassword ? "text" : "password"}
          placeholder="·············"
          required
          bind:value={newPassword}
        />
        <button
          type="button"
          onclick={() => (showNewPassword = !showNewPassword)}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {#if showNewPassword}
            <Eye class="h-4 w-4" />
          {:else}
            <EyeOff class="h-4 w-4" />
          {/if}
        </button>
      </div>
    </div>

    <div class="relative mt-4">
      <Label for="confirm-password" class="mb-2"
        >Bevestig nieuw wachtwoord</Label
      >
      <div class="relative">
        <Input
          id="confirm-password"
          class="placeholder:font-bold pr-10"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="·············"
          required
          bind:value={confirmPassword}
        />
        <button
          type="button"
          onclick={() => (showConfirmPassword = !showConfirmPassword)}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {#if showConfirmPassword}
            <Eye class="h-4 w-4" />
          {:else}
            <EyeOff class="h-4 w-4" />
          {/if}
        </button>
      </div>
    </div>

    <Button class="mt-4" onclick={updatePassword} disabled={isChangingPassword}>
      {isChangingPassword ? "Opslaan..." : "Opslaan"}
    </Button>
  </Card.Content>
</Card.Root>
<Card.Root class="mt-6 mb-10">
  <Card.Header>
    <Card.Title class="text-destructive">Account verwijderen</Card.Title>
    <Card.Description>
      Verwijder je account permanent. Deze actie kan niet ongedaan worden
      gemaakt.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="destructive"
          ><DestructiveIcon class="h-4 w-4" /> Verwijder mijn account</Button
        >
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Wil je je account verwijderen?</AlertDialog.Title>
          <AlertDialog.Description>
            Deze actie kan niet ongedaan worden gemaakt. Dit zal je account
            permanent verwijderen en je gegevens van onze servers verwijderen.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Annuleren</AlertDialog.Cancel>
          <AlertDialog.Action
            class="text-white bg-destructive"
            onclick={() => deleteAccount()}
            disabled={isDeletingAccount}
          >
            {isDeletingAccount ? "Verwijderen..." : "Doorgaan"}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </Card.Content>
</Card.Root>

<script lang="ts">
  import TopMenu from "@/components/TopMenu.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
</script>
<TopMenu />
<div class="items-center justify-center md:justify-between w-full px-4 sm:px-8 md:px-12 py-10 mt-20 md:mt-25 gap-6 md:gap-0">
    <h1 class="text-2xl sm:text-3xl md:text-4xl text-center mb-6">Het <span class="font-bold"><span class="text-[#76A9FF]">Toetsen</span>Bord</span> Team</h1>
    <a href="https://jessehoekema.com" target="_blank" class="cursor-pointer  max-w-3xl">
        <Card.Root class="w-full max-w-3xl p-6 flex flex-col mx-auto">
            <Card.Content class="flex flex-col items-center">
                <img src="https://jessehoekema.com/assets/pfp_new.png" alt="Jessi Flessi" class="rounded-full mx-auto mb-4" style="width: 200px;" />
                <h2 class="text-4xl font-semibold mb-2">Jessi Flessi</h2>
                <p class="text-center mb-4">Oprichter & Lead Developer</p>
                <p class="text-center font-bold text-xl">Hoi! Ik ben Jesse, ik heb ToetsenBord opgericht om scholieren te helpen hun toetsen en huiswerk beter te organiseren en snel kunnen zien wat nog op hun te wachten staat zonder som helemaal om te gooien.</p>
            </Card.Content>
        </Card.Root>
    </a>   
</div>
<footer class="w-full mt-auto ">
    <Card.Root class="w-full mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between rounded-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} ToetsenBord. Alle rechten voorbehouden.</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
            <a href="#home" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Home</a>
            <a href="#waarom" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Waarom</a>
            <a href="/login" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Login</a>
        </div>
    </Card.Root>
</footer>
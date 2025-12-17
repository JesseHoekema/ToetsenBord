<script lang="ts">
    import TopMenu from "@/components/TopMenu.svelte";
    import NotesIcon from "@lucide/svelte/icons/notebook-pen";
    import CalendarIcon from "@lucide/svelte/icons/calendar-check";
    import ShieldIcon from "@lucide/svelte/icons/shield-check";
    import * as Card from "$lib/components/ui/card/index.js";
    import OpenIcon from "@lucide/svelte/icons/git-pull-request-arrow";
    import IntergrationIcon from "@lucide/svelte/icons/plug-2";
    import UiIcon from "@lucide/svelte/icons/paintbrush";

    import { onMount } from 'svelte';

    onMount(() => {
        const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
        const handleClick = (e: MouseEvent) => {
            const anchor = e.currentTarget as HTMLAnchorElement;
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        anchors.forEach(anchor => {
            anchor.addEventListener('click', handleClick);
        });
        return () => {
            anchors.forEach(anchor => {
                anchor.removeEventListener('click', handleClick);
            });
        };
    });
</script>

<TopMenu />
<div id="home"></div>
<div class="absolute top-38 ml-12 right-4 z-0">
    <img src="/assets/mockup_4.png" alt="App Mockup" class="w-500  opacity-70 select-none pointer-events-none user-select-none" />
</div>
<div class="flex flex-col md:flex-row items-center justify-center md:justify-between w-full px-4 sm:px-8 md:px-12 py-10 mt-20 md:mt-25 gap-6 md:gap-0 z-20 relative">
    <img src="/assets/logo-icon.png" alt="Logo" class="w-24 sm:w-32 md:w-28 lg:w-88" />
    <div class="flex-1 max-w-2xl">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left max-w-xl mx-auto md:mx-0">"Maar ik kon de toets niet vinden in som"</h1>
        <p class="mt-4 text-sm sm:text-base text-center md:text-left max-w-[590px] mx-auto md:mx-0">
            Met <span class="font-bold"><span class="text-[#76A9FF]">Toetsen</span>Bord</span> gebeurt dit je niet meer! Een dashboard voor al je aankomende toetsen, en ook meteen notities en boeken erbij.
        </p>
    </div>
</div>
<!-- div for waarom in nav -->
<div id="waarom"></div>

<section class="mt-20 sm:mt-28 md:mt-36 flex flex-col items-center px-4 sm:px-6 z-20 relative">
    <h1 class="text-2xl sm:text-3xl md:text-4xl text-center mb-6">Waarom <span class="font-bold"><span class="text-[#76A9FF]">Toetsen</span>Bord?</span></h1>
    <div class="shadow-lg rounded-2xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-3xl w-full flex flex-col items-center">
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
            <span class="inline-flex items-center gap-2 bg-[#E6F2FF] text-[#0B66D1] px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm md:text-base"><NotesIcon class="w-3 h-3 sm:w-4 sm:h-4 text-[#0B66D1]" /> Notities & boeken</span>
            <span class="inline-flex items-center gap-2 bg-[#FFF4E6] text-[#B85C00] px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm md:text-base"><CalendarIcon class="w-3 h-3 sm:w-4 sm:h-4 text-[#B85C00]" /> Slimme planning</span>
            <span class="inline-flex items-center gap-2 bg-[#E9FFF1] text-[#047857] px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm md:text-base"><ShieldIcon class="w-3 h-3 sm:w-4 sm:h-4 text-[#047857]" /> Privacy-first</span>
        </div>
        <p class="text-sm sm:text-base md:text-lg text-center font-medium leading-relaxed mb-4">
            <span class="font-bold"><span class="text-[#76A9FF]">Toetsen</span>Bord</span> geeft je in één oogopslag overzicht van alle toetsen die binnenkort op de planning staan in Somtoday. Nooit meer zoeken naar die ene toets of verdwalen in een bult van info: alles staat netjes bij elkaar, precies wanneer je het nodig hebt.<br><br>
            Maar daar stopt het niet. Je kunt bij elke toets eenvoudig notities, boeken en bijlagen toevoegen. Zo heb je alles wat je nodig hebt om goed voorbereid te zijn, op één simpele en mooie plek. Ideaal voor scholieren die graag orde willen houden op hun schoolwerk en geen verrassingen of onvoldoendes willen.<br><br>
            Dankzij de directe integratie met Somtoday verschijnen je toetsen automatisch in je dashboard. Je hoeft dus niets zelf toe te voegen en kunt direct aan de slag met leren en plannen. Alles draait om overzicht, gemak en tijdwinst.<br><br>
            Heb je een goed idee voor ToetsenBord of kom je een probleem tegen? Mooi! ToetsenBord is volledig open-source. Je kunt dus zelf bijdragen, een PR openen of zelfs je eigen versie hosten. Samen maken we het beter.<br><br>
            En het mooiste van alles? Dit alles is <span class="font-bold text-xl text-[#76A9FF]">gratis</span> — voor iedereen.
        </p>
    </div>
</section>
<!-- div for features in nav -->
<div id="features"></div>
<section class="mt-20 sm:mt-28 md:mt-36 flex flex-col items-center mb-20 w-full px-4 sm:px-6">
    <h1 class="text-2xl sm:text-3xl md:text-4xl text-center mb-6">Features</h1>
    <div class="shadow-lg rounded-2xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 w-full max-w-none flex flex-col">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <NotesIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#0B66D1]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Notities & Boeken</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    Voeg eenvoudig notities en boeken toe aan je toetsen. Alles wat je nodig hebt om goed voorbereid te zijn, op één plek.
                </p>
            </Card.Root>

            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <CalendarIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#B85C00]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Slimme Planning</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    Krijg een overzicht van al je aankomende toetsen, automatisch gesynchroniseerd met Somtoday. Nooit meer iets missen!
                </p>
            </Card.Root>

            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <ShieldIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#047857]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Privacy-First</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    Jouw gegevens zijn van jou. We slaan niets onnodigs op en zorgen ervoor dat je privacy altijd gewaarborgd is.
                </p>
            </Card.Root>

            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <OpenIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#6F42C1]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Open Source</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    ToetsenBord is volledig open-source. Iedereen kan bijdragen, verbeteren of zelfs zijn eigen versie hosten.
                </p>
            </Card.Root>

            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <IntergrationIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#D14AB8]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Integraties</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    Koppel ToetsenBord met andere tools en platforms die je gebruikt om je studie-ervaring nog beter te maken.
                </p>
            </Card.Root>

            <Card.Root class="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg shadow-sm">
                <UiIcon class="w-10 h-10 sm:w-12 sm:h-12 text-[#FFA500]" />
                <h2 class="text-xl sm:text-2xl font-bold mt-2">Modern design</h2>
                <p class="text-sm sm:text-base md:text-lg mt-2">
                    Een strak en modern ontwerp dat niet alleen mooi is, maar ook gebruiksvriendelijk en simpel in gebruik.
                </p>
            </Card.Root>
        </div>
    </div>
</section>

<footer class="w-full mt-auto">
    <Card.Root class="w-full mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between rounded-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} ToetsenBord. Alle rechten voorbehouden.</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
            <a href="#home" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Home</a>
            <a href="#waarom" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Waarom</a>
            <a href="/login" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Login</a>
        </div>
    </Card.Root>
</footer>
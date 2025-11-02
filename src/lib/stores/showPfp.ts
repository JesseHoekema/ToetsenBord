import { writable } from "svelte/store";

export const showProfilePicture = writable(true);

if (typeof window !== "undefined") {
	const stored = localStorage.getItem("showProfilePicture");
	if (stored !== null) {
		showProfilePicture.set(stored === "true");
	}

	window.addEventListener("storage", (event) => {
		if (event.key === "showProfilePicture") {
			showProfilePicture.set(event.newValue === "true");
		}
	});
}

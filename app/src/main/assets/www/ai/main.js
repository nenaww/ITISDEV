function initializePiggy() {

    const piggy = new PiggyApp(document.body);

    piggy.initialize();

    console.log("Piggy initialized.");

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializePiggy
    );

} else {

    initializePiggy();

}
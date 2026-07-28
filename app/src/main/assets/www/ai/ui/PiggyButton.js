class PiggyButton {

    constructor(onClick) {

        this.element = document.createElement("img");

        this.element.src = "images/piggy-floating.png";

        this.element.className = "piggy-floating-button";

        this.element.alt = "Piggy AI";

        this.element.addEventListener("click", onClick);

    }

    render(parent) {

        parent.appendChild(this.element);

    }

}

window.PiggyButton = PiggyButton;
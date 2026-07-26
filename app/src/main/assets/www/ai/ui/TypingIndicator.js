class TypingIndicator {

    constructor() {

        this.element = document.createElement("div");

        this.element.className = "piggy-typing";

        this.element.innerHTML = `

            <img
                src="images/piggy-chat.png"
                class="bubble-avatar"
            >

            <div class="typing-dots">

                <span></span>

                <span></span>

                <span></span>

            </div>

        `;

    }

    show() {

        this.element.style.display = "flex";

    }

    hide() {

        this.element.style.display = "none";

    }

    render() {

        return this.element;

    }

}

window.TypingIndicator = TypingIndicator;
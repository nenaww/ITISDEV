class PiggyOverlay {

    constructor(onSend = () => {}) {

        this.onSend = onSend;

        this.chatView = new ChatView();

        this.typingIndicator = new TypingIndicator();

        this.overlay = document.createElement("div");
        this.overlay.className = "piggy-overlay hidden";

        this.overlay.innerHTML = `
            <div class="piggy-header">

                <button class="piggy-back-btn">
                    ←
                </button>

            </div>

            <div class="piggy-center">

                <img
                    src="images/piggy-chat.png"
                    class="piggy-avatar"
                >

                <h2>Hello, I'm Piggy!</h2>

                <p>
                    I can answer questions about your
                    receipts, spending and household finances.
                </p>

            </div>

            <div class="piggy-suggestions"></div>

            <div class="piggy-chat-container"></div>

            <div class="piggy-input">

                <input
                    type="text"
                    placeholder="Ask Piggy anything..."
                >

                <button class="piggy-send">
                    Send
                </button>

            </div>
        `;

        this.chatContainer =
            this.overlay.querySelector(".piggy-chat-container");

        this.chatContainer.appendChild(
            this.chatView.render()
        );

        this.chatContainer.appendChild(
            this.typingIndicator.render()
        );

        this.hideTyping();

        this.input =
            this.overlay.querySelector("input");

        this.sendButton =
            this.overlay.querySelector(".piggy-send");

        this.backButton =
            this.overlay.querySelector(".piggy-back-btn");

        this.suggestionContainer =
            this.overlay.querySelector(".piggy-suggestions");

        this.buildSuggestions();

        this.backButton.onclick = () => this.close();

        this.sendButton.onclick = () => this.sendCurrentMessage();

        this.input.addEventListener("keypress", e => {

            if (e.key === "Enter") {

                this.sendCurrentMessage();

            }

        });

    }

    buildSuggestions() {

        const suggestions = [

            "How much did I spend this month?",

            "Show my latest receipt",

            "What products do I buy the most?"

        ];

        suggestions.forEach(text => {

            const chip = new SuggestionChip(

                text,

                message => {

                    this.input.value = message;

                    this.sendCurrentMessage();

                }

            );

            this.suggestionContainer.appendChild(

                chip.render()

            );

        });

    }

    sendCurrentMessage() {

        const text = this.input.value.trim();

        if (!text)
            return;

        this.chatView.addUserMessage(text);

        this.input.value = "";

        this.showTyping();

        this.onSend(text);

    }

    receivePiggyMessage(text) {

        this.hideTyping();

        this.chatView.addPiggyMessage(text);

    }

    showTyping() {

        this.typingIndicator.show();

    }

    hideTyping() {

        this.typingIndicator.hide();

    }

    clearConversation() {

        this.chatView.clear();

    }

    open() {

        this.overlay.classList.remove("hidden");

        this.input.focus();

    }

    close() {

        this.overlay.classList.add("hidden");

    }

    render(parent) {

        parent.appendChild(this.overlay);

    }

}

window.PiggyOverlay = PiggyOverlay;
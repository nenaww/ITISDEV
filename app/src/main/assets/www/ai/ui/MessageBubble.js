class MessageBubble {

    constructor({

        sender,

        text

    }) {

        this.sender = sender;

        this.text = text;

    }

    render() {

        const bubble = document.createElement("div");

        bubble.className =
            this.sender === "user"
                ? "bubble-user"
                : "bubble-piggy";

        const formattedText =
            this.sender === "piggy"
                ? marked.parse(this.text)
                : this.text;

        bubble.innerHTML =
            this.sender === "piggy"
                ? `
                    <img
                        src="images/piggy-chat.png"
                        class="bubble-avatar"
                    >

                    <div class="bubble-text">
                        ${formattedText}
                    </div>
                `
                : `
                    <div class="bubble-text">
                        ${this.text}
                    </div>
                `;

        return bubble;

    }

}

window.MessageBubble = MessageBubble;
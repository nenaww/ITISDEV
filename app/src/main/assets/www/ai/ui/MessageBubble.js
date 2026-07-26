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

        bubble.innerHTML =

            this.sender === "piggy"

            ?

            `
                <img
                    src="images/piggy-chat.png"
                    class="bubble-avatar"
                >

                <div class="bubble-text">

                    ${this.text}

                </div>

            `

            :

            `

                <div class="bubble-text">

                    ${this.text}

                </div>

            `;

        return bubble;

    }

}

window.MessageBubble = MessageBubble;
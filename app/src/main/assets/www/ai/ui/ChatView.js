class ChatView {

    constructor() {

        this.container = document.createElement("div");

        this.container.className =

            "piggy-chat-view";

    }

    addUserMessage(text) {

        this.addBubble("user", text);

    }

    addPiggyMessage(text) {

        this.addBubble("piggy", text);

    }

    addBubble(sender, text) {

        const bubble =

            new MessageBubble({

                sender,

                text

            });

        this.container.appendChild(

            bubble.render()

        );

        this.scrollToBottom();

    }

    scrollToBottom() {

        requestAnimationFrame(() => {

            this.container.scrollTop =

                this.container.scrollHeight;

        });

    }

    clear() {

        this.container.innerHTML = "";

    }

    render() {

        return this.container;

    }

}

window.ChatView = ChatView;
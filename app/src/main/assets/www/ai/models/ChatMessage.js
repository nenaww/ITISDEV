class ChatMessage {
    constructor(role, content) {
        this.role = role;
        this.content = content;
    }

    static system(content) {
        return new ChatMessage("system", content);
    }

    static user(content) {
        return new ChatMessage("user", content);
    }

    static assistant(content) {
        return new ChatMessage("assistant", content);
    }

    toJSON() {
        return {
            role: this.role,
            content: this.content
        };
    }
}

window.ChatMessage = ChatMessage;
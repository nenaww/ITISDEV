/**
 * Represents a chat request.
 */
class ChatRequest {

    constructor(

        userPrompt,

        history = []

    ) {

        this.userPrompt = userPrompt;

        this.history = history;

    }

}

window.ChatRequest = ChatRequest;
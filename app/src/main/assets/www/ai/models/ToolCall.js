class ToolCall {

    constructor({
        id,
        name,
        arguments: args = {}
    }) {

        this.id = id;
        this.name = name;
        this.arguments = args;

    }

}

window.ToolCall = ToolCall;
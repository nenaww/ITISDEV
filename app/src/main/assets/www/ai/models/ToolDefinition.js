/*
==========================================================
Tool Definition
Gemini Function Declaration
==========================================================
*/

class ToolDefinition {

    constructor({

        name,

        description,

        parameters = {

            type: "object",

            properties: {}

        }

    }) {

        this.name = name;

        this.description = description;

        this.parameters = parameters;

    }

    toJSON() {

        return {

            name: this.name,

            description: this.description,

            parameters: this.parameters

        };

    }

}

window.ToolDefinition = ToolDefinition;
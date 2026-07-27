/*
==========================================================
AI Service
Gemini REST API
==========================================================
*/
class AIService {

    constructor() {

        this.endpoint =
            `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL}:generateContent?key=${AI_CONFIG.API_KEY}`;

    }

    async sendMessage(messages, tools = []) {

        const systemMessage = messages.find(
            message => message.role === "system"
        );

        const conversation = messages.filter(
            message => message.role !== "system"
        );

        const body = {

            contents: conversation.map(message => ({

                role:
                    message.role === "assistant"
                        ? "model"
                        : "user",

                parts: [

                    {

                        text: message.content

                    }

                ]

            }))

        };

        if (systemMessage) {

            body.systemInstruction = {

                parts: [

                    {

                        text: systemMessage.content

                    }

                ]

            };

        }

        if (tools.length > 0) {

            body.tools = [

                {

                    functionDeclarations:

                        tools.map(tool => tool.toJSON())

                }

            ];

        }

        const response = await fetch(

            this.endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json"

                },

                body:

                    JSON.stringify(body)

            }

        );

        if (!response.ok) {

            const error = await response.json();

            throw new Error(

                error.error?.message ??

                "Gemini request failed."

            );

        }

        return await response.json();

    }

    extractText(response) {

        const candidate =
            response.candidates?.[0];

        if (!candidate)
            return "";

        const parts =
            candidate.content?.parts ?? [];

        return parts
            .filter(part => part.text)
            .map(part => part.text)
            .join("");

    }

    extractToolCalls(response) {

        const candidate =
            response.candidates?.[0];

        if (!candidate)
            return [];

        const parts =
            candidate.content?.parts ?? [];

        return parts
            .filter(part => part.functionCall)
            .map(part => ({

                name:
                    part.functionCall.name,

                arguments:
                    part.functionCall.args ?? {}

            }));

    }

    async continueConversation(messages, previousResponse, toolResults) {

        const systemMessage = messages.find(
            message => message.role === "system"
        );

        const conversation = messages.filter(
            message => message.role !== "system"
        );

        const contents = [

            ...conversation.map(message => ({

                role:
                    message.role === "assistant"
                        ? "model"
                        : "user",

                parts: [

                    {

                        text: message.content

                    }

                ]

            })),

            // Preserve Gemini's previous functionCall
            {
                role: "model",
                parts:
                    previousResponse.candidates?.[0]?.content?.parts
                        ?.filter(part => part.functionCall) || []
            },

            {

                role: "user",

                parts: toolResults.map(result => ({

                    functionResponse: {
                        name: result.name,
                        response: {
                            result: result.output
                        }
                    }

                }))

            }

        ].filter(Boolean);

        const body = {

            contents

        };

        if (systemMessage) {

            body.systemInstruction = {

                parts: [

                    {

                        text: systemMessage.content

                    }

                ]

            };

        }

        const response = await fetch(

            this.endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(body)

            }

        );

        if (!response.ok) {

            const error = await response.json();

            throw new Error(

                error.error?.message ??

                "Gemini request failed."

            );

        }

        return await response.json();

    }

}

window.AIService = AIService;
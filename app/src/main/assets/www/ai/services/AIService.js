/*
==========================================================
AI Service
Gemini REST API
==========================================================
*/

class AIService {

    constructor() {

        this.apiKey = AI_CONFIG.API_KEY;
        this.model = AI_CONFIG.MODEL;

        this.endpoint =
            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    }


    /*
    ======================================================
    SEND INITIAL MESSAGE
    ======================================================
    */

    async sendMessage(messages, tools = []) {

        const systemMessage =
            messages.find(m => m.role === "system");

        const conversation =
            messages.filter(m => m.role !== "system");

        const contents =
            conversation.map(m =>
                this.messageToGemini(m)
            );

        return await this.generate(
            contents,
            systemMessage?.content,
            tools
        );
    }


    /*
    ======================================================
    GENERATE
    ======================================================
    */

    async generate(
        contents,
        systemInstruction = null,
        tools = []
    ) {

        const body = {
            contents
        };

        if (systemInstruction) {

            body.systemInstruction = {
                parts: [
                    {
                        text: systemInstruction
                    }
                ]
            };
        }

        if (tools?.length > 0) {

            body.tools = [
                {
                    functionDeclarations:
                        tools.map(tool =>
                            tool.toJSON()
                        )
                }
            ];
        }

        return await this.request(body);
    }


    /*
    ======================================================
    CONVERT CHAT HISTORY
    ======================================================
    */

    messageToGemini(message) {

        return {

            role:
                message.role === "assistant"
                    ? "model"
                    : "user",

            parts: [
                {
                    text: String(
                        message.content ?? ""
                    )
                }
            ]
        };
    }


    /*
    ======================================================
    EXTRACT TEXT
    ======================================================
    */

    extractText(response) {

        const parts =
            response
                ?.candidates
                ?.[0]
                ?.content
                ?.parts ?? [];

        return parts
            .filter(part =>
                typeof part.text === "string"
            )
            .map(part => part.text)
            .join("\n")
            .trim();
    }


    /*
    ======================================================
    EXTRACT TOOL CALLS
    ======================================================
    */

    extractToolCalls(response) {

        const parts =
            response
                ?.candidates
                ?.[0]
                ?.content
                ?.parts ?? [];

        return parts
            .filter(part =>
                part.functionCall
            )
            .map(part => ({

                name:
                    part.functionCall.name,

                args:
                    part.functionCall.args ?? {},

                /*
                Preserve ID when Gemini supplies one.
                */
                id:
                    part.functionCall.id ?? null

            }));
    }


    /*
    ======================================================
    BUILD FUNCTION RESPONSES
    ======================================================
    */

    buildFunctionResponses(
        toolCalls,
        toolOutputs
    ) {

        return toolOutputs.map(
            (result, index) => {

                const call =
                    toolCalls[index];

                const functionResponse = {

                    name:
                        result.name ??
                        call?.name,

                    response: {
                        result:
                            result.output
                    }
                };


                /*
                Match Gemini's function call ID
                when one exists.
                */

                if (call?.id) {

                    functionResponse.id =
                        call.id;
                }


                return {
                    functionResponse
                };
            }
        );
    }


    /*
    ======================================================
    HTTP REQUEST
    ======================================================
    */

    async request(body) {

        const response =
            await fetch(
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


        let data;

        try {

            data =
                await response.json();

        }
        catch {

            throw new Error(
                "Piggy received an invalid response from Gemini."
            );
        }


        if (!response.ok || data?.error) {

            console.error(
                "Gemini API error:",
                data
            );

            throw new Error(
                data?.error?.message ||
                `Gemini request failed (${response.status}).`
            );
        }


        return data;
    }
}


window.AIService = AIService;
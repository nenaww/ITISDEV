/*
==========================================================
Piggy Chat Manager
Gemini Multi-Tool Implementation
==========================================================
*/

class PiggyChatManager {

    constructor() {

        this.ai =
            new AIService();

        this.history = [];

        /*
        Safety limit.

        Piggy can use several tools for one question,
        but cannot loop forever.
        */
        this.maxToolRounds = 5;
    }


    async ask(userPrompt) {

        try {

            /*
            ==================================================
            STORE USER MESSAGE
            ==================================================
            */

            this.history.push({
                role: "user",
                content: userPrompt
            });


            /*
            ==================================================
            BUILD PROMPT
            ==================================================
            */

            const messages =
                PromptBuilder.buildMessages(
                    this.history
                );


            const systemMessage =
                messages.find(
                    m => m.role === "system"
                );


            const conversation =
                messages.filter(
                    m => m.role !== "system"
                );


            /*
            This contains the COMPLETE Gemini conversation
            for the current request.

            We keep adding function calls and responses
            until Gemini actually produces text.
            */

            const contents =
                conversation.map(
                    message =>
                        this.ai.messageToGemini(
                            message
                        )
                );


            const tools =
                ToolRegistry.getTools();


            /*
            ==================================================
            FIRST GEMINI REQUEST
            ==================================================
            */

            let response =
                await this.ai.generate(
                    contents,
                    systemMessage?.content,
                    tools
                );


            /*
            ==================================================
            TOOL LOOP
            ==================================================
            */

            for (
                let round = 0;
                round < this.maxToolRounds;
                round++
            ) {

                /*
                ----------------------------------------------
                Does Gemini want tools?
                ----------------------------------------------
                */

                const toolCalls =
                    this.ai.extractToolCalls(
                        response
                    );


                /*
                ==============================================
                NO TOOL CALL = FINAL RESPONSE
                ==============================================
                */

                if (toolCalls.length === 0) {

                    const text =
                        this.ai.extractText(
                            response
                        );


                    /*
                    NEVER return an empty successful message.
                    */

                    if (!text) {

                        console.error(
                            "Gemini returned no text:",
                            response
                        );

                        throw new Error(
                            "Piggy couldn't generate a response."
                        );
                    }


                    /*
                    Only now do we store Piggy's message.
                    */

                    this.history.push({
                        role: "assistant",
                        content: text
                    });


                    return {
                        success: true,
                        text
                    };
                }


                /*
                ==============================================
                GEMINI REQUESTED TOOL(S)
                ==============================================
                */


                /*
                Preserve Gemini's EXACT response.

                This is important.

                Do NOT manually rebuild the functionCall.
                */

                const modelContent =
                    response
                        ?.candidates
                        ?.[0]
                        ?.content;


                if (!modelContent?.parts) {

                    throw new Error(
                        "Gemini returned an invalid tool call."
                    );
                }


                contents.push(
                    modelContent
                );


                /*
                ----------------------------------------------
                WAIT FOR TOOL RETRIEVAL
                ----------------------------------------------

                Piggy's typing animation should remain active
                while this is awaited.
                */

                const toolOutputs =
                    await RetrievalService.retrieve(
                        toolCalls
                    );


                /*
                ----------------------------------------------
                SEND TOOL RESULTS BACK
                ----------------------------------------------
                */

                const functionResponses =
                    this.ai.buildFunctionResponses(
                        toolCalls,
                        toolOutputs
                    );


                contents.push({

                    role: "user",

                    parts:
                        functionResponses

                });


                /*
                ----------------------------------------------
                ASK GEMINI AGAIN
                ----------------------------------------------

                IMPORTANT:

                Tools remain available.

                Gemini can either:

                A. produce the final text

                OR

                B. request another tool.

                We DO NOT display anything yet.
                ----------------------------------------------
                */

                response =
                    await this.ai.generate(
                        contents,
                        systemMessage?.content,
                        tools
                    );
            }


            /*
            ==================================================
            SAFETY LIMIT REACHED
            ==================================================
            */

            throw new Error(
                "Piggy needed too many steps to answer that request."
            );

        }
        catch (error) {

            console.error(
                "PiggyChatManager error:",
                error
            );


            return {

                success: false,

                text:
                    error?.message ||
                    "Piggy had trouble answering that."

            };
        }
    }


    clearHistory() {

        this.history = [];
    }
}


window.PiggyChatManager =
    PiggyChatManager;
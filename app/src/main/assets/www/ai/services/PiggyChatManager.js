/*
==========================================================
Piggy Chat Manager
Gemini Implementation
==========================================================
*/
class PiggyChatManager {

    constructor() {

        this.ai = new AIService();

        this.history = [];

    }

    async ask(userPrompt) {

        try {

            // Store user message

            this.history.push({

                role: "user",

                content: userPrompt

            });

            // Build conversation

            const messages = PromptBuilder.buildMessages(

                this.history

            );

            // First Gemini request

            const response = await this.ai.sendMessage(

                messages,

                ToolRegistry.getTools()

            );

            // Check if Gemini requested tools

            const toolCalls =

                this.ai.extractToolCalls(response);

            // If no tools were requested

            if (toolCalls.length === 0) {

                const text =

                    this.ai.extractText(response);

                this.history.push({

                    role: "assistant",

                    content: text

                });

                return {

                    success: true,

                    text

                };

            }

            // Execute tools

            const toolOutputs =

                await RetrievalService.retrieve(

                    toolCalls

                );

            // Continue conversation with tool responses

            const finalResponse =
                await this.ai.continueConversation(
                    messages,
                    response,
                    toolOutputs
                );

            console.log("FIRST RESPONSE:");
            console.log(JSON.stringify(response, null, 2));

            console.log("FINAL RESPONSE:");
            console.log(JSON.stringify(finalResponse, null, 2));

            const finalText =
                this.ai.extractText(finalResponse);

            console.log("FINAL TEXT:", finalText);

            this.history.push({

                role: "assistant",

                content: finalText

            });

            return {

                success: true,

                text: finalText

            };

        }

        catch (error) {

            console.error(error);

            return {

                success: false,

                text: error.message

            };

        }

    }

    clearHistory() {

        this.history = [];

    }

}

window.PiggyChatManager = PiggyChatManager;
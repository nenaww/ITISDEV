class RetrievalService {

    static async retrieve(toolCalls) {

        const outputs = [];

        for (const call of toolCalls) {

            const result = await ToolExecutor.execute(

                call.name,

                call.arguments

            );

            outputs.push(

                new ToolResult(

                    call.name,

                    result

                )

            );

        }

        return outputs;

    }

}

window.RetrievalService = RetrievalService;
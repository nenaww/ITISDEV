function noParams() {

    return {
        type: "object",
        properties: {}
    };

}

function stringParam(name, description) {

    return {

        type: "object",

        properties: {

            [name]: {

                type: "string",

                description

            }

        },

        required: [name]

    };

}

function numberParam(name, description) {

    return {

        type: "object",

        properties: {

            [name]: {

                type: "number",

                description

            }

        },

        required: [name]

    };

}

function compareMonthsParams() {

    return {

        type: "object",

        properties: {

            month1: {

                type: "string",

                description: "First month"

            },

            month2: {

                type: "string",

                description: "Second month"

            }

        },

        required: [

            "month1",

            "month2"

        ]

    };

}

class ToolRegistry {

    static getTools() {

        return [

            /*
            ========================================================
            EXPENSE TOOLS
            ========================================================


            new ToolDefinition({

                name: "getMonthlyExpenses",

                description: "Returns the user's total expenses for a given month.",

                parameters: stringParam(

                    "month",

                    "Month to retrieve."

                )

            }),

            new ToolDefinition({

                name: "getExpensesByCategory",

                description: "Returns all expenses for a category.",

                parameters: stringParam(

                    "category",

                    "Expense category"

                )

            }),

            new ToolDefinition({

                name: "getExpensesByStore",

                description: "Returns expenses grouped by store.",

                parameters: stringParam(

                    "store",

                    "Store name"

                )

            }),

            new ToolDefinition({

                name: "getLargestExpenses",

                description: "Returns the user's largest expenses.",

                parameters: numberParam(

                    "limit",

                    "Maximum number of expenses"

                )

            }),

            /*
            ========================================================
            BUDGET
            ========================================================


            new ToolDefinition({

                name: "getBudgetSummary",

                description: "Returns the user's current budget summary.",

                parameters: noParams()

            }),

            new ToolDefinition({

                name: "getBudgetProgress",

                description: "Returns budget progress for every category.",

                parameters: noParams()

            }),
            */

            /*
            ========================================================
            RECEIPTS
            ========================================================
            */

            new ToolDefinition({

                name: "getRecentReceipts",

                description: "Returns the user's recent receipts.",

                parameters: numberParam(

                    "limit",

                    "Maximum receipts"

                )

            }),

            new ToolDefinition({

                name: "getReceiptItems",

                description: "Returns every item inside a receipt.",

                parameters: stringParam(

                    "receiptId",

                    "Receipt ID"

                )

            }),

            /*
            ========================================================
            PRODUCTS
            ========================================================


            new ToolDefinition({

                name: "getFrequentlyPurchasedProducts",

                description: "Returns products purchased most frequently.",

                parameters: noParams()

            }),

            new ToolDefinition({

                name: "getProductHistory",

                description: "Returns purchase history for a product.",

                parameters: stringParam(

                    "product",

                    "Product name"

                )

            }),

            new ToolDefinition({

                name: "getCheapestStore",

                description: "Returns the cheapest store for a product.",

                parameters: stringParam(

                    "product",

                    "Product name"

                )

            }),

            /*
            ========================================================
            BILLS
            ========================================================


            new ToolDefinition({

                name: "getUpcomingBills",

                description: "Returns upcoming bills.",

                parameters: noParams()

            }),

            new ToolDefinition({

                name: "getBillStatus",

                description: "Returns information about a bill.",

                parameters: stringParam(

                    "billName",

                    "Bill name"

                )

            }),

            /*
            ========================================================
            DEBTS
            ========================================================


            new ToolDefinition({

                name: "getDebtSummary",

                description: "Returns the user's debt summary.",

                parameters: noParams()

            }),
            */

            /*
            ========================================================
            ANALYTICS
            ========================================================
            */

            new ToolDefinition({

                name: "compareMonths",

                description: "Compare expenses between two months.",

                parameters: compareMonthsParams()

            }),

            new ToolDefinition({

                name: "getHighestExpenseCategory",

                description: "Returns the category with the highest spending.",

                parameters: noParams()

            }),

            new ToolDefinition({

                name: "getDailyAverageSpend",

                description: "Returns the user's average daily spending.",

                parameters: noParams()

            })

        ];

    }

}

window.ToolRegistry = ToolRegistry;
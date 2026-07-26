class BudgetTools {

    static async getMonthlyExpenses({ month } = {}) {
        throw new Error("ExpenseTools.getMonthlyExpenses() has not been implemented yet.");
    }

    static async getExpensesByCategory({ category } = {}) {
        throw new Error("ExpenseTools.getExpensesByCategory() has not been implemented yet.");
    }

    static async getExpensesByStore({ store } = {}) {
        throw new Error("ExpenseTools.getExpensesByStore() has not been implemented yet.");
    }

    static async getLargestExpenses({ limit = 5 } = {}) {
        throw new Error("ExpenseTools.getLargestExpenses() has not been implemented yet.");
    }

    static async searchExpenses({ keyword } = {}) {
        throw new Error("ExpenseTools.searchExpenses() has not been implemented yet.");
    }

}

window.BudgetTools = BudgetTools;
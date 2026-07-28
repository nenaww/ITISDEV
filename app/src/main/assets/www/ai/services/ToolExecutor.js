class ToolExecutor {

    static registry = {

        getMonthlyExpenses: ExpenseTools.getMonthlyExpenses,
        getExpensesByCategory: ExpenseTools.getExpensesByCategory,
        getExpensesByStore: ExpenseTools.getExpensesByStore,
        getLargestExpenses: ExpenseTools.getLargestExpenses,

        getBudgetSummary: BudgetTools.getBudgetSummary,
        getBudgetProgress: BudgetTools.getBudgetProgress,

        getRecentReceipts: ReceiptTools.getRecentReceipts,
        getReceiptItems: ReceiptTools.getReceiptItems,

        getFrequentlyPurchasedProducts: ProductTools.getFrequentlyPurchasedProducts,
        getProductHistory: ProductTools.getProductHistory,
        getCheapestStore: ProductTools.getCheapestStore,

        getUpcomingBills: BillTools.getUpcomingBills,
        getBillStatus: BillTools.getBillStatus,

        getDebtSummary: DebtTools.getDebtSummary,

        compareMonths: AnalyticsTools.compareMonths,
        getHighestExpenseCategory: AnalyticsTools.getHighestExpenseCategory,
        getDailyAverageSpend: AnalyticsTools.getDailyAverageSpend

    };

    static async execute(name, args = {}) {

        const fn = this.registry[name];

        if (!fn) {

            throw new Error(`Unknown tool: ${name}`);

        }

        return await fn(args);

    }

}

window.ToolExecutor = ToolExecutor;
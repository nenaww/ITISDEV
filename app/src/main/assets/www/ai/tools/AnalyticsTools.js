class AnalyticsTools {

    /**
     * Returns overall spending statistics.
     */
    static async getTotalSpent() {

        const receipts = await ReceiptTools.getReceipts();

        const summary = ReceiptTools.summarizeReceipts(receipts);

        return {

            totalSpent: summary.totalSpent,

            receiptCount: summary.receiptCount,

            averageReceipt: summary.averageReceipt

        };

    }

    /**
     * Returns average spending per day.
     */
    static async getDailyAverageSpend() {

        const receipts = await ReceiptTools.getReceipts();

        if (receipts.length === 0) {

            return {

                averageDailySpend: 0

            };

        }

        const grouped = {};

        receipts.forEach(receipt => {

            const date = receipt.receipt_date;

            grouped[date] =

                (grouped[date] || 0)

                + Number(receipt.total || 0);

        });

        const totals = Object.values(grouped);

        const average =

            totals.reduce((a, b) => a + b, 0)

            / totals.length;

        return {

            averageDailySpend: average,

            daysTracked: totals.length

        };

    }

    /**
     * Returns total receipts scanned.
     */
    static async getReceiptCount() {

        const receipts = await ReceiptTools.getReceipts();

        return {

            receiptCount: receipts.length

        };

    }

    /**
     * Returns average receipt value.
     */
    static async getAverageReceiptValue() {

        const receipts = await ReceiptTools.getReceipts();

        if (receipts.length === 0) {

            return {

                averageReceiptValue: 0

            };

        }

        const total = receipts.reduce(

            (sum, receipt) =>

                sum + Number(receipt.total || 0),

            0

        );

        return {

            averageReceiptValue:

                total / receipts.length

        };

    }

    /**
     * Returns the store visited the most.
     */
    static async getMostVisitedStore() {

        const receipts = await ReceiptTools.getReceipts();

        const stores = {};

        receipts.forEach(receipt => {

            const store =

                receipt.store_name_raw || "Unknown";

            stores[store] =

                (stores[store] || 0) + 1;

        });

        const sorted =

            Object.entries(stores)

            .map(([store, visits]) => ({

                store,

                visits

            }))

            .sort((a, b) =>

                b.visits - a.visits

            );

        return sorted[0] || null;

    }

    /**
     * Compare spending between two months.
     *
     * Example:
     * month1 = "2026-06"
     * month2 = "2026-07"
     */
    static async compareMonths({

        month1,

        month2

    }) {

        const receipts =

            await ReceiptTools.getReceipts();

        const total1 = receipts

            .filter(r =>

                r.receipt_date.startsWith(month1)

            )

            .reduce(

                (sum, r) =>

                    sum + Number(r.total || 0),

                0

            );

        const total2 = receipts

            .filter(r =>

                r.receipt_date.startsWith(month2)

            )

            .reduce(

                (sum, r) =>

                    sum + Number(r.total || 0),

                0

            );

        return {

            month1,

            total1,

            month2,

            total2,

            difference:

                total2 - total1

        };

    }

    /**
     * Returns the category with the highest spending.
     */
    static async getHighestExpenseCategory() {

        const receipts =

            await ReceiptTools.getReceipts();

        const categories = {};

        for (const receipt of receipts) {

            const items =

                await ReceiptTools.getReceiptItems(

                    receipt.id

                );

            items.forEach(item => {

                const category =

                    item.category || "Uncategorized";

                categories[category] =

                    (categories[category] || 0)

                    + Number(item.line_total || 0);

            });

        }

        const sorted =

            Object.entries(categories)

            .map(([category, total]) => ({

                category,

                total

            }))

            .sort((a, b) =>

                b.total - a.total

            );

        return sorted[0] || null;

    }

}

window.AnalyticsTools = AnalyticsTools;
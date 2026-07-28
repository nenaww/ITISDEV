class ReceiptTools {

    static supabase = window.supabaseClient;

    /**
     * Gets receipts using optional filters.
     *
     * filters:
     * {
     *    limit,
     *    store,
     *    fromDate,
     *    toDate
     * }
     */
    static async getReceipts(filters = {}) {

        let query = ReceiptTools.supabase
            .from("receipts")
            .select("*")
            .order("receipt_date", {
                ascending: false
            });

        if (filters.store) {

            query = query.eq(
                "store_name_raw",
                filters.store
            );

        }

        if (filters.fromDate) {

            query = query.gte(
                "receipt_date",
                filters.fromDate
            );

        }

        if (filters.toDate) {

            query = query.lte(
                "receipt_date",
                filters.toDate
            );

        }

        if (filters.limit) {

            query = query.limit(filters.limit);

        }

        const { data, error } = await query;

        if (error)
            throw error;

        return data;

    }

    /**
     * Returns every item inside one receipt.
     */
    static async getReceiptItems(receiptId) {

        const { data, error } = await ReceiptTools.supabase

            .from("receipt_items")

            .select(`
                *,
                products(*)
            `)

            .eq(
                "receipt_id",
                receiptId
            )

            .order(
                "id"
            );

        if (error)
            throw error;

        return data;

    }

    /**
     * Searches OCR text.
     */
    static async searchReceipts(keyword) {

        const { data, error } = await ReceiptTools.supabase

            .from("receipts")

            .select("*")

            .ilike(
                "raw_ocr_text",
                `%${keyword}%`
            );

        if (error)
            throw error;

        return data;

    }

    /**
     * Creates a quick summary from receipts.
     */
    static summarizeReceipts(receipts) {

        const totalSpent = receipts.reduce(

            (sum, receipt) =>

                sum + Number(receipt.total || 0),

            0

        );

        return {

            receiptCount: receipts.length,

            totalSpent,

            averageReceipt:

                receipts.length === 0

                    ? 0

                    : totalSpent / receipts.length

        };

    }

    /**
     * Basic receipt statistics.
     */
    static getReceiptStatistics(receipts) {

        if (receipts.length === 0) {

            return {

                firstReceipt: null,

                latestReceipt: null,

                totalReceipts: 0

            };

        }

        return {

            totalReceipts: receipts.length,

            firstReceipt:

                receipts[receipts.length - 1],

            latestReceipt:

                receipts[0]

        };

    }

    /**
     * Returns the user's most recent receipts.
     *
     * args:
     * {
     *     limit: 5
     * }
     */
    static async getRecentReceipts({ limit = 5 } = {}) {

        const { data, error } = await ReceiptTools.supabase

            .from("receipts")

            .select(`
                id,
                receipt_date,
                store_name_raw,
                total
            `)

            .order("receipt_date", {
                ascending: false
            })

            .limit(limit);

        if (error)
            throw error;

        return data;

    }

}

window.ReceiptTools = ReceiptTools;
class ReceiptTools {

    static supabase = window.supabaseClient;


    /*
    ======================================================
    GET RECEIPTS
    ======================================================
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

            query = query.limit(
                filters.limit
            );

        }


        const { data, error } =
            await query;


        if (error) {
            throw error;
        }


        return data ?? [];

    }


    /*
    ======================================================
    GET RECEIPT ITEMS
    ======================================================

    Supports:

    getReceiptItems("receipt-uuid")

    OR

    getReceiptItems()

    If no receipt ID is supplied, Piggy automatically
    uses the most recent receipt.
    ======================================================
    */

    static async getReceiptItems(receiptId = null) {

        /*
        --------------------------------------------------
        Normalize arguments
        --------------------------------------------------

        This also protects us if something accidentally
        passes:

        { receiptId: "uuid" }

        instead of:

        "uuid"
        --------------------------------------------------
        */

        if (
            receiptId &&
            typeof receiptId === "object"
        ) {

            receiptId =
                receiptId.receiptId ??
                receiptId.id ??
                null;

        }


        /*
        --------------------------------------------------
        No ID supplied?
        Find latest receipt automatically.
        --------------------------------------------------
        */

        if (!receiptId) {

            const {
                data: latestReceipt,
                error: receiptError
            } = await ReceiptTools.supabase

                .from("receipts")

                .select(`
                    id,
                    receipt_date,
                    store_name_raw,
                    total
                `)

                .order(
                    "receipt_date",
                    {
                        ascending: false
                    }
                )

                .limit(1)

                .maybeSingle();


            if (receiptError) {
                throw receiptError;
            }


            /*
            No receipts exist.
            */

            if (!latestReceipt) {

                return {
                    receipt: null,
                    items: []
                };

            }


            receiptId =
                latestReceipt.id;

        }


        /*
        --------------------------------------------------
        Validate ID
        --------------------------------------------------
        */

        if (
            typeof receiptId !== "string" ||
            !receiptId.trim()
        ) {

            throw new Error(
                "A valid receipt ID is required."
            );

        }


        /*
        --------------------------------------------------
        Get receipt information
        --------------------------------------------------
        */

        const {
            data: receipt,
            error: receiptError
        } = await ReceiptTools.supabase

            .from("receipts")

            .select(`
                id,
                receipt_date,
                store_name_raw,
                total
            `)

            .eq(
                "id",
                receiptId
            )

            .maybeSingle();


        if (receiptError) {
            throw receiptError;
        }


        /*
        --------------------------------------------------
        Receipt doesn't exist
        --------------------------------------------------
        */

        if (!receipt) {

            return {
                receipt: null,
                items: []
            };

        }


        /*
        --------------------------------------------------
        Get receipt items
        --------------------------------------------------
        */

        const {
            data: items,
            error: itemsError
        } = await ReceiptTools.supabase

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
                "id",
                {
                    ascending: true
                }
            );


        if (itemsError) {
            throw itemsError;
        }


        /*
        --------------------------------------------------
        Return receipt + items together
        --------------------------------------------------

        This gives Piggy everything needed to make a
        useful response with ONE tool call.
        --------------------------------------------------
        */

        return {

            receipt,

            items: items ?? []

        };

    }


    /*
    ======================================================
    SEARCH RECEIPTS
    ======================================================
    */

    static async searchReceipts(keyword) {

        const { data, error } =
            await ReceiptTools.supabase

                .from("receipts")

                .select("*")

                .ilike(
                    "raw_ocr_text",
                    `%${keyword}%`
                );


        if (error) {
            throw error;
        }


        return data ?? [];

    }


    /*
    ======================================================
    SUMMARIZE RECEIPTS
    ======================================================
    */

    static summarizeReceipts(receipts = []) {

        const totalSpent =
            receipts.reduce(

                (sum, receipt) =>
                    sum +
                    Number(
                        receipt.total || 0
                    ),

                0

            );


        return {

            receiptCount:
                receipts.length,

            totalSpent,

            averageReceipt:
                receipts.length === 0
                    ? 0
                    : totalSpent /
                      receipts.length

        };

    }


    /*
    ======================================================
    RECEIPT STATISTICS
    ======================================================
    */

    static getReceiptStatistics(receipts = []) {

        if (
            receipts.length === 0
        ) {

            return {

                firstReceipt: null,

                latestReceipt: null,

                totalReceipts: 0

            };

        }


        return {

            totalReceipts:
                receipts.length,

            firstReceipt:
                receipts[
                    receipts.length - 1
                ],

            latestReceipt:
                receipts[0]

        };

    }


    /*
    ======================================================
    GET RECENT RECEIPTS
    ======================================================
    */

    static async getRecentReceipts(
        { limit = 5 } = {}
    ) {

        /*
        Safety in case limit somehow arrives incorrectly.
        */

        const safeLimit =
            Number.isFinite(
                Number(limit)
            )
                ? Math.max(
                    1,
                    Math.min(
                        Number(limit),
                        20
                    )
                )
                : 5;


        const { data, error } =
            await ReceiptTools.supabase

                .from("receipts")

                .select(`
                    id,
                    receipt_date,
                    store_name_raw,
                    total
                `)

                .order(
                    "receipt_date",
                    {
                        ascending: false
                    }
                )

                .limit(
                    safeLimit
                );


        if (error) {
            throw error;
        }


        return data ?? [];

    }

}


window.ReceiptTools = ReceiptTools;
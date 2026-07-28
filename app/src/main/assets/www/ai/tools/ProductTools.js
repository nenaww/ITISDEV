class ProductTools {

    static supabase = window.supabaseClient;

    /**
     * Returns purchase history for a product.
     *
     * args:
     * {
     *     product: "Coca Cola"
     * }
     */
    static async getProductHistory({ product }) {

        const { data, error } = await this.supabase

            .from("receipt_items")

            .select(`
                *,
                receipts(*),
                products(*)
            `)

            .ilike("normalized_text", `%${product}%`)

            .order("created_at", {
                ascending: false
            });

        if (error)
            throw error;

        return data;

    }

    /**
     * Returns the products purchased most often.
     */
    static async getFrequentlyPurchasedProducts({ limit = 10 } = {}) {

        const { data, error } = await this.supabase

            .from("receipt_items")

            .select(`
                normalized_text,
                quantity
            `);

        if (error)
            throw error;

        const counts = {};

        data.forEach(item => {

            const name = item.normalized_text;

            if (!name) return;

            counts[name] = (counts[name] || 0) + Number(item.quantity || 1);

        });

        return Object.entries(counts)

            .map(([product, quantity]) => ({
                product,
                quantity
            }))

            .sort((a, b) => b.quantity - a.quantity)

            .slice(0, limit);

    }

    /**
     * Returns the average price paid for a product.
     */
    static async getAverageProductPrice({ product }) {

        const history = await this.getProductHistory({ product });

        if (history.length === 0)
            return null;

        const total = history.reduce(

            (sum, item) =>

                sum + Number(item.unit_price || 0),

            0

        );

        return {

            product,

            averagePrice:

                total / history.length,

            purchases:

                history.length

        };

    }

    /**
     * Returns every known price observation.
     */
    static async getPriceHistory({ product }) {

        const { data, error } = await this.supabase

            .from("product_price_observations")

            .select("*")

            .ilike("product_name", `%${product}%`)

            .order("observed_at", {
                ascending: false
            });

        if (error)
            throw error;

        return data;

    }

    /**
     * Returns the cheapest observed store.
     */
    static async getCheapestStore({ product }) {

        const prices = await this.getPriceHistory({ product });

        if (prices.length === 0)
            return null;

        prices.sort(

            (a, b) =>

                Number(a.unit_price) -

                Number(b.unit_price)

        );

        return prices[0];

    }

    /**
     * Searches products.
     */
    static async searchProducts({ keyword }) {

        const { data, error } = await this.supabase

            .from("products")

            .select("*")

            .or(

                `canonical_name.ilike.%${keyword}%,
                 normalized_name.ilike.%${keyword}%,
                 brand.ilike.%${keyword}%`

            );

        if (error)
            throw error;

        return data;

    }

}

window.ProductTools = ProductTools;
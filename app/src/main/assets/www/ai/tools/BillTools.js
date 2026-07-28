class BillTools {

    static async getUpcomingBills() {
        throw new Error("BillTools.getUpcomingBills() has not been implemented yet.");
    }

    static async getBillStatus({ billName } = {}) {
        throw new Error("BillTools.getBillStatus() has not been implemented yet.");
    }

    static async getPaidBills() {
        throw new Error("BillTools.getPaidBills() has not been implemented yet.");
    }

    static async getBillsDueToday() {
        throw new Error("BillTools.getBillsDueToday() has not been implemented yet.");
    }

    static async getBillsDueThisWeek() {
        throw new Error("BillTools.getBillsDueThisWeek() has not been implemented yet.");
    }

}

window.BillTools = BillTools;
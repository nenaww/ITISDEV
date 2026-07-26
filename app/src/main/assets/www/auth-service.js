const KABALIKAT_AUTH_DB_NAME = "kabalikat_auth_language_db";
const KABALIKAT_AUTH_DB_VERSION = 1;
const KABALIKAT_PROFILE_KEY = "kabalikat_profile_v1";

const KabalikatAuth = (() => {
    let dbPromise = null;

    function openDatabase() {
        if (dbPromise) return dbPromise;

        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(
                KABALIKAT_AUTH_DB_NAME,
                KABALIKAT_AUTH_DB_VERSION
            );

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains("users")) {
                    const users = db.createObjectStore("users", { keyPath: "id" });
                    users.createIndex("email", "email", { unique: true });
                    users.createIndex("familyCode", "familyCode", { unique: false });
                }

                if (!db.objectStoreNames.contains("families")) {
                    db.createObjectStore("families", { keyPath: "familyCode" });
                }

                if (!db.objectStoreNames.contains("sessions")) {
                    db.createObjectStore("sessions", { keyPath: "id" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return dbPromise;
    }

    async function getRecord(storeName, key) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, "readonly")
                .objectStore(storeName)
                .get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async function putRecord(storeName, record) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .put(record);
            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    }

    async function deleteRecord(storeName, key) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function getCurrentSession() {
        return getRecord("sessions", "current");
    }

    async function getCurrentUser() {
        const session = await getCurrentSession();
        if (!session?.userId) return null;
        return getRecord("users", session.userId);
    }

    function saveProfileMirror(user) {
        if (!user) {
            localStorage.removeItem(KABALIKAT_PROFILE_KEY);
            return;
        }

        const existing = (() => {
            try {
                return JSON.parse(localStorage.getItem(KABALIKAT_PROFILE_KEY) || "{}");
            } catch {
                return {};
            }
        })();

        localStorage.setItem(
            KABALIKAT_PROFILE_KEY,
            JSON.stringify({
                ...existing,
                id: user.id,
                name: user.name || "Family Member",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "Family Member",
                familyCode: user.familyCode || "",
                profileImage: existing.profileImage || ""
            })
        );
    }

    async function syncCurrentProfile() {
        let user = await getCurrentUser();

        if (!user) {
            saveProfileMirror(null);
            return null;
        }

        const samplePhones = {
            "sample-head": "0917 123 4567",
            "sample-member-1": "0918 234 5678",
            "sample-member-2": "0919 345 6789"
        };

        if (!user.phone && samplePhones[user.id]) {
            user = {
                ...user,
                phone: samplePhones[user.id],
                updatedAt: new Date().toISOString()
            };

            await putRecord("users", user);
        }

        saveProfileMirror(user);
        return user;
    }

    async function verifyCurrentPassword(password) {
        const user = await getCurrentUser();
        if (!user) return false;
        return user.password === String(password || "");
    }

    async function updateCurrentPassword(currentPassword, newPassword) {
        const user = await getCurrentUser();
        if (!user) throw new Error("No signed-in account was found.");
        if (user.password !== String(currentPassword || "")) {
            throw new Error("Your current account password is incorrect.");
        }

        user.password = String(newPassword || "");
        user.updatedAt = new Date().toISOString();
        await putRecord("users", user);
        return user;
    }

    async function updateCurrentUser(updates) {
        const user = await getCurrentUser();
        if (!user) throw new Error("No signed-in account was found.");

        const updated = {
            ...user,
            ...updates,
            id: user.id,
            familyCode: user.familyCode,
            updatedAt: new Date().toISOString()
        };

        await putRecord("users", updated);
        saveProfileMirror(updated);
        return updated;
    }

    async function logout() {
        await deleteRecord("sessions", "current");
        localStorage.removeItem(KABALIKAT_PROFILE_KEY);
        sessionStorage.removeItem("kabalikat_vault_unlock_ticket_v3");
    }

    async function deleteCurrentAccount() {
        const user = await getCurrentUser();
        if (!user) return;
        await deleteRecord("users", user.id);
        await logout();
    }

    return {
        openDatabase,
        getCurrentSession,
        getCurrentUser,
        syncCurrentProfile,
        verifyCurrentPassword,
        updateCurrentPassword,
        updateCurrentUser,
        logout,
        deleteCurrentAccount
    };
})();

window.KabalikatAuth = KabalikatAuth;
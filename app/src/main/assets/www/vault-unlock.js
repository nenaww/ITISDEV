const VAULT_AUTH_DB_NAME =
    "kabalikat_auth_language_db";

const VAULT_TICKET_KEY =
    "kabalikat_vault_unlock_ticket_v3";

const VAULT_TICKET_LIFETIME =
    5 * 60 * 1000;

let vaultUnlockDatabase = null;
let vaultUnlockUser = null;

document.addEventListener(
    "DOMContentLoaded",
    initializeVaultUnlock
);

async function initializeVaultUnlock() {
    bindVaultUnlockEvents();

    try {
        vaultUnlockDatabase =
            await openVaultAuthDatabase();

        vaultUnlockUser =
            await loadSignedInVaultUser();

        if (!vaultUnlockUser) {
            showVaultUnlockError(
                "Please sign in before opening Secure Vault."
            );

            setUnlockButtonDisabled(true);
            return;
        }

        renderVaultUnlockAccount(
            vaultUnlockUser
        );

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "vaultPassword"
                    )
                    ?.focus();
            },
            80
        );
    } catch (error) {
        console.error(
            "Secure Vault unlock initialization failed:",
            error
        );

        showVaultUnlockError(
            "Your account could not be verified. Please return to Home and try again."
        );

        setUnlockButtonDisabled(true);
    }
}

function bindVaultUnlockEvents() {
    document
        .getElementById(
            "vaultUnlockBack"
        )
        ?.addEventListener(
            "click",
            () => {
                window.location.href =
                    "home.html";
            }
        );

    document
        .getElementById(
            "toggleVaultPassword"
        )
        ?.addEventListener(
            "click",
            toggleVaultPassword
        );

    document
        .getElementById(
            "vaultUnlockForm"
        )
        ?.addEventListener(
            "submit",
            verifyVaultPassword
        );
}

function openVaultAuthDatabase() {
    return new Promise(
        (resolve, reject) => {
            const request =
                indexedDB.open(
                    VAULT_AUTH_DB_NAME
                );

            request.onsuccess =
                event => {
                    resolve(
                        event.target.result
                    );
                };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

function getVaultAuthRecord(
    storeName,
    key
) {
    return new Promise(
        (resolve, reject) => {
            if (
                !vaultUnlockDatabase
                    .objectStoreNames
                    .contains(storeName)
            ) {
                resolve(null);
                return;
            }

            const request =
                vaultUnlockDatabase
                    .transaction(
                        storeName,
                        "readonly"
                    )
                    .objectStore(
                        storeName
                    )
                    .get(key);

            request.onsuccess = () => {
                resolve(
                    request.result || null
                );
            };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

async function loadSignedInVaultUser() {
    const session =
        await getVaultAuthRecord(
            "sessions",
            "current"
        );

    if (!session?.userId) {
        return null;
    }

    return await getVaultAuthRecord(
        "users",
        session.userId
    );
}

function renderVaultUnlockAccount(user) {
    const account =
        document.getElementById(
            "vaultUnlockAccount"
        );

    const name =
        String(
            user.name ||
            "Family Member"
        ).trim();

    setVaultUnlockText(
        "vaultUnlockName",
        name
    );

    setVaultUnlockText(
        "vaultUnlockEmail",
        user.email ||
            user.role ||
            "Signed-in account"
    );

    setVaultUnlockText(
        "vaultUnlockAvatar",
        getVaultInitials(name)
    );

    if (account) {
        account.hidden = false;
    }
}

async function verifyVaultPassword(event) {
    event.preventDefault();

    hideVaultUnlockError();

    if (!vaultUnlockUser) {
        showVaultUnlockError(
            "Please sign in before opening Secure Vault."
        );
        return;
    }

    const passwordInput =
        document.getElementById(
            "vaultPassword"
        );

    const enteredPassword =
        String(
            passwordInput?.value || ""
        );

    if (!enteredPassword) {
        showVaultUnlockError(
            "Enter your account password."
        );

        passwordInput?.focus();
        return;
    }

    setUnlockButtonDisabled(true);

    const savedPassword =
        String(
            vaultUnlockUser.password || ""
        );

    if (
        !savedPassword ||
        enteredPassword !== savedPassword
    ) {
        showVaultUnlockError(
            "Incorrect password. Please try again."
        );

        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.focus();
        }

        setUnlockButtonDisabled(false);
        return;
    }

    sessionStorage.setItem(
        VAULT_TICKET_KEY,
        JSON.stringify({
            userId:
                vaultUnlockUser.id,
            familyCode:
                vaultUnlockUser.familyCode,
            expiresAt:
                Date.now() +
                VAULT_TICKET_LIFETIME
        })
    );

    window.location.replace(
        "secure-vault.html"
    );
}

function toggleVaultPassword() {
    const input =
        document.getElementById(
            "vaultPassword"
        );

    const button =
        document.getElementById(
            "toggleVaultPassword"
        );

    const icon =
        button?.querySelector("i");

    if (!input) {
        return;
    }

    const shouldShow =
        input.type === "password";

    input.type =
        shouldShow
            ? "text"
            : "password";

    if (icon) {
        icon.className =
            shouldShow
                ? "bi bi-eye-slash"
                : "bi bi-eye";
    }

    button?.setAttribute(
        "aria-label",
        shouldShow
            ? "Hide password"
            : "Show password"
    );
}

function setUnlockButtonDisabled(disabled) {
    const button =
        document.getElementById(
            "unlockVaultButton"
        );

    if (button) {
        button.disabled = disabled;
    }
}

function showVaultUnlockError(message) {
    const error =
        document.getElementById(
            "vaultUnlockError"
        );

    if (!error) {
        return;
    }

    error.textContent = message;
    error.hidden = false;
}

function hideVaultUnlockError() {
    const error =
        document.getElementById(
            "vaultUnlockError"
        );

    if (error) {
        error.hidden = true;
        error.textContent = "";
    }
}

function setVaultUnlockText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function getVaultInitials(name) {
    return String(
        name || "Family Member"
    )
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part =>
            part[0].toUpperCase()
        )
        .join("") || "FM";
}

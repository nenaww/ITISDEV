const VAULT_TICKET_KEY =
    "kabalikat_vault_unlock_ticket_v3";

const VAULT_TICKET_DURATION =
    5 * 60 * 1000;

const VAULT_ORIGIN_KEY =
    "kabalikat_vault_origin_v1";

const vaultOrigin =
    getVaultOrigin();

let currentVaultUser = null;

const vaultUnlockLanguage =
    localStorage.getItem("kabalikat_language") === "tl"
        ? "tl"
        : "en";

const vaultUnlockText = {
    en: {
        eyebrow: "SECURE VAULT",
        title: "Enter your password",
        subtitle:
            "Confirm your account password before opening your family's protected files.",
        password: "PASSWORD",
        placeholder: "Enter your password",
        submit: "Unlock Vault",
        verifying: "Verifying...",
        inactivity:
            "The vault locks again after five minutes of inactivity.",
        empty: "Enter your account password.",
        incorrect: "Incorrect account password.",
        failed: "Password could not be verified.",
        noSession: "Your login session has expired."
    },

    tl: {
        eyebrow: "SECURE VAULT",
        title: "Ilagay ang iyong password",
        subtitle:
            "Kumpirmahin ang password ng account bago buksan ang protektadong files ng pamilya.",
        password: "PASSWORD",
        placeholder: "Ilagay ang iyong password",
        submit: "Buksan ang Vault",
        verifying: "Vine-verify...",
        inactivity:
            "Magsasara muli ang vault pagkalipas ng limang minutong walang aktibidad.",
        empty: "Ilagay ang password ng account.",
        incorrect: "Mali ang password ng account.",
        failed: "Hindi ma-verify ang password.",
        noSession: "Nag-expire na ang iyong login session."
    }
};

document.addEventListener(
    "DOMContentLoaded",
    initializeVaultUnlock
);

async function initializeVaultUnlock() {
    bindVaultUnlockEvents();
    applyVaultUnlockLanguage();

    try {
        currentVaultUser =
            await KabalikatAuth.getCurrentUser();

        if (!currentVaultUser) {
            showVaultUnlockError(
                getVaultText().noSession
            );

            window.setTimeout(() => {
                window.location.replace("login.html");
            }, 900);

            return;
        }

        renderVaultAccount();
    } catch (error) {
        console.error(error);

        showVaultUnlockError(
            getVaultText().noSession
        );

        window.setTimeout(() => {
            window.location.replace("login.html");
        }, 900);
    }
}

function bindVaultUnlockEvents() {
    document
        .getElementById("vaultUnlockBackButton")
        .addEventListener("click", () => {
            window.location.href =
                getVaultOriginRoute();
        });

    document
        .getElementById("vaultUnlockPasswordToggle")
        .addEventListener(
            "click",
            toggleVaultPassword
        );

    document
        .getElementById("vaultUnlockPassword")
        .addEventListener(
            "input",
            clearVaultUnlockError
        );

    document
        .getElementById("vaultUnlockForm")
        .addEventListener(
            "submit",
            unlockVault
        );
}

function applyVaultUnlockLanguage() {
    const text = getVaultText();

    setVaultText(
        "vaultUnlockEyebrow",
        text.eyebrow
    );

    setVaultText(
        "vaultUnlockTitle",
        text.title
    );

    setVaultText(
        "vaultUnlockSubtitle",
        text.subtitle
    );

    setVaultText(
        "vaultPasswordLabel",
        text.password
    );

    setVaultText(
        "vaultUnlockSubmitText",
        text.submit
    );

    setVaultText(
        "vaultInactivityText",
        text.inactivity
    );

    document
        .getElementById("vaultUnlockPassword")
        .placeholder = text.placeholder;
}

function renderVaultAccount() {
    const name =
        currentVaultUser.name ||
        "Family Member";

    const email =
        currentVaultUser.email ||
        "Current account";

    setVaultText(
        "vaultAccountName",
        name
    );

    setVaultText(
        "vaultAccountEmail",
        email
    );

    setVaultText(
        "vaultAccountInitials",
        getVaultInitials(name)
    );
}

function getVaultInitials(name) {
    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "FM";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

async function unlockVault(event) {
    event.preventDefault();

    const passwordInput =
        document.getElementById(
            "vaultUnlockPassword"
        );

    const passwordBox =
        document.getElementById(
            "vaultPasswordInputBox"
        );

    const submitButton =
        document.getElementById(
            "vaultUnlockSubmit"
        );

    const submitText =
        document.getElementById(
            "vaultUnlockSubmitText"
        );

    const password =
        passwordInput.value;

    const text =
        getVaultText();

    if (!currentVaultUser) {
        showVaultUnlockError(text.noSession);
        return;
    }

    if (!password) {
        showVaultUnlockError(text.empty);
        passwordBox.classList.add("is-invalid");
        passwordInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitText.textContent = text.verifying;

    try {
        const valid =
            await KabalikatAuth.verifyCurrentPassword(
                password
            );

        if (!valid) {
            showVaultUnlockError(text.incorrect);
            passwordBox.classList.add("is-invalid");
            passwordInput.select();
            return;
        }

        const now = Date.now();

        sessionStorage.setItem(
            VAULT_TICKET_KEY,
            JSON.stringify({
                userId:
                    String(currentVaultUser.id || ""),
                familyCode:
                    normalizeFamilyCode(
                        currentVaultUser.familyCode
                    ),
                issuedAt: now,
                expiresAt:
                    now + VAULT_TICKET_DURATION
            })
        );

        window.location.replace(
            `secure-vault.html?from=${encodeURIComponent(vaultOrigin)}`
        );
    } catch (error) {
        console.error(error);
        showVaultUnlockError(text.failed);
        passwordBox.classList.add("is-invalid");
    } finally {
        submitButton.disabled = false;
        submitText.textContent = text.submit;
    }
}

function toggleVaultPassword() {
    const input =
        document.getElementById(
            "vaultUnlockPassword"
        );

    const button =
        document.getElementById(
            "vaultUnlockPasswordToggle"
        );

    const show =
        input.type === "password";

    input.type =
        show
            ? "text"
            : "password";

    button.innerHTML =
        show
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';

    button.setAttribute(
        "aria-label",
        show
            ? "Hide password"
            : "Show password"
    );
}

function showVaultUnlockError(message) {
    document
        .getElementById("vaultUnlockError")
        .textContent = message;
}

function clearVaultUnlockError() {
    showVaultUnlockError("");

    document
        .getElementById("vaultPasswordInputBox")
        .classList.remove("is-invalid");
}


function getVaultOrigin() {
    const requestedOrigin =
        new URLSearchParams(
            window.location.search
        ).get("from");

    if (
        requestedOrigin === "home" ||
        requestedOrigin === "profile"
    ) {
        sessionStorage.setItem(
            VAULT_ORIGIN_KEY,
            requestedOrigin
        );

        return requestedOrigin;
    }

    const savedOrigin =
        sessionStorage.getItem(
            VAULT_ORIGIN_KEY
        );

    return savedOrigin === "profile"
        ? "profile"
        : "home";
}

function getVaultOriginRoute() {
    return vaultOrigin === "profile"
        ? "profile.html"
        : "home.html";
}

function normalizeFamilyCode(value) {
    return String(value || "")
        .trim()
        .toUpperCase();
}

function getVaultText() {
    return (
        vaultUnlockText[vaultUnlockLanguage] ||
        vaultUnlockText.en
    );
}

function setVaultText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}
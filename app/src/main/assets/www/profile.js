const PROFILE_KEY = "kabalikat_profile_v1";
const VAULT_TICKET_KEY = "kabalikat_vault_unlock_ticket_v3";
const VAULT_TICKET_DURATION = 2 * 60 * 1000;

const routes = {
    home: "home.html",
    expenses: "expenses.html",
    scanner: "scanner.html",
    bills: "bills.html",
    vault: "secure-vault.html",
    vaultUnlock: "vault-unlock.html",
    login: "login.html"
};

let profile = null;
let editing = false;
let toastTimer = null;
let profileLanguage =
    localStorage.getItem("kabalikat_language") || "en";

const el = {};

window.addEventListener("DOMContentLoaded", async () => {
    collectElements();

    try {
        profile = await KabalikatAuth.syncCurrentProfile();

        if (!profile) {
            window.location.replace(routes.login);
            return;
        }
    } catch (error) {
        console.error(error);
        window.location.replace(routes.login);
        return;
    }

    renderProfile();
    bindEvents();
    resetPasswordForm();
    resetVaultUnlock();
});

function collectElements() {
    [
        "profileBackButton",
        "profilePictureButton",
        "profilePictureInput",
        "profileImage",
        "profileInitials",
        "profileDisplayName",
        "profileRoleChip",
        "accountDetailsButton",
        "secureVaultButton",
        "changePasswordButton",
        "profileLanguageButton",
        "profileLanguageValue",
        "profileLanguageBackdrop",
        "profileLanguageSheet",
        "closeProfileLanguageSheet",
        "profileLogoutRowButton",
        "deleteAccountButton",
        "profileSheetBackdrop",
        "profileAccountSheet",
        "closeAccountSheet",
        "profileNameInput",
        "profileEmailInput",
        "profilePhoneInput",
        "profileEditSaveButton",
        "profileEditSaveIcon",
        "profileEditSaveText",
        "vaultUnlockBackdrop",
        "vaultUnlockSheet",
        "closeVaultUnlockSheet",
        "vaultPasswordInput",
        "vaultPasswordInputBox",
        "vaultPasswordError",
        "unlockVaultButton",
        "changePasswordBackdrop",
        "changePasswordSheet",
        "closeChangePasswordSheet",
        "changePasswordFormState",
        "changePasswordSuccessState",
        "closePasswordSuccess",
        "passwordSuccessDoneButton",
        "currentPasswordInput",
        "newPasswordInput",
        "confirmPasswordInput",
        "passwordStrengthBars",
        "passwordStrengthText",
        "passwordMatchMessage",
        "passwordRequirementLength",
        "passwordRequirementUppercase",
        "passwordRequirementNumber",
        "passwordRequirementSpecial",
        "updatePasswordButton",
        "profileLogoutBackdrop",
        "profileLogoutDialog",
        "cancelLogoutButton",
        "confirmLogoutButton",
        "profileDeleteBackdrop",
        "profileDeleteDialog",
        "cancelDeleteButton",
        "confirmDeleteButton",
        "profileNavHome",
        "profileNavExpenses",
        "profileNavScan",
        "profileNavBills",
        "profileNavSavings",
        "profileToast"
    ].forEach(id => {
        el[id] = document.getElementById(id);
    });

    el.passwordToggleButtons = document.querySelectorAll(
        ".profile-password-toggle"
    );
}

function bindEvents() {
    el.profileBackButton.addEventListener("click", () => {
        go(routes.home);
    });

    el.profilePictureButton.addEventListener("click", () => {
        el.profilePictureInput.click();
    });

    el.profilePictureInput.addEventListener("change", () => {
        updatePicture(el.profilePictureInput.files?.[0]);
    });

    el.accountDetailsButton.addEventListener("click", openAccountSheet);
    el.secureVaultButton.addEventListener("click", () => {
        go(`${routes.vaultUnlock}?from=profile`);
    });
    el.changePasswordButton.addEventListener("click", openPasswordSheet);
    el.profileLanguageButton.addEventListener("click", openLanguageSheet);
    el.closeProfileLanguageSheet.addEventListener("click", closeLanguageSheet);
    el.profileLanguageBackdrop.addEventListener("click", closeLanguageSheet);

    document
        .querySelectorAll("[data-profile-language]")
        .forEach(button => {
            button.addEventListener("click", () => {
                setProfileLanguage(button.dataset.profileLanguage);
            });
        });

    el.profileLogoutRowButton.addEventListener("click", () => {
        openDialog(
            el.profileLogoutBackdrop,
            el.profileLogoutDialog
        );
    });

    el.deleteAccountButton.addEventListener("click", () => {
        openDialog(
            el.profileDeleteBackdrop,
            el.profileDeleteDialog
        );
    });

    el.closeAccountSheet.addEventListener("click", closeAccountSheet);
    el.profileSheetBackdrop.addEventListener("click", closeAccountSheet);

    el.profileEditSaveButton.addEventListener("click", () => {
        if (editing) {
            saveAccountDetails();
            return;
        }

        setEditMode(true);
    });

    el.closeVaultUnlockSheet.addEventListener("click", closeVaultUnlock);
    el.vaultUnlockBackdrop.addEventListener("click", closeVaultUnlock);
    el.unlockVaultButton.addEventListener("click", verifyVaultAccess);
    el.vaultPasswordInput.addEventListener("input", clearVaultError);

    el.vaultPasswordInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            verifyVaultAccess();
        }
    });

    el.closeChangePasswordSheet.addEventListener(
        "click",
        closePasswordSheet
    );

    el.closePasswordSuccess.addEventListener(
        "click",
        closePasswordSheet
    );

    el.passwordSuccessDoneButton.addEventListener(
        "click",
        closePasswordSheet
    );

    el.changePasswordBackdrop.addEventListener(
        "click",
        closePasswordSheet
    );

    [
        el.currentPasswordInput,
        el.newPasswordInput,
        el.confirmPasswordInput
    ].forEach(input => {
        input.addEventListener("input", validatePasswordForm);
    });

    el.updatePasswordButton.addEventListener("click", updatePassword);

    el.passwordToggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            togglePassword(button);
        });
    });

    el.cancelLogoutButton.addEventListener("click", () => {
        closeDialog(
            el.profileLogoutBackdrop,
            el.profileLogoutDialog
        );
    });

    el.profileLogoutBackdrop.addEventListener("click", () => {
        closeDialog(
            el.profileLogoutBackdrop,
            el.profileLogoutDialog
        );
    });

    el.confirmLogoutButton.addEventListener("click", logout);

    el.cancelDeleteButton.addEventListener("click", () => {
        closeDialog(
            el.profileDeleteBackdrop,
            el.profileDeleteDialog
        );
    });

    el.profileDeleteBackdrop.addEventListener("click", () => {
        closeDialog(
            el.profileDeleteBackdrop,
            el.profileDeleteDialog
        );
    });

    el.confirmDeleteButton.addEventListener("click", deleteAccount);

    el.profileNavHome.addEventListener("click", () => {
        go(routes.home);
    });

    el.profileNavExpenses.addEventListener("click", () => {
        go(routes.expenses);
    });

    el.profileNavScan.addEventListener("click", () => {
        go(routes.scanner);
    });

    el.profileNavBills.addEventListener("click", () => {
        go(routes.bills);
    });

    el.profileNavSavings.addEventListener("click", goSavings);
}

function renderProfile() {
    const mirror = JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "{}"
    );

    const name = profile.name || "Family Member";
    const image = mirror.profileImage || "";

    el.profileDisplayName.textContent = name;
    el.profileRoleChip.textContent = profile.role || "Family Member";
    el.profileInitials.textContent = initials(name);
    el.profileNameInput.value = name;
    el.profileEmailInput.value = profile.email || "";
    el.profilePhoneInput.value = profile.phone || "";
    renderProfileLanguage();

    if (image) {
        el.profileImage.src = image;
        el.profileImage.hidden = false;
        el.profileInitials.hidden = true;
        return;
    }

    el.profileImage.hidden = true;
    el.profileInitials.hidden = false;
}


function renderProfileLanguage() {
    const label =
        profileLanguage === "tl"
            ? "Tagalog"
            : "English";

    el.profileLanguageValue.textContent = label;

    document
        .querySelectorAll("[data-profile-language]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.profileLanguage === profileLanguage
            );
        });
}

function openLanguageSheet() {
    renderProfileLanguage();
    openSheet(
        el.profileLanguageBackdrop,
        el.profileLanguageSheet
    );
}

function closeLanguageSheet() {
    closeSheet(
        el.profileLanguageBackdrop,
        el.profileLanguageSheet
    );
}

function setProfileLanguage(language) {
    profileLanguage =
        language === "tl"
            ? "tl"
            : "en";

    localStorage.setItem(
        "kabalikat_language",
        profileLanguage
    );

    renderProfileLanguage();
    closeLanguageSheet();

    showToast(
        profileLanguage === "tl"
            ? "Naka-set na sa Tagalog."
            : "Language set to English."
    );
}

function openAccountSheet() {
    setEditMode(false);
    renderProfile();
    openSheet(
        el.profileSheetBackdrop,
        el.profileAccountSheet
    );
}

function closeAccountSheet() {
    setEditMode(false);
    closeSheet(
        el.profileSheetBackdrop,
        el.profileAccountSheet
    );
}

function setEditMode(value) {
    editing = value;

    [
        el.profileNameInput,
        el.profileEmailInput,
        el.profilePhoneInput
    ].forEach(input => {
        input.readOnly = !value;
    });

    el.profileEditSaveText.textContent = value
        ? "Save Changes"
        : "Edit Profile";

    el.profileEditSaveIcon.className = value
        ? "bi bi-check2-circle"
        : "bi bi-pencil";

    if (value) {
        setTimeout(() => {
            el.profileNameInput.focus();
        }, 80);
    }
}

async function saveAccountDetails() {
    const name = el.profileNameInput.value.trim();
    const email = el.profileEmailInput.value.trim().toLowerCase();
    const phone = el.profilePhoneInput.value.trim();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Enter a valid name and email.");
        return;
    }

    try {
        profile = await KabalikatAuth.updateCurrentUser({
            name,
            email,
            phone
        });

        renderProfile();
        setEditMode(false);
        toast("Profile updated.");
    } catch (error) {
        toast(error.message || "Profile could not be updated.");
    }
}

function openVaultUnlock() {
    resetVaultUnlock();
    openSheet(
        el.vaultUnlockBackdrop,
        el.vaultUnlockSheet
    );

    setTimeout(() => {
        el.vaultPasswordInput.focus();
    }, 250);
}

function closeVaultUnlock() {
    closeSheet(
        el.vaultUnlockBackdrop,
        el.vaultUnlockSheet
    );
}

function resetVaultUnlock() {
    el.vaultPasswordInput.value = "";
    el.vaultPasswordInput.type = "password";
    clearVaultError();
}

function clearVaultError() {
    el.vaultPasswordError.textContent = "";
    el.vaultPasswordInputBox.style.borderColor = "";
}

async function verifyVaultAccess() {
    const password = el.vaultPasswordInput.value;

    if (!password) {
        el.vaultPasswordError.textContent =
            "Enter your account password.";
        return;
    }

    el.unlockVaultButton.disabled = true;
    el.unlockVaultButton.innerHTML =
        '<i class="bi bi-arrow-repeat"></i> Verifying...';

    try {
        const valid = await KabalikatAuth.verifyCurrentPassword(
            password
        );

        if (!valid) {
            el.vaultPasswordError.textContent =
                "Incorrect account password.";
            return;
        }

        const now = Date.now();

        sessionStorage.setItem(
            VAULT_TICKET_KEY,
            JSON.stringify({
                userId: profile.id,
                familyCode: profile.familyCode,
                issuedAt: now,
                expiresAt: now + VAULT_TICKET_DURATION
            })
        );

        go(routes.vault);
    } catch (error) {
        el.vaultPasswordError.textContent =
            "Password could not be verified.";
    } finally {
        el.unlockVaultButton.disabled = false;
        el.unlockVaultButton.innerHTML =
            '<i class="bi bi-unlock"></i> Unlock Vault';
    }
}

function openPasswordSheet() {
    resetPasswordForm();
    openSheet(
        el.changePasswordBackdrop,
        el.changePasswordSheet
    );
}

function closePasswordSheet() {
    closeSheet(
        el.changePasswordBackdrop,
        el.changePasswordSheet
    );
}

function resetPasswordForm() {
    [
        el.currentPasswordInput,
        el.newPasswordInput,
        el.confirmPasswordInput
    ].forEach(input => {
        input.value = "";
        input.type = "password";
    });

    el.changePasswordFormState.hidden = false;
    el.changePasswordSuccessState.hidden = true;

    validatePasswordForm();
}

function togglePassword(button) {
    const input = document.getElementById(
        button.dataset.passwordTarget
    );

    const show = input.type === "password";

    input.type = show ? "text" : "password";
    button.innerHTML = `
        <i class="bi bi-eye${show ? "" : "-slash"}"></i>
    `;
}

function passwordRules(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}

function validatePasswordForm() {
    const currentPassword = el.currentPasswordInput.value;
    const newPassword = el.newPasswordInput.value;
    const confirmedPassword = el.confirmPasswordInput.value;

    const rules = passwordRules(newPassword);
    const score = Object.values(rules).filter(Boolean).length;

    [
        [el.passwordRequirementLength, rules.length],
        [el.passwordRequirementUppercase, rules.uppercase],
        [el.passwordRequirementNumber, rules.number],
        [el.passwordRequirementSpecial, rules.special]
    ].forEach(([requirement, isValid]) => {
        requirement.classList.toggle("is-valid", isValid);

        const icon = requirement.querySelector("i");

        if (icon) {
            icon.className = isValid
                ? "bi bi-check-circle-fill"
                : "bi bi-circle";
        }
    });

    el.passwordStrengthBars.className = "profile-strength-bars";
    el.passwordStrengthText.className = "";

    if (newPassword) {
        const strengthLevel = Math.max(1, Math.min(score, 4));

        el.passwordStrengthBars.classList.add(
            `strength-${strengthLevel}`
        );

        el.passwordStrengthText.classList.add(
            `strength-${strengthLevel}`
        );
    }

    const strengthLabels = {
        0: "Too weak",
        1: "Too weak",
        2: "Weak",
        3: "Medium",
        4: "Strong"
    };

    el.passwordStrengthText.textContent =
        strengthLabels[score] || "Too weak";

    const passwordsMatch =
        Boolean(newPassword) &&
        confirmedPassword === newPassword;

    if (!confirmedPassword) {
        el.passwordMatchMessage.textContent = "";
        el.passwordMatchMessage.style.color = "";
    } else if (passwordsMatch) {
        el.passwordMatchMessage.textContent = "Passwords match.";
        el.passwordMatchMessage.style.color = "#5F8D6A";
    } else {
        el.passwordMatchMessage.textContent =
            "Passwords do not match.";
        el.passwordMatchMessage.style.color = "#D84D4D";
    }

    el.updatePasswordButton.disabled =
        !currentPassword ||
        score < 4 ||
        !passwordsMatch;
}

async function updatePassword() {
    try {
        await KabalikatAuth.updateCurrentPassword(
            el.currentPasswordInput.value,
            el.newPasswordInput.value
        );

        el.changePasswordFormState.hidden = true;
        el.changePasswordSuccessState.hidden = false;
    } catch (error) {
        toast(error.message || "Password could not be updated.");
    }
}

async function updatePicture(file) {
    if (!file) {
        return;
    }

    const acceptedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const maximumSize = 2 * 1024 * 1024;

    if (
        !acceptedTypes.includes(file.type) ||
        file.size > maximumSize
    ) {
        toast("Choose a JPG, PNG, or WebP below 2 MB.");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const mirror = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "{}"
        );

        mirror.profileImage = String(reader.result || "");

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(mirror)
        );

        renderProfile();
        toast("Profile picture updated.");
    };

    reader.readAsDataURL(file);
}

async function logout() {
    await KabalikatAuth.logout();
    go(routes.login);
}

async function deleteAccount() {
    await KabalikatAuth.deleteCurrentAccount();
    go(routes.login);
}

function openSheet(backdrop, sheet) {
    backdrop.hidden = false;
    sheet.hidden = false;

    requestAnimationFrame(() => {
        backdrop.classList.add("show");
        sheet.classList.add("show");
    });
}

function closeSheet(backdrop, sheet) {
    backdrop.classList.remove("show");
    sheet.classList.remove("show");

    setTimeout(() => {
        backdrop.hidden = true;
        sheet.hidden = true;
    }, 240);
}

function openDialog(backdrop, dialog) {
    backdrop.hidden = false;
    dialog.hidden = false;

    requestAnimationFrame(() => {
        backdrop.classList.add("show");
        dialog.classList.add("show");
    });
}

function closeDialog(backdrop, dialog) {
    backdrop.classList.remove("show");
    dialog.classList.remove("show");

    setTimeout(() => {
        backdrop.hidden = true;
        dialog.hidden = true;
    }, 220);
}

function initials(name) {
    const parts = String(name)
        .trim()
        .split(/\s+/);

    if (parts.length > 1) {
        return (
            parts[0][0] +
            parts.at(-1)[0]
        ).toUpperCase();
    }

    return parts[0]
        .slice(0, 2)
        .toUpperCase();
}

function go(route) {
    window.location.href = route;
}

function goSavings() {
    const url = new URL(
        routes.expenses,
        location.href
    );

    url.searchParams.set(
        "section",
        "budget-overview"
    );

    url.hash = "budget-overview";
    location.href = url.href;
}

function toast(message) {
    clearTimeout(toastTimer);

    el.profileToast.textContent = message;
    el.profileToast.classList.add("show");

    toastTimer = setTimeout(() => {
        el.profileToast.classList.remove("show");
    }, 2400);
}
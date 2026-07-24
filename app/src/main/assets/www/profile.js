const KABALIKAT_PROFILE_KEY = "kabalikat_profile_v1";

const defaultProfile = {
    name: "Elena Dela Cruz",
    email: "elena@email.com",
    phone: "0917 123 4567",
    role: "Head",
    familyCode: "KABA-4821",
    profileImage: ""
};

const profileRoutes = {
    home: "home.html",
    expenses: "expenses.html",
    scanner: "scanner.html",
    bills: "bills.html",
    secureVault: "secure-vault.html",
    login: "login.html"
};

let currentProfile = {
    ...defaultProfile
};

let profileToastTimer = null;
let isProfileEditing = false;

const profileElements = {};

document.addEventListener("DOMContentLoaded", () => {
    collectProfileElements();

    currentProfile = getSavedProfile();

    renderProfile();
    bindProfileActions();
    resetPasswordSheet();
});

/* =========================================================
   ELEMENTS
   ========================================================= */

function collectProfileElements() {
    profileElements.backButton =
        document.getElementById("profileBackButton");

    profileElements.pictureButton =
        document.getElementById("profilePictureButton");

    profileElements.pictureInput =
        document.getElementById("profilePictureInput");

    profileElements.profileImage =
        document.getElementById("profileImage");

    profileElements.profileInitials =
        document.getElementById("profileInitials");

    profileElements.displayName =
        document.getElementById("profileDisplayName");

    profileElements.roleChip =
        document.getElementById("profileRoleChip");

    profileElements.accountDetailsButton =
        document.getElementById("accountDetailsButton");

    profileElements.secureVaultButton =
        document.getElementById("secureVaultButton");

    profileElements.changePasswordButton =
        document.getElementById("changePasswordButton");

    profileElements.logoutRowButton =
        document.getElementById("profileLogoutRowButton");

    profileElements.deleteAccountButton =
        document.getElementById("deleteAccountButton");

    /* Account Details */

    profileElements.sheetBackdrop =
        document.getElementById("profileSheetBackdrop");

    profileElements.accountSheet =
        document.getElementById("profileAccountSheet");

    profileElements.closeAccountSheet =
        document.getElementById("closeAccountSheet");

    profileElements.nameInput =
        document.getElementById("profileNameInput");

    profileElements.emailInput =
        document.getElementById("profileEmailInput");

    profileElements.phoneInput =
        document.getElementById("profilePhoneInput");

    profileElements.editSaveButton =
        document.getElementById("profileEditSaveButton");

    profileElements.editSaveIcon =
        document.getElementById("profileEditSaveIcon");

    profileElements.editSaveText =
        document.getElementById("profileEditSaveText");

    /* Change Password */

    profileElements.changePasswordBackdrop =
        document.getElementById("changePasswordBackdrop");

    profileElements.changePasswordSheet =
        document.getElementById("changePasswordSheet");

    profileElements.closeChangePasswordSheet =
        document.getElementById("closeChangePasswordSheet");

    profileElements.changePasswordFormState =
        document.getElementById("changePasswordFormState");

    profileElements.changePasswordSuccessState =
        document.getElementById("changePasswordSuccessState");

    profileElements.closePasswordSuccess =
        document.getElementById("closePasswordSuccess");

    profileElements.passwordSuccessDoneButton =
        document.getElementById("passwordSuccessDoneButton");

    profileElements.currentPasswordInput =
        document.getElementById("currentPasswordInput");

    profileElements.newPasswordInput =
        document.getElementById("newPasswordInput");

    profileElements.confirmPasswordInput =
        document.getElementById("confirmPasswordInput");

    profileElements.passwordStrengthBars =
        document.getElementById("passwordStrengthBars");

    profileElements.passwordStrengthText =
        document.getElementById("passwordStrengthText");

    profileElements.passwordMatchMessage =
        document.getElementById("passwordMatchMessage");

    profileElements.passwordRequirementLength =
        document.getElementById("passwordRequirementLength");

    profileElements.passwordRequirementUppercase =
        document.getElementById("passwordRequirementUppercase");

    profileElements.passwordRequirementNumber =
        document.getElementById("passwordRequirementNumber");

    profileElements.passwordRequirementSpecial =
        document.getElementById("passwordRequirementSpecial");

    profileElements.updatePasswordButton =
        document.getElementById("updatePasswordButton");

    profileElements.passwordToggleButtons =
        document.querySelectorAll(".profile-password-toggle");

    /* Logout */

    profileElements.logoutBackdrop =
        document.getElementById("profileLogoutBackdrop");

    profileElements.logoutDialog =
        document.getElementById("profileLogoutDialog");

    profileElements.cancelLogoutButton =
        document.getElementById("cancelLogoutButton");

    profileElements.confirmLogoutButton =
        document.getElementById("confirmLogoutButton");

    /* Delete */

    profileElements.deleteBackdrop =
        document.getElementById("profileDeleteBackdrop");

    profileElements.deleteDialog =
        document.getElementById("profileDeleteDialog");

    profileElements.cancelDeleteButton =
        document.getElementById("cancelDeleteButton");

    profileElements.confirmDeleteButton =
        document.getElementById("confirmDeleteButton");

    /* Navigation */

    profileElements.navHome =
        document.getElementById("profileNavHome");

    profileElements.navExpenses =
        document.getElementById("profileNavExpenses");

    profileElements.navScan =
        document.getElementById("profileNavScan");

    profileElements.navBills =
        document.getElementById("profileNavBills");

    profileElements.navSavings =
        document.getElementById("profileNavSavings");

    profileElements.toast =
        document.getElementById("profileToast");
}

/* =========================================================
   STORAGE
   ========================================================= */

function getSavedProfile() {
    try {
        const savedProfile =
            localStorage.getItem(KABALIKAT_PROFILE_KEY);

        if (!savedProfile) {
            localStorage.setItem(
                KABALIKAT_PROFILE_KEY,
                JSON.stringify(defaultProfile)
            );

            return {
                ...defaultProfile
            };
        }

        return {
            ...defaultProfile,
            ...JSON.parse(savedProfile)
        };
    } catch (error) {
        console.error("Unable to load profile:", error);

        return {
            ...defaultProfile
        };
    }
}

function saveCurrentProfile() {
    try {
        localStorage.setItem(
            KABALIKAT_PROFILE_KEY,
            JSON.stringify(currentProfile)
        );

        return true;
    } catch (error) {
        console.error("Unable to save profile:", error);

        showProfileToast(
            "The profile could not be saved on this device."
        );

        return false;
    }
}

/* =========================================================
   PROFILE RENDERING
   ========================================================= */

function renderProfile() {
    const name = String(
        currentProfile.name || defaultProfile.name
    ).trim();

    profileElements.displayName.textContent = name;

    profileElements.roleChip.textContent =
        currentProfile.role || "Member";

    profileElements.profileInitials.textContent =
        getInitials(name);

    profileElements.nameInput.value = name;

    profileElements.emailInput.value =
        currentProfile.email || "";

    profileElements.phoneInput.value =
        currentProfile.phone || "";

    if (currentProfile.profileImage) {
        profileElements.profileImage.src =
            currentProfile.profileImage;

        profileElements.profileImage.hidden = false;
        profileElements.profileInitials.hidden = true;
    } else {
        profileElements.profileImage.removeAttribute("src");
        profileElements.profileImage.hidden = true;
        profileElements.profileInitials.hidden = false;
    }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function bindProfileActions() {
    profileElements.backButton.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        navigateTo(profileRoutes.home);
    });

    profileElements.pictureButton.addEventListener(
        "click",
        () => {
            profileElements.pictureInput.click();
        }
    );

    profileElements.pictureInput.addEventListener(
        "change",
        () => {
            const selectedFile =
                profileElements.pictureInput.files?.[0];

            updateProfilePicture(selectedFile);

            profileElements.pictureInput.value = "";
        }
    );

    profileElements.accountDetailsButton.addEventListener(
        "click",
        openAccountSheet
    );

    profileElements.secureVaultButton.addEventListener(
        "click",
        () => navigateTo(profileRoutes.secureVault)
    );

    profileElements.changePasswordButton.addEventListener(
        "click",
        openChangePasswordSheet
    );

    profileElements.logoutRowButton.addEventListener(
        "click",
        () => {
            openDialog(
                profileElements.logoutBackdrop,
                profileElements.logoutDialog
            );
        }
    );

    profileElements.deleteAccountButton.addEventListener(
        "click",
        () => {
            openDialog(
                profileElements.deleteBackdrop,
                profileElements.deleteDialog
            );
        }
    );

    /* Account Details */

    profileElements.closeAccountSheet.addEventListener(
        "click",
        closeAccountSheet
    );

    profileElements.sheetBackdrop.addEventListener(
        "click",
        closeAccountSheet
    );

    profileElements.editSaveButton.addEventListener(
        "click",
        handleProfileEditSave
    );

    [
        profileElements.nameInput,
        profileElements.emailInput,
        profileElements.phoneInput
    ].forEach(input => {
        input.addEventListener("keydown", event => {
            if (
                event.key === "Enter" &&
                isProfileEditing
            ) {
                event.preventDefault();
                updateAccountDetails();
            }
        });
    });

    /* Change Password */

    profileElements.closeChangePasswordSheet.addEventListener(
        "click",
        closeChangePasswordSheet
    );

    profileElements.closePasswordSuccess.addEventListener(
        "click",
        closeChangePasswordSheet
    );

    profileElements.passwordSuccessDoneButton.addEventListener(
        "click",
        closeChangePasswordSheet
    );

    profileElements.changePasswordBackdrop.addEventListener(
        "click",
        closeChangePasswordSheet
    );

    [
        profileElements.currentPasswordInput,
        profileElements.newPasswordInput,
        profileElements.confirmPasswordInput
    ].forEach(input => {
        input.addEventListener(
            "input",
            updatePasswordValidation
        );

        input.addEventListener("keydown", event => {
            if (
                event.key === "Enter" &&
                !profileElements.updatePasswordButton.disabled
            ) {
                event.preventDefault();
                submitPasswordChange();
            }
        });
    });

    profileElements.passwordToggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            togglePasswordVisibility(button);
        });
    });

    profileElements.updatePasswordButton.addEventListener(
        "click",
        submitPasswordChange
    );

    /* Logout */

    profileElements.cancelLogoutButton.addEventListener(
        "click",
        () => {
            closeDialog(
                profileElements.logoutBackdrop,
                profileElements.logoutDialog
            );
        }
    );

    profileElements.logoutBackdrop.addEventListener(
        "click",
        () => {
            closeDialog(
                profileElements.logoutBackdrop,
                profileElements.logoutDialog
            );
        }
    );

    profileElements.confirmLogoutButton.addEventListener(
        "click",
        performLogout
    );

    /* Delete */

    profileElements.cancelDeleteButton.addEventListener(
        "click",
        () => {
            closeDialog(
                profileElements.deleteBackdrop,
                profileElements.deleteDialog
            );
        }
    );

    profileElements.deleteBackdrop.addEventListener(
        "click",
        () => {
            closeDialog(
                profileElements.deleteBackdrop,
                profileElements.deleteDialog
            );
        }
    );

    profileElements.confirmDeleteButton.addEventListener(
        "click",
        performDeleteAccount
    );

    /* Navigation */

    profileElements.navHome.addEventListener(
        "click",
        () => navigateTo(profileRoutes.home)
    );

    profileElements.navExpenses.addEventListener(
        "click",
        () => navigateTo(profileRoutes.expenses)
    );

    profileElements.navScan.addEventListener(
        "click",
        () => navigateTo(profileRoutes.scanner)
    );

    profileElements.navBills.addEventListener(
        "click",
        () => navigateTo(profileRoutes.bills)
    );

    profileElements.navSavings.addEventListener(
        "click",
        goToSavings
    );

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") {
            return;
        }

        if (!profileElements.accountSheet.hidden) {
            closeAccountSheet();
        }

        if (!profileElements.changePasswordSheet.hidden) {
            closeChangePasswordSheet();
        }

        if (!profileElements.logoutDialog.hidden) {
            closeDialog(
                profileElements.logoutBackdrop,
                profileElements.logoutDialog
            );
        }

        if (!profileElements.deleteDialog.hidden) {
            closeDialog(
                profileElements.deleteBackdrop,
                profileElements.deleteDialog
            );
        }
    });
}

/* =========================================================
   ACCOUNT DETAILS
   ========================================================= */

function openAccountSheet() {
    resetProfileForm();
    setProfileEditMode(false);

    profileElements.sheetBackdrop.hidden = false;
    profileElements.accountSheet.hidden = false;

    requestAnimationFrame(() => {
        profileElements.sheetBackdrop.classList.add("show");
        profileElements.accountSheet.classList.add("show");
    });
}

function closeAccountSheet() {
    resetProfileForm();
    setProfileEditMode(false);

    profileElements.sheetBackdrop.classList.remove("show");
    profileElements.accountSheet.classList.remove("show");

    window.setTimeout(() => {
        profileElements.sheetBackdrop.hidden = true;
        profileElements.accountSheet.hidden = true;
    }, 240);
}

function resetProfileForm() {
    profileElements.nameInput.value =
        currentProfile.name || "";

    profileElements.emailInput.value =
        currentProfile.email || "";

    profileElements.phoneInput.value =
        currentProfile.phone || "";
}

function setProfileEditMode(editing) {
    isProfileEditing = editing;

    profileElements.accountSheet.classList.toggle(
        "is-editing",
        editing
    );

    const inputs = [
        profileElements.nameInput,
        profileElements.emailInput,
        profileElements.phoneInput
    ];

    inputs.forEach(input => {
        input.readOnly = !editing;

        input.setAttribute(
            "aria-readonly",
            String(!editing)
        );
    });

    if (editing) {
        profileElements.editSaveText.textContent =
            "Save Changes";

        profileElements.editSaveIcon.className =
            "bi bi-check2-circle";

        window.setTimeout(() => {
            profileElements.nameInput.focus();

            const endPosition =
                profileElements.nameInput.value.length;

            profileElements.nameInput.setSelectionRange(
                endPosition,
                endPosition
            );
        }, 50);

        return;
    }

    profileElements.editSaveText.textContent =
        "Edit Profile";

    profileElements.editSaveIcon.className =
        "bi bi-pencil";
}

function handleProfileEditSave() {
    if (!isProfileEditing) {
        setProfileEditMode(true);
        return;
    }

    updateAccountDetails();
}

function updateAccountDetails() {
    const name =
        profileElements.nameInput.value.trim();

    const email =
        profileElements.emailInput.value.trim();

    const phone =
        profileElements.phoneInput.value.trim();

    if (!name) {
        showProfileToast(
            "Please enter your full name."
        );

        profileElements.nameInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showProfileToast(
            "Please enter a valid email address."
        );

        profileElements.emailInput.focus();
        return;
    }

    if (!phone) {
        showProfileToast(
            "Please enter your mobile number."
        );

        profileElements.phoneInput.focus();
        return;
    }

    const previousProfile = {
        ...currentProfile
    };

    currentProfile = {
        ...currentProfile,
        name,
        email,
        phone
    };

    const saved = saveCurrentProfile();

    if (!saved) {
        currentProfile = previousProfile;
        return;
    }

    renderProfile();
    setProfileEditMode(false);

    showProfileToast(
        "Profile updated successfully."
    );
}

/* =========================================================
   CHANGE PASSWORD
   ========================================================= */

function openChangePasswordSheet() {
    resetPasswordSheet();

    profileElements.changePasswordBackdrop.hidden = false;
    profileElements.changePasswordSheet.hidden = false;

    requestAnimationFrame(() => {
        profileElements.changePasswordBackdrop.classList.add("show");
        profileElements.changePasswordSheet.classList.add("show");
    });
}

function closeChangePasswordSheet() {
    profileElements.changePasswordBackdrop.classList.remove("show");
    profileElements.changePasswordSheet.classList.remove("show");

    window.setTimeout(() => {
        profileElements.changePasswordBackdrop.hidden = true;
        profileElements.changePasswordSheet.hidden = true;

        resetPasswordSheet();
    }, 240);
}

function resetPasswordSheet() {
    profileElements.currentPasswordInput.value = "";
    profileElements.newPasswordInput.value = "";
    profileElements.confirmPasswordInput.value = "";

    profileElements.changePasswordFormState.hidden = false;
    profileElements.changePasswordSuccessState.hidden = true;

    [
        profileElements.currentPasswordInput,
        profileElements.newPasswordInput,
        profileElements.confirmPasswordInput
    ].forEach(input => {
        input.type = "password";
    });

    profileElements.passwordToggleButtons.forEach(button => {
        const icon = button.querySelector("i");

        if (icon) {
            icon.className = "bi bi-eye-slash";
        }

        button.setAttribute(
            "aria-label",
            "Show password"
        );
    });

    updatePasswordValidation();
}

function togglePasswordVisibility(button) {
    const targetId =
        button.dataset.passwordTarget;

    const input =
        document.getElementById(targetId);

    const icon =
        button.querySelector("i");

    if (!input || !icon) {
        return;
    }

    const willShow =
        input.type === "password";

    input.type =
        willShow ? "text" : "password";

    icon.className =
        willShow
            ? "bi bi-eye"
            : "bi bi-eye-slash";

    button.setAttribute(
        "aria-label",
        willShow
            ? "Hide password"
            : "Show password"
    );
}

function getPasswordRules(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}

function updatePasswordValidation() {
    const currentPassword =
        profileElements.currentPasswordInput.value;

    const newPassword =
        profileElements.newPasswordInput.value;

    const confirmedPassword =
        profileElements.confirmPasswordInput.value;

    const rules =
        getPasswordRules(newPassword);

    const score =
        Object.values(rules).filter(Boolean).length;

    renderPasswordRequirement(
        profileElements.passwordRequirementLength,
        rules.length
    );

    renderPasswordRequirement(
        profileElements.passwordRequirementUppercase,
        rules.uppercase
    );

    renderPasswordRequirement(
        profileElements.passwordRequirementNumber,
        rules.number
    );

    renderPasswordRequirement(
        profileElements.passwordRequirementSpecial,
        rules.special
    );

    renderPasswordStrength(
        score,
        newPassword.length
    );

    const passwordsMatch =
        newPassword.length > 0 &&
        confirmedPassword === newPassword;

    if (!confirmedPassword) {
        profileElements.passwordMatchMessage.textContent = "";

        profileElements.passwordMatchMessage.classList.remove(
            "is-matching"
        );
    } else if (passwordsMatch) {
        profileElements.passwordMatchMessage.textContent =
            "Passwords match.";

        profileElements.passwordMatchMessage.classList.add(
            "is-matching"
        );
    } else {
        profileElements.passwordMatchMessage.textContent =
            "Passwords do not match.";

        profileElements.passwordMatchMessage.classList.remove(
            "is-matching"
        );
    }

    profileElements.updatePasswordButton.disabled =
        !currentPassword ||
        score < 4 ||
        !passwordsMatch;
}

function renderPasswordRequirement(element, valid) {
    if (!element) {
        return;
    }

    element.classList.toggle(
        "is-valid",
        valid
    );

    const icon =
        element.querySelector("i");

    if (icon) {
        icon.className =
            valid
                ? "bi bi-check-circle-fill"
                : "bi bi-circle";
    }
}

function renderPasswordStrength(score, hasPassword) {
    profileElements.passwordStrengthBars.className =
        "profile-strength-bars";

    profileElements.passwordStrengthText.className = "";

    if (!hasPassword) {
        profileElements.passwordStrengthText.textContent =
            "Too weak";

        return;
    }

    const strengthLevel =
        Math.max(1, Math.min(score, 4));

    profileElements.passwordStrengthBars.classList.add(
        `strength-${strengthLevel}`
    );

    profileElements.passwordStrengthText.classList.add(
        `strength-${strengthLevel}`
    );

    const labels = {
        1: "Too weak",
        2: "Weak",
        3: "Medium",
        4: "Strong"
    };

    profileElements.passwordStrengthText.textContent =
        labels[strengthLevel];
}

function submitPasswordChange() {
    if (profileElements.updatePasswordButton.disabled) {
        return;
    }

    /*
     * Connect this to the authentication backend later.
     * Do not store passwords in localStorage.
     */

    showPasswordSuccess();
}

function showPasswordSuccess() {
    profileElements.changePasswordFormState.hidden = true;
    profileElements.changePasswordSuccessState.hidden = false;

    profileElements.changePasswordSheet.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   PROFILE PICTURE
   ========================================================= */

function updateProfilePicture(file) {
    if (!file) {
        return;
    }

    const acceptedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!acceptedTypes.includes(file.type)) {
        showProfileToast(
            "Choose a JPG, PNG or WebP image."
        );

        return;
    }

    const maximumSize =
        2 * 1024 * 1024;

    if (file.size > maximumSize) {
        showProfileToast(
            "Profile picture must be below 2 MB."
        );

        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        const previousImage =
            currentProfile.profileImage;

        currentProfile.profileImage =
            String(reader.result || "");

        const saved = saveCurrentProfile();

        if (!saved) {
            currentProfile.profileImage =
                previousImage;

            return;
        }

        renderProfile();

        showProfileToast(
            "Profile picture updated."
        );
    });

    reader.addEventListener("error", () => {
        showProfileToast(
            "The selected image could not be opened."
        );
    });

    reader.readAsDataURL(file);
}

/* =========================================================
   DIALOGS
   ========================================================= */

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

    window.setTimeout(() => {
        backdrop.hidden = true;
        dialog.hidden = true;
    }, 220);
}

/* =========================================================
   LOGOUT
   ========================================================= */

function performLogout() {
    closeDialog(
        profileElements.logoutBackdrop,
        profileElements.logoutDialog
    );

    /*
     * Replace this redirect with the logout method from your
     * authentication service once authentication is connected.
     */

    navigateTo(profileRoutes.login);
}

/* =========================================================
   DELETE ACCOUNT
   ========================================================= */

function performDeleteAccount() {
    /*
     * Prototype behavior only.
     * Connect this to the authentication and database backend.
     */

    localStorage.removeItem(
        KABALIKAT_PROFILE_KEY
    );

    closeDialog(
        profileElements.deleteBackdrop,
        profileElements.deleteDialog
    );

    navigateTo(profileRoutes.login);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function goToSavings() {
    const url = new URL(
        profileRoutes.expenses,
        window.location.href
    );

    url.searchParams.set(
        "section",
        "budget-overview"
    );

    url.hash = "budget-overview";

    window.location.href = url.href;
}

function navigateTo(route) {
    if (!route) {
        return;
    }

    window.location.href = route;
}

/* =========================================================
   HELPERS
   ========================================================= */

function getInitials(name) {
    const words = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "KB";
    }

    if (words.length === 1) {
        return words[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
}

function showProfileToast(message) {
    window.clearTimeout(
        profileToastTimer
    );

    profileElements.toast.textContent =
        message;

    profileElements.toast.classList.add(
        "show"
    );

    profileToastTimer = window.setTimeout(
        () => {
            profileElements.toast.classList.remove(
                "show"
            );
        },
        2400
    );
}
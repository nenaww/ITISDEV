const LOGIN_DB_NAME = "kabalikat_auth_language_db";
const LOGIN_DB_VERSION = 1;

let loginDb = null;

const backToWelcome = document.getElementById("backToWelcome");
const languageToggle = document.getElementById("languageToggle");
const languageText = document.getElementById("languageText");
const goRegisterBtn = document.getElementById("goRegisterBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const loginForm = document.getElementById("loginForm");

let currentLanguage = localStorage.getItem("kabalikat_language") || "en";

const translations = {
    en: {
        lang: "English",
        title: "Login here",
        subtitle: "Welcome back. Continue managing your family budget.",
        email: "Email",
        password: "Password",
        emailPlaceholder: "example@email.com",
        passwordPlaceholder: "Enter password",
        signIn: "Sign in",
        signupLine: "Don’t have an account?",
        signupButton: "Signup",
        emptyFields: "Please enter your email and password.",
        invalidLogin: "Incorrect email or password.",
        loginSuccess: "Login successful.",
        sampleReady: "Sample head account ready: elena@test.com / 123456"
    },
    tl: {
        lang: "Tagalog",
        title: "Mag-login dito",
        subtitle: "Maligayang pagbabalik. Ipagpatuloy ang pag-manage ng budget ng pamilya.",
        email: "Email",
        password: "Password",
        emailPlaceholder: "halimbawa@email.com",
        passwordPlaceholder: "Ilagay ang password",
        signIn: "Mag-login",
        signupLine: "Wala ka pang account?",
        signupButton: "Mag-sign up",
        emptyFields: "Ilagay ang email at password.",
        invalidLogin: "Mali ang email o password.",
        loginSuccess: "Login successful.",
        sampleReady: "Sample head account ready: elena@test.com / 123456"
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    setupLoginAnimation();
    setupLoginActions();
    applyLanguage(currentLanguage);

    try {
        await openLoginDatabase();
        await seedSampleHeadAccount();

        setTimeout(() => {
            showLoginToast(translations[currentLanguage].sampleReady);
        }, 700);
    } catch (error) {
        console.error(error);
        showLoginToast("Sample data could not be refreshed, but login is still active.");
    }
});

function setupLoginActions() {
    if (languageToggle) {
        languageToggle.addEventListener("click", () => {
            currentLanguage = currentLanguage === "en" ? "tl" : "en";
            localStorage.setItem("kabalikat_language", currentLanguage);
            applyLanguage(currentLanguage);
        });
    }

    if (backToWelcome) {
        backToWelcome.addEventListener("click", () => {
            document.body.classList.add("page-leave");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 140);
        });
    }

    if (goRegisterBtn) {
        goRegisterBtn.addEventListener("click", () => {
            window.location.href = "register.html";
        });
    }

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.innerHTML = isPassword
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", loginSampleUser);
    }
}

function setupLoginAnimation() {
    const warmStart = sessionStorage.getItem("loginWarmStart");

    if (warmStart === "true") {
        document.body.classList.add("login-warm-start");
        document.body.classList.remove("login-preparing");

        setTimeout(() => {
            document.body.classList.add("login-intro-finished");
            sessionStorage.removeItem("loginWarmStart");
        }, 1150);
    } else {
        document.body.classList.remove("login-preparing");
        document.body.classList.add("login-intro-finished");
    }
}

function applyLanguage(lang) {
    const t = translations[lang] || translations.en;

    if (languageText) {
        languageText.textContent = t.lang;
    }

    setText("loginTitle", t.title);
    setText("loginSubtitle", t.subtitle);
    setText("emailLabel", t.email);
    setText("passwordLabel", t.password);
    setText("signInButton", t.signIn);

    const emailInput = document.getElementById("emailInput");
    const passwordInputField = document.getElementById("passwordInput");

    if (emailInput) {
        emailInput.placeholder = t.emailPlaceholder;
    }

    if (passwordInputField) {
        passwordInputField.placeholder = t.passwordPlaceholder;
    }

    const signupLine = document.getElementById("signupLine");

    if (signupLine) {
        signupLine.innerHTML = `${t.signupLine} <button id="goRegisterBtn" type="button">${t.signupButton}</button>`;

        const newRegisterButton = document.getElementById("goRegisterBtn");
        if (newRegisterButton) {
            newRegisterButton.addEventListener("click", () => {
                window.location.href = "register.html";
            });
        }
    }
}

async function loginSampleUser(event) {
    event.preventDefault();

    const emailInput = document.getElementById("emailInput");
    const passwordInputField = document.getElementById("passwordInput");

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInputField ? passwordInputField.value.trim() : "";

    if (!email || !password) {
        showLoginToast(translations[currentLanguage].emptyFields);
        return;
    }

    const user = await getByIndex("users", "email", email);

    if (!user || user.password !== password) {
        showLoginToast(translations[currentLanguage].invalidLogin);
        return;
    }

    await putRecord("sessions", {
        id: "current",
        userId: user.id,
        loggedInAt: new Date().toISOString()
    });

    localStorage.setItem("kabalikat_profile_v1", JSON.stringify({
        id: user.id,
        name: user.name || "Family Member",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Family Member",
        familyCode: user.familyCode || "",
        profileImage: ""
    }));

    showLoginToast(translations[currentLanguage].loginSuccess);

    setTimeout(() => {
        window.location.href = "home.html";
    }, 650);
}

async function seedSampleHeadAccount() {
    const sampleFamily = {
        familyCode: "KABA-4821",
        familyName: "Dela Cruz Family",
        monthlyBudget: 25000,
        createdBy: "sample-head",
        createdAt: new Date().toISOString()
    };

    const sampleHead = {
        id: "sample-head",
        name: "Elena Dela Cruz",
        email: "elena@test.com",
        phone: "0917 123 4567",
        password: "123456",
        role: "Household Head",
        familyCode: "KABA-4821",
        createdAt: new Date().toISOString()
    };

    const sampleMemberOne = {
        id: "sample-member-1",
        name: "Ana Dela Cruz",
        email: "ana@test.com",
        phone: "0918 234 5678",
        password: "123456",
        role: "Family Member",
        familyCode: "KABA-4821",
        createdAt: new Date().toISOString()
    };

    const sampleMemberTwo = {
        id: "sample-member-2",
        name: "Marco Dela Cruz",
        email: "marco@test.com",
        phone: "0919 345 6789",
        password: "123456",
        role: "Family Member",
        familyCode: "KABA-4821",
        createdAt: new Date().toISOString()
    };

    await putRecord("families", sampleFamily);

    await upsertUserByEmail(sampleHead);
    await upsertUserByEmail(sampleMemberOne);
    await upsertUserByEmail(sampleMemberTwo);
}

async function upsertUserByEmail(user) {
    const existingUser = await getByIndex("users", "email", user.email);

    if (existingUser) {
        /* Preserve the member's changed password and profile data. */
        await putRecord("users", {
            ...user,
            ...existingUser,
            id: existingUser.id,
            email: existingUser.email,
            phone: existingUser.phone || user.phone || "",
            password: existingUser.password
        });
        return;
    }

    await putRecord("users", user);
}

function openLoginDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(LOGIN_DB_NAME, LOGIN_DB_VERSION);

        request.onupgradeneeded = event => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains("users")) {
                const users = database.createObjectStore("users", { keyPath: "id" });
                users.createIndex("email", "email", { unique: true });
                users.createIndex("familyCode", "familyCode", { unique: false });
            }

            if (!database.objectStoreNames.contains("families")) {
                database.createObjectStore("families", { keyPath: "familyCode" });
            }

            if (!database.objectStoreNames.contains("sessions")) {
                database.createObjectStore("sessions", { keyPath: "id" });
            }
        };

        request.onsuccess = event => {
            loginDb = event.target.result;
            resolve(loginDb);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function store(name, mode = "readonly") {
    return loginDb.transaction(name, mode).objectStore(name);
}

function getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const request = store(storeName).index(indexName).get(value);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function putRecord(storeName, record) {
    return new Promise((resolve, reject) => {
        const request = store(storeName, "readwrite").put(record);

        request.onsuccess = () => {
            resolve(record);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function showLoginToast(message) {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
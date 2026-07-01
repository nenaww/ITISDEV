const backToWelcome = document.getElementById("backToWelcome");
const languageToggle = document.getElementById("languageToggle");
const languageText = document.getElementById("languageText");
const goRegisterBtn = document.getElementById("goRegisterBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const loginForm = document.getElementById("loginForm");

let currentLanguage = "en";

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
        signupButton: "Signup"
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
        signupButton: "Mag-sign up"
    }
};

function applyLanguage(lang) {
    currentLanguage = lang;

    const t = translations[lang];

    languageText.textContent = t.lang;
    document.getElementById("loginTitle").textContent = t.title;
    document.getElementById("loginSubtitle").textContent = t.subtitle;
    document.getElementById("emailLabel").textContent = t.email;
    document.getElementById("passwordLabel").textContent = t.password;
    document.getElementById("emailInput").placeholder = t.emailPlaceholder;
    document.getElementById("passwordInput").placeholder = t.passwordPlaceholder;
    document.getElementById("signInButton").textContent = t.signIn;

    const signupLine = document.getElementById("signupLine");
    signupLine.innerHTML = `${t.signupLine} <button id="goRegisterBtn" type="button">${t.signupButton}</button>`;

    document
        .getElementById("goRegisterBtn")
        .addEventListener("click", () => {
            window.location.href = "register.html";
        });
}

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        const nextLang = currentLanguage === "en" ? "tl" : "en";
        applyLanguage(nextLang);
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
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // prototype only
        alert("Prototype login successful.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
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

    applyLanguage("en");
});
const DB_NAME = "kabalikat_auth_language_db";
const DB_VERSION = 1;

let db = null;
let selectedRole = "head";
let currentLanguage = localStorage.getItem("kabalikat_language") || "en";

const carouselItems = [
    {
        image: "images/pic1.png",
        enTitle: "Welcome to KABALIKAT!",
        enSubtitle: "A simple family budgeting companion for shared household expenses.",
        tlTitle: "Welcome sa KABALIKAT!",
        tlSubtitle: "Simpleng katuwang sa pag-aayos ng budget ng pamilya."
    },
    {
        image: "images/pic2.png",
        enTitle: "Plan your household budget",
        enSubtitle: "Set a monthly budget and track family spending with less confusion.",
        tlTitle: "Planuhin ang budget ng bahay",
        tlSubtitle: "Magtakda ng buwanang budget at sundan ang gastos ng pamilya."
    },
    {
        image: "images/pic3.png",
        enTitle: "Track expenses together",
        enSubtitle: "Let family members join using one shared family code.",
        tlTitle: "Sundan ang gastos together",
        tlSubtitle: "Pasalihin ang pamilya gamit ang iisang family code."
    }
];

const dictionary = {
    en: {
        language: "English",
        loginButtonText: "Log In",
        signupQuestion: "Don’t have an account?",
        signupLink: "Signup",

        loginTitle: "Login here",
        loginSubtitle: "Welcome back. Continue managing your family budget.",
        loginEmailLabel: "Email",
        loginPasswordLabel: "Password",
        signinButton: "Sign in",
        demoText: "Load Demo Family",
        noAccountText: "Don’t have an account?",
        createAccountText: "Signup",

        registerTitle: "Create Account",
        registerSubtitle: "Create or join a family budgeting space.",
        nameLabel: "Full Name",
        regEmailLabel: "Email",
        regPasswordLabel: "Password",
        confirmPasswordLabel: "Confirm Password",
        roleLabel: "Account Role",
        headRoleText: "Household Head",
        memberRoleText: "Family Member",
        familyNameLabel: "Family Name",
        budgetLabel: "Total Monthly Budget",
        familyCodeLabel: "Family Code",
        familyCodeHelper: "Ask the household head for the family code.",
        signupButton: "Sign up",
        alreadyAccountText: "Already have an account?",
        signinLinkText: "Sign in",

        summaryFamilyNameLabel: "Family Name",
        summaryFamilyCodeLabel: "Family Code",
        summaryBudgetLabel: "Monthly Budget",
        prototypeNote: "Login and registration are working. The main dashboard will be added next.",
        logoutButton: "Logout"
    },
    tl: {
        language: "Tagalog",
        loginButtonText: "Mag-login",
        signupQuestion: "Wala ka pang account?",
        signupLink: "Mag-sign up",

        loginTitle: "Mag-login dito",
        loginSubtitle: "Maligayang pagbabalik. Ipagpatuloy ang pag-aayos ng budget ng pamilya.",
        loginEmailLabel: "Email",
        loginPasswordLabel: "Password",
        signinButton: "Mag-login",
        demoText: "Gamitin ang Demo Family",
        noAccountText: "Wala ka pang account?",
        createAccountText: "Mag-sign up",

        registerTitle: "Gumawa ng Account",
        registerSubtitle: "Gumawa o sumali sa family budgeting space.",
        nameLabel: "Buong Pangalan",
        regEmailLabel: "Email",
        regPasswordLabel: "Password",
        confirmPasswordLabel: "Kumpirmahin ang Password",
        roleLabel: "Uri ng Account",
        headRoleText: "Household Head",
        memberRoleText: "Miyembro ng Pamilya",
        familyNameLabel: "Pangalan ng Pamilya",
        budgetLabel: "Kabuuang Buwanang Budget",
        familyCodeLabel: "Family Code",
        familyCodeHelper: "Hingin ang family code sa household head.",
        signupButton: "Mag-sign up",
        alreadyAccountText: "May account ka na?",
        signinLinkText: "Mag-login",

        summaryFamilyNameLabel: "Pangalan ng Pamilya",
        summaryFamilyCodeLabel: "Family Code",
        summaryBudgetLabel: "Buwanang Budget",
        prototypeNote: "Gumagana na ang login at registration. Susunod na ilalagay ang main dashboard.",
        logoutButton: "Mag-logout"
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await openDatabase();

    applyLanguage();

    const page = document.body.dataset.page;

    if (page === "welcome") {
        setupWelcomePage();
    }

    if (page === "login") {
        setupLoginPage();
    }

    if (page === "register") {
        setupRegisterPage();
    }
});

function goToPage(page, delay = 150) {
    document.body.classList.add("page-leave");

    setTimeout(() => {
        window.location.href = page;
    }, delay);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === "en" ? "tl" : "en";
    localStorage.setItem("kabalikat_language", currentLanguage);
    applyLanguage();

    if (document.body.dataset.page === "welcome") {
        setupWelcomePage();
    }
}

function applyLanguage() {
    const words = dictionary[currentLanguage];

    const languageLabel = document.getElementById("languageLabel");
    if (languageLabel) {
        languageLabel.textContent = currentLanguage === "en" ? "English" : "Tagalog";
    }

    Object.keys(words).forEach(id => {
        const element = document.getElementById(id);

        if (element && id !== "languageLabel") {
            element.textContent = words[id];
        }
    });
}

function setupWelcomePage() {
    let currentSlide = 0;

    const image = document.getElementById("carouselImage");
    const title = document.getElementById("welcomeTitle");
    const subtitle = document.getElementById("welcomeSubtitle");

    if (!image || !title || !subtitle) {
        return;
    }

    function showSlide(index) {
        const item = carouselItems[index];

        image.classList.remove("is-hidden");
        image.src = item.image;

        image.onerror = () => {
            image.classList.add("is-hidden");
        };

        title.textContent = currentLanguage === "en" ? item.enTitle : item.tlTitle;
        subtitle.textContent = currentLanguage === "en" ? item.enSubtitle : item.tlSubtitle;

        for (let i = 0; i < carouselItems.length; i++) {
            const dot = document.getElementById(`dot${i}`);
            if (dot) {
                dot.classList.toggle("active", i === index);
            }
        }
    }

    showSlide(currentSlide);

    if (window.kabalikatCarouselTimer) {
        clearInterval(window.kabalikatCarouselTimer);
    }

    window.kabalikatCarouselTimer = setInterval(() => {
        currentSlide = (currentSlide + 1) % carouselItems.length;
        showSlide(currentSlide);
    }, 2800);
}

function setupLoginPage() {
    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", loginUser);
    }
}

function setupRegisterPage() {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", registerUser);
    selectRole("head");
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.className = "bi bi-eye-slash";
    } else {
        input.type = "password";
        icon.className = "bi bi-eye";
    }
}

function selectRole(role) {
    selectedRole = role;

    const headRoleBtn = document.getElementById("headRoleBtn");
    const memberRoleBtn = document.getElementById("memberRoleBtn");
    const headFields = document.getElementById("headFields");
    const memberFields = document.getElementById("memberFields");

    if (!headRoleBtn || !memberRoleBtn || !headFields || !memberFields) {
        return;
    }

    headRoleBtn.classList.toggle("active", role === "head");
    memberRoleBtn.classList.toggle("active", role === "member");
    headFields.classList.toggle("active", role === "head");
    memberFields.classList.toggle("active", role === "member");
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

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
            db = event.target.result;
            resolve(db);
        };

        request.onerror = () => reject(request.error);
    });
}

function store(name, mode = "readonly") {
    return db.transaction(name, mode).objectStore(name);
}

function addRecord(storeName, record) {
    return new Promise((resolve, reject) => {
        const request = store(storeName, "readwrite").add(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

function putRecord(storeName, record) {
    return new Promise((resolve, reject) => {
        const request = store(storeName, "readwrite").put(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

function getRecord(storeName, key) {
    return new Promise((resolve, reject) => {
        const request = store(storeName).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

function getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const request = store(storeName).index(indexName).get(value);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const request = store(storeName, "readwrite").clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();
    const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

    if (!name || !email || !password || !confirmPassword) {
        showToast("Please complete all required fields.");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.");
        return;
    }

    const existingUser = await getByIndex("users", "email", email);

    if (existingUser) {
        showToast("Email already exists.");
        return;
    }

    if (selectedRole === "head") {
        await registerHead(name, email, password);
    } else {
        await registerMember(name, email, password);
    }
}

async function registerHead(name, email, password) {
    const familyName = document.getElementById("familyName").value.trim();
    const monthlyBudget = Number(document.getElementById("monthlyBudget").value.trim());

    if (!familyName || monthlyBudget <= 0) {
        showToast("Enter family name and valid budget.");
        return;
    }

    const userId = createId("user");
    const familyCode = await createUniqueFamilyCode();

    const family = {
        familyCode,
        familyName,
        monthlyBudget,
        createdBy: userId,
        createdAt: new Date().toISOString()
    };

    const user = {
        id: userId,
        name,
        email,
        password,
        role: "Household Head",
        familyCode,
        createdAt: new Date().toISOString()
    };

    await addRecord("families", family);
    await addRecord("users", user);

    showToast(`Registered successfully. Family code: ${familyCode}`);

    setTimeout(() => {
        goToPage("login.html");
    }, 900);
}

async function registerMember(name, email, password) {
    const familyCode = document.getElementById("joinFamilyCode").value.trim().toUpperCase();

    if (!familyCode) {
        showToast("Enter your family code.");
        return;
    }

    const family = await getRecord("families", familyCode);

    if (!family) {
        showToast("Family code not found.");
        return;
    }

    const userId = createId("user");

    const user = {
        id: userId,
        name,
        email,
        password,
        role: "Family Member",
        familyCode,
        createdAt: new Date().toISOString()
    };

    await addRecord("users", user);

    showToast("Registered successfully. Please log in.");

    setTimeout(() => {
        goToPage("login.html");
    }, 900);
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const user = await getByIndex("users", "email", email);

    if (!user || user.password !== password) {
        showToast("Incorrect email or password.");
        return;
    }

    await setCurrentUser(user.id);
    showToast("Login successful.");

    setTimeout(() => {
        goToPage("home.html");
    }, 650);
}

function warmLoginTransition() {
    const transition = document.getElementById("loginWarmTransition");

    sessionStorage.setItem("loginWarmStart", "true");

    if (!transition) {
        goToPage("login.html");
        return;
    }

    transition.classList.add("active");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 900);
}

async function setCurrentUser(userId) {
    await putRecord("sessions", {
        id: "current",
        userId,
        loggedInAt: new Date().toISOString()
    });
}

async function getCurrentUser() {
    const session = await getRecord("sessions", "current");

    if (!session) {
        return null;
    }

    return await getRecord("users", session.userId);
}

async function logoutUser() {
    await clearStore("sessions");
    showToast("Logged out.");

    setTimeout(() => {
        goToPage("index.html");
    }, 500);
}

async function loadDemoFamily() {
    const family = {
        familyCode: "KABA-4821",
        familyName: "Dela Cruz Family",
        monthlyBudget: 25000,
        createdBy: "user-demo-head",
        createdAt: new Date().toISOString()
    };

    const head = {
        id: "user-demo-head",
        name: "Elena",
        email: "elena@test.com",
        password: "123456",
        role: "Household Head",
        familyCode: "KABA-4821",
        createdAt: new Date().toISOString()
    };

    await putRecord("families", family);
    await putRecord("users", head);
    await setCurrentUser(head.id);

    showToast("Demo family loaded.");

    setTimeout(() => {
        goToPage("home.html");
    }, 650);
}

async function createUniqueFamilyCode() {
    let code;
    let exists = true;

    while (exists) {
        const digits = Math.floor(1000 + Math.random() * 9000);
        code = `KABA-${digits}`;
        exists = await getRecord("families", code);
    }

    return code;
}

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
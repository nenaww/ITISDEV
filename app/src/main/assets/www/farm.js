const KABALIKAT_PET_KEY = "kabalikat_pet_state_v1";

const accessoryGroups = {
    hat: [
        {
            id: "none",
            name: "No Hat",
            image: null
        },
        {
            id: "straw",
            name: "Straw Hat",
            image: "images/piggery/acc1.png"
        },
        {
            id: "beanie",
            name: "Pink Beanie",
            image: "images/piggery/acc6.png"
        }
    ],

    neck: [
        {
            id: "none",
            name: "No Neck Accessory",
            image: null
        },
        {
            id: "bowtie",
            name: "Black Bow Tie",
            image: "images/piggery/acc2.png"
        },
        {
            id: "scarf",
            name: "White Scarf",
            image: "images/piggery/acc3.png"
        }
    ],

    eyes: [
        {
            id: "none",
            name: "No Eyewear",
            image: null
        },
        {
            id: "glasses",
            name: "Blue Glasses",
            image: "images/piggery/acc4.png"
        },
        {
            id: "shades",
            name: "Black Shades",
            image: "images/piggery/acc5.png"
        }
    ]
};

const comboImageMap = {
    "none|none|none": "run1.png",
    "none|bowtie|none": "run2.png",
    "none|none|glasses": "run3.png",
    "none|none|shades": "run4.png",
    "straw|bowtie|none": "run5.png",
    "straw|none|glasses": "run6.png",
    "none|bowtie|shades": "run7.png",
    "beanie|scarf|glasses": "run8.png",
    "straw|none|none": "run9.png",
    "beanie|none|none": "run10.png",
    "none|scarf|none": "run11.png",
    "none|scarf|glasses": "run12.png",
    "none|scarf|shades": "run13.png",
    "straw|none|shades": "run14.png",
    "straw|scarf|none": "run15.png",
    "straw|scarf|shades": "run16.png",
    "beanie|bowtie|none": "run17.png",
    "beanie|none|shades": "run18.png",
    "none|bowtie|glasses": "run19.png",
    "straw|bowtie|glasses": "run20.png",
    "straw|bowtie|shades": "run21.png",
    "straw|scarf|glasses": "run22.png",
    "beanie|none|glasses": "run23.png",
    "beanie|bowtie|glasses": "run24.png",
    "beanie|bowtie|shades": "run25.png",
    "beanie|scarf|none": "run26.png",
    "beanie|scarf|shades": "run27.png"
};

const allAccessories = [
    {
        id: "straw",
        group: "hat",
        name: "Straw Hat",
        image: "images/piggery/acc1.png"
    },
    {
        id: "bowtie",
        group: "neck",
        name: "Black Bow Tie",
        image: "images/piggery/acc2.png"
    },
    {
        id: "scarf",
        group: "neck",
        name: "White Scarf",
        image: "images/piggery/acc3.png"
    },
    {
        id: "glasses",
        group: "eyes",
        name: "Blue Glasses",
        image: "images/piggery/acc4.png"
    },
    {
        id: "shades",
        group: "eyes",
        name: "Black Shades",
        image: "images/piggery/acc5.png"
    },
    {
        id: "beanie",
        group: "hat",
        name: "Pink Beanie",
        image: "images/piggery/acc6.png"
    }
];

const defaultPetState = {
    ownerName: "Elena",
    role: "Head",
    pigName: "Porky",
    level: 1,
    exp: 80,
    expMax: 500,
    streak: 3,
    mood: "Happy",
    accessories: {
        hat: "straw",
        neck: "none",
        eyes: "shades"
    }
};

const farmMembersBase = [
    {
        ownerName: "Elena",
        role: "Head",
        pigName: "Porky",
        level: 1,
        exp: 80,
        expMax: 500,
        streak: 3,
        mood: "Happy",
        accessories: {
            hat: "straw",
            neck: "none",
            eyes: "shades"
        }
    },
    {
        ownerName: "Ana",
        role: "Member",
        pigName: "Penny",
        level: 10,
        exp: 2710,
        expMax: 3000,
        streak: 18,
        mood: "Proud",
        accessories: {
            hat: "beanie",
            neck: "scarf",
            eyes: "glasses"
        }
    },
    {
        ownerName: "Marco",
        role: "Member",
        pigName: "Sally",
        level: 9,
        exp: 2480,
        expMax: 3000,
        streak: 15,
        mood: "Happy",
        accessories: {
            hat: "none",
            neck: "none",
            eyes: "shades"
        }
    },
    {
        ownerName: "Lolo Ben",
        role: "Member",
        pigName: "Budget",
        level: 7,
        exp: 1850,
        expMax: 2500,
        streak: 11,
        mood: "Sleepy",
        accessories: {
            hat: "none",
            neck: "bowtie",
            eyes: "shades"
        }
    },
    {
        ownerName: "Tita May",
        role: "Member",
        pigName: "Little",
        level: 5,
        exp: 1420,
        expMax: 2000,
        streak: 8,
        mood: "Worried",
        accessories: {
            hat: "straw",
            neck: "none",
            eyes: "glasses"
        }
    }
];

document.addEventListener("DOMContentLoaded", () => {
    seedPetIfMissing();
    bindPiggeryActions();
    renderPiggery();
});

function bindPiggeryActions() {
    const backButton = document.getElementById("farmBackButton");
    const openCustomizeButton = document.getElementById("openCustomizeButton");
    const closeCustomizeButton = document.getElementById("closeCustomizeButton");
    const saveCustomizeButton = document.getElementById("saveCustomizeButton");
    const customizeModal = document.getElementById("customizeModal");
    const pigNameInput = document.getElementById("pigNameInput");

    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "home.html";
        });
    }

    if (openCustomizeButton) {
        openCustomizeButton.addEventListener("click", openCustomizeModal);
    }

    if (closeCustomizeButton) {
        closeCustomizeButton.addEventListener("click", () => {
            customizeModal.classList.add("hidden");
        });
    }

    if (saveCustomizeButton) {
        saveCustomizeButton.addEventListener("click", saveCustomizeChanges);
    }

    if (customizeModal) {
        customizeModal.addEventListener("click", event => {
            if (event.target === customizeModal) {
                customizeModal.classList.add("hidden");
            }
        });
    }

    if (pigNameInput) {
        pigNameInput.addEventListener("input", () => {
            pigNameInput.value = sanitizePigName(pigNameInput.value);
        });
    }
}

function sanitizePigName(name) {
    const clean = String(name || "")
        .replace(/[^a-zA-Z0-9]/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    if (!clean) {
        return "";
    }

    return clean.split(" ")[0].slice(0, 12);
}

function seedPetIfMissing() {
    const existing = localStorage.getItem(KABALIKAT_PET_KEY);

    if (!existing) {
        localStorage.setItem(KABALIKAT_PET_KEY, JSON.stringify(defaultPetState));
    }
}

function getPetState() {
    try {
        const saved = localStorage.getItem(KABALIKAT_PET_KEY);

        if (!saved) {
            return structuredClone(defaultPetState);
        }

        const parsed = JSON.parse(saved);

        return {
            ...defaultPetState,
            ...parsed,
            pigName: sanitizePigName(parsed.pigName || defaultPetState.pigName),
            accessories: {
                ...defaultPetState.accessories,
                ...(parsed.accessories || {})
            }
        };
    } catch (error) {
        return structuredClone(defaultPetState);
    }
}

function savePetState(pet) {
    const merged = {
        ...defaultPetState,
        ...pet,
        pigName: sanitizePigName(pet.pigName || defaultPetState.pigName),
        accessories: {
            ...defaultPetState.accessories,
            ...(pet.accessories || {})
        }
    };

    localStorage.setItem(KABALIKAT_PET_KEY, JSON.stringify(merged));
}

function getPigImagePath(accessories) {
    const safeAccessories = {
        ...defaultPetState.accessories,
        ...(accessories || {})
    };

    const comboKey = `${safeAccessories.hat}|${safeAccessories.neck}|${safeAccessories.eyes}`;
    const fileName = comboImageMap[comboKey] || "run1.png";

    return `images/piggery/${fileName}`;
}

function getAccessoryLabel(groupName, value) {
    const group = accessoryGroups[groupName] || [];
    const item = group.find(option => option.id === value);

    return item ? item.name : "None";
}

function getEquippedList(accessories) {
    const safeAccessories = {
        ...defaultPetState.accessories,
        ...(accessories || {})
    };

    return [
        getAccessoryLabel("hat", safeAccessories.hat),
        getAccessoryLabel("neck", safeAccessories.neck),
        getAccessoryLabel("eyes", safeAccessories.eyes)
    ].filter(label => !label.toLowerCase().startsWith("no"));
}

function getEquippedAccessoryText(accessories) {
    const list = getEquippedList(accessories);

    return list.length ? list.join(" • ") : "No accessories equipped";
}

function renderPiggery() {
    const members = getFarmMembers();

    renderFarm(members);
    renderUserPigCard();
    renderAccessorySection();
}

function renderUserPigCard() {
    const pet = getPetState();
    const pigImage = getPigImagePath(pet.accessories);

    setText("profilePigName", sanitizePigName(pet.pigName) || "Porky");
    setText("profilePigOwner", `${pet.ownerName} • ${pet.role || "Head"}`);
    setText("profilePigLevel", pet.level);
    setText("profilePigMood", pet.mood);
    setText("profilePigStreak", `${pet.streak} day streak`);
    setText("profilePigExpText", `${Number(pet.exp).toLocaleString()} / ${Number(pet.expMax).toLocaleString()}`);

    const profilePigIcon = document.getElementById("profilePigIcon");
    const profilePigExpFill = document.getElementById("profilePigExpFill");

    if (profilePigIcon) {
        profilePigIcon.src = pigImage;
        profilePigIcon.onerror = () => {
            profilePigIcon.src = "images/piggery/run1.png";
        };
    }

    if (profilePigExpFill) {
        const percent = getExpPercent(pet.exp, pet.expMax);
        profilePigExpFill.style.width = `${percent}%`;
    }
}

function renderAccessorySection() {
    const pet = getPetState();
    const preview = document.getElementById("equippedAccessoryPreview");
    const grid = document.getElementById("accessoryPreviewGrid");
    const count = document.getElementById("profileAccessoryCount");

    if (count) {
        count.textContent = "6 / 6";
    }

    if (preview) {
        preview.innerHTML = `
            <img src="${escapeHtml(getPigImagePath(pet.accessories))}" alt="${escapeHtml(pet.pigName)}">
            <div>
                <strong>Equipped: ${escapeHtml(getEquippedAccessoryText(pet.accessories))}</strong>
                <span>This combination also appears in the farm.</span>
            </div>
        `;
    }

    if (grid) {
        const activeIds = new Set();

        if (pet.accessories.hat !== "none") activeIds.add(pet.accessories.hat);
        if (pet.accessories.neck !== "none") activeIds.add(pet.accessories.neck);
        if (pet.accessories.eyes !== "none") activeIds.add(pet.accessories.eyes);

        grid.innerHTML = allAccessoriesCards.map(item => {
            const activeClass = activeIds.has(item.id) ? "active" : "";

            return `
                <div class="accessory-preview-item ${activeClass}">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
                    <span>${escapeHtml(item.name)}</span>
                </div>
            `;
        }).join("");
    }
}

function getFarmMembers() {
    const currentPet = getPetState();
    const members = farmMembersBase.map(member => ({
        ...member,
        accessories: {
            ...defaultPetState.accessories,
            ...(member.accessories || {})
        }
    }));

    members[0] = {
        ...members[0],
        ownerName: currentPet.ownerName || members[0].ownerName,
        role: currentPet.role || members[0].role,
        pigName: sanitizePigName(currentPet.pigName) || members[0].pigName,
        level: Number(currentPet.level || members[0].level),
        exp: Number(currentPet.exp || members[0].exp),
        expMax: Number(currentPet.expMax || members[0].expMax),
        streak: Number(currentPet.streak || members[0].streak),
        mood: currentPet.mood || members[0].mood,
        accessories: {
            ...defaultPetState.accessories,
            ...(currentPet.accessories || {})
        }
    };

    return members
        .map((member, index) => ({
            ...member,
            score: getMemberScore(member),
            originalIndex: index,
            isCurrentUser: index === 0
        }))
        .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
}

function getMemberScore(member) {
    return Number(member.exp || 0) +
        Number(member.streak || 0) * 40 +
        Number(member.level || 0) * 75;
}

function renderFarm(members) {
    const farmRaceArea = document.getElementById("farmRaceArea");

    if (!farmRaceArea) return;

    const maxScore = Math.max(...members.map(member => Number(member.score || 0)), 1);

    const rows = members.map((member, index) => {
        const progress = getRaceProgress(member.score, maxScore);
        const pigImage = getPigImagePath(member.accessories);
        const userRowClass = member.isCurrentUser ? "is-user" : "";
        const userMetaClass = member.isCurrentUser ? "is-user" : "";
        const youBadge = member.isCurrentUser
            ? `<div class="farm-you-badge">YOUR PIG</div>`
            : "";

        return `
            <article class="farm-race-row ${userRowClass}">
                <button
                    class="farm-race-meta ${userMetaClass}"
                    type="button"
                    data-member-index="${index}">
                    <strong>#${index + 1} ${escapeHtml(sanitizePigName(member.pigName))}</strong>
                    <span>${escapeHtml(member.ownerName)} • Level ${member.level}</span>
                    <div class="farm-exp">🪙 ${Number(member.exp).toLocaleString()} EXP</div>
                    ${youBadge}
                </button>

                <div class="farm-dust" style="--race-progress: ${progress}%"></div>

                <button
                    class="farm-race-pig"
                    type="button"
                    data-member-index="${index}"
                    style="--race-progress: ${progress}%;">
                    <img
                        src="${escapeHtml(pigImage)}"
                        alt="${escapeHtml(member.pigName)}"
                        onerror="this.src='images/piggery/run1.png'">
                </button>
            </article>
        `;
    }).join("");

    farmRaceArea.innerHTML = `
        <div class="farm-track-shell">
            ${rows}
        </div>

        <div class="farm-track-footer">
            <div class="farm-bottom-message">
                <span>🏆</span>
                <strong>Save more. Track more. Help your pig grow.</strong>
            </div>
        </div>
    `;

    farmRaceArea.querySelectorAll("[data-member-index]").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.memberIndex);
            openPigProfileModal(members[index]);
        });
    });
}

function getRaceProgress(score, maxScore) {
    const rawPercent = maxScore > 0 ? (Number(score || 0) / maxScore) * 100 : 0;
    const scaledPercent = 58 + (rawPercent * 0.28);

    return Math.max(58, Math.min(84, Math.round(scaledPercent)));
}

function openPigProfileModal(member) {
    const modal = document.getElementById("pigProfileModal");

    if (!modal || !member) {
        return;
    }

    const pigImage = getPigImagePath(member.accessories);
    const expPercent = getExpPercent(member.exp, member.expMax);

    modal.innerHTML = `
        <div class="pig-profile-backdrop" id="closePigProfileBackdrop"></div>

        <article class="pig-profile-card">
            <button id="closePigProfileButton" class="pig-profile-close" type="button" aria-label="Close">
                <i class="bi bi-x-lg"></i>
            </button>

            <div class="pig-profile-image-frame">
                <img
                    src="${escapeHtml(pigImage)}"
                    alt="${escapeHtml(member.pigName)}"
                    onerror="this.src='images/piggery/run1.png'">
            </div>

            <div class="pig-profile-info">
                <span>${escapeHtml(member.ownerName)} • ${escapeHtml(member.role || "Member")}</span>
                <h2>${escapeHtml(sanitizePigName(member.pigName))}</h2>
                <p>${escapeHtml(getEquippedAccessoryText(member.accessories))}</p>
            </div>

            <div class="pig-profile-stat-grid">
                <div>
                    <span>Level</span>
                    <strong>${member.level}</strong>
                </div>

                <div>
                    <span>Streak</span>
                    <strong>${member.streak}d</strong>
                </div>

                <div>
                    <span>Mood</span>
                    <strong>${escapeHtml(member.mood)}</strong>
                </div>
            </div>

            <div class="pig-profile-exp">
                <div>
                    <span>EXP</span>
                    <strong>${Number(member.exp).toLocaleString()} / ${Number(member.expMax).toLocaleString()}</strong>
                </div>

                <div class="profile-exp-track">
                    <div class="profile-exp-fill" style="width: ${expPercent}%;"></div>
                </div>
            </div>
        </article>
    `;

    modal.classList.remove("hidden");

    document.getElementById("closePigProfileButton").addEventListener("click", closePigProfileModal);
    document.getElementById("closePigProfileBackdrop").addEventListener("click", closePigProfileModal);
}

function closePigProfileModal() {
    const modal = document.getElementById("pigProfileModal");

    if (modal) {
        modal.classList.add("hidden");
    }
}

function openCustomizeModal() {
    const pet = getPetState();
    const modal = document.getElementById("customizeModal");
    const input = document.getElementById("pigNameInput");

    if (input) {
        input.value = sanitizePigName(pet.pigName || "");
    }

    renderCustomizePreview();
    renderAccessoryChoices();

    if (modal) {
        modal.classList.remove("hidden");
    }
}

function renderCustomizePreview() {
    const preview = document.getElementById("customizePigPreview");
    const pet = getPetState();

    if (!preview) {
        return;
    }

    preview.innerHTML = `
        <img
            src="${escapeHtml(getPigImagePath(pet.accessories))}"
            alt="${escapeHtml(pet.pigName)}"
            onerror="this.src='images/piggery/run1.png'">
    `;
}

function renderAccessoryChoices() {
    renderAccessoryGroup("hatChoiceGrid", "hat");
    renderAccessoryGroup("neckChoiceGrid", "neck");
    renderAccessoryGroup("eyesChoiceGrid", "eyes");
}

function renderAccessoryGroup(containerId, groupName) {
    const grid = document.getElementById(containerId);
    const pet = getPetState();

    if (!grid) {
        return;
    }

    const currentValue = pet.accessories?.[groupName] || "none";

    grid.innerHTML = accessoryGroups[groupName].map(item => {
        const activeClass = currentValue === item.id ? "active" : "";
        const imagePart = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`
            : `<span>⊘</span>`;

        return `
            <button
                class="accessory-choice ${activeClass}"
                type="button"
                data-group="${escapeHtml(groupName)}"
                data-value="${escapeHtml(item.id)}">
                ${imagePart}
                <span>${escapeHtml(item.name)}</span>
            </button>
        `;
    }).join("");

    grid.querySelectorAll(".accessory-choice").forEach(button => {
        button.addEventListener("click", () => {
            const selectedGroup = button.dataset.group;
            const selectedValue = button.dataset.value;
            const currentPet = getPetState();

            savePetState({
                ...currentPet,
                accessories: {
                    ...defaultPetState.accessories,
                    ...(currentPet.accessories || {}),
                    [selectedGroup]: selectedValue
                }
            });

            renderAccessoryChoices();
            renderCustomizePreview();
        });
    });
}

function saveCustomizeChanges() {
    const input = document.getElementById("pigNameInput");
    const modal = document.getElementById("customizeModal");
    const pet = getPetState();

    const newPigName = sanitizePigName(input ? input.value : "") || pet.pigName || "Porky";

    savePetState({
        ...pet,
        pigName: newPigName
    });

    renderPiggery();

    if (modal) {
        modal.classList.add("hidden");
    }

    showToast("Pig updated.");
}

function getExpPercent(exp, expMax) {
    const currentExp = Number(exp || 0);
    const maxExp = Number(expMax || 1);

    if (maxExp <= 0) {
        return 0;
    }

    return Math.min((currentExp / maxExp) * 100, 100);
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
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
    }, 2300);
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
const SAVINGS_STORAGE_KEY = 'kabalikat_household_allocations_v1';

const SAVINGS_MEMBERS = {
    Elena: {
        role: 'Household Head',
        initials: 'ED',
        soft: '#F6EAF6',
        accent: '#B96FB4'
    },
    Ana: {
        role: 'Child / Member',
        initials: 'AD',
        soft: '#FAF0C6',
        accent: '#AA8024'
    },
    Marco: {
        role: 'Child / Member',
        initials: 'MD',
        soft: '#E0EEF4',
        accent: '#50849F'
    },
    'Lolo Ben': {
        role: 'Member',
        initials: 'LB',
        soft: '#E5F1E8',
        accent: '#557862'
    }
};

const PURPOSE_META = {
    Allowance: { icon: 'bi-cash-coin' },
    Education: { icon: 'bi-book' },
    Transportation: { icon: 'bi-bus-front' },
    Medicine: { icon: 'bi-capsule' },
    'Household Needs': { icon: 'bi-house-heart' },
    'Personal Needs': { icon: 'bi-person-heart' },
    Savings: { icon: 'bi-piggy-bank' },
    Other: { icon: 'bi-three-dots' }
};



const THIRTEENTH_ALLOCATION_META = {
    christmas: { name: 'Christmas & Noche Buena', icon: 'bi-gift', soft: '#F6EAF6', accent: '#B96FB4' },
    savings: { name: 'Savings', icon: 'bi-piggy-bank', soft: '#FFF1E8', accent: '#E98B5F' },
    bills: { name: 'Bills & Debt', icon: 'bi-receipt', soft: '#EEF6F0', accent: '#6C9278' },
    school: { name: 'School Needs', icon: 'bi-book', soft: '#EAF3F8', accent: '#5A8DA8' },
    emergency: { name: 'Emergency Fund', icon: 'bi-shield-check', soft: '#FFF5D8', accent: '#B48A28' },
    other: { name: 'Other', icon: 'bi-three-dots', soft: '#F4EFEC', accent: '#817872' }
};

function createDefaultThirteenthMonthState() {
    return {
        received: false,
        expectedAmount: 50000,
        amount: 0,
        receivedDate: '',
        allocations: [
            { id: 'christmas', allocated: 15000, spent: 0 },
            { id: 'savings', allocated: 15000, spent: 0 },
            { id: 'bills', allocated: 10000, spent: 0 },
            { id: 'school', allocated: 5000, spent: 0 },
            { id: 'emergency', allocated: 3000, spent: 0 },
            { id: 'other', allocated: 2000, spent: 0 }
        ]
    };
}

const DEFAULT_MONTH = getCurrentMonthKey();

const defaultSavingsState = {
    selectedMonth: DEFAULT_MONTH,
    thirteenthMonth: createDefaultThirteenthMonthState(),
    months: {
        [DEFAULT_MONTH]: {
            budget: 25000,
            allocations: [
                {
                    id: createAllocationId(),
                    member: 'Elena',
                    purpose: 'Household Needs',
                    amount: 7000,
                    note: 'Groceries and shared home supplies'
                },
                {
                    id: createAllocationId(),
                    member: 'Ana',
                    purpose: 'Education',
                    amount: 3500,
                    note: 'School allowance and materials'
                },
                {
                    id: createAllocationId(),
                    member: 'Marco',
                    purpose: 'Transportation',
                    amount: 2500,
                    note: 'Fare and weekly allowance'
                },
                {
                    id: createAllocationId(),
                    member: 'Lolo Ben',
                    purpose: 'Medicine',
                    amount: 2000,
                    note: 'Maintenance medicine and personal needs'
                }
            ]
        }
    }
};

let savingsState = loadSavingsState();
let expandedMembers = new Set(Object.keys(SAVINGS_MEMBERS));
let toastTimer = null;

document.addEventListener('DOMContentLoaded', initializeSavingsPage);

function initializeSavingsPage() {
    normalizeSavingsState();
    populateMemberOptions();
    bindSavingsEvents();
    renderSavingsPage();
}

function bindSavingsEvents() {
    document.getElementById('openAllocationForm')?.addEventListener('click', () => openAllocationSheet());
    document.getElementById('addAllocationSecondary')?.addEventListener('click', () => openAllocationSheet());
    document.getElementById('editBudgetButton')?.addEventListener('click', openBudgetSheet);

    document.getElementById('closeAllocationSheet')?.addEventListener('click', closeSheets);
    document.getElementById('closeBudgetSheet')?.addEventListener('click', closeSheets);
    document.getElementById('sheetBackdrop')?.addEventListener('click', closeSheets);

    document.getElementById('allocationForm')?.addEventListener('submit', saveAllocation);
    document.getElementById('budgetForm')?.addEventListener('submit', saveBudget);

    document.getElementById('allocationAmount')?.addEventListener('input', updateAllocationAvailableHint);

    const monthButton = document.getElementById('monthPickerButton');
    const monthInput = document.getElementById('monthPickerInput');

    monthButton?.addEventListener('click', () => {
        if (typeof monthInput.showPicker === 'function') {
            monthInput.showPicker();
        } else {
            monthInput.click();
        }
    });

    monthInput?.addEventListener('change', event => {
        const selected = event.target.value;

        if (!/^\d{4}-\d{2}$/.test(selected)) {
            return;
        }

        savingsState.selectedMonth = selected;
        ensureMonthExists(selected);
        persistSavingsState();
        renderSavingsPage();
    });

    document.getElementById('openThirteenthPanel')?.addEventListener('click', openThirteenthPanel);
    document.getElementById('closeThirteenthPanel')?.addEventListener('click', closeThirteenthPanel);
    document.getElementById('thirteenthInfoButton')?.addEventListener('click', () => {
        showSavingsToast('Plan your 13th month pay before spending, then update each allocation as money is used.');
    });
    document.getElementById('markThirteenthReceived')?.addEventListener('click', openThirteenthReceiveSheet);
    document.getElementById('closeThirteenthReceiveSheet')?.addEventListener('click', closeSheets);
    document.getElementById('closeThirteenthAllocationSheet')?.addEventListener('click', closeSheets);
    document.getElementById('thirteenthReceiveForm')?.addEventListener('submit', saveThirteenthReceived);
    document.getElementById('thirteenthAllocationForm')?.addEventListener('submit', saveThirteenthAllocation);
    document.getElementById('thirteenthAllocatedInput')?.addEventListener('input', updateThirteenthAllocationHint);
    document.getElementById('resetThirteenthPlan')?.addEventListener('click', resetThirteenthPlan);

    document.getElementById('navHome')?.addEventListener('click', () => {
        window.location.href = 'home.html';
    });

    document.getElementById('navExpenses')?.addEventListener('click', () => {
        window.location.href = 'expenses.html';
    });

    document.getElementById('navScan')?.addEventListener('click', () => {
        window.location.href = 'scanner.html';
    });

    document.getElementById('navProfile')?.addEventListener('click', () => {
        showSavingsToast('Profile will be added next.');
    });
}

function normalizeSavingsState() {
    if (!savingsState || typeof savingsState !== 'object') {
        savingsState = structuredCloneSafe(defaultSavingsState);
    }

    if (!savingsState.selectedMonth || !/^\d{4}-\d{2}$/.test(savingsState.selectedMonth)) {
        savingsState.selectedMonth = DEFAULT_MONTH;
    }

    if (!savingsState.months || typeof savingsState.months !== 'object') {
        savingsState.months = {};
    }

    normalizeThirteenthMonthState();
    ensureMonthExists(savingsState.selectedMonth);
    persistSavingsState();
}

function ensureMonthExists(monthKey) {
    if (savingsState.months[monthKey]) {
        return;
    }

    savingsState.months[monthKey] = {
        budget: 25000,
        allocations: []
    };
}

function getCurrentMonthState() {
    ensureMonthExists(savingsState.selectedMonth);
    return savingsState.months[savingsState.selectedMonth];
}

function renderSavingsPage() {
    const current = getCurrentMonthState();
    const totals = calculateAllocationTotals(current);

    setText('monthPickerText', formatMonthKey(savingsState.selectedMonth));

    const monthInput = document.getElementById('monthPickerInput');
    if (monthInput) {
        monthInput.value = savingsState.selectedMonth;
    }

    setText('monthlyBudgetAmount', peso(current.budget));
    setText('allocatedAmount', peso(totals.allocated));
    setText('availableAmount', peso(totals.available));
    setText('allocatedMemberCount', String(totals.memberCount));
    setText('allocationProgressText', `${peso(totals.allocated)} of ${peso(current.budget)} allocated`);
    setText('allocationProgressPercent', `${totals.percent}%`);

    renderProgressSegments(current, totals);
    renderMemberAllocations(current, totals);
    renderThirteenthMonth();
    updateAllocationAvailableHint();
}

function renderProgressSegments(current, totals) {
    const container = document.getElementById('allocationProgressSegments');

    if (!container) {
        return;
    }

    const grouped = getMemberAllocationGroups(current.allocations);

    container.innerHTML = grouped.map(group => {
        const member = SAVINGS_MEMBERS[group.member] || fallbackMember(group.member);
        const width = current.budget > 0
            ? Math.max((group.total / current.budget) * 100, 0)
            : 0;

        return `
            <span
                class="allocation-progress-segment"
                title="${escapeHtml(group.member)}: ${peso(group.total)}"
                style="width:${Math.min(width, 100).toFixed(2)}%; background:${escapeHtml(member.accent)}">
            </span>
        `;
    }).join('');

    if (!totals.allocated) {
        container.innerHTML = '';
    }
}

function renderMemberAllocations(current, totals) {
    const container = document.getElementById('memberAllocationList');

    if (!container) {
        return;
    }

    if (!current.allocations.length) {
        container.innerHTML = `
            <div class="allocation-empty-state">
                <i class="bi bi-people"></i>
                <strong>No household allocations yet</strong>
                <p>Assign a budget to a family member for allowance, education, transportation, medicine, or other needs.</p>
                <button type="button" data-empty-add-allocation>Add first allocation</button>
            </div>
        `;

        container.querySelector('[data-empty-add-allocation]')?.addEventListener('click', () => openAllocationSheet());
        return;
    }

    const groups = getMemberAllocationGroups(current.allocations);

    container.innerHTML = groups.map(group => {
        const member = SAVINGS_MEMBERS[group.member] || fallbackMember(group.member);
        const percentOfBudget = current.budget > 0
            ? Math.round((group.total / current.budget) * 100)
            : 0;
        const expanded = expandedMembers.has(group.member);
        const purposeSummary = [...new Set(group.items.map(item => item.purpose))].join(' • ');

        return `
            <article
                class="member-allocation-card ${expanded ? 'expanded' : ''}"
                data-member-card="${escapeHtml(group.member)}"
                style="--member-soft:${escapeHtml(member.soft)}; --member-accent:${escapeHtml(member.accent)}">

                <button class="member-allocation-summary" type="button" data-toggle-member="${escapeHtml(group.member)}">
                    <span class="member-allocation-avatar">${escapeHtml(member.initials)}</span>

                    <span class="member-allocation-copy">
                        <h3>${escapeHtml(group.member)}</h3>
                        <p>${escapeHtml(member.role)} • ${escapeHtml(purposeSummary)}</p>
                    </span>

                    <span class="member-allocation-value">
                        <strong>${peso(group.total)}</strong>
                        <span>${percentOfBudget}% of budget</span>
                    </span>
                </button>

                <div class="member-allocation-track">
                    <span style="width:${Math.min(percentOfBudget, 100)}%"></span>
                </div>

                <div class="member-allocation-details">
                    ${group.items.map(item => allocationLineItem(item, member)).join('')}

                    <button class="member-add-line" type="button" data-add-for-member="${escapeHtml(group.member)}">
                        <i class="bi bi-plus-lg"></i>
                        Add another allocation for ${escapeHtml(group.member)}
                    </button>
                </div>
            </article>
        `;
    }).join('');

    container.querySelectorAll('[data-toggle-member]').forEach(button => {
        button.addEventListener('click', () => {
            const memberName = button.dataset.toggleMember;

            if (expandedMembers.has(memberName)) {
                expandedMembers.delete(memberName);
            } else {
                expandedMembers.add(memberName);
            }

            renderMemberAllocations(current, totals);
        });
    });

    container.querySelectorAll('[data-add-for-member]').forEach(button => {
        button.addEventListener('click', () => openAllocationSheet(null, button.dataset.addForMember));
    });

    container.querySelectorAll('[data-edit-allocation]').forEach(button => {
        button.addEventListener('click', () => {
            const allocation = current.allocations.find(item => item.id === button.dataset.editAllocation);
            if (allocation) {
                openAllocationSheet(allocation);
            }
        });
    });

    container.querySelectorAll('[data-delete-allocation]').forEach(button => {
        button.addEventListener('click', () => deleteAllocation(button.dataset.deleteAllocation));
    });
}

function allocationLineItem(item, member) {
    const meta = PURPOSE_META[item.purpose] || PURPOSE_META.Other;
    const note = item.note ? item.note : 'No note added';

    return `
        <div class="allocation-line-item">
            <span class="allocation-line-icon"><i class="bi ${escapeHtml(meta.icon)}"></i></span>

            <span class="allocation-line-copy">
                <strong>${escapeHtml(item.purpose)}</strong>
                <small>${escapeHtml(note)}</small>
            </span>

            <span class="allocation-line-actions">
                <b class="allocation-line-amount">${peso(item.amount)}</b>
                <button class="allocation-icon-button" type="button" data-edit-allocation="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.purpose)} allocation">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="allocation-icon-button delete" type="button" data-delete-allocation="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.purpose)} allocation">
                    <i class="bi bi-trash3"></i>
                </button>
            </span>
        </div>
    `;
}

function openAllocationSheet(allocation = null, preselectedMember = '') {
    const sheet = document.getElementById('allocationSheet');
    const backdrop = document.getElementById('sheetBackdrop');
    const form = document.getElementById('allocationForm');

    if (!sheet || !backdrop || !form) {
        return;
    }

    form.reset();

    document.getElementById('allocationId').value = allocation?.id || '';
    document.getElementById('allocationMember').value = allocation?.member || preselectedMember || Object.keys(SAVINGS_MEMBERS)[0];
    document.getElementById('allocationPurpose').value = allocation?.purpose || 'Allowance';
    document.getElementById('allocationAmount').value = allocation?.amount || '';
    document.getElementById('allocationNote').value = allocation?.note || '';

    setText('allocationSheetEyebrow', allocation ? 'Edit allocation' : 'New allocation');
    setText('allocationSheetTitle', allocation ? 'Update assigned budget' : 'Assign a budget');
    setText('saveAllocationLabel', allocation ? 'Update allocation' : 'Save allocation');

    backdrop.hidden = false;
    sheet.hidden = false;
    updateAllocationAvailableHint();

    setTimeout(() => document.getElementById('allocationAmount')?.focus(), 60);
}

function openBudgetSheet() {
    const current = getCurrentMonthState();
    const totals = calculateAllocationTotals(current);
    const sheet = document.getElementById('budgetSheet');
    const backdrop = document.getElementById('sheetBackdrop');

    document.getElementById('budgetInput').value = current.budget;
    setText('budgetMinimumHint', `Current allocations require at least ${peso(totals.allocated)}.`);

    backdrop.hidden = false;
    sheet.hidden = false;

    setTimeout(() => document.getElementById('budgetInput')?.focus(), 60);
}

function closeSheets() {
    document.getElementById('sheetBackdrop').hidden = true;
    document.getElementById('allocationSheet').hidden = true;
    document.getElementById('budgetSheet').hidden = true;
    document.getElementById('thirteenthReceiveSheet').hidden = true;
    document.getElementById('thirteenthAllocationSheet').hidden = true;
}

function saveAllocation(event) {
    event.preventDefault();

    const current = getCurrentMonthState();
    const id = document.getElementById('allocationId').value;
    const member = document.getElementById('allocationMember').value;
    const purpose = document.getElementById('allocationPurpose').value;
    const amount = Number(document.getElementById('allocationAmount').value);
    const note = document.getElementById('allocationNote').value.trim();

    if (!member || !purpose || !Number.isFinite(amount) || amount <= 0) {
        showSavingsToast('Enter a valid member, purpose, and amount.');
        return;
    }

    const oldAllocation = current.allocations.find(item => item.id === id);
    const allocatedWithoutCurrent = current.allocations.reduce((sum, item) => {
        return sum + (item.id === id ? 0 : Number(item.amount || 0));
    }, 0);

    if (allocatedWithoutCurrent + amount > current.budget) {
        const availableForEntry = Math.max(current.budget - allocatedWithoutCurrent, 0);
        showSavingsToast(`This exceeds the household budget. You can allocate up to ${peso(availableForEntry)}.`);
        return;
    }

    if (oldAllocation) {
        oldAllocation.member = member;
        oldAllocation.purpose = purpose;
        oldAllocation.amount = amount;
        oldAllocation.note = note;
    } else {
        current.allocations.push({
            id: createAllocationId(),
            member,
            purpose,
            amount,
            note
        });
    }

    expandedMembers.add(member);
    persistSavingsState();
    closeSheets();
    renderSavingsPage();
    showSavingsToast(oldAllocation ? 'Allocation updated.' : 'Allocation added.');
}

function saveBudget(event) {
    event.preventDefault();

    const current = getCurrentMonthState();
    const totals = calculateAllocationTotals(current);
    const newBudget = Number(document.getElementById('budgetInput').value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        showSavingsToast('Enter a valid monthly budget.');
        return;
    }

    if (newBudget < totals.allocated) {
        showSavingsToast(`The budget cannot be lower than the ${peso(totals.allocated)} already allocated.`);
        return;
    }

    current.budget = newBudget;
    persistSavingsState();
    closeSheets();
    renderSavingsPage();
    showSavingsToast('Monthly household budget updated.');
}

function deleteAllocation(id) {
    const current = getCurrentMonthState();
    const allocation = current.allocations.find(item => item.id === id);

    if (!allocation) {
        return;
    }

    const confirmed = window.confirm(`Remove the ${allocation.purpose} allocation for ${allocation.member}?`);

    if (!confirmed) {
        return;
    }

    current.allocations = current.allocations.filter(item => item.id !== id);
    persistSavingsState();
    renderSavingsPage();
    showSavingsToast('Allocation removed.');
}

function updateAllocationAvailableHint() {
    const current = getCurrentMonthState();
    const id = document.getElementById('allocationId')?.value || '';
    const enteredAmount = Number(document.getElementById('allocationAmount')?.value || 0);

    const allocatedWithoutCurrent = current.allocations.reduce((sum, item) => {
        return sum + (item.id === id ? 0 : Number(item.amount || 0));
    }, 0);

    const maximumForEntry = Math.max(current.budget - allocatedWithoutCurrent, 0);
    const remainingAfterEntry = Math.max(maximumForEntry - Math.max(enteredAmount, 0), 0);

    setText(
        'allocationAvailableHint',
        enteredAmount > 0
            ? `${peso(remainingAfterEntry)} will remain available after this allocation.`
            : `You can allocate up to ${peso(maximumForEntry)}.`
    );
}



function normalizeThirteenthMonthState() {
    const defaults = createDefaultThirteenthMonthState();
    const current = savingsState.thirteenthMonth;

    if (!current || typeof current !== 'object') {
        savingsState.thirteenthMonth = defaults;
        return;
    }

    current.received = Boolean(current.received);
    current.expectedAmount = positiveNumberOr(current.expectedAmount, defaults.expectedAmount);
    current.amount = Math.max(Number(current.amount || 0), 0);
    current.receivedDate = typeof current.receivedDate === 'string' ? current.receivedDate : '';

    const oldAllocations = Array.isArray(current.allocations) ? current.allocations : [];
    current.allocations = defaults.allocations.map(defaultItem => {
        const savedItem = oldAllocations.find(item => item && item.id === defaultItem.id) || {};
        return {
            id: defaultItem.id,
            allocated: Math.max(Number(savedItem.allocated ?? defaultItem.allocated), 0),
            spent: Math.max(Number(savedItem.spent ?? defaultItem.spent), 0)
        };
    });

    current.allocations.forEach(item => {
        item.spent = Math.min(item.spent, item.allocated);
    });
}

function renderThirteenthMonth() {
    const data = savingsState.thirteenthMonth;
    const totals = calculateThirteenthTotals(data);
    const planBase = getThirteenthPlanBase(data);
    const statusCard = document.getElementById('thirteenthStatusCard');

    setText(
        'thirteenthPreviewStatus',
        data.received
            ? `Received ${formatShortDate(data.receivedDate)} • ${peso(data.amount)}`
            : `Not yet received • ${peso(data.expectedAmount)} expected`
    );

    statusCard?.classList.toggle('received', data.received);
    setText('thirteenthStatusTitle', data.received ? 'Received' : 'Not yet received');
    setText(
        'thirteenthStatusDescription',
        data.received
            ? `Received on ${formatLongDate(data.receivedDate)}. Update the plan as your household uses the money.`
            : 'Once you receive your 13th month pay, mark it as received so the plan can track your remaining money.'
    );
    setText(
        'thirteenthExpectedAmount',
        data.received ? `Total received: ${peso(data.amount)}` : `Expected: ${peso(data.expectedAmount)}`
    );

    const receiveButton = document.getElementById('markThirteenthReceived');
    if (receiveButton) {
        receiveButton.innerHTML = data.received
            ? '<i class="bi bi-pencil"></i><span>Edit received details</span>'
            : '<i class="bi bi-gift"></i><span>Mark as Received</span>';
    }

    setText('thirteenthSpentAmount', peso(totals.spent));
    setText('thirteenthSpentPercent', `${totals.utilization}%`);
    setText('thirteenthRemainingAmount', peso(totals.remaining));
    setText('thirteenthRemainingPercent', `${totals.remainingPercent}%`);
    setText('thirteenthUtilization', `${totals.utilization}%`);

    const utilizationFill = document.getElementById('thirteenthUtilizationFill');
    if (utilizationFill) utilizationFill.style.width = `${Math.min(totals.utilization, 100)}%`;

    setText(
        'thirteenthPlanSummary',
        `${peso(totals.allocated)} planned out of ${peso(planBase)}${totals.unallocated > 0 ? ` • ${peso(totals.unallocated)} unallocated` : ''}`
    );

    renderThirteenthDistribution(data, planBase);
    renderThirteenthAllocationList(data, planBase);
}

function renderThirteenthDistribution(data, planBase) {
    const container = document.getElementById('thirteenthDistributionBar');
    if (!container) return;

    container.innerHTML = data.allocations.map(item => {
        const meta = THIRTEENTH_ALLOCATION_META[item.id];
        const width = planBase > 0 ? Math.max((Number(item.allocated || 0) / planBase) * 100, 0) : 0;
        return `<span title="${escapeHtml(meta.name)}: ${peso(item.allocated)}" style="width:${width.toFixed(2)}%; background:${escapeHtml(meta.accent)}"></span>`;
    }).join('');
}

function renderThirteenthAllocationList(data, planBase) {
    const container = document.getElementById('thirteenthAllocationList');
    if (!container) return;

    container.innerHTML = data.allocations.map(item => {
        const meta = THIRTEENTH_ALLOCATION_META[item.id];
        const share = planBase > 0 ? Math.round((Number(item.allocated || 0) / planBase) * 100) : 0;
        const spentPercent = item.allocated > 0 ? Math.min(Math.round((Number(item.spent || 0) / item.allocated) * 100), 100) : 0;
        const availablePercent = item.allocated > 0 ? Math.max(100 - spentPercent, 0) : 0;

        return `
            <button
                class="thirteenth-allocation-card"
                type="button"
                data-thirteenth-allocation="${escapeHtml(item.id)}"
                style="--allocation-soft:${escapeHtml(meta.soft)}; --allocation-accent:${escapeHtml(meta.accent)}">
                <span class="thirteenth-allocation-icon"><i class="bi ${escapeHtml(meta.icon)}"></i></span>
                <span class="thirteenth-allocation-copy">
                    <strong>${escapeHtml(meta.name)}</strong>
                    <small>Allocated ${peso(item.allocated)} • Spent ${peso(item.spent)}</small>
                    <span class="thirteenth-allocation-progress"><i style="width:${availablePercent}%"></i></span>
                </span>
                <span class="thirteenth-allocation-value">
                    <strong>${peso(item.allocated)}</strong>
                    <small>${share}%</small>
                </span>
                <i class="bi bi-chevron-right"></i>
            </button>
        `;
    }).join('');

    container.querySelectorAll('[data-thirteenth-allocation]').forEach(button => {
        button.addEventListener('click', () => openThirteenthAllocationSheet(button.dataset.thirteenthAllocation));
    });
}

function openThirteenthPanel() {
    renderThirteenthMonth();
    const panel = document.getElementById('thirteenthMonthPanel');
    if (panel) panel.hidden = false;
}

function closeThirteenthPanel() {
    const panel = document.getElementById('thirteenthMonthPanel');
    if (panel) panel.hidden = true;
}

function openThirteenthReceiveSheet() {
    const data = savingsState.thirteenthMonth;
    const amountInput = document.getElementById('thirteenthReceivedInput');
    const dateInput = document.getElementById('thirteenthReceivedDateInput');

    amountInput.value = data.received ? data.amount : data.expectedAmount;
    dateInput.value = data.receivedDate || new Date().toISOString().slice(0, 10);
    setText('thirteenthReceiveTitle', data.received ? 'Edit received details' : 'Mark as received');
    setText('saveThirteenthReceivedLabel', data.received ? 'Update received pay' : 'Save received pay');

    document.getElementById('sheetBackdrop').hidden = false;
    document.getElementById('thirteenthReceiveSheet').hidden = false;
    setTimeout(() => amountInput?.focus(), 60);
}

function saveThirteenthReceived(event) {
    event.preventDefault();

    const data = savingsState.thirteenthMonth;
    const amount = Number(document.getElementById('thirteenthReceivedInput').value);
    const receivedDate = document.getElementById('thirteenthReceivedDateInput').value;
    const allocated = data.allocations.reduce((sum, item) => sum + Number(item.allocated || 0), 0);

    if (!Number.isFinite(amount) || amount <= 0 || !receivedDate) {
        showSavingsToast('Enter a valid received amount and date.');
        return;
    }

    let planAdjusted = false;

    if (amount < allocated) {
        scaleThirteenthAllocationsToBase(data, amount);
        planAdjusted = true;
    }

    data.received = true;
    data.amount = amount;
    data.receivedDate = receivedDate;
    data.expectedAmount = amount;

    persistSavingsState();
    closeSheets();
    renderThirteenthMonth();
    showSavingsToast(
        planAdjusted
            ? 'Received pay saved. The allocation plan was adjusted to fit the actual amount.'
            : '13th month pay marked as received.'
    );
}

function openThirteenthAllocationSheet(id) {
    const data = savingsState.thirteenthMonth;
    const allocation = data.allocations.find(item => item.id === id);
    const meta = THIRTEENTH_ALLOCATION_META[id];
    if (!allocation || !meta) return;

    document.getElementById('thirteenthAllocationId').value = id;
    document.getElementById('thirteenthAllocationName').value = meta.name;
    document.getElementById('thirteenthAllocatedInput').value = allocation.allocated;
    document.getElementById('thirteenthSpentInput').value = allocation.spent;
    setText('thirteenthAllocationSheetTitle', meta.name);
    updateThirteenthAllocationHint();

    document.getElementById('sheetBackdrop').hidden = false;
    document.getElementById('thirteenthAllocationSheet').hidden = false;
    setTimeout(() => document.getElementById('thirteenthAllocatedInput')?.focus(), 60);
}

function updateThirteenthAllocationHint() {
    const data = savingsState.thirteenthMonth;
    const id = document.getElementById('thirteenthAllocationId')?.value;
    const entered = Math.max(Number(document.getElementById('thirteenthAllocatedInput')?.value || 0), 0);
    const base = getThirteenthPlanBase(data);
    const otherAllocated = data.allocations.reduce((sum, item) => sum + (item.id === id ? 0 : Number(item.allocated || 0)), 0);
    const remaining = Math.max(base - otherAllocated - entered, 0);
    setText('thirteenthAllocationAvailableHint', `${peso(remaining)} will remain unallocated.`);
}

function saveThirteenthAllocation(event) {
    event.preventDefault();

    const data = savingsState.thirteenthMonth;
    const id = document.getElementById('thirteenthAllocationId').value;
    const allocation = data.allocations.find(item => item.id === id);
    const allocated = Number(document.getElementById('thirteenthAllocatedInput').value);
    const spent = Number(document.getElementById('thirteenthSpentInput').value);
    const base = getThirteenthPlanBase(data);

    if (!allocation || !Number.isFinite(allocated) || allocated < 0 || !Number.isFinite(spent) || spent < 0) {
        showSavingsToast('Enter valid allocation and spent amounts.');
        return;
    }

    if (spent > allocated) {
        showSavingsToast('Spent cannot be greater than the planned amount.');
        return;
    }

    const otherAllocated = data.allocations.reduce((sum, item) => sum + (item.id === id ? 0 : Number(item.allocated || 0)), 0);
    if (otherAllocated + allocated > base) {
        showSavingsToast(`This exceeds the ${peso(base)} available for your 13th month plan.`);
        return;
    }

    allocation.allocated = allocated;
    allocation.spent = spent;
    persistSavingsState();
    closeSheets();
    renderThirteenthMonth();
    showSavingsToast('13th month allocation updated.');
}

function resetThirteenthPlan() {
    const confirmed = window.confirm('Reset the 13th month allocation amounts and spending to the recommended plan?');
    if (!confirmed) return;

    const current = savingsState.thirteenthMonth;
    current.allocations = createRecommendedThirteenthAllocations(getThirteenthPlanBase(current));
    persistSavingsState();
    renderThirteenthMonth();
    showSavingsToast('13th month allocation plan reset.');
}


function createRecommendedThirteenthAllocations(baseAmount) {
    const base = Math.max(Math.round(Number(baseAmount || 0)), 0);
    const ratios = [
        ['christmas', 0.30],
        ['savings', 0.30],
        ['bills', 0.20],
        ['school', 0.10],
        ['emergency', 0.06],
        ['other', 0.04]
    ];

    let used = 0;

    return ratios.map(([id, ratio], index) => {
        const allocated = index === ratios.length - 1
            ? Math.max(base - used, 0)
            : Math.round(base * ratio);
        used += allocated;
        return { id, allocated, spent: 0 };
    });
}

function scaleThirteenthAllocationsToBase(data, newBase) {
    const currentTotal = data.allocations.reduce((sum, item) => sum + Number(item.allocated || 0), 0);

    if (currentTotal <= 0) {
        data.allocations = createRecommendedThirteenthAllocations(newBase);
        return;
    }

    let used = 0;
    data.allocations.forEach((item, index) => {
        const nextAmount = index === data.allocations.length - 1
            ? Math.max(Math.round(newBase) - used, 0)
            : Math.round((Number(item.allocated || 0) / currentTotal) * newBase);

        item.allocated = nextAmount;
        item.spent = Math.min(Number(item.spent || 0), nextAmount);
        used += nextAmount;
    });
}

function calculateThirteenthTotals(data) {
    const base = getThirteenthPlanBase(data);
    const allocated = data.allocations.reduce((sum, item) => sum + Number(item.allocated || 0), 0);
    const spent = data.allocations.reduce((sum, item) => sum + Number(item.spent || 0), 0);
    const remaining = Math.max(base - spent, 0);
    const utilization = base > 0 ? Math.min(Math.round((spent / base) * 100), 100) : 0;
    const remainingPercent = base > 0 ? Math.max(100 - utilization, 0) : 0;
    const unallocated = Math.max(base - allocated, 0);
    return { allocated, spent, remaining, utilization, remainingPercent, unallocated };
}

function getThirteenthPlanBase(data) {
    return data.received && Number(data.amount) > 0
        ? Number(data.amount)
        : Number(data.expectedAmount || 0);
}

function positiveNumberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function formatShortDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatLongDate(value) {
    if (!value) return 'the selected date';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}


function calculateAllocationTotals(current) {
    const allocated = current.allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const available = Math.max(Number(current.budget || 0) - allocated, 0);
    const memberCount = new Set(current.allocations.map(item => item.member)).size;
    const percent = current.budget > 0
        ? Math.min(Math.round((allocated / current.budget) * 100), 100)
        : 0;

    return { allocated, available, memberCount, percent };
}

function getMemberAllocationGroups(allocations) {
    const groups = new Map();

    allocations.forEach(item => {
        if (!groups.has(item.member)) {
            groups.set(item.member, {
                member: item.member,
                total: 0,
                items: []
            });
        }

        const group = groups.get(item.member);
        group.total += Number(item.amount || 0);
        group.items.push(item);
    });

    return [...groups.values()].sort((first, second) => {
        const memberOrder = Object.keys(SAVINGS_MEMBERS);
        const firstIndex = memberOrder.indexOf(first.member);
        const secondIndex = memberOrder.indexOf(second.member);

        if (firstIndex === -1 && secondIndex === -1) {
            return first.member.localeCompare(second.member);
        }

        if (firstIndex === -1) return 1;
        if (secondIndex === -1) return -1;
        return firstIndex - secondIndex;
    });
}

function populateMemberOptions() {
    const select = document.getElementById('allocationMember');

    if (!select) {
        return;
    }

    select.innerHTML = Object.entries(SAVINGS_MEMBERS).map(([name, member]) => {
        return `<option value="${escapeHtml(name)}">${escapeHtml(name)} — ${escapeHtml(member.role)}</option>`;
    }).join('');
}

function loadSavingsState() {
    try {
        const stored = localStorage.getItem(SAVINGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : structuredCloneSafe(defaultSavingsState);
    } catch (error) {
        return structuredCloneSafe(defaultSavingsState);
    }
}

function persistSavingsState() {
    try {
        localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(savingsState));
    } catch (error) {
        showSavingsToast('Unable to save allocation changes on this device.');
    }
}

function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
}

function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function formatMonthKey(monthKey) {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    return new Intl.DateTimeFormat('en-PH', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function createAllocationId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `allocation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fallbackMember(name) {
    const initials = String(name || 'Member')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');

    return {
        role: 'Member',
        initials: initials || 'M',
        soft: '#F4EFEC',
        accent: '#817872'
    };
}

function peso(value) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showSavingsToast(message) {
    const toast = document.getElementById('savingsToast');

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

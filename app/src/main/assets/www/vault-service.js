const VAULT_PREFIX = "kabalikat_family_vault_v3_";

window.KabalikatVault = {
  forFamily(familyCode) {
    const code = String(familyCode || "").trim().toUpperCase();
    if (!code) throw new Error("Family code is required.");
    const key = VAULT_PREFIX + code.replace(/[^A-Z0-9_-]/g, "-");

    const initial = () => ({
      version: 3,
      familyCode: code,
      folders: [
        { id: "folder-groceries", name: "Groceries", parentId: "", starred: false, createdAt: new Date().toISOString() },
        { id: "folder-bills", name: "Household Bills", parentId: "", starred: false, createdAt: new Date().toISOString() },
        { id: "folder-warranties", name: "Warranties", parentId: "", starred: false, createdAt: new Date().toISOString() }
      ],
      files: [
        { id: "file-1", title: "Puregold Receipt", type: "receipt", merchant: "Puregold", amount: 1250, date: "2026-07-24", uploadedById: "sample-head", uploadedByName: "Elena", folderId: "folder-groceries", mimeType: "image/jpeg", dataUrl: "", linkedExpense: "Groceries", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), trashedAt: "" },
        { id: "file-2", title: "Electric Fan Warranty", type: "warranty", merchant: "Abenson", amount: 2399, date: "2026-07-20", uploadedById: "sample-head", uploadedByName: "Elena", folderId: "folder-warranties", mimeType: "application/pdf", dataUrl: "", linkedExpense: "Electric Fan", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), trashedAt: "" },
        { id: "file-3", title: "Maynilad Billing", type: "document", merchant: "Maynilad", amount: 1034, date: "2026-07-18", uploadedById: "sample-member-2", uploadedByName: "Marco", folderId: "folder-bills", mimeType: "application/pdf", dataUrl: "", linkedExpense: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), trashedAt: "" }
      ]
    });

    function load() {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) { const state = initial(); save(state); return state; }
        const parsed = JSON.parse(saved);
        return {
          version: 4,
          familyCode: code,
          folders: Array.isArray(parsed.folders)
            ? parsed.folders.map(folder => ({
                ...folder,
                parentId: folder.parentId || "",
                starred: folder.starred === true
              }))
            : [],
          files: Array.isArray(parsed.files)
            ? parsed.files.map(file => ({
                ...file,
                title:
                  file.title === "Maynilad Billing Statement"
                    ? "Maynilad Billing"
                    : file.title
              }))
            : []
        };
      } catch { return initial(); }
    }
    function save(state) { localStorage.setItem(key, JSON.stringify(state)); return state; }
    function mutate(callback) { const state = load(); callback(state); return save(state); }
    function actorOk(actor) { if (!actor?.id) throw new Error("Signed-in member required."); }
    function isHead(actor) { return /head/i.test(String(actor.role || "")); }
    function findFile(state, id) { const file = state.files.find(item => item.id === id); if (!file) throw new Error("File not found."); return file; }
    function canManage(file, actor) { return isHead(actor) || file.uploadedById === actor.id; }
    function id(prefix) { return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`; }

    return {
      storageKey: key,
      load,
      createFolder(name, actor, parentId = "") {
        actorOk(actor);

        const clean = String(name || "").trim();
        const normalizedParentId = String(parentId || "").trim();

        if (!clean) {
          throw new Error("Folder name is required.");
        }

        let created;

        mutate(state => {
          if (
            normalizedParentId &&
            !state.folders.some(folder => folder.id === normalizedParentId)
          ) {
            throw new Error("Parent folder was not found.");
          }

          const duplicate = state.folders.some(folder =>
            String(folder.parentId || "") === normalizedParentId &&
            folder.name.toLowerCase() === clean.toLowerCase()
          );

          if (duplicate) {
            throw new Error("A folder with this name already exists here.");
          }

          const now =
            new Date().toISOString();

          created = {
            id: id("folder"),
            name: clean,
            parentId: normalizedParentId,
            createdById: actor.id,
            starred: false,
            createdAt: now,
            updatedAt: now
          };

          state.folders.push(created);
        });

        return created;
      },
      toggleFolderStar(folderId, actor) {
        actorOk(actor);

        const targetId =
          String(folderId || "").trim();

        let starred = false;

        mutate(state => {
          const folder =
            state.folders.find(
              item => item.id === targetId
            );

          if (!folder) {
            throw new Error("Folder not found.");
          }

          folder.starred =
            folder.starred !== true;

          folder.updatedAt =
            new Date().toISOString();

          starred =
            folder.starred;
        });

        return starred;
      },
      deleteFolder(folderId, actor) {
        actorOk(actor);

        const targetId = String(folderId || "").trim();

        mutate(state => {
          const target = state.folders.find(folder => folder.id === targetId);

          if (!target) {
            throw new Error("Folder not found.");
          }

          const mayManageTarget =
            isHead(actor) ||
            target.createdById === actor.id;

          if (!mayManageTarget) {
            throw new Error("You can only delete folders you created.");
          }

          const descendantIds = new Set([targetId]);
          let added = true;

          while (added) {
            added = false;

            state.folders.forEach(folder => {
              if (
                descendantIds.has(String(folder.parentId || "")) &&
                !descendantIds.has(folder.id)
              ) {
                descendantIds.add(folder.id);
                added = true;
              }
            });
          }

          const protectedFile = state.files.find(file =>
            descendantIds.has(String(file.folderId || "")) &&
            !isHead(actor) &&
            file.uploadedById !== actor.id
          );

          if (protectedFile) {
            throw new Error(
              "This folder contains a file uploaded by another family member."
            );
          }

          const now = new Date().toISOString();

          state.files.forEach(file => {
            if (descendantIds.has(String(file.folderId || ""))) {
              file.trashedAt = file.trashedAt || now;
              file.updatedAt = now;
            }
          });

          state.folders = state.folders.filter(
            folder => !descendantIds.has(folder.id)
          );
        });
      },
      addFile(payload, actor) {
        actorOk(actor); let created;
        mutate(state => {
          const now = new Date().toISOString();
          created = { id: id("file"), title: String(payload.title || "Untitled File").trim(), type: ["receipt","warranty","document"].includes(payload.type) ? payload.type : "document", merchant: payload.merchant || "", amount: Number(payload.amount || 0), date: payload.date || now.slice(0,10), uploadedById: actor.id, uploadedByName: actor.name || "Family Member", folderId: payload.folderId || "", mimeType: payload.mimeType || "application/octet-stream", dataUrl: payload.dataUrl || "", linkedExpense: payload.linkedExpense || "", createdAt: now, updatedAt: now, trashedAt: "" };
          state.files.unshift(created);
        });
        return created;
      },
      updateFile(fileId, updates, actor) {
        actorOk(actor);
        mutate(state => { const file = findFile(state,fileId); if (!canManage(file,actor)) throw new Error("You can only manage files you uploaded."); Object.assign(file, updates, { updatedAt: new Date().toISOString() }); });
      },
      moveToTrash(fileId, actor) {
        actorOk(actor);
        mutate(state => { const file = findFile(state,fileId); if (!canManage(file,actor)) throw new Error("You can only remove files you uploaded."); file.trashedAt = new Date().toISOString(); });
      },
      restoreFile(fileId, actor) {
        actorOk(actor);

        mutate(state => {
          const file =
            findFile(state, fileId);

          if (!canManage(file, actor)) {
            throw new Error(
              "You cannot restore this file."
            );
          }

          if (
            file.folderId &&
            !state.folders.some(
              folder =>
                folder.id ===
                file.folderId
            )
          ) {
            file.folderId = "";
          }

          file.trashedAt = "";
          file.updatedAt =
            new Date().toISOString();
        });
      },
      deleteFile(fileId, actor) {
        actorOk(actor); if (!isHead(actor)) throw new Error("Only the Household Head can permanently delete files.");
        mutate(state => state.files = state.files.filter(file => file.id !== fileId));
      },
      emptyTrash(actor) {
        actorOk(actor); if (!isHead(actor)) throw new Error("Only the Household Head can empty Trash.");
        mutate(state => state.files = state.files.filter(file => !file.trashedAt));
      },
      addScannedReceipt(receipt, actor) { return this.addFile({ ...receipt, type: "receipt" }, actor); }
    };
  }
};
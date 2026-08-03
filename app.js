"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const config = window.SERGIO_DASHBOARD_CONFIG;

    const state = {
        currentCalendarDate: new Date(),
        selectedCalendarDate: null,
        loadedFolders: new Map()
    };

    const elements = {
        timelineContainer: document.getElementById("timeline-container"),

        calendarSection: document.getElementById("calendar-section"),
        calendarDays: document.getElementById("calendar-days"),
        calendarMonthLabel: document.getElementById(
            "calendar-month-label"
        ),
        calendarEventDetails: document.getElementById(
            "calendar-event-details"
        ),
        previousMonthButton: document.getElementById(
            "previous-month-button"
        ),
        nextMonthButton: document.getElementById(
            "next-month-button"
        ),
        openCalendarButton: document.getElementById(
            "open-calendar-button"
        ),
        heroCalendarButton: document.getElementById(
            "hero-calendar-button"
        ),

        adminModal: document.getElementById("admin-modal"),
        adminPinForm: document.getElementById("admin-pin-form"),
        adminPinInput: document.getElementById("admin-pin"),
        adminPinMessage: document.getElementById(
            "admin-pin-message"
        ),
        openAdminButton: document.getElementById(
            "open-admin-button"
        ),
        adminSection: document.getElementById("admin-section"),
        lockAdminButton: document.getElementById(
            "lock-admin-button"
        ),

        documentModal: document.getElementById("document-modal"),
        documentModalTitle: document.getElementById(
            "document-modal-title"
        ),
        documentPreview: document.getElementById(
            "document-preview"
        ),
        documentModalActions: document.getElementById(
            "document-modal-actions"
        )
    };

    try {
        initialiseDashboard();
    } catch (error) {
        console.error(error);

        showFatalError(
            error instanceof Error
                ? error.message
                : "An unexpected error prevented the dashboard from starting."
        );
    }

    function initialiseDashboard() {
        validateConfiguration();
        renderCalendar();
        renderTimeline();
        initialiseCalendarControls();
        initialiseAdminGate();
        initialiseModalControls();
    }

    function validateConfiguration() {
        if (!config) {
            throw new Error(
                "The dashboard configuration could not be loaded. Check config.js."
            );
        }

        const requiredGitHubFields = [
            "username",
            "repository",
            "branch"
        ];

        const missingFields = requiredGitHubFields.filter((field) => {
            return !config.github?.[field];
        });

        if (missingFields.length > 0) {
            throw new Error(
                `Missing GitHub configuration: ${missingFields.join(", ")}`
            );
        }

        if (!Array.isArray(config.branches)) {
            throw new Error(
                "The branches configuration must be an array."
            );
        }

        if (!Array.isArray(config.calendarEvents)) {
            config.calendarEvents = [];
        }
    }

    function initialiseCalendarControls() {
        elements.previousMonthButton?.addEventListener(
            "click",
            () => {
                state.currentCalendarDate = new Date(
                    state.currentCalendarDate.getFullYear(),
                    state.currentCalendarDate.getMonth() - 1,
                    1
                );

                state.selectedCalendarDate = null;
                renderCalendar();
            }
        );

        elements.nextMonthButton?.addEventListener(
            "click",
            () => {
                state.currentCalendarDate = new Date(
                    state.currentCalendarDate.getFullYear(),
                    state.currentCalendarDate.getMonth() + 1,
                    1
                );

                state.selectedCalendarDate = null;
                renderCalendar();
            }
        );

        const scrollToCalendar = () => {
            elements.calendarSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        };

        elements.openCalendarButton?.addEventListener(
            "click",
            scrollToCalendar
        );

        elements.heroCalendarButton?.addEventListener(
            "click",
            scrollToCalendar
        );
    }

    function renderCalendar() {
        if (
            !elements.calendarDays ||
            !elements.calendarMonthLabel
        ) {
            return;
        }

        const year = state.currentCalendarDate.getFullYear();
        const month = state.currentCalendarDate.getMonth();

        elements.calendarMonthLabel.textContent =
            new Intl.DateTimeFormat("en-ZA", {
                month: "long",
                year: "numeric"
            }).format(state.currentCalendarDate);

        elements.calendarDays.innerHTML = "";

        const firstDayOfMonth = new Date(year, month, 1);
        const finalDayOfMonth = new Date(year, month + 1, 0);
        const leadingEmptyDays = firstDayOfMonth.getDay();
        const numberOfDays = finalDayOfMonth.getDate();

        for (
            let index = 0;
            index < leadingEmptyDays;
            index += 1
        ) {
            const emptyCell = document.createElement("span");
            emptyCell.className = "calendar-day is-empty";
            emptyCell.setAttribute("aria-hidden", "true");
            elements.calendarDays.appendChild(emptyCell);
        }

        for (let day = 1; day <= numberOfDays; day += 1) {
            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);
            const matchingEvents = getCalendarEvents(dateKey);

            const dayElement = document.createElement(
                matchingEvents.length > 0
                    ? "button"
                    : "span"
            );

            dayElement.className = "calendar-day";
            dayElement.textContent = String(day);
            dayElement.dataset.date = dateKey;

            if (matchingEvents.length > 0) {
                dayElement.type = "button";
                dayElement.classList.add("has-event");

                const eventNames = matchingEvents
                    .map((event) => event.title)
                    .join(", ");

                dayElement.title = eventNames;

                dayElement.setAttribute(
                    "aria-label",
                    `${formatReadableDate(date)}: ${eventNames}`
                );

                dayElement.addEventListener("click", () => {
                    state.selectedCalendarDate = dateKey;
                    renderCalendar();
                    displayCalendarEvents(dateKey);
                });
            } else {
                dayElement.setAttribute(
                    "aria-label",
                    formatReadableDate(date)
                );
            }

            if (isToday(date)) {
                dayElement.classList.add("is-today");
            }

            if (state.selectedCalendarDate === dateKey) {
                dayElement.classList.add("is-selected");
            }

            elements.calendarDays.appendChild(dayElement);
        }

        if (!state.selectedCalendarDate) {
            elements.calendarEventDetails.textContent =
                "Select a highlighted date to view its event.";
        }
    }

    function displayCalendarEvents(dateKey) {
        const events = getCalendarEvents(dateKey);

        if (events.length === 0) {
            elements.calendarEventDetails.textContent =
                "No dashboard events are scheduled for this date.";
            return;
        }

        const date = parseDateKey(dateKey);

        const eventMarkup = events
            .map((event) => {
                const branchName = getBranchTitle(event.branch);

                return `
                    <article class="calendar-event-entry">
                        <strong>
                            ${escapeHtml(event.title)}
                        </strong>

                        ${
                            branchName
                                ? `
                                    <span>
                                        ${escapeHtml(branchName)}
                                    </span>
                                `
                                : ""
                        }
                    </article>
                `;
            })
            .join("");

        elements.calendarEventDetails.innerHTML = `
            <div>
                <strong>
                    ${escapeHtml(formatReadableDate(date))}
                </strong>

                ${eventMarkup}
            </div>
        `;
    }

    function getCalendarEvents(dateKey) {
        return config.calendarEvents.filter((event) => {
            return event.date === dateKey;
        });
    }

    function getBranchTitle(branchId) {
        const branch = config.branches.find((item) => {
            return item.id === branchId;
        });

        return branch?.title || "";
    }

    function renderTimeline() {
        if (!elements.timelineContainer) {
            return;
        }

        elements.timelineContainer.innerHTML = "";

        if (config.branches.length === 0) {
            elements.timelineContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        No timeline branches have been configured.
                    </p>
                </div>
            `;
            return;
        }

        config.branches.forEach((branch) => {
            elements.timelineContainer.appendChild(
                createTimelineBranch(branch)
            );
        });
    }

    function createTimelineBranch(branch) {
        const section = document.createElement("section");

        section.className = "timeline-branch";
        section.dataset.branchId = branch.id;

        const items = Array.isArray(branch.items)
            ? branch.items
            : [];

        const teamsMarkup = createTeamsMarkup(
            branch.teams
        );

        section.innerHTML = `
            <div class="timeline-branch-marker">
                <img
                    src="${escapeAttribute(branch.image)}"
                    alt="${escapeAttribute(branch.title)} logo"
                    loading="lazy"
                >
            </div>

            <header class="timeline-branch-header">
                <h3>
                    ${escapeHtml(branch.title)}
                </h3>

                <span class="timeline-branch-subtitle">
                    ${escapeHtml(branch.subtitle || "")}
                </span>

                <p class="timeline-branch-description">
                    ${escapeHtml(branch.description || "")}
                </p>
            </header>

            ${teamsMarkup}

            <div class="timeline-items"></div>
        `;

        const itemsContainer = section.querySelector(
            ".timeline-items"
        );

        if (items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        No deliverables have been added
                        to this branch.
                    </p>
                </div>
            `;
        } else {
            items.forEach((item) => {
                itemsContainer.appendChild(
                    createTimelineCard(item)
                );
            });
        }

        return section;
    }

    function createTeamsMarkup(teams) {
        if (
            !Array.isArray(teams) ||
            teams.length === 0
        ) {
            return "";
        }

        const teamCards = teams
            .map((team) => {
                const members = Array.isArray(team.members)
                    ? team.members.filter(Boolean)
                    : [];

                const memberCountMarkup =
                    members.length > 0
                        ? `
                            <span class="team-count">
                                ${members.length}
                                member${
                                    members.length === 1
                                        ? ""
                                        : "s"
                                }
                            </span>
                        `
                        : "";

                const noteMarkup = team.note
                    ? `
                        <p class="team-note">
                            ${escapeHtml(team.note)}
                        </p>
                    `
                    : "";

                const membersMarkup =
                    members.length > 0
                        ? `
                            <div class="team-members">
                                ${members
                                    .map((member) => {
                                        return `
                                            <span class="team-member">
                                                ${escapeHtml(member)}
                                            </span>
                                        `;
                                    })
                                    .join("")}
                            </div>
                        `
                        : "";

                return `
                    <article class="team-card">
                        <div class="team-card-top">
                            <h4>
                                ${escapeHtml(
                                    team.title || "Team"
                                )}
                            </h4>

                            ${memberCountMarkup}
                        </div>

                        ${noteMarkup}
                        ${membersMarkup}
                    </article>
                `;
            })
            .join("");

        return `
            <section
                class="timeline-teams"
                aria-label="Indaba planning teams"
            >
                <div class="timeline-teams-header">
                    <div>
                        <h4>
                            Indaba planning teams
                        </h4>

                        <p>
                            Key teams involved in planning
                            and delivering the Energy Indaba.
                        </p>
                    </div>
                </div>

                <div class="team-grid">
                    ${teamCards}
                </div>
            </section>
        `;
    }

    function createTimelineCard(item) {
        const article = document.createElement("article");

        article.className = "timeline-card";
        article.dataset.folder = item.folder;

        const contentId = `${item.id}-documents`;
        const statusClass = getStatusClass(item.status);
        const statusLabel = getStatusLabel(item.status);

        article.innerHTML = `
            <button
                class="timeline-card-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="${escapeAttribute(contentId)}"
            >
                <span class="timeline-card-copy">
                    <span class="timeline-card-topline">
                        <span class="timeline-card-title">
                            ${escapeHtml(item.title)}
                        </span>

                        <span
                            class="status-badge ${statusClass}"
                        >
                            ${escapeHtml(statusLabel)}
                        </span>
                    </span>

                    <span class="timeline-card-description">
                        ${escapeHtml(item.description || "")}
                    </span>

                    <span class="timeline-card-date">
                        ${escapeHtml(item.dateLabel || "")}
                    </span>
                </span>

                <span
                    class="timeline-card-arrow"
                    aria-hidden="true"
                >
                    ↓
                </span>
            </button>

            <div
                class="timeline-card-content"
                id="${escapeAttribute(contentId)}"
                hidden
            ></div>
        `;

        const toggle = article.querySelector(
            ".timeline-card-toggle"
        );

        const content = article.querySelector(
            ".timeline-card-content"
        );

        toggle.addEventListener("click", async () => {
            const isOpen =
                article.classList.contains("is-open");

            if (isOpen) {
                closeTimelineCard(
                    article,
                    toggle,
                    content
                );
                return;
            }

            openTimelineCard(
                article,
                toggle,
                content
            );

            if (!content.dataset.loaded) {
                await loadFolderDocuments(
                    item.folder,
                    content
                );
            }
        });

        return article;
    }

    function openTimelineCard(
        article,
        toggle,
        content
    ) {
        article.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        content.hidden = false;
    }

    function closeTimelineCard(
        article,
        toggle,
        content
    ) {
        article.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        content.hidden = true;
    }

    async function loadFolderDocuments(
        folderPath,
        container
    ) {
        if (!folderPath) {
            container.innerHTML = `
                <div class="error-state">
                    <strong>
                        No folder has been configured.
                    </strong>

                    <p>
                        Add a valid folder path in config.js.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="loading-state">
                <span
                    class="loading-spinner"
                    aria-hidden="true"
                ></span>

                <p>Loading documents…</p>
            </div>
        `;

        try {
            let files;

            if (state.loadedFolders.has(folderPath)) {
                files = state.loadedFolders.get(folderPath);
            } else {
                files = await fetchGitHubFolder(
                    folderPath
                );

                state.loadedFolders.set(
                    folderPath,
                    files
                );
            }

            renderDocumentList(files, container);
            container.dataset.loaded = "true";
        } catch (error) {
            console.error(error);

            container.innerHTML = `
                <div class="error-state">
                    <strong>
                        Documents could not be loaded.
                    </strong>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                    <button
                        class="button button-secondary retry-folder-button"
                        type="button"
                    >
                        Try again
                    </button>
                </div>
            `;

            const retryButton =
                container.querySelector(
                    ".retry-folder-button"
                );

            retryButton?.addEventListener(
                "click",
                async () => {
                    state.loadedFolders.delete(
                        folderPath
                    );

                    delete container.dataset.loaded;

                    await loadFolderDocuments(
                        folderPath,
                        container
                    );
                }
            );
        }
    }

    async function fetchGitHubFolder(folderPath) {
        const username = encodeURIComponent(
            config.github.username
        );

        const repository = encodeURIComponent(
            config.github.repository
        );

        const branch = encodeURIComponent(
            config.github.branch
        );

        const encodedPath = folderPath
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");

        const apiUrl =
            `https://api.github.com/repos/${username}/${repository}` +
            `/contents/${encodedPath}?ref=${branch}`;

        const response = await fetch(apiUrl, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(
                    "The GitHub API rate limit may have been reached. Please try again later."
                );
            }

            if (response.status === 404) {
                throw new Error(
                    `The folder "${folderPath}" was not found. Check the spelling in config.js.`
                );
            }

            throw new Error(
                `GitHub returned an error with status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "The configured repository path is not a folder."
            );
        }

        return data
            .filter((item) => {
                return (
                    item.type === "file" &&
                    !item.name.startsWith(".")
                );
            })
            .sort((firstFile, secondFile) => {
                return firstFile.name.localeCompare(
                    secondFile.name,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );
            });
    }

    function renderDocumentList(files, container) {
        if (files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>
                        No documents uploaded yet.
                    </strong>

                    <p>
                        Add files to this folder in GitHub
                        and reload the dashboard.
                    </p>
                </div>
            `;
            return;
        }

        const list = document.createElement("div");
        list.className = "document-list";

        files.forEach((file) => {
            list.appendChild(
                createDocumentItem(file)
            );
        });

        container.innerHTML = "";
        container.appendChild(list);
    }

    function createDocumentItem(file) {
        const extension = getFileExtension(file.name);
        const previewSupported =
            canPreviewFile(extension);

        const item = document.createElement("article");

        item.className = "document-item";

        item.innerHTML = `
            <span
                class="document-icon"
                aria-hidden="true"
            >
                ${escapeHtml(
                    getFileIconLabel(extension)
                )}
            </span>

            <div class="document-info">
                <span
                    class="document-name"
                    title="${escapeAttribute(file.name)}"
                >
                    ${escapeHtml(
                        formatFileName(file.name)
                    )}
                </span>

                <span class="document-meta">
                    ${escapeHtml(
                        extension.toUpperCase() || "FILE"
                    )}
                    ·
                    ${escapeHtml(
                        formatFileSize(file.size)
                    )}
                </span>
            </div>

            <div class="document-actions">
                ${
                    previewSupported
                        ? `
                            <button
                                class="document-action preview-document-button"
                                type="button"
                            >
                                Preview
                            </button>
                        `
                        : ""
                }

                <a
                    class="document-action"
                    href="${escapeAttribute(
                        getPagesFileUrl(file.path)
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open
                </a>
            </div>
        `;

        const previewButton = item.querySelector(
            ".preview-document-button"
        );

        previewButton?.addEventListener(
            "click",
            () => {
                openDocumentPreview(file);
            }
        );

        return item;
    }

    function openDocumentPreview(file) {
        if (
            !elements.documentModal ||
            !elements.documentPreview ||
            !elements.documentModalActions
        ) {
            return;
        }

        const extension = getFileExtension(file.name);
        const githubUrl = file.html_url;
        const rawUrl = file.download_url;
        const displayName = formatFileName(file.name);
        const pagesFileUrl = getPagesFileUrl(file.path);

        elements.documentModalTitle.textContent =
            displayName;

        elements.documentPreview.innerHTML = "";
        elements.documentModalActions.innerHTML = "";

        if (isImageExtension(extension)) {
            const image = document.createElement("img");

            image.src = pagesFileUrl;
            image.alt = `Preview of ${displayName}`;
            image.loading = "eager";

            image.addEventListener("error", () => {
                showUnsupportedPreview(
                    "The image preview could not be loaded."
                );
            });

            elements.documentPreview.appendChild(image);
        } else if (extension === "pdf") {
            createPdfPreview(
                pagesFileUrl,
                displayName
            );
        } else if (isOfficeExtension(extension)) {
            createOfficePreview(
                pagesFileUrl,
                displayName
            );
        } else {
            showUnsupportedPreview(
                "This file type cannot be previewed directly."
            );
        }

        if (canPreviewFile(extension)) {
            addFullscreenPreviewAction();
        }

        addDocumentModalAction(
            "Open on GitHub",
            githubUrl
        );

        addDocumentModalAction(
            extension === "pdf"
                ? "Open PDF in new tab"
                : "Open document in new tab",
            pagesFileUrl
        );

        addDocumentModalAction(
            "Download original",
            rawUrl
        );

        showModal(elements.documentModal);
    }

    function getPagesFileUrl(filePath) {
        const cleanPath = String(filePath || "")
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");

        const currentPath = window.location.pathname;
        const repositoryRoot = currentPath.endsWith("/")
            ? currentPath
            : currentPath.substring(
                0,
                currentPath.lastIndexOf("/") + 1
            );

        return new URL(
            cleanPath,
            `${window.location.origin}${repositoryRoot}`
        ).href;
    }

    function createPdfPreview(
        pagesFileUrl,
        displayName
    ) {
        const objectElement =
            document.createElement("object");

        objectElement.data = pagesFileUrl;
        objectElement.type = "application/pdf";
        objectElement.setAttribute(
            "aria-label",
            `Preview of ${displayName}`
        );

        objectElement.style.width = "100%";
        objectElement.style.height = "70vh";
        objectElement.style.minHeight = "500px";

        objectElement.innerHTML = `
            <div class="document-preview-message">
                <p>
                    Your browser could not display this PDF inline.
                </p>

                <p>
                    Use “Open PDF in new tab” below.
                </p>
            </div>
        `;

        elements.documentPreview.appendChild(
            objectElement
        );
    }

    function createOfficePreview(
        pagesFileUrl,
        displayName
    ) {
        const iframe = document.createElement("iframe");

        iframe.src =
            "https://view.officeapps.live.com/op/embed.aspx?src=" +
            encodeURIComponent(pagesFileUrl);

        iframe.title = `Preview of ${displayName}`;
        iframe.loading = "eager";
        iframe.allowFullscreen = true;

        elements.documentPreview.appendChild(iframe);
    }

    function showUnsupportedPreview(message) {
        elements.documentPreview.innerHTML = `
            <div class="document-preview-message">
                <p>
                    ${escapeHtml(message)}
                </p>

                <p>
                    Use one of the buttons below to open
                    the original document.
                </p>
            </div>
        `;
    }

    function addFullscreenPreviewAction() {
        const button = document.createElement("button");

        button.className = "button button-primary";
        button.type = "button";
        button.textContent = "Full screen view";

        button.addEventListener("click", async () => {
            const target = elements.documentPreview;

            if (!target) {
                return;
            }

            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                    return;
                }

                if (target.requestFullscreen) {
                    await target.requestFullscreen();
                    return;
                }

                if (target.webkitRequestFullscreen) {
                    target.webkitRequestFullscreen();
                    return;
                }

                throw new Error(
                    "Fullscreen mode is not supported by this browser."
                );
            } catch (error) {
                console.error(
                    "Fullscreen preview failed:",
                    error
                );

                window.alert(
                    "Full-screen preview could not be opened. Use the open-file button instead."
                );
            }
        });

        elements.documentModalActions.appendChild(
            button
        );
    }

    function addDocumentModalAction(label, url) {
        if (!url) {
            return;
        }

        const link = document.createElement("a");

        link.className = "button button-secondary";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;

        elements.documentModalActions.appendChild(link);
    }

    function initialiseAdminGate() {
        const sessionKey =
            config.admin?.sessionKey ||
            "sergioDashboardAdminUnlocked";

        const isUnlocked =
            sessionStorage.getItem(sessionKey) === "true";

        if (isUnlocked) {
            unlockAdminSection(false);
        }

        elements.openAdminButton?.addEventListener(
            "click",
            () => {
                if (
                    sessionStorage.getItem(sessionKey) ===
                    "true"
                ) {
                    unlockAdminSection(true);
                    return;
                }

                elements.adminPinInput.value = "";
                elements.adminPinMessage.textContent = "";

                showModal(elements.adminModal);

                window.setTimeout(() => {
                    elements.adminPinInput?.focus();
                }, 50);
            }
        );

        elements.adminPinInput?.addEventListener(
            "input",
            () => {
                elements.adminPinInput.value =
                    elements.adminPinInput.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                elements.adminPinMessage.textContent = "";
            }
        );

        elements.adminPinForm?.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                const submittedPin =
                    elements.adminPinInput.value.trim();

                const configuredPin = String(
                    config.admin?.pin || ""
                );

                if (!/^\d{4}$/.test(submittedPin)) {
                    elements.adminPinMessage.textContent =
                        "Enter a valid four-digit PIN.";
                    return;
                }

                if (submittedPin !== configuredPin) {
                    elements.adminPinMessage.textContent =
                        "The PIN is incorrect.";

                    elements.adminPinInput.select();
                    return;
                }

                sessionStorage.setItem(
                    sessionKey,
                    "true"
                );

                closeModal(elements.adminModal);
                unlockAdminSection(true);
            }
        );

        elements.lockAdminButton?.addEventListener(
            "click",
            () => {
                sessionStorage.removeItem(sessionKey);

                elements.adminSection.hidden = true;

                elements.openAdminButton?.focus();
            }
        );
    }

    function unlockAdminSection(scrollIntoView) {
        if (!elements.adminSection) {
            return;
        }

        elements.adminSection.hidden = false;

        if (scrollIntoView) {
            elements.adminSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    function initialiseModalControls() {
        document
            .querySelectorAll("[data-close-modal]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    const modalId =
                        button.dataset.closeModal;

                    const modal =
                        document.getElementById(modalId);

                    closeModal(modal);
                });
            });

        document
            .querySelectorAll("dialog.modal")
            .forEach((modal) => {
                modal.addEventListener(
                    "click",
                    (event) => {
                        if (event.target === modal) {
                            closeModal(modal);
                        }
                    }
                );

                modal.addEventListener("close", () => {
                    document.body.classList.remove(
                        "modal-open"
                    );
                });

                modal.addEventListener(
                    "cancel",
                    () => {
                        document.body.classList.remove(
                            "modal-open"
                        );
                    }
                );
            });
    }

    function showModal(modal) {
        if (!modal) {
            return;
        }

        if (
            typeof modal.showModal === "function" &&
            !modal.open
        ) {
            modal.showModal();
        } else {
            modal.setAttribute("open", "");
        }

        document.body.classList.add("modal-open");
    }

    function closeModal(modal) {
        if (!modal) {
            return;
        }

        if (
            typeof modal.close === "function" &&
            modal.open
        ) {
            modal.close();
        } else {
            modal.removeAttribute("open");
        }

        document.body.classList.remove("modal-open");
    }

    function getStatusClass(status) {
        const classes = {
            upcoming: "status-upcoming",
            "in-progress": "status-in-progress",
            completed: "status-completed"
        };

        return classes[status] || classes.upcoming;
    }

    function getStatusLabel(status) {
        const labels = {
            upcoming: "Upcoming",
            "in-progress": "In progress",
            completed: "Completed"
        };

        return labels[status] || "Upcoming";
    }

    function getFileExtension(fileName) {
        const parts = String(fileName).split(".");

        if (parts.length < 2) {
            return "";
        }

        return parts.pop().toLowerCase();
    }

    function getFileIconLabel(extension) {
        const labels = {
            pdf: "PDF",
            doc: "DOC",
            docx: "DOC",
            xls: "XLS",
            xlsx: "XLS",
            ppt: "PPT",
            pptx: "PPT",
            png: "IMG",
            jpg: "IMG",
            jpeg: "IMG",
            gif: "IMG",
            webp: "IMG",
            svg: "SVG",
            txt: "TXT",
            csv: "CSV",
            zip: "ZIP"
        };

        return labels[extension] || "FILE";
    }

    function canPreviewFile(extension) {
        return [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "svg"
        ].includes(extension);
    }

    function isImageExtension(extension) {
        return [
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "svg"
        ].includes(extension);
    }

    function isOfficeExtension(extension) {
        return [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx"
        ].includes(extension);
    }

    function formatFileName(fileName) {
        return String(fileName)
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function formatFileSize(bytes) {
        const numberOfBytes = Number(bytes);

        if (
            !Number.isFinite(numberOfBytes) ||
            numberOfBytes <= 0
        ) {
            return "0 B";
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB"
        ];

        const unitIndex = Math.min(
            Math.floor(
                Math.log(numberOfBytes) /
                Math.log(1024)
            ),
            units.length - 1
        );

        const value =
            numberOfBytes /
            Math.pow(1024, unitIndex);

        const roundedValue =
            value >= 10 || unitIndex === 0
                ? value.toFixed(0)
                : value.toFixed(1);

        return `${roundedValue} ${units[unitIndex]}`;
    }

    function formatDateKey(date) {
        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function parseDateKey(dateKey) {
        const [year, month, day] = dateKey
            .split("-")
            .map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    function formatReadableDate(date) {
        return new Intl.DateTimeFormat(
            "en-ZA",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);
    }

    function isToday(date) {
        const today = new Date();

        return (
            date.getFullYear() ===
                today.getFullYear() &&
            date.getMonth() ===
                today.getMonth() &&
            date.getDate() ===
                today.getDate()
        );
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function showFatalError(message) {
        const main = document.querySelector("main");

        if (!main) {
            return;
        }

        main.innerHTML = `
            <section class="timeline-section">
                <div class="error-state">
                    <strong>
                        The dashboard could not start.
                    </strong>

                    <p>
                        ${escapeHtml(message)}
                    </p>
                </div>
            </section>
        `;
    }
});

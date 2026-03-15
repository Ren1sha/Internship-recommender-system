import "./style.css";
import { getProfileFromFirestore, logout } from "./firebase.js";
import { internshipsData } from "./data.js";
import { rankInternships } from "./matcher.js";
import { generateFeedback } from "./feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Auth & Profile Check
  const currentUserRaw = localStorage.getItem("currentUser");
  if (!currentUserRaw) {
    window.location.href = "/";
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  const displayName = currentUser.name || currentUser.email.split("@")[0];
  document.getElementById("user-display").textContent = displayName;
  document.getElementById("user-avatar").src =
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName)}`;

  // Theme Toggle Logic
  const themeToggle = document.getElementById("theme-toggle");
  const themeThumb = document.getElementById("theme-toggle-thumb");

  const updateThumbPosition = (isDark) => {
    if (isDark) {
      themeThumb.classList.remove("translate-x-1");
      themeThumb.classList.add("translate-x-6");
    } else {
      themeThumb.classList.remove("translate-x-6");
      themeThumb.classList.add("translate-x-1");
    }
  };

  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    updateThumbPosition(true);
  } else {
    updateThumbPosition(false);
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    updateThumbPosition(isDark);

    if (isDark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  document.getElementById("btn-logout").addEventListener("click", () => {
    logout();
  });

  const profile = await getProfileFromFirestore(currentUser.uid);
  if (!profile) {
    window.location.href = "/profile.html";
    return;
  }

  // 1. Core NLP Execution
  const rankedInternships = rankInternships(profile, internshipsData);

  // Update Global Top Score Display
  if (rankedInternships.length > 0) {
    const highestScore = Math.round(rankedInternships[0].matchScore * 100);
    document.getElementById("top-match-score").textContent = `${highestScore}%`;
  }

  // 2. Render Grid
  // 2. Render Grid Function
  const grid = document.getElementById("internship-grid");

  // Modal DOM Elements
  const modal = document.getElementById("feedback-modal");
  const modalContent = document.getElementById("modal-content");
  const missingPills = document.getElementById("missing-skills-pills");

  const openModal = () => {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100");
    modal.children[0].classList.replace("scale-95", "scale-100");
  };

  const closeModal = () => {
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.classList.remove("opacity-100");
    modal.children[0].classList.replace("scale-100", "scale-95");
  };

  document
    .getElementById("close-modal-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("close-modal-btn-bottom")
    .addEventListener("click", closeModal);

  const renderGrid = (internshipsToRender) => {
    grid.innerHTML = "";
    internshipsToRender.forEach((job) => {
      const card = document.createElement("div");
      card.className =
        "card flex flex-col hover:border-primary-200 hover:shadow-lg transition-all transform hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-primary-500 duration-300";

      const percentage = Math.round(job.matchScore * 100);

      // Determine Color based on Match Score
      let badgeColor = "bg-red-100 text-red-700";
      if (percentage > 70) badgeColor = "bg-emerald-100 text-emerald-800";
      else if (percentage > 40) badgeColor = "bg-amber-100 text-amber-800";

      card.innerHTML = `
        <div class="p-6 flex-1">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white leading-tight">${job.role}</h3>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">${job.company}</p>
            </div>
            <div class="px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm ${badgeColor} flex flex-col items-center">
              ${percentage}%
              <span class="text-[10px] uppercase tracking-wider opacity-80">Match</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${job.location}</span>
            <span>&bull;</span>
            <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${job.duration}</span>
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">${job.description}</p>
          
          <div class="flex flex-wrap gap-1.5 mb-2 mt-auto">
            ${job.requiredSkills.map((s) => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 rounded text-[11px] font-bold uppercase tracking-wide border border-slate-200 transition-colors duration-300">${s}</span>`).join("")}
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3 transition-colors duration-300">
          <button class="flex-1 btn-primary text-sm py-2" onclick="alert('Application Sent to ${job.company}')">Apply Now</button>
          <button class="feedback-trigger px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm focus:ring-2 focus:ring-primary-500" data-job-id="${job.id}">
            Get AI Feedback
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-bind AI Feedback button clicks after re-rendering
    document.querySelectorAll(".feedback-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const jobId = e.target.getAttribute("data-job-id");
        const job = internshipsToRender.find((j) => j.id === jobId);

        const feedback = generateFeedback(profile.skills, job.requiredSkills);

        modalContent.innerHTML = `<p>${feedback.message}</p>`;

        if (feedback.missing.length > 0) {
          missingPills.innerHTML = feedback.missing
            .map(
              (skill) =>
                `<span class="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              ${skill}
            </span>`,
            )
            .join("");
        } else {
          missingPills.innerHTML = `<span class="text-xs text-slate-500 italic">No missing skills! You're good to go.</span>`;
        }

        openModal();
      });
    });
  };

  // Initial Render
  renderGrid(rankedInternships);

  // Sorting Logic
  let currentSort = "relevance";
  const sortRelevanceBtn = document.getElementById("sort-relevance");
  const sortAlphaBtn = document.getElementById("sort-alpha");

  const updateSortUI = (activeBtn, inactiveBtn) => {
    activeBtn.className =
      "px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200 dark:bg-primary-900/40 dark:text-primary-400 dark:border-primary-800 transition-colors";
    inactiveBtn.className =
      "px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-transparent dark:text-slate-400 dark:hover:bg-slate-700 transition-colors";
  };

  sortRelevanceBtn.addEventListener("click", () => {
    if (currentSort === "relevance") return;
    currentSort = "relevance";
    updateSortUI(sortRelevanceBtn, sortAlphaBtn);

    const sorted = [...rankedInternships].sort(
      (a, b) => b.matchScore - a.matchScore,
    );
    renderGrid(sorted);
  });

  sortAlphaBtn.addEventListener("click", () => {
    if (currentSort === "alphabetical") return;
    currentSort = "alphabetical";
    updateSortUI(sortAlphaBtn, sortRelevanceBtn);

    // Sort ascending by role string
    const sorted = [...rankedInternships].sort((a, b) =>
      a.role.localeCompare(b.role),
    );
    renderGrid(sorted);
  });
});

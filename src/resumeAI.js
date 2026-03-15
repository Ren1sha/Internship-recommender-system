import "./style.css";
import {
  getProfileFromFirestore,
  logout,
  saveProfileToFirestore,
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Auth & Data Fetching
  const currentUserRaw = localStorage.getItem("currentUser");
  if (!currentUserRaw) {
    window.location.href = "/";
    return;
  }
  const currentUser = JSON.parse(currentUserRaw);

  document.getElementById("btn-logout").addEventListener("click", () => {
    logout();
  });

  const profile = await getProfileFromFirestore(currentUser.uid);
  if (!profile) {
    window.location.href = "/profile.html";
    return;
  }

  // 2. Populate Profile UI
  const displayName = currentUser.name || currentUser.email.split("@")[0];
  document.getElementById("profile-email").textContent = displayName;
  document.getElementById("user-avatar-nav").src =
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName)}`;
  document.getElementById("user-avatar-large").src =
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName)}`;
  document.getElementById("user-display").textContent = displayName;

  document.getElementById("profile-college").textContent =
    profile.academic.college;
  document.getElementById("profile-dept-year").textContent =
    `${profile.academic.department}, Year ${profile.academic.year}`;

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

  const skillsContainer = document.getElementById("profile-skills-container");

  const renderSkills = () => {
    skillsContainer.innerHTML = "";
    profile.skills.forEach((skill) => {
      const span = document.createElement("span");
      span.className =
        "px-2.5 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 rounded-md text-[11px] font-bold uppercase tracking-wide border border-primary-100 dark:border-primary-800 transition-colors duration-300";
      span.textContent = skill;
      skillsContainer.appendChild(span);
    });
  };

  renderSkills();

  // Add Skill Logic
  const addSkillForm = document.getElementById("add-skill-form");
  const newSkillInput = document.getElementById("new-skill-input");

  addSkillForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newSkill = newSkillInput.value.trim();
    if (
      newSkill &&
      !profile.skills
        .map((s) => s.toLowerCase())
        .includes(newSkill.toLowerCase())
    ) {
      profile.skills.push(newSkill);
      renderSkills();
      newSkillInput.value = "";
      // Persist to Mock Firestore
      await saveProfileToFirestore(currentUser.uid, profile);
    }
  });

  // 3. Resume Upload UI State Logic
  let resumeUploaded = false;
  const dropzone = document.getElementById("resume-dropzone");
  const fileInput = document.getElementById("resume-file-input");
  const btnBrowse = document.getElementById("btn-browse-resume");
  const statusCard = document.getElementById("resume-status-card");
  const chatInput = document.getElementById("chat-input");
  const chatSubmit = document.getElementById("chat-submit");
  const chatStatusText = document.getElementById("chat-status-text");

  const handleUpload = () => {
    // Simulate upload delay
    dropzone.innerHTML = `<div class="py-6 text-center animate-pulse text-sm font-semibold text-primary-600">Analyzing Document via NLP...</div>`;

    setTimeout(() => {
      resumeUploaded = true;
      dropzone.classList.add("hidden");
      statusCard.classList.remove("hidden");
      statusCard.classList.add("flex");

      // Unlock Chat
      chatInput.disabled = false;
      chatSubmit.disabled = false;
      chatInput.placeholder = "Type your question here...";
      chatStatusText.textContent = "AI Engine Active - Context Linked";
      chatStatusText.classList.replace("text-slate-400", "text-emerald-500");

      // Add initial AI analysis message
      appendAIMessage(
        `**Resume Parsed Successfully!**\n\nI noticed you have strong skills in ${profile.skills.slice(0, 3).join(", ")}. However, your resume currently lacks measurable impact metrics.\n\nTry asking me: *"How can I improve my project bullet points?"* or *"Write a summary section for my profile."*`,
      );
    }, 1500);
  };

  dropzone.addEventListener("click", () => fileInput.click());
  btnBrowse.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) handleUpload();
  });

  // Drag and Drop Handlers
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-primary-500", "bg-primary-50");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("border-primary-500", "bg-primary-50");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-primary-500", "bg-primary-50");
    if (e.dataTransfer.files.length > 0) handleUpload();
  });

  // 4. Chat Interface Logic
  const chatHistory = document.getElementById("chat-history");
  const chatForm = document.getElementById("chat-form");

  // Utility to scroll to bottom
  const scrollToBottom = () => {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  const appendUserMessage = (text) => {
    const div = document.createElement("div");
    div.className = "flex items-start gap-4 flex-row-reverse animate-fade-in";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-slate-800 text-white dark:bg-slate-700 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-xs font-bold transition-colors duration-300">
        ME
      </div>
      <div class="bg-primary-600 border border-primary-700 dark:bg-primary-700 dark:border-primary-800 rounded-2xl p-4 text-sm text-white shadow-sm max-w-[85%] leading-relaxed rounded-tr-none transition-colors duration-300">
        <p>${text}</p>
      </div>
    `;
    chatHistory.appendChild(div);
    scrollToBottom();
  };

  const appendAIMessage = (text) => {
    // Basic Markdown Simulation (bolding)
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-800">$1</em>')
      .replace(/\n/g, "<br/>");

    const div = document.createElement("div");
    div.className = "flex items-start gap-4 animate-fade-in";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-primary-200">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 shadow-sm max-w-[85%] leading-relaxed rounded-tl-none">
        <p>${formattedText}</p>
      </div>
    `;
    chatHistory.appendChild(div);
    scrollToBottom();
  };

  const simulateAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    let response = "";

    const userSkills =
      profile.skills.length > 0 ? profile.skills : ["your skills"];
    const primarySkill = userSkills[0].toUpperCase();

    // Advanced Simulated Intents Mapping
    if (
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hey")
    ) {
      response = `Hello! I'm ready to help you optimize your resume. Since you are studying ${profile.academic.department}, we should focus on technical achievements. What section do you want to work on first?`;
    } else if (
      lowerMsg.includes("bullet") ||
      lowerMsg.includes("project") ||
      lowerMsg.includes("experience")
    ) {
      response = `Instead of saying "Built a project using ${primarySkill}", use the **Action-Context-Result** framework:\n\n* "Developed a scalable backend service using **${primarySkill}**, optimizing database queries which reduced data retrieval time by 30%."*\n\nAlways quantify your achievements! Want another example for ${userSkills[1] || "another skill"}?`;
    } else if (
      lowerMsg.includes("summary") ||
      lowerMsg.includes("objective") ||
      lowerMsg.includes("about")
    ) {
      response = `Here is a strong, ATS-friendly summary tailored to your profile:\n\n*"Motivated ${profile.academic.year} Year ${profile.academic.department} student at ${profile.academic.college} with strong foundational knowledge in ${userSkills.join(", ")}. Seeking a challenging internship to leverage my problem-solving abilities and contribute to scalable architecture."*\n\nHow does that look?`;
    } else if (
      lowerMsg.includes("skill") ||
      lowerMsg.includes("tech") ||
      lowerMsg.includes("tools")
    ) {
      response = `You have listed: **${userSkills.join(", ")}**.\n\nMake sure these aren't just in a list! You need to prove them. For example, if you list ${primarySkill}, you should have a project bullet point that explicitly states *how* you used ${primarySkill} to solve a problem.`;
    } else if (
      lowerMsg.includes("education") ||
      lowerMsg.includes("college") ||
      lowerMsg.includes("degree")
    ) {
      response = `Since you are currently at **${profile.academic.college}**, put your Education section at the TOP of your resume until you graduate. Include relevant coursework related to ${profile.academic.department} and your expected graduation date.`;
    } else if (
      lowerMsg.includes("tailor") ||
      lowerMsg.includes("match") ||
      lowerMsg.includes("apply")
    ) {
      response = `To tailor your resume, you need to match the job description. If a job asks for ${primarySkill}, ensure that word appears exactly as written in your resume at least twice. I can help you rewrite a bullet point to fit a specific job description if you paste it here!`;
    } else if (lowerMsg.includes("thank") || lowerMsg.includes("thanks")) {
      response = `You're welcome! Let me know if you need help polishing any other sections before you start applying.`;
    } else {
      // Dynamic Fallback: Try to use the user's own words against their profile
      const words = lowerMsg.split(" ").filter((w) => w.length > 4);
      const focusWord =
        words.length > 0
          ? words[Math.floor(Math.random() * words.length)]
          : "that topic";

      response = `Regarding "${focusWord}", the best approach for a ${profile.academic.department} major is to be specific. Avoid generic terms. Since you want an internship utilizing ${userSkills.slice(0, 2).join(" and ")}, make sure your points about ${focusWord} clearly demonstrate your technical impact.`;
    }

    // Add typing delay to simulate "thinking"
    setTimeout(() => {
      appendAIMessage(response);
    }, 1000);
  };

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!resumeUploaded) return;

    const val = chatInput.value.trim();
    if (val) {
      appendUserMessage(val);
      chatInput.value = "";

      // Keep focus on input for rapid chatting
      chatInput.focus();

      // Trigger AI
      simulateAIResponse(val);
    }
  });
});

import './style.css';
import { internshipsData, getCompanyLogoColor } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const themeThumb = document.getElementById('theme-toggle-thumb');

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

  // Get internship ID from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const internshipId = urlParams.get('id') || localStorage.getItem('selectedInternshipId');

  if (!internshipId) {
    window.location.href = '/dashboard.html';
    return;
  }

  // Find the internship
  const internship = internshipsData.find(i => i.id === internshipId);

  if (!internship) {
    window.location.href = '/dashboard.html';
    return;
  }

  // Helper function to create skill badges
  const createSkillBadges = (skills) => {
    return skills.map(skill => `
      <span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold">
        ${skill}
      </span>
    `).join('');
  };

  // Helper function to create perk badges
  const createPerkBadges = (perks) => {
    const perkList = perks.split(', ');
    return perkList.map(perk => `
      <span class="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold">
        ${perk}
      </span>
    `).join('');
  };

  // Populate the page
  document.getElementById('role-title').textContent = internship.role;
  document.getElementById('company-name').textContent = internship.company;
  document.getElementById('company-name-sidebar').textContent = internship.company;
  document.getElementById('location').textContent = internship.location;
  document.getElementById('start-date').textContent = internship.startDate;
  document.getElementById('duration').textContent = internship.duration;
  document.getElementById('stipend').textContent = internship.stipend;
  document.getElementById('apply-by').textContent = internship.applyBy;
  document.getElementById('posted-ago').textContent = internship.postedAgo;
  document.getElementById('internship-type').textContent = internship.type;
  document.getElementById('applicants').textContent = `${internship.applicants} applicants`;

  // Company logo - using colored gradient with initials
  const logoDiv = document.getElementById('company-logo');
  const initials = internship.company.split(' ').map(w => w[0]).join('');
  const colorGradient = getCompanyLogoColor(internship.company);
  logoDiv.className = `w-16 h-16 rounded-lg bg-gradient-to-br ${colorGradient} flex items-center justify-center text-white font-bold text-xl shadow-md`;
  logoDiv.textContent = initials;

  // Content sections
  document.getElementById('about-internship').textContent = internship.aboutInternship;
  document.getElementById('skills-required').innerHTML = createSkillBadges(internship.skillsRequired);
  document.getElementById('who-can-apply').textContent = internship.whoCan;
  document.getElementById('other-requirements').textContent = internship.otherRequirements;
  document.getElementById('perks').innerHTML = createPerkBadges(internship.perks);
  document.getElementById('openings-count').textContent = `${internship.openings} opening${internship.openings > 1 ? 's' : ''}`;

  // Company section
  document.getElementById('company-about').textContent = internship.companyAbout;
  document.getElementById('company-website').href = `https://${internship.companyWebsite}`;
  document.getElementById('company-website').textContent = internship.companyWebsite;
  
  document.getElementById('hiring-info').innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    <span>${internship.hiringInfo}</span>
  `;

  document.getElementById('opportunities-info').innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
    <span>${internship.applicants} applicants</span>
  `;

  // Bottom section - Company info
  document.getElementById('company-name-bottom').textContent = internship.company;
  document.getElementById('company-about-bottom').textContent = internship.companyAbout;
  document.getElementById('company-website-bottom').href = `https://${internship.companyWebsite}`;
  document.getElementById('company-website-bottom').textContent = internship.companyWebsite;

  document.getElementById('hiring-info-bottom').innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    <span>${internship.hiringInfo}</span>
  `;

  document.getElementById('opportunities-info-bottom').innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
    <span>${internship.applicants} applicants</span>
  `;

  // Back button from navbar
  document.getElementById('btn-back-nav').addEventListener('click', () => {
    window.location.href = '/dashboard.html';
  });

  // Apply buttons (top and bottom)
  const applyHandler = () => {
    alert(`Application sent to ${internship.company} for ${internship.role}!`);
  };

  document.getElementById('apply-btn').addEventListener('click', applyHandler);
  document.getElementById('apply-btn-bottom').addEventListener('click', applyHandler);
});

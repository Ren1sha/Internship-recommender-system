import './style.css';
import { saveProfileToFirestore } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Authentication Check
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    window.location.href = '/';
    return;
  }
  const currentUser = JSON.parse(currentUserRaw);

  // UI Elements
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const progressBar = document.getElementById('progress-bar');
  
  const btnNext1 = document.getElementById('btn-next-1');
  const btnBack2 = document.getElementById('btn-back-2');
  const btnSubmit = document.getElementById('btn-submit');

  const skillInput = document.getElementById('skill-input');
  const skillsContainer = document.getElementById('skills-container');
  
  // Data State
  let skillsList = [];

  // Functions for Skill Tags
  const renderSkills = () => {
    skillsContainer.innerHTML = '';
    skillsList.forEach((skill, index) => {
      const tag = document.createElement('div');
      tag.className = 'flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold border border-primary-100';
      tag.innerHTML = `
        ${skill}
        <button type="button" class="hover:text-primary-900 focus:outline-none" data-index="${index}">&times;</button>
      `;
      skillsContainer.appendChild(tag);
    });

    // Add delete listeners
    skillsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        skillsList.splice(idx, 1);
        renderSkills();
      });
    });
  };

  const addSkill = (val) => {
    const cleaned = val.trim();
    if (cleaned && !skillsList.includes(cleaned.toLowerCase())) {
      skillsList.push(cleaned.toLowerCase());
      renderSkills();
    }
    skillInput.value = '';
  };

  skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput.value);
    }
  });

  skillInput.addEventListener('blur', () => {
    addSkill(skillInput.value);
  });

  // Navigation Logic
  btnNext1.addEventListener('click', () => {
    // Basic validation
    const college = document.getElementById('college').value.trim();
    const dept = document.getElementById('department').value;
    const year = document.getElementById('year').value;
    
    if(!college || !dept || !year) {
      alert("Please fill in all required academic details.");
      return;
    }

    step1.classList.add('hidden');
    step1.classList.remove('block');
    step2.classList.remove('hidden');
    step2.classList.add('block');
    progressBar.style.width = '100%';
  });

  btnBack2.addEventListener('click', () => {
    step2.classList.add('hidden');
    step2.classList.remove('block');
    step1.classList.remove('hidden');
    step1.classList.add('block');
    progressBar.style.width = '50%';
  });

  // Submit Logic
  btnSubmit.addEventListener('click', async () => {
    if(skillsList.length < 3) {
      alert("Please add at least 3 technical skills to power the AI engine.");
      return;
    }

    const locations = Array.from(document.querySelectorAll('.location-check:checked')).map(cb => cb.value);
    
    const profileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      academic: {
        college: document.getElementById('college').value.trim(),
        department: document.getElementById('department').value,
        year: parseInt(document.getElementById('year').value),
        cgpa: parseFloat(document.getElementById('cgpa').value) || null
      },
      skills: skillsList,
      preferences: {
        locations: locations
      },
      bio: document.getElementById('bio').value.trim(),
      createdAt: new Date().toISOString()
    };

    btnSubmit.disabled = true;
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span class="animate-pulse">Saving Profile...</span>';

    try {
      await saveProfileToFirestore(currentUser.uid, profileData);
      window.location.href = '/dashboard.html';
    } catch(err) {
      alert("Error saving profile");
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  });
});

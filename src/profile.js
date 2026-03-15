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
  const suggestionsDropdown = document.getElementById('suggestions-dropdown');
  const suggestionsList = document.getElementById('suggestions-list');
  
  // Data State
  let skillsList = [];
  let selectedSuggestionIndex = -1;

  // Comprehensive list of technical skills
  const commonSkills = [
    'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'PHP', 'Swift',
    'Kotlin', 'Ruby', 'R', 'MATLAB', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
    'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'React Native', 'Flutter', 'SwiftUI',
    'Node.js', 'Django', 'Flask', 'Spring', 'FastAPI', 'Express.js', '.NET', 'ASP.NET',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Sass', 'LESS', 'Material UI', 'Ant Design',
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Heroku',
    'REST API', 'GraphQL', 'WebSocket', 'Socket.io', 'OAuth', 'JWT', 'Linux', 'Ubuntu', 'Windows',
    'MacOS', 'Apache', 'Nginx', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Trello',
    'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'UI/UX Design',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras',
    'NLP', 'Computer Vision', 'OpenCV', 'Data Science', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'AutoCAD', 'SolidWorks', 'CAD', 'Blender', '3D Modeling', 'Unity', 'Unreal Engine', 'Game Development',
    'Android', 'iOS', 'Cross-platform', 'Mobile Development', 'Web Development', 'Backend Development',
    'Frontend Development', 'Full Stack', 'Data Engineering', 'DevOps', 'Cloud Computing',
    'Blockchain', 'Web3', 'Ethereum', 'Smart Contracts', 'IoT', 'Embedded Systems', 'Arduino',
    'Raspberry Pi', 'Microservices', 'Serverless', 'Excel', 'Tableau', 'Power BI', 'Looker',
    'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Teamwork',
    'Project Management', 'Debugging', 'Testing', 'QA', 'SEO', 'Marketing', 'Sales'
  ];

  // Functions for Skill Suggestions
  const filterSuggestions = (input) => {
    const lowerInput = input.toLowerCase().trim();
    if (lowerInput.length === 0) return [];
    
    return commonSkills.filter(skill => 
      skill.toLowerCase().includes(lowerInput) && 
      !skillsList.includes(skill.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  };

  const renderSuggestions = (suggestions) => {
    suggestionsList.innerHTML = '';
    selectedSuggestionIndex = -1;

    if (suggestions.length === 0) {
      suggestionsDropdown.classList.add('hidden');
      return;
    }

    suggestions.forEach((skill, index) => {
      const div = document.createElement('div');
      div.className = 'px-4 py-2.5 cursor-pointer text-sm font-medium text-slate-700 hover:bg-primary-100 hover:text-primary-700 transition-colors suggestion-item';
      div.innerHTML = skill;
      div.setAttribute('data-skill', skill);
      
      // Use mousedown with preventDefault to keep focus on input
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        addSkill(skill);
        skillInput.value = '';
        skillInput.focus();
        suggestionsDropdown.classList.add('hidden');
      });

      div.addEventListener('mouseover', () => {
        document.querySelectorAll('.suggestion-item').forEach(el => el.classList.remove('bg-primary-100', 'text-primary-700'));
        div.classList.add('bg-primary-100', 'text-primary-700');
        selectedSuggestionIndex = index;
      });

      div.addEventListener('mouseout', () => {
        div.classList.remove('bg-primary-100', 'text-primary-700');
      });

      suggestionsList.appendChild(div);
    });

    suggestionsDropdown.classList.remove('hidden');
  };

  skillInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length === 0) {
      suggestionsDropdown.classList.add('hidden');
      return;
    }
    const suggestions = filterSuggestions(value);
    renderSuggestions(suggestions);
  });

  skillInput.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.suggestion-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
        items.forEach(el => el.classList.remove('bg-primary-100', 'text-primary-700'));
        items[selectedSuggestionIndex].classList.add('bg-primary-100', 'text-primary-700');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        selectedSuggestionIndex = selectedSuggestionIndex <= 0 ? items.length - 1 : selectedSuggestionIndex - 1;
        items.forEach(el => el.classList.remove('bg-primary-100', 'text-primary-700'));
        items[selectedSuggestionIndex].classList.add('bg-primary-100', 'text-primary-700');
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
        addSkill(items[selectedSuggestionIndex].getAttribute('data-skill'));
      } else if (skillInput.value.trim()) {
        addSkill(skillInput.value);
      }
      skillInput.value = '';
      suggestionsDropdown.classList.add('hidden');
    } else if (e.key === ',') {
      e.preventDefault();
      if (skillInput.value.trim()) {
        addSkill(skillInput.value);
      }
      skillInput.value = '';
      suggestionsDropdown.classList.add('hidden');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#skill-input') && !e.target.closest('#suggestions-list')) {
      suggestionsDropdown.classList.add('hidden');
    }
  });

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
    if (cleaned && !skillsList.map(s => s.toLowerCase()).includes(cleaned.toLowerCase())) {
      skillsList.push(cleaned.toLowerCase());
      renderSkills();
    }
  };

  skillInput.addEventListener('blur', () => {
    setTimeout(() => {
      const value = skillInput.value.trim();
      if (value.length > 0) {
        addSkill(value);
        skillInput.value = '';
      }
      suggestionsDropdown.classList.add('hidden');
    }, 100);
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

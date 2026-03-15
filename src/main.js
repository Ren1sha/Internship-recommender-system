import './style.css';
import { simulateAuth } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSwitchText = document.getElementById('auth-switch-text');
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  const nameGroup = document.getElementById('name-group');
  const nameInput = document.getElementById('name');
  
  let isLoginMode = false;

  // Toggle between Login and Signup modes
  authToggleBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      authTitle.textContent = 'Welcome Back';
      authSubtitle.textContent = 'Enter your details to access your dashboard.';
      authSubmitBtn.textContent = 'Log In';
      authSwitchText.textContent = "Don't have an account?";
      authToggleBtn.textContent = 'Sign up';
      nameGroup.style.maxHeight = '0';
      nameGroup.style.opacity = '0';
      nameInput.removeAttribute('required');
    } else {
      authTitle.textContent = 'Create Account';
      authSubtitle.textContent = 'Join thousands of students finding their path.';
      authSubmitBtn.textContent = 'Sign Up';
      authSwitchText.textContent = 'Already have an account?';
      authToggleBtn.textContent = 'Log in';
      nameGroup.style.maxHeight = '100px';
      nameGroup.style.opacity = '1';
      nameInput.setAttribute('required', 'true');
    }
  });

  // Handle Form Submission
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if(!email || !password || (!isLoginMode && !name)) return;

    // Simulate authentication processing
    authSubmitBtn.disabled = true;
    const originalText = authSubmitBtn.textContent;
    authSubmitBtn.innerHTML = '<span class="animate-pulse">Processing...</span>';

    try {
      const user = await simulateAuth(email, password, isLoginMode, name);
      
      // If successful, check if user profile exists (to redirect to dashboard or profile setup)
      const cachedProfile = localStorage.getItem(`profile_${user.uid}`);
      if (cachedProfile) {
        window.location.href = '/dashboard.html';
      } else {
        window.location.href = '/profile.html';
      }
    } catch (error) {
      alert(error.message);
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = originalText;
    }
  });

  // Check if already logged in
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    const cachedProfile = localStorage.getItem(`profile_${user.uid}`);
    if (cachedProfile) {
      window.location.href = '/dashboard.html';
    } else {
      window.location.href = '/profile.html';
    }
  }
});

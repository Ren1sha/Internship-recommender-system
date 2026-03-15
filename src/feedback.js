/**
 * AI-Powered Feedback Module
 * Analyzes a student's skills against an internship's requirements to generate
 * personalized feedback. Explains why an internship might not be a perfect match
 * and outlines exact skills to improve.
 */

export const generateFeedback = (studentSkills, internshipReqs) => {
  if (!studentSkills || !internshipReqs) return "Unable to generate feedback.";

  const studentSet = new Set(studentSkills.map(s => s.toLowerCase().trim()));
  const reqSet = new Set(internshipReqs.map(s => s.toLowerCase().trim()));

  const missingSkills = [];
  const matchingSkills = [];

  reqSet.forEach(skill => {
    if (studentSet.has(skill)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Feedback Generation Logic Template
  let feedback = "";
  
  if (missingSkills.length === 0) {
    feedback = `<strong>Excellent Match!</strong> You currently possess all exactly required core skills (${matchingSkills.join(', ')}). Your profile is highly competitive for this role. Consider highlighting these on your resume.`;
  } else if (matchingSkills.length === 0) {
    feedback = `<strong>Low Match Detected:</strong> You are missing major foundational skills for this specific role. You must learn <strong>${missingSkills.slice(0, 3).join(', ')}</strong> to be considered. We recommend looking for internships closer to your current domain.`;
  } else {
    feedback = `<strong>Partial Match:</strong> While you have a good grasp of <strong>${matchingSkills.join(', ')}</strong>, the employer heavily relies on additional tools. <br/><br/>`;
    feedback += `<strong>AI Recommendation:</strong> To dramatically improve your chances of placement, focus your upskilling efforts on: <span class="text-primary-600 font-bold">${missingSkills.join(', ')}</span>. Consider taking a short certification course in these areas next semester.`;
  }

  return {
    missing: missingSkills,
    matching: matchingSkills,
    message: feedback
  };
};

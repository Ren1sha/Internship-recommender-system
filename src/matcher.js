/**
 * NLP Core Engine: Similarity Matcher
 * 
 * Uses mathematical textual similarity approaches:
 * - Jaccard Index (Intersection over Union for sets of skills)
 * 
 * In a real backend, this would utilize more complex NLP embeddings (like word2vec or BERT),
 * but for this architecture, Jaccard Similarity applied over pre-processed arrays provides 
 * a Fast Content-Based Filtering approach.
 */

/**
 * Calculates Jaccard Similarity between two arrays of strings.
 * Score is between 0 (no match) and 1 (perfect match).
 */
export const calculateJaccardSimilarity = (studentSkills, requiredSkills) => {
  if (!studentSkills || !requiredSkills || studentSkills.length === 0 || requiredSkills.length === 0) {
    return 0;
  }

  // Preprocess: Lowercase and strip whitespace to simulate robust tokenization
  const tokenize = (arr) => arr.map(s => s.toLowerCase().trim());
  
  const setA = new Set(tokenize(studentSkills));
  const setB = new Set(tokenize(requiredSkills));

  // Intersection: Skills present in both sets
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  
  // Union: All unique skills combined
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
};

/**
 * Ranks all available internships against a student's profile profile.
 * Applies the Similarity matching and sorts by descending relevance score.
 */
export const rankInternships = (studentProfile, internships) => {
  const studentSkills = studentProfile.skills || [];
  
  const ranked = internships.map(internship => {
    // 1. Calculate base NLP textual skill match
    const skillScore = calculateJaccardSimilarity(studentSkills, internship.requiredSkills);
    
    // 2. Weights & Preferences
    // If we wanted to add a Location Weight, we could adjust the score here:
    let locationBonus = 0;
    const sLocs = studentProfile.preferences?.locations || [];
    
    // If internship location matches preferred location or remote
    if (sLocs.includes(internship.location) || (internship.type === 'Remote' && sLocs.includes('Remote'))) {
      locationBonus = 0.15; // 15% bump for perfect location match
    }

    // 3. Final Relevance Score (Capped at 1.0 -> 100%)
    const finalScore = Math.min(1.0, skillScore + locationBonus);

    return {
      ...internship,
      matchScore: finalScore,
      skillScore: skillScore // Keep raw skill score for the Feedback module
    };
  });

  // Sort descending by matchScore
  return ranked.sort((a, b) => b.matchScore - a.matchScore);
};

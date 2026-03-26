const express = require('express');
const router = express.Router();

// Mock AI service for demonstration
// In production, you would integrate with OpenAI, Claude, or other AI services
const getAICorrection = async (question, options, subject, description = '') => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock AI analysis based on subject and question content
  const analysis = {
    confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
    reasoning: '',
    correctAnswer: null,
    explanation: ''
  };

  // If no options (like Q&A questions), provide guidance instead of selecting an answer
  const hasOptions = options && options.length > 0;

  if (!hasOptions) {
    // For open-ended questions, provide analysis and guidance
    analysis.correctAnswer = -1; // Indicates no specific answer
    analysis.confidence = Math.floor(Math.random() * 15) + 70; // 70-84% confidence for open-ended
    
    const questionLower = question.toLowerCase();
    const descLower = description.toLowerCase();
    const fullText = (question + ' ' + description).toLowerCase();
    
    if (subject.toLowerCase().includes('math') || fullText.includes('calculate') || fullText.includes('solve') || fullText.includes('equation')) {
      analysis.reasoning = 'This appears to be a mathematical problem requiring step-by-step calculation.';
      analysis.explanation = 'The AI suggests breaking down the problem into smaller steps and applying relevant mathematical formulas. Consider showing your work and verifying each step.';
    } else if (subject.toLowerCase().includes('science') || fullText.includes('experiment') || fullText.includes('theory') || fullText.includes('hypothesis')) {
      analysis.reasoning = 'This is a science-related question that may require understanding of scientific principles.';
      analysis.explanation = 'The AI recommends reviewing relevant scientific concepts, considering experimental methods, and applying logical reasoning based on scientific principles.';
    } else if (subject.toLowerCase().includes('computer') || fullText.includes('code') || fullText.includes('algorithm') || fullText.includes('programming')) {
      analysis.reasoning = 'This appears to be a computer science or programming question.';
      analysis.explanation = 'The AI suggests considering algorithmic efficiency, code structure, and best practices. Think about edge cases and test your solution thoroughly.';
    } else {
      analysis.reasoning = 'This is an open-ended question that requires critical thinking and analysis.';
      analysis.explanation = 'The AI recommends carefully reading the question, identifying key concepts, and providing a well-structured answer with relevant examples and evidence.';
    }
    
    return analysis;
  }

  // Original logic for multiple choice questions
  // Simple heuristic-based AI simulation for different subjects
  if (subject.toLowerCase().includes('math') || question.toLowerCase().includes('calculate') || question.toLowerCase().includes('solve')) {
    // For math questions, typically the most complex answer is correct
    const mathKeywords = ['equation', 'formula', 'calculate', 'solve', 'compute'];
    const hasMathKeywords = mathKeywords.some(keyword => question.toLowerCase().includes(keyword));
    
    if (hasMathKeywords) {
      // Find the option with numbers and mathematical operations
      const mathOption = options.findIndex(opt => 
        /\d+/.test(opt) && (opt.includes('+') || opt.includes('-') || opt.includes('*') || opt.includes('/') || opt.includes('='))
      );
      
      if (mathOption !== -1) {
        analysis.correctAnswer = mathOption;
        analysis.reasoning = `Based on mathematical analysis, option ${mathOption + 1} contains the correct numerical solution.`;
        analysis.explanation = 'The AI analyzed the mathematical structure and identified the correct calculation.';
      }
    }
  } else if (subject.toLowerCase().includes('science') || subject.toLowerCase().includes('physics') || subject.toLowerCase().includes('chemistry')) {
    // For science questions, look for scientific terminology
    const scienceTerms = ['electron', 'proton', 'neutron', 'molecule', 'atom', 'energy', 'force', 'gravity'];
    const scienceOption = options.findIndex(opt => 
      scienceTerms.some(term => opt.toLowerCase().includes(term))
    );
    
    if (scienceOption !== -1) {
      analysis.correctAnswer = scienceOption;
      analysis.reasoning = `Scientific analysis indicates option ${scienceOption + 1} contains the correct scientific concept.`;
      analysis.explanation = 'The AI evaluated the scientific accuracy and relevance of each option.';
    }
  } else if (subject.toLowerCase().includes('computer') || subject.toLowerCase().includes('programming')) {
    // For computer science questions
    const csTerms = ['algorithm', 'function', 'variable', 'loop', 'array', 'object', 'class'];
    const csOption = options.findIndex(opt => 
      csTerms.some(term => opt.toLowerCase().includes(term))
    );
    
    if (csOption !== -1) {
      analysis.correctAnswer = csOption;
      analysis.reasoning = `Computer science analysis identifies option ${csOption + 1} as the correct answer.`;
      analysis.explanation = 'The AI evaluated the programming concepts and logical correctness.';
    }
  } else {
    // For general questions, use keyword matching and length analysis
    const questionWords = question.toLowerCase().split(' ');
    
    // Find option with most keyword matches
    let maxMatches = 0;
    let bestOption = 0;
    
    options.forEach((option, index) => {
      const optionWords = option.toLowerCase().split(' ');
      const matches = questionWords.filter(word => 
        word.length > 3 && optionWords.includes(word)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestOption = index;
      }
    });
    
    analysis.correctAnswer = bestOption;
    analysis.reasoning = `Contextual analysis suggests option ${bestOption + 1} is most relevant to the question.`;
    analysis.explanation = 'The AI performed semantic analysis to determine the most relevant answer.';
  }

  // Fallback if no specific analysis worked
  if (analysis.correctAnswer === null) {
    analysis.correctAnswer = Math.floor(Math.random() * options.length);
    analysis.reasoning = `AI analysis indicates option ${analysis.correctAnswer + 1} as the most probable answer.`;
    analysis.explanation = 'The AI used pattern recognition and contextual analysis to determine the answer.';
  }

  return analysis;
};

// POST /api/ai/correct-poll
router.post('/correct-poll', async (req, res) => {
  try {
    const { question, options, subject, description } = req.body;

    // Validate input
    if (!question) {
      return res.status(400).json({ 
        error: 'Invalid input. Question is required.' 
      });
    }

    // For questions without options (like Q&A), we'll analyze the question itself
    const hasOptions = options && Array.isArray(options) && options.length > 0;
    
    // Get AI analysis
    const analysis = await getAICorrection(question, hasOptions ? options : [], subject || 'General', description);

    res.json({
      success: true,
      data: {
        correctAnswer: analysis.correctAnswer,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        explanation: analysis.explanation,
        timestamp: new Date().toISOString(),
        hasOptions: hasOptions
      }
    });

  } catch (error) {
    console.error('AI correction error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI correction. Please try again.' 
    });
  }
});

// GET /api/ai/health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Correction Service',
    version: '1.0.0'
  });
});

module.exports = router;

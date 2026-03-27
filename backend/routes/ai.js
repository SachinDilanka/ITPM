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
    
    if (subject.toLowerCase().includes('programming') || subject.toLowerCase().includes('introduction') || fullText.includes('code') || fullText.includes('algorithm') || fullText.includes('programming')) {
      analysis.reasoning = 'This appears to be a programming-related question requiring algorithmic thinking.';
      analysis.explanation = 'The AI suggests considering the problem requirements, choosing appropriate data structures, and implementing efficient algorithms. Think about edge cases and test your solution thoroughly.';
    } else if (subject.toLowerCase().includes('network') || subject.toLowerCase().includes('management') || fullText.includes('network') || fullText.includes('protocol')) {
      analysis.reasoning = 'This is a network-related question that may require understanding of network concepts.';
      analysis.explanation = 'The AI recommends reviewing network protocols, topology concepts, and considering security aspects. Think about scalability and performance requirements.';
    } else if (subject.toLowerCase().includes('database') || fullText.includes('sql') || fullText.includes('database') || fullText.includes('query')) {
      analysis.reasoning = 'This is a database-related question that may require SQL knowledge and design principles.';
      analysis.explanation = 'The AI suggests considering database normalization, proper indexing, and efficient query design. Think about data integrity and performance optimization.';
    } else if (subject.toLowerCase().includes('applications') || subject.toLowerCase().includes('frameworks') || fullText.includes('framework') || fullText.includes('application')) {
      analysis.reasoning = 'This appears to be an application development question.';
      analysis.explanation = 'The AI recommends considering framework selection, architecture patterns, and best practices. Think about maintainability, scalability, and user experience.';
    } else {
      analysis.reasoning = 'This is an open-ended question that requires critical thinking and analysis.';
      analysis.explanation = 'The AI recommends carefully reading the question, identifying key concepts, and providing a well-structured answer with relevant examples and evidence.';
    }
    
    return analysis;
  }

  // Original logic for multiple choice questions
  // Simple heuristic-based AI simulation for different subjects
  if (subject.toLowerCase().includes('programming') || subject.toLowerCase().includes('introduction') || question.toLowerCase().includes('calculate') || question.toLowerCase().includes('solve') || question.toLowerCase().includes('code')) {
    // For programming questions, look for programming concepts
    const programmingKeywords = ['algorithm', 'function', 'variable', 'loop', 'array', 'object', 'class', 'code', 'programming'];
    const hasProgrammingKeywords = programmingKeywords.some(keyword => question.toLowerCase().includes(keyword));
    
    if (hasProgrammingKeywords) {
      // Find the option with programming terms
      const programmingOption = options.findIndex(opt => 
        programmingKeywords.some(keyword => opt.toLowerCase().includes(keyword))
      );
      
      if (programmingOption !== -1) {
        analysis.correctAnswer = programmingOption;
        analysis.reasoning = `Based on programming analysis, option ${programmingOption + 1} contains the correct programming concept.`;
        analysis.explanation = 'The AI analyzed the programming logic and identified the correct solution.';
      }
    }
  } else if (subject.toLowerCase().includes('network') || subject.toLowerCase().includes('management') || question.toLowerCase().includes('network') || question.toLowerCase().includes('protocol')) {
    // For network questions, look for network terminology
    const networkTerms = ['tcp', 'ip', 'dns', 'router', 'switch', 'protocol', 'lan', 'wan', 'network'];
    const networkOption = options.findIndex(opt => 
      networkTerms.some(term => opt.toLowerCase().includes(term))
    );
    
    if (networkOption !== -1) {
      analysis.correctAnswer = networkOption;
      analysis.reasoning = `Network analysis indicates option ${networkOption + 1} contains the correct network concept.`;
      analysis.explanation = 'The AI evaluated the network architecture and protocol concepts.';
    }
  } else if (subject.toLowerCase().includes('database') || question.toLowerCase().includes('sql') || question.toLowerCase().includes('database') || question.toLowerCase().includes('query')) {
    // For database questions, look for database terminology
    const databaseTerms = ['sql', 'query', 'table', 'database', 'join', 'select', 'insert', 'update', 'delete'];
    const databaseOption = options.findIndex(opt => 
      databaseTerms.some(term => opt.toLowerCase().includes(term))
    );
    
    if (databaseOption !== -1) {
      analysis.correctAnswer = databaseOption;
      analysis.reasoning = `Database analysis identifies option ${databaseOption + 1} as the correct answer.`;
      analysis.explanation = 'The AI evaluated the database concepts and SQL syntax.';
    }
  } else if (subject.toLowerCase().includes('applications') || subject.toLowerCase().includes('frameworks') || question.toLowerCase().includes('framework') || question.toLowerCase().includes('application')) {
    // For application and framework questions
    const appTerms = ['framework', 'application', 'software', 'web', 'mobile', 'api', 'rest', 'mvc'];
    const appOption = options.findIndex(opt => 
      appTerms.some(term => opt.toLowerCase().includes(term))
    );
    
    if (appOption !== -1) {
      analysis.correctAnswer = appOption;
      analysis.reasoning = `Application analysis identifies option ${appOption + 1} as the correct answer.`;
      analysis.explanation = 'The AI evaluated the application development and framework concepts.';
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

# Gemini AI Integration Setup Guide

## Overview
The KnowVerse application now uses Google Gemini AI for intelligent poll analysis and correct answer selection.

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Backend
1. Open the `.env` file in the backend folder
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### 3. Install Dependencies
The required package is already installed:
```bash
npm install @google/generative-ai
```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

## Features

### Gemini AI Capabilities:
- **Intelligent Analysis**: Uses Google's Gemini Pro model for accurate answer selection
- **Educational Context**: Understands different subjects (Math, Science, Programming, etc.)
- **Confidence Scoring**: Provides confidence levels (70-100%)
- **Detailed Reasoning**: Explains why an answer is correct
- **Fallback System**: Graceful degradation if API fails

### Supported Question Types:
- **Multiple Choice**: Selects the most accurate answer
- **Open-Ended**: Provides guidance and analysis
- **Subject-Specific**: Tailored analysis for different academic subjects

## How It Works

### Frontend Integration:
- Button shows "Gemini AI" with attractive design
- Loading state shows "Gemini..." with spinning icon
- Results display confidence, reasoning, and explanation

### Backend Processing:
1. Receives question, options, subject, and description
2. Constructs context-aware prompt for Gemini
3. Sends to Google Gemini Pro API
4. Parses JSON response with analysis
5. Returns structured result with confidence score

### Error Handling:
- **API Failures**: Falls back to keyword-based analysis
- **Invalid Responses**: Validates and corrects malformed data
- **Network Issues**: Graceful degradation with user feedback

## Testing

### Test Polls:
1. **Math Question**: "What is 15 + 27?" → Should select "42"
2. **Science Question**: "What is the chemical symbol for gold?" → Should select "Au"
3. **Geography Question**: "Which continent is Egypt in?" → Should select "Africa"

### Expected Results:
- High confidence (85-100%) for factual questions
- Detailed reasoning explaining the choice
- Automatic vote selection for correct answer
- Visual feedback in the UI

## Troubleshooting

### Common Issues:
1. **"API Key Invalid"**: Check your Gemini API key in .env file
2. **"Network Error"**: Ensure backend server is running and connected to internet
3. **"AI Analysis Failed"**: Check Gemini API quota and usage limits

### Debug Information:
- Check browser console for detailed logs
- Backend logs show Gemini API responses
- Error messages indicate specific failure points

## API Response Format

```json
{
  "correctAnswer": 2,
  "confidence": 95,
  "reasoning": "Based on mathematical calculation...",
  "explanation": "Detailed analysis of why this answer is correct...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "hasOptions": true
}
```

## Cost and Limits

- **Free Tier**: Gemini API has generous free limits
- **Rate Limits**: Check Google AI Studio for current limits
- **Cost**: Generally very affordable for educational use

## Security

- API keys are stored in environment variables
- No sensitive data is logged
- Requests are made securely to Google's servers

## Future Enhancements

- Support for Gemini Pro Vision (image analysis)
- Custom prompts for different subjects
- Batch processing for multiple polls
- Caching for repeated questions

---

**Note**: Make sure to restart your backend server after updating the API key!

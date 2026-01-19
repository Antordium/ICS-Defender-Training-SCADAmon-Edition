/**
 * ICS Defender Training: SCADAmon Edition
 * Quiz Engine - Handles quiz logic, randomization, and scoring
 */

class QuizEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      questionsPerQuiz: options.questionsPerQuiz || 10,
      passingScore: options.passingScore || 80,
      showFeedback: options.showFeedback !== false,
      randomizeQuestions: options.randomizeQuestions !== false,
      randomizeAnswers: options.randomizeAnswers !== false,
      moduleId: options.moduleId || 'unknown',
      moduleName: options.moduleName || 'Module',
      badgeName: options.badgeName || '🏅',
      ...options
    };
    
    this.questions = [];
    this.selectedQuestions = [];
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.score = 0;
    this.quizStarted = false;
    this.quizCompleted = false;
  }
  
  /**
   * Load questions from JSON file
   */
  async loadQuestions(questionsUrl) {
    try {
      const response = await fetch(questionsUrl);
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`);
      }
      const data = await response.json();
      this.questions = data.questions || data;
      console.log(`Loaded ${this.questions.length} questions`);
      return true;
    } catch (error) {
      console.error('Error loading questions:', error);
      this.showError('Failed to load quiz questions. Please refresh the page.');
      return false;
    }
  }
  
  /**
   * Select random questions for the quiz
   */
  selectQuestions() {
    let pool = [...this.questions];
    
    // Shuffle if randomization enabled
    if (this.options.randomizeQuestions) {
      pool = this.shuffleArray(pool);
    }
    
    // Select the required number of questions
    this.selectedQuestions = pool.slice(0, this.options.questionsPerQuiz);
    
    // Randomize answers for each question if enabled
    if (this.options.randomizeAnswers) {
      this.selectedQuestions = this.selectedQuestions.map(q => this.randomizeQuestionAnswers(q));
    }
    
    return this.selectedQuestions;
  }
  
  /**
   * Randomize answer order for a question
   */
  randomizeQuestionAnswers(question) {
    const q = { ...question };
    
    // Handle different question types
    if (q.type === 'multiple_choice' || !q.type) {
      // Create answer objects with original indices
      const answerObjects = q.options.map((text, index) => ({
        text,
        originalIndex: index,
        isCorrect: index === q.correctIndex
      }));
      
      // Check for "All of the above" or "None of the above" - keep at end
      const specialAnswers = [];
      const regularAnswers = [];
      
      answerObjects.forEach(a => {
        const lowerText = a.text.toLowerCase();
        if (lowerText.includes('all of the above') || 
            lowerText.includes('none of the above') ||
            lowerText.includes('both a and b') ||
            lowerText.includes('a and b') ||
            lowerText.includes('b and c')) {
          specialAnswers.push(a);
        } else {
          regularAnswers.push(a);
        }
      });
      
      // Shuffle regular answers
      const shuffledRegular = this.shuffleArray(regularAnswers);
      const finalOrder = [...shuffledRegular, ...specialAnswers];
      
      // Update question with new order
      q.options = finalOrder.map(a => a.text);
      q.correctIndex = finalOrder.findIndex(a => a.isCorrect);
      q.answerMap = finalOrder.map(a => a.originalIndex);
    }
    
    return q;
  }
  
  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Start the quiz
   */
  startQuiz() {
    this.selectQuestions();
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.score = 0;
    this.quizStarted = true;
    this.quizCompleted = false;
    
    // Report to cmi5
    if (window.cmi5) {
      window.cmi5.progressed(0);
    }
    
    this.renderQuiz();
  }
  
  /**
   * Render the quiz interface
   */
  renderQuiz() {
    if (!this.quizStarted) {
      this.renderStartScreen();
      return;
    }
    
    if (this.quizCompleted) {
      this.renderResults();
      return;
    }
    
    this.renderQuestion();
  }
  
  /**
   * Render start screen
   */
  renderStartScreen() {
    this.container.innerHTML = `
      <div class="quiz-container fade-in">
        <div class="quiz-header">
          <h2 class="quiz-title">⚡ A Wild Quiz Appeared! ⚡</h2>
          <p style="color: var(--text-secondary); margin-top: 16px;">
            ${this.options.moduleName}
          </p>
        </div>
        
        <div class="question-box" style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 20px;">📋</div>
          <h3 style="color: var(--text-primary); margin-bottom: 16px;">Quiz Details</h3>
          <ul style="list-style: none; padding: 0; color: var(--text-secondary);">
            <li style="margin: 8px 0;">📝 ${this.options.questionsPerQuiz} Questions</li>
            <li style="margin: 8px 0;">✅ ${this.options.passingScore}% Required to Pass</li>
            <li style="margin: 8px 0;">🔄 Questions & Answers Randomized</li>
            <li style="margin: 8px 0;">💡 Explanations After Each Question</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-primary" onclick="quiz.startQuiz()">
            🎮 Start Quiz
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render current question
   */
  renderQuestion() {
    const question = this.selectedQuestions[this.currentQuestionIndex];
    const questionNum = this.currentQuestionIndex + 1;
    const totalQuestions = this.selectedQuestions.length;
    const progress = Math.round((this.currentQuestionIndex / totalQuestions) * 100);
    
    // Determine question type badge
    const typeBadge = this.getQuestionTypeBadge(question);
    
    // Build answer options HTML
    const answersHtml = this.buildAnswersHtml(question);
    
    this.container.innerHTML = `
      <div class="quiz-container fade-in">
        <div class="quiz-header">
          <h2 class="quiz-title">${this.options.moduleName} Quiz</h2>
          <div class="quiz-progress">
            <div class="quiz-progress-bar">
              <div class="quiz-progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="quiz-progress-text">Question ${questionNum} of ${totalQuestions}</span>
          </div>
        </div>
        
        <div class="question-box slide-in">
          <span class="question-type-badge">${typeBadge}</span>
          <p class="question-text">${question.question}</p>
          ${question.context ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">${question.context}</p>` : ''}
        </div>
        
        <div class="answers-container" id="answers-container">
          ${answersHtml}
        </div>
        
        <div id="feedback-container"></div>
        
        <div id="nav-buttons" style="text-align: center; margin-top: 24px; display: none;">
          <button class="btn btn-primary" onclick="quiz.nextQuestion()">
            ${questionNum === totalQuestions ? '📊 See Results' : '➡️ Next Question'}
          </button>
        </div>
      </div>
    `;
    
    // Add click handlers to answers
    this.attachAnswerHandlers(question);
  }
  
  /**
   * Get question type badge text
   */
  getQuestionTypeBadge(question) {
    const type = question.type || 'multiple_choice';
    const badges = {
      'multiple_choice': '🎯 Multiple Choice',
      'true_false': '✓✗ True/False',
      'matching': '🔗 Matching',
      'ordering': '📋 Ordering'
    };
    return badges[type] || '❓ Question';
  }
  
  /**
   * Build HTML for answer options
   */
  buildAnswersHtml(question) {
    const type = question.type || 'multiple_choice';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    if (type === 'true_false') {
      return `
        <div class="answer-option" data-index="0">
          <span class="answer-letter">T</span>
          <span class="answer-text">True</span>
        </div>
        <div class="answer-option" data-index="1">
          <span class="answer-letter">F</span>
          <span class="answer-text">False</span>
        </div>
      `;
    }
    
    // Multiple choice (default)
    return question.options.map((option, index) => `
      <div class="answer-option" data-index="${index}">
        <span class="answer-letter">${letters[index]}</span>
        <span class="answer-text">${option}</span>
      </div>
    `).join('');
  }
  
  /**
   * Attach click handlers to answer options
   */
  attachAnswerHandlers(question) {
    const answerElements = document.querySelectorAll('.answer-option');
    
    answerElements.forEach(element => {
      element.addEventListener('click', () => {
        // Prevent multiple selections
        if (this.answers[this.currentQuestionIndex] !== undefined) return;
        
        const selectedIndex = parseInt(element.dataset.index);
        this.submitAnswer(selectedIndex, question);
      });
    });
  }
  
  /**
   * Submit an answer
   */
  submitAnswer(selectedIndex, question) {
    const isCorrect = selectedIndex === question.correctIndex;
    
    // Record the answer
    this.answers[this.currentQuestionIndex] = {
      questionId: question.id,
      selected: selectedIndex,
      correct: isCorrect
    };
    
    if (isCorrect) {
      this.score++;
    }
    
    // Report to cmi5
    if (window.cmi5) {
      window.cmi5.answered(
        question.id,
        question.options[selectedIndex],
        isCorrect
      );
    }
    
    // Visual feedback
    this.showAnswerFeedback(selectedIndex, question, isCorrect);
  }
  
  /**
   * Show feedback after answering
   */
  showAnswerFeedback(selectedIndex, question, isCorrect) {
    const answerElements = document.querySelectorAll('.answer-option');
    
    // Mark selected answer
    answerElements[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Show correct answer if wrong
    if (!isCorrect) {
      answerElements[question.correctIndex].classList.add('correct');
    }
    
    // Disable all answer options
    answerElements.forEach(el => {
      el.style.pointerEvents = 'none';
    });
    
    // Show feedback box
    if (this.options.showFeedback) {
      const feedbackContainer = document.getElementById('feedback-container');
      feedbackContainer.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'correct' : 'incorrect'} fade-in">
          <p class="feedback-title">
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p class="feedback-explanation">${question.explanation}</p>
        </div>
      `;
    }
    
    // Show navigation button
    document.getElementById('nav-buttons').style.display = 'block';
    
    // Update progress
    const progress = Math.round(((this.currentQuestionIndex + 1) / this.selectedQuestions.length) * 100);
    if (window.cmi5) {
      window.cmi5.progressed(progress);
    }
  }
  
  /**
   * Move to next question or show results
   */
  nextQuestion() {
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= this.selectedQuestions.length) {
      this.completeQuiz();
    } else {
      this.renderQuestion();
    }
  }
  
  /**
   * Complete the quiz and calculate final score
   */
  completeQuiz() {
    this.quizCompleted = true;
    const percentage = Math.round((this.score / this.selectedQuestions.length) * 100);
    const passed = percentage >= this.options.passingScore;
    
    // Report to cmi5
    if (window.cmi5) {
      if (passed) {
        window.cmi5.passed(percentage);
      } else {
        window.cmi5.failed(percentage);
      }
      window.cmi5.completed(percentage, passed);
    }
    
    this.renderResults();
  }
  
  /**
   * Render quiz results
   */
  renderResults() {
    const percentage = Math.round((this.score / this.selectedQuestions.length) * 100);
    const passed = percentage >= this.options.passingScore;
    
    this.container.innerHTML = `
      <div class="quiz-container fade-in">
        <div class="quiz-header">
          <h2 class="quiz-title">Quiz Complete!</h2>
        </div>
        
        <div class="quiz-results">
          <div class="results-score">${percentage}%</div>
          <p class="results-message ${passed ? 'passed' : 'failed'}">
            ${passed ? '🎉 Congratulations! You Passed!' : '😔 Not quite. Try again!'}
          </p>
          <p style="color: var(--text-secondary);">
            You answered ${this.score} out of ${this.selectedQuestions.length} questions correctly.
          </p>
          
          ${passed ? `
            <div style="margin: 32px 0;">
              <p style="color: var(--pokemon-yellow); font-size: 1.2rem; margin-bottom: 16px;">
                You earned the ${this.options.badgeName}!
              </p>
              <div class="badge-earned">
                ${this.getBadgeEmoji()}
              </div>
            </div>
          ` : `
            <div style="margin: 24px 0; padding: 16px; background: var(--bg-darker); border-radius: 8px;">
              <p style="color: var(--text-secondary);">
                You need ${this.options.passingScore}% to pass. Review the material and try again!
              </p>
            </div>
          `}
          
          <div style="margin-top: 32px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            ${!passed ? `
              <button class="btn btn-primary" onclick="quiz.startQuiz()">
                🔄 Retry Quiz
              </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="quiz.reviewAnswers()">
              📋 Review Answers
            </button>
            ${passed ? `
              <button class="btn btn-success" onclick="quiz.returnToCourse()">
                ✅ Continue Course
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Get badge emoji based on module
   */
  getBadgeEmoji() {
    const badges = {
      '1': '⚡', // Electric - Foundation
      '2': '🏗️', // Architecture
      '3': '🌊', // Water - Protocols
      '4': '❄️', // Ice - Windows
      '5': '🌑', // Dark - Unix
      '6': '📜', // Normal - Governance
      '7': '🔥', // Fire - Response
      '8': '👻'  // Ghost - Synthesis
    };
    return badges[this.options.moduleId] || '🏅';
  }
  
  /**
   * Review all answers
   */
  reviewAnswers() {
    let reviewHtml = `
      <div class="quiz-container fade-in">
        <div class="quiz-header">
          <h2 class="quiz-title">📋 Answer Review</h2>
        </div>
    `;
    
    this.selectedQuestions.forEach((question, index) => {
      const answer = this.answers[index];
      const isCorrect = answer && answer.correct;
      
      reviewHtml += `
        <div class="question-box" style="margin-bottom: 16px; border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">
            Question ${index + 1} - ${isCorrect ? '✅ Correct' : '❌ Incorrect'}
          </p>
          <p class="question-text" style="font-size: 1rem;">${question.question}</p>
          
          <div style="margin-top: 12px; font-size: 0.9rem;">
            ${!isCorrect ? `
              <p style="color: var(--danger);">
                <strong>Your answer:</strong> ${question.options[answer?.selected] || 'No answer'}
              </p>
            ` : ''}
            <p style="color: var(--success);">
              <strong>Correct answer:</strong> ${question.options[question.correctIndex]}
            </p>
          </div>
          
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              <strong>Explanation:</strong> ${question.explanation}
            </p>
          </div>
        </div>
      `;
    });
    
    reviewHtml += `
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-secondary" onclick="quiz.renderResults()">
            ← Back to Results
          </button>
        </div>
      </div>
    `;
    
    this.container.innerHTML = reviewHtml;
  }
  
  /**
   * Return to course (close quiz)
   */
  returnToCourse() {
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide quiz and show completion message
    this.container.innerHTML = `
      <div class="quiz-container fade-in" style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 16px;">${this.getBadgeEmoji()}</div>
        <h3 style="color: var(--success);">Module Complete!</h3>
        <p style="color: var(--text-secondary); margin-top: 8px;">
          You've earned the ${this.options.badgeName}. Proceed to the next module!
        </p>
      </div>
    `;
    
    // Notify parent/course navigation if available
    if (window.courseNav) {
      window.courseNav.markModuleComplete(this.options.moduleId);
    }
  }
  
  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="info-box danger">
          <p class="info-box-title">⚠️ Error</p>
          <p>${message}</p>
        </div>
        <button class="btn btn-secondary" onclick="location.reload()">
          🔄 Refresh Page
        </button>
      </div>
    `;
  }
}

// Make available globally
window.QuizEngine = QuizEngine;

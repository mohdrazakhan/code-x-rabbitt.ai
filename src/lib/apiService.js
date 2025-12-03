class ApiService {
  constructor() {
    this.baseUrl = '/api';
  }

  async #makeRequest(endpoint, method = 'GET', data = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Compile code
  async compileCode({ language, sourceCode, stdin = '' }) {
    return this.#makeRequest('/compile', 'POST', {
      language,
      sourceCode,
      stdin
    });
  }

  // Get coding tips
  async getTips({ language, sourceCode, problem = {} }) {
    return this.#makeRequest('/learn/tips', 'POST', {
      language,
      sourceCode,
      problem
    });
  }

  // Get quiz questions
  async getQuiz({ language, topic }) {
    return this.#makeRequest('/learn/quiz', 'POST', {
      language,
      ...(topic && { topic })
    });
  }

  // Get learning roadmap
  async getRoadmap({ language, skillLevel = 'beginner' }) {
    return this.#makeRequest('/learn/roadmap', 'POST', {
      language,
      skillLevel
    });
  }
}

export const apiService = new ApiService();

/**
 * ICS Defender Training: SCADAmon Edition
 * cmi5 Wrapper - Handles LRS communication
 * 
 * This wrapper interfaces with the PCTE cmi5 player
 * and manages xAPI statements for learning analytics.
 */

class Cmi5Wrapper {
  constructor() {
    this.initialized = false;
    this.endpoint = null;
    this.auth = null;
    this.actor = null;
    this.registration = null;
    this.activityId = null;
    this.sessionId = this.generateUUID();
    this.startTime = new Date();
    
    // Parse launch parameters from URL
    this.parseLaunchParams();
  }
  
  /**
   * Parse cmi5 launch parameters from URL
   */
  parseLaunchParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Required cmi5 parameters
    this.endpoint = params.get('endpoint');
    this.auth = params.get('auth');
    this.activityId = params.get('activityId');
    this.registration = params.get('registration');
    
    // Actor information (from fetch)
    const actorParam = params.get('actor');
    if (actorParam) {
      try {
        this.actor = JSON.parse(decodeURIComponent(actorParam));
      } catch (e) {
        console.error('Failed to parse actor parameter:', e);
      }
    }
    
    // Validate required parameters
    if (!this.endpoint || !this.auth || !this.activityId) {
      console.warn('Missing cmi5 launch parameters. Running in standalone mode.');
      this.standaloneMode = true;
    }
  }
  
  /**
   * Initialize the cmi5 session
   */
  async initialize() {
    if (this.standaloneMode) {
      console.log('cmi5 Wrapper: Running in standalone mode');
      this.initialized = true;
      return true;
    }
    
    try {
      // Fetch state document to get session requirements
      await this.fetchLaunchData();
      
      // Send initialized statement
      await this.sendStatement({
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/initialized',
          display: { 'en-US': 'initialized' }
        }
      });
      
      this.initialized = true;
      console.log('cmi5 Wrapper: Initialized successfully');
      return true;
      
    } catch (error) {
      console.error('cmi5 initialization failed:', error);
      this.standaloneMode = true;
      this.initialized = true;
      return false;
    }
  }
  
  /**
   * Fetch launch data from LRS
   */
  async fetchLaunchData() {
    const fetchUrl = this.endpoint + '/activities/state?' +
      'activityId=' + encodeURIComponent(this.activityId) +
      '&agent=' + encodeURIComponent(JSON.stringify(this.actor)) +
      '&registration=' + encodeURIComponent(this.registration) +
      '&stateId=LMS.LaunchData';
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Authorization': this.auth,
        'X-Experience-API-Version': '1.0.3'
      }
    });
    
    if (response.ok) {
      const launchData = await response.json();
      this.launchData = launchData;
      return launchData;
    }
    
    return null;
  }
  
  /**
   * Send an xAPI statement to the LRS
   */
  async sendStatement(statementParts) {
    if (this.standaloneMode) {
      console.log('cmi5 Statement (standalone):', statementParts);
      return { id: this.generateUUID() };
    }
    
    const statement = {
      id: this.generateUUID(),
      actor: this.actor,
      verb: statementParts.verb,
      object: {
        id: this.activityId,
        objectType: 'Activity'
      },
      context: {
        registration: this.registration,
        contextActivities: {
          category: [{
            id: 'https://w3id.org/xapi/cmi5/context/categories/cmi5'
          }]
        },
        extensions: {
          'https://w3id.org/xapi/cmi5/context/extensions/sessionid': this.sessionId
        }
      },
      timestamp: new Date().toISOString()
    };
    
    // Add result if provided
    if (statementParts.result) {
      statement.result = statementParts.result;
    }
    
    try {
      const response = await fetch(this.endpoint + '/statements', {
        method: 'POST',
        headers: {
          'Authorization': this.auth,
          'Content-Type': 'application/json',
          'X-Experience-API-Version': '1.0.3'
        },
        body: JSON.stringify(statement)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const statementId = response.headers.get('X-Experience-API-Consistent-Through') || statement.id;
      console.log('Statement sent:', statementParts.verb.display['en-US']);
      return { id: statementId };
      
    } catch (error) {
      console.error('Failed to send statement:', error);
      throw error;
    }
  }
  
  /**
   * Record module launch
   */
  async launched(moduleName) {
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/launched',
        display: { 'en-US': 'launched' }
      },
      result: {
        extensions: {
          'https://w3id.org/xapi/cmi5/result/extensions/progress': 0
        }
      }
    });
  }
  
  /**
   * Update progress through content
   */
  async progressed(progressPercent) {
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/progressed',
        display: { 'en-US': 'progressed' }
      },
      result: {
        extensions: {
          'https://w3id.org/xapi/cmi5/result/extensions/progress': progressPercent
        }
      }
    });
  }
  
  /**
   * Record quiz answer
   */
  async answered(questionId, response, correct) {
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/answered',
        display: { 'en-US': 'answered' }
      },
      object: {
        id: this.activityId + '/questions/' + questionId,
        objectType: 'Activity',
        definition: {
          type: 'http://adlnet.gov/expapi/activities/cmi.interaction'
        }
      },
      result: {
        response: response,
        success: correct
      }
    });
  }
  
  /**
   * Record module pass (mastery achieved)
   */
  async passed(score) {
    const duration = this.calculateDuration();
    
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/passed',
        display: { 'en-US': 'passed' }
      },
      result: {
        score: {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        },
        success: true,
        completion: true,
        duration: duration
      }
    });
  }
  
  /**
   * Record module fail (mastery not achieved)
   */
  async failed(score) {
    const duration = this.calculateDuration();
    
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/failed',
        display: { 'en-US': 'failed' }
      },
      result: {
        score: {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        },
        success: false,
        completion: true,
        duration: duration
      }
    });
  }
  
  /**
   * Record module completion
   */
  async completed(score, success) {
    const duration = this.calculateDuration();
    
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: { 'en-US': 'completed' }
      },
      result: {
        score: {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        },
        success: success,
        completion: true,
        duration: duration
      }
    });
  }
  
  /**
   * Terminate the session
   */
  async terminate() {
    if (!this.initialized) return;
    
    return this.sendStatement({
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/terminated',
        display: { 'en-US': 'terminated' }
      },
      result: {
        duration: this.calculateDuration()
      }
    });
  }
  
  /**
   * Calculate ISO 8601 duration from session start
   */
  calculateDuration() {
    const now = new Date();
    const durationMs = now - this.startTime;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    let duration = 'PT';
    if (hours > 0) duration += hours + 'H';
    if (minutes % 60 > 0) duration += (minutes % 60) + 'M';
    duration += (seconds % 60) + 'S';
    
    return duration;
  }
  
  /**
   * Generate a UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Save state to LRS
   */
  async saveState(stateId, state) {
    if (this.standaloneMode) {
      localStorage.setItem(`cmi5_state_${stateId}`, JSON.stringify(state));
      return true;
    }
    
    const stateUrl = this.endpoint + '/activities/state?' +
      'activityId=' + encodeURIComponent(this.activityId) +
      '&agent=' + encodeURIComponent(JSON.stringify(this.actor)) +
      '&registration=' + encodeURIComponent(this.registration) +
      '&stateId=' + encodeURIComponent(stateId);
    
    try {
      const response = await fetch(stateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': this.auth,
          'Content-Type': 'application/json',
          'X-Experience-API-Version': '1.0.3'
        },
        body: JSON.stringify(state)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }
  
  /**
   * Retrieve state from LRS
   */
  async getState(stateId) {
    if (this.standaloneMode) {
      const stored = localStorage.getItem(`cmi5_state_${stateId}`);
      return stored ? JSON.parse(stored) : null;
    }
    
    const stateUrl = this.endpoint + '/activities/state?' +
      'activityId=' + encodeURIComponent(this.activityId) +
      '&agent=' + encodeURIComponent(JSON.stringify(this.actor)) +
      '&registration=' + encodeURIComponent(this.registration) +
      '&stateId=' + encodeURIComponent(stateId);
    
    try {
      const response = await fetch(stateUrl, {
        method: 'GET',
        headers: {
          'Authorization': this.auth,
          'X-Experience-API-Version': '1.0.3'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get state:', error);
      return null;
    }
  }
}

// Global instance
window.cmi5 = new Cmi5Wrapper();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await window.cmi5.initialize();
});

// Handle page unload
window.addEventListener('beforeunload', async (event) => {
  if (window.cmi5.initialized) {
    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon && !window.cmi5.standaloneMode) {
      const statement = {
        id: window.cmi5.generateUUID(),
        actor: window.cmi5.actor,
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/terminated',
          display: { 'en-US': 'terminated' }
        },
        object: { id: window.cmi5.activityId },
        context: { registration: window.cmi5.registration },
        timestamp: new Date().toISOString()
      };
      
      navigator.sendBeacon(
        window.cmi5.endpoint + '/statements',
        new Blob([JSON.stringify(statement)], { type: 'application/json' })
      );
    }
  }
});

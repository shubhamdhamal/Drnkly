import axios from 'axios';

// Session timeout in milliseconds (1 hour)
export const SESSION_TIMEOUT = 60 * 60 * 1000;

// Session expiry event name
export const SESSION_EXPIRED_EVENT = 'sessionExpired';

// Session management class
class SessionManager {
  private static instance: SessionManager;
  private sessionTimeoutId: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private countdownIntervalId: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize session timeout
    this.resetSessionTimeout();
    
    // Add activity listeners
    this.addActivityListeners();
    
    // Start countdown timer
    this.startCountdown();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private addActivityListeners() {
    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetSessionTimeout());
    });
  }

  private resetSessionTimeout() {
    this.lastActivityTime = Date.now();
    
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    this.sessionTimeoutId = setTimeout(() => {
      this.handleSessionExpiry();
    }, SESSION_TIMEOUT);
  }

  private handleSessionExpiry() {
    // Clear session data
    this.clearSession();
    
    // Dispatch session expired event
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  public clearSession() {
    // Clear localStorage items
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    
    // Clear session timeout
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
    
    // Clear countdown interval
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  public setSession(token: string, user: any) {
    // Store session data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user._id);
    
    // Store session start time
    localStorage.setItem('sessionStartTime', Date.now().toString());
    
    // Reset session timeout
    this.resetSessionTimeout();
    
    // Start countdown timer
    this.startCountdown();
    
    // Set up axios interceptor for token
    this.setupAxiosInterceptor();
  }

  private startCountdown() {
    // Clear existing interval
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }

    // Start countdown interval
    this.countdownIntervalId = setInterval(() => {
      const remainingTime = this.getRemainingTime();
      if (remainingTime <= 0) {
        this.handleSessionExpiry();
      }
    }, 1000); // Update every second
  }

  public getRemainingTime(): number {
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    if (!sessionStartTime) return 0;
    
    const elapsed = Date.now() - parseInt(sessionStartTime);
    const remaining = SESSION_TIMEOUT - elapsed;
    
    return Math.max(0, remaining);
  }

  public getFormattedRemainingTime(): string {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) return '00:00:00';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private setupAxiosInterceptor() {
    // Add request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleSessionExpiry();
        }
        return Promise.reject(error);
      }
    );
  }

  public isSessionValid(): boolean {
    const token = localStorage.getItem('authToken');
    const remainingTime = this.getRemainingTime();
    return !!token && remainingTime > 0;
  }
}

export const sessionManager = SessionManager.getInstance(); 
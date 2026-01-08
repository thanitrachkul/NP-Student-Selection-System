
import { AdminUser, SystemConfig, ActivityLog } from '../types';

const STORAGE_KEYS = {
  USERS: 'APP_ADMIN_USERS',
  CONFIG: 'APP_SYSTEM_CONFIG',
  LOGS: 'APP_ACTIVITY_LOGS',
  SESSION: 'APP_ACTIVE_SESSION' // New key
};

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001',
  username: 'Admin',
  password: '@Np123456',
  name: 'ผู้ดูแลระบบหลัก',
  role: 'SUPER_ADMIN'
};

// Set the default configuration values for the app.  In particular, the
// scriptUrl field is populated with the Google Apps Script URL provided by the user.
// This ensures the app has a working backend endpoint as soon as it starts up
// without requiring a manual paste in the UI.  If you need to override these values
// later via the System Admin settings, you still can.
const DEFAULT_CONFIG: SystemConfig = {
  // The backend endpoint for Google Apps Script calls.  This default was set
  // via ChatGPT based on user instruction to avoid needing to paste it in the
  // settings page manually.  See https://script.google.com for more information.
  scriptUrl: 'https://script.google.com/macros/s/AKfycbyMxIHg_KG_tBobkonmp9aXbeXciCot1A_9qNndQsotzPnAwmlKI59Py549deH6Z5_f/exec',
  sheetId: '1ge8sumS3qX7lsw29cIoBQrsW5vNYI5yfr_BPveAiLmc',
  driveId: '142UYdJGFhP3TtJ_fSJA2WUW3E8iHTIWW'
};

export const storage = {
  // --- Session Management ---
  saveSession(user: AdminUser) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },

  getSession(): AdminUser | null {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // --- User Management ---
  getUsers(): AdminUser[] {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!stored) {
      // Initialize with default admin if empty
      this.saveUsers([DEFAULT_ADMIN]);
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(stored);
  },

  saveUsers(users: AdminUser[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user: AdminUser) {
    const users = this.getUsers();
    if (users.some(u => u.username === user.username)) {
      throw new Error('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว');
    }
    users.push(user);
    this.saveUsers(users);
  },

  updateUser(updatedUser: AdminUser) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  },

  deleteUser(userId: string) {
    let users = this.getUsers();
    const target = users.find(u => u.id === userId);
    
    // Prevent deleting the main Super Admin account
    if (target?.username === 'Admin' || target?.id === 'admin-001') { 
        throw new Error('ไม่สามารถลบผู้ดูแลระบบหลัก (Super Admin) ได้');
    }
    
    users = users.filter(u => u.id !== userId);
    this.saveUsers(users);
  },

  validateUser(username: string, password: string): AdminUser | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },

  // --- System Configuration ---
  getConfig(): SystemConfig {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!stored) {
        return DEFAULT_CONFIG;
    }
    return JSON.parse(stored);
  },

  saveConfig(config: SystemConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // --- Activity Logs ---
  getLogs(): ActivityLog[] {
    const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
    return stored ? JSON.parse(stored) : [];
  },

  addLog(user: AdminUser | null, action: string, details: string) {
    if (!user) return; // Don't log anonymous actions if any
    
    const logs = this.getLogs();
    const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        details,
        timestamp: new Date().toISOString()
    };
    
    // Keep only last 100 logs to prevent overflow
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  }
};

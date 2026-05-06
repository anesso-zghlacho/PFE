const API_BASE = 'http://localhost:8000/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrafficLogs() {
    return this.request('/traffic/');
  }

  async createTrafficLog(data: {
    src_ip: string;
    dst_ip: string;
    src_port: number;
    dst_port: number;
    protocol: string;
    duration: number;
    packet_count: number;
    byte_count: number;
    bytes_per_packet: number;
    packets_per_sec: number;
    syn_count: number;
    ack_count: number;
    fin_count: number;
  }) {
    return this.request('/traffic/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAlerts() {
    return this.request('/alerts/');
  }

  async createAlert(data: {
    title: string;
    description: string;
    severity: string;
    source_ip: string;
    is_resolved: boolean;
  }) {
    return this.request('/alerts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resolveAlert(alertId: number) {
    return this.request(`/alerts/${alertId}/resolve/`, {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/user/');
  }

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  async logout() {
    return this.request('/auth/logout/', {
      method: 'POST',
    });
  }

  async startSniffer(interfaceName?: string) {
    return this.request('/sniffer/start/', {
      method: 'POST',
      body: JSON.stringify({ interface: interfaceName }),
    });
  }

  async stopSniffer() {
    return this.request('/sniffer/stop/', {
      method: 'POST',
    });
  }

  async getSnifferStatus() {
    return this.request('/sniffer/status/');
  }
}

export const api = new ApiClient();
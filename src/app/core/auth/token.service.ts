import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private secretKey = 'P96Rc6d8fKs9Pac4d5e6f708192a3PpS';

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }

  private decrypt(data: string): string | null {
    const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  }

  setToken(token: string): void {
    const encryptedToken = this.encrypt(token);
    localStorage.setItem('accessToken', encryptedToken);
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem('accessToken');
    if (!encryptedToken) return null;
    return this.decrypt(encryptedToken);
  }

  removeToken(): void {
    localStorage.removeItem('accessToken');
  }
}

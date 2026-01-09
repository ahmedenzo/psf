import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class CookieService {
  private secretKey = 'e5b4c6d8f1a2b3c4d5e6f708192a3b4c';

  setCookie(name: string, value: string, days: number): void {
    const encryptedValue = CryptoJS.AES.encrypt(value, this.secretKey).toString();
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(encryptedValue)}; expires=${expires}; path=/`;
  }

  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      const decryptedValue = CryptoJS.AES.decrypt(decodeURIComponent(match[2]), this.secretKey).toString(CryptoJS.enc.Utf8);
      return decryptedValue;
    }
    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

/**
 * פונקציות עזר לטיפול בכתובות IP
 * תומך בזיהוי IP אמיתי דרך פרוקסי
 */

/**
 * מחלץ את כתובת ה-IP האמיתית מבקשה
 * בודק headers שונים שמוגדרים על ידי פרוקסי/CDN
 * @param {Request} req - אובייקט הבקשה של Express
 * @returns {string} כתובת IP
 */
function getClientIP(req) {
  // רשימת headers לבדיקה (מסודרים לפי עדיפות)
  const headers = [
    // Cloudflare
    'cf-connecting-ip',
    // Nginx proxy
    'x-real-ip',
    // Standard proxy header (יכול להכיל רשימה מופרדת בפסיקים)
    'x-forwarded-for',
    // Azure
    'x-client-ip',
    // AWS ELB
    'x-forwarded',
    // אחרים
    'forwarded-for',
    'forwarded',
  ];

  // בדיקת כל header
  for (const header of headers) {
    const value = req.headers[header];
    if (value) {
      // אם זו רשימה, לקחת את הראשון (ה-client המקורי)
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // fallback ל-IP ישיר
  const directIP = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;

  // הסרת prefix של IPv6 mapped IPv4
  if (directIP && directIP.startsWith('::ffff:')) {
    return directIP.substring(7);
  }

  return directIP || 'unknown';
}

/**
 * בודק האם מחרוזת היא כתובת IP תקינה (IPv4 או IPv6)
 * @param {string} ip - כתובת לבדיקה
 * @returns {boolean}
 */
function isValidIP(ip) {
  if (!ip || typeof ip !== 'string') return false;

  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 pattern (פשוט יותר)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:)*:(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::$/;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * מנרמל כתובת IP (מסיר prefixes)
 * @param {string} ip
 * @returns {string}
 */
function normalizeIP(ip) {
  if (!ip) return 'unknown';

  // הסרת IPv6 mapped IPv4 prefix
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip.toLowerCase();
}

/**
 * בודק אם IP הוא localhost
 * @param {string} ip
 * @returns {boolean}
 */
function isLocalhost(ip) {
  const localhostIPs = [
    '127.0.0.1',
    '::1',
    'localhost',
    '::ffff:127.0.0.1',
  ];
  return localhostIPs.includes(normalizeIP(ip));
}

module.exports = {
  getClientIP,
  isValidIP,
  normalizeIP,
  isLocalhost,
};

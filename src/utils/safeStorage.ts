/**
 * Safe LocalStorage and Image Optimization Utilities
 * Prevents QuotaExceededError and optimizes image storage.
 */

/**
 * Resizes and compresses an image file to a lightweight JPEG DataURL (15KB - 30KB max)
 * to avoid exceeding browser localStorage quotas (~5MB origin limit).
 */
export const compressImageFile = (
  file: File,
  maxDimension = 300,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback if canvas context fails
          resolve(reader.result as string);
          return;
        }

        // Fill background white in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to high-quality compressed JPEG thumbnail
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Scans localStorage and purges/cleans oversized (>50KB) base64 strings
 * from cached arrays to prevent and recover from QuotaExceededError.
 */
export const cleanStorageQuota = (): void => {
  try {
    // 1. Clean smilecare_auth_user
    const authRaw = localStorage.getItem('smilecare_auth_user');
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw);
        if (auth?.avatar && typeof auth.avatar === 'string' && auth.avatar.length > 50000) {
          auth.avatar = '';
          localStorage.setItem('smilecare_auth_user', JSON.stringify(auth));
        }
      } catch {}
    }

    // 2. Clean smilecare_staff_members
    const staffRaw = localStorage.getItem('smilecare_staff_members');
    if (staffRaw) {
      try {
        const staffList = JSON.parse(staffRaw);
        if (Array.isArray(staffList)) {
          let modified = false;
          const cleaned = staffList.map((s: any) => {
            if (s?.avatar && typeof s.avatar === 'string' && s.avatar.length > 50000) {
              modified = true;
              return { ...s, avatar: '' };
            }
            return s;
          });
          if (modified) {
            localStorage.setItem('smilecare_staff_members', JSON.stringify(cleaned));
          }
        }
      } catch {}
    }

    // 3. Clean smilecare_doctors_list
    const docRaw = localStorage.getItem('smilecare_doctors_list');
    if (docRaw) {
      try {
        const docList = JSON.parse(docRaw);
        if (Array.isArray(docList)) {
          let modified = false;
          const cleaned = docList.map((d: any) => {
            if (d?.avatar && typeof d.avatar === 'string' && d.avatar.length > 50000) {
              modified = true;
              return { ...d, avatar: '' };
            }
            return d;
          });
          if (modified) {
            localStorage.setItem('smilecare_doctors_list', JSON.stringify(cleaned));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Storage cleanup notice:', err);
  }
};

/**
 * Safely persists an item to localStorage with QuotaExceededError mitigation.
 * If quota is hit, runs cleanStorageQuota and retries. Never throws unhandled errors.
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaExceeded =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      err?.number === -2147024882;

    if (isQuotaExceeded) {
      console.warn(`[SafeStorage] LocalStorage quota exceeded while setting "${key}". Pruning oversized cached data...`);
      cleanStorageQuota();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error(`[SafeStorage] Unable to save "${key}" after pruning:`, retryErr);
        return false;
      }
    }

    console.warn(`[SafeStorage] Failed to save key "${key}":`, err);
    return false;
  }
};

// Immediate proactive cleanup on module evaluation
if (typeof window !== 'undefined' && window.localStorage) {
  cleanStorageQuota();
}

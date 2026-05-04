import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseDateString(dateStr) {
  if (!dateStr) return new Date();
  
  // 1. Try standard ISO/JS parsing first
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // 2. Try European format common in some locales (DD. MM. YYYY, HH:mm:ss)
  // E.g., "1. 5. 2026, 19:58:18"
  const parts = dateStr.match(/(\d+)\.\s*(\d+)\.\s*(\d+)(?:,\s*(\d+):(\d+):(\d+))?/);
  if (parts) {
    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parts[3];
    const hour = parts[4] ? parts[4].padStart(2, '0') : '00';
    const min = parts[5] ? parts[5].padStart(2, '0') : '00';
    const sec = parts[6] ? parts[6].padStart(2, '0') : '00';
    d = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
    if (!isNaN(d.getTime())) return d;
  }
  
  // 3. Try DD/MM/YYYY format
  const partsSlash = dateStr.match(/(\d+)\/(\d+)\/(\d+)(?:,\s*(\d+):(\d+):(\d+))?/);
  if (partsSlash) {
    const day = partsSlash[1].padStart(2, '0');
    const month = partsSlash[2].padStart(2, '0');
    const year = partsSlash[3];
    const hour = partsSlash[4] ? partsSlash[4].padStart(2, '0') : '00';
    const min = partsSlash[5] ? partsSlash[5].padStart(2, '0') : '00';
    const sec = partsSlash[6] ? partsSlash[6].padStart(2, '0') : '00';
    d = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
    if (!isNaN(d.getTime())) return d;
  }

  // 4. Fallback to current time if unparseable to prevent crashes
  return new Date(); 
}

export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  if (dateStr === 'Today') return true;
  const d = parseDateString(dateStr);
  return isSameDay(d, new Date());
}

export function isYesterday(dateStr) {
  if (!dateStr) return false;
  if (dateStr === 'Yesterday') return true;
  const d = parseDateString(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
}

export function isTomorrow(dateStr) {
  if (!dateStr) return false;
  if (dateStr === 'Tomorrow') return true;
  const d = parseDateString(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(d, tomorrow);
}


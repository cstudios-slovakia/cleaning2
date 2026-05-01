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
  
  // 3. Fallback to current time if unparseable to prevent crashes
  return new Date(); 
}

/**
 * Utility to compute relative upload time and urgency badges for produce listings
 */

export interface TimeAgoResult {
  relativeTime: string;
  fullDate: string;
  isFresh: boolean;
  isSuperFresh: boolean;
  badgeLabel: string;
  badgeColorClass: string;
}

export function formatUploadTimeAgo(dateString?: string | number | Date): TimeAgoResult {
  if (!dateString) {
    return {
      relativeTime: 'Recently',
      fullDate: 'Recently listed',
      isFresh: false,
      isSuperFresh: false,
      badgeLabel: 'Live Crop',
      badgeColorClass: 'bg-[#E8F0E8] text-[#4A5D4E] border-[#D4E2D4]',
    };
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Full date formatter
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const fullDate = `${dateStr} at ${timeStr}`;

  // Relative string calculation
  let relativeTime = '';
  let isSuperFresh = false;
  let isFresh = false;
  let badgeLabel = '';
  let badgeColorClass = '';

  if (diffSec < 60) {
    relativeTime = 'Just now';
    isSuperFresh = true;
    isFresh = true;
    badgeLabel = '⚡ Just Uploaded';
    badgeColorClass = 'bg-emerald-600 text-white shadow-xs';
  } else if (diffMin < 60) {
    relativeTime = `${diffMin}m ago`;
    isSuperFresh = true;
    isFresh = true;
    badgeLabel = `⚡ Fresh (${diffMin}m ago)`;
    badgeColorClass = 'bg-emerald-600 text-white shadow-xs';
  } else if (diffHours < 24) {
    relativeTime = `${diffHours}h ago`;
    isSuperFresh = diffHours <= 3;
    isFresh = true;
    badgeLabel = diffHours <= 3 ? `⚡ Fresh (${diffHours}h ago)` : `⏰ Uploaded ${diffHours}h ago`;
    badgeColorClass = diffHours <= 3 
      ? 'bg-[#E5B25D] text-[#2D3A30] font-extrabold shadow-2xs' 
      : 'bg-[#E8F0E8] text-[#2D3A30] border border-[#D4E2D4]';
  } else if (diffDays === 1) {
    relativeTime = `Yesterday at ${timeStr}`;
    isFresh = false;
    badgeLabel = '📅 Listed Yesterday';
    badgeColorClass = 'bg-stone-100 text-stone-700 border border-stone-200';
  } else if (diffDays < 7) {
    relativeTime = `${diffDays} days ago`;
    isFresh = false;
    badgeLabel = `📅 ${diffDays}d ago`;
    badgeColorClass = 'bg-stone-100 text-stone-700 border border-stone-200';
  } else {
    relativeTime = dateStr;
    isFresh = false;
    badgeLabel = `📅 ${dateStr}`;
    badgeColorClass = 'bg-stone-100 text-stone-700 border border-stone-200';
  }

  return {
    relativeTime,
    fullDate,
    isFresh,
    isSuperFresh,
    badgeLabel,
    badgeColorClass,
  };
}

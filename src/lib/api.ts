const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, '')
  : `${(import.meta.env.BASE_URL as string) || '/'}api`.replace(/\/+/g, '/').replace(/\/$/, '');

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}): ${res.statusText}`);
    }
    throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
  }
  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data as T;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUser = (uid: string) => req<any>(`/users/${uid}`);
export const getUserByUsername = (username: string) => req<any>(`/users/by-username/${username}`);
export const getUsers = (q?: string) => req<any[]>(`/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const upsertUser = (data: any) => req<any>('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (uid: string, data: any) => req<any>(`/users/${uid}`, { method: 'PUT', body: JSON.stringify(data) });
export const getUserStats = (uid: string) => req<any>(`/users/${uid}/stats`);

// ─── Novels ──────────────────────────────────────────────────────────────────
export const getNovels = (filters?: { authorUid?: string; status?: string; language?: string }) => {
  const p = new URLSearchParams();
  if (filters?.authorUid) p.set('authorUid', filters.authorUid);
  if (filters?.status) p.set('status', filters.status);
  if (filters?.language && filters.language !== 'all') p.set('language', filters.language);
  return req<any[]>(`/novels${p.toString() ? `?${p}` : ''}`);
};
export const getNovel = (id: string) => req<any>(`/novels/${id}`);
export const createNovel = (data: any) => req<any>('/novels', { method: 'POST', body: JSON.stringify(data) });
export const updateNovel = (id: string, data: any) => req<any>(`/novels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNovel = (id: string) => req<any>(`/novels/${id}`, { method: 'DELETE' });
export const likeNovel = (id: string, uid: string) => req<{ liked: boolean }>(`/novels/${id}/like`, { method: 'POST', body: JSON.stringify({ uid }) });
export const isLiked = (id: string, uid: string) => req<{ liked: boolean }>(`/novels/${id}/liked?uid=${uid}`);
export const viewNovel = (id: string) => req<any>(`/novels/${id}/view`, { method: 'POST', body: '{}' });
export const shareNovel = (id: string) => req<any>(`/novels/${id}/share`, { method: 'POST', body: '{}' });

// ─── Chapters ────────────────────────────────────────────────────────────────
export const getChapters = (novelId: string) => req<any[]>(`/novels/${novelId}/chapters`);
export const createChapter = (novelId: string, data: any) => req<any>(`/novels/${novelId}/chapters`, { method: 'POST', body: JSON.stringify(data) });
export const updateChapter = (novelId: string, chapterId: string, data: any) => req<any>(`/novels/${novelId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteChapter = (novelId: string, chapterId: string) => req<any>(`/novels/${novelId}/chapters/${chapterId}`, { method: 'DELETE' });

// ─── Characters ──────────────────────────────────────────────────────────────
export const getCharacters = (novelId: string) => req<any[]>(`/novels/${novelId}/characters`);
export const createCharacter = (novelId: string, data: any) => req<any>(`/novels/${novelId}/characters`, { method: 'POST', body: JSON.stringify(data) });
export const updateCharacter = (novelId: string, characterId: string, data: any) => req<any>(`/novels/${novelId}/characters/${characterId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCharacter = (novelId: string, characterId: string) => req<any>(`/novels/${novelId}/characters/${characterId}`, { method: 'DELETE' });

// ─── World Notes ─────────────────────────────────────────────────────────────
export const getWorldNotes = (novelId: string) => req<any[]>(`/novels/${novelId}/world-notes`);
export const createWorldNote = (novelId: string, data: any) => req<any>(`/novels/${novelId}/world-notes`, { method: 'POST', body: JSON.stringify(data) });
export const updateWorldNote = (novelId: string, id: string, data: any) => req<any>(`/novels/${novelId}/world-notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWorldNote = (novelId: string, id: string) => req<any>(`/novels/${novelId}/world-notes/${id}`, { method: 'DELETE' });

// ─── Follows ─────────────────────────────────────────────────────────────────
export const getFollows = (followerUid: string) => req<any[]>(`/follows?followerUid=${followerUid}`);
export const getFollowers = (followedUid: string) => req<any[]>(`/follows?followedUid=${followedUid}`);
export const getFollowingProfiles = (followerUid: string) => req<any[]>(`/follows/profiles?followerUid=${followerUid}`);
export const followUser = (followerUid: string, followedUid: string) => req<any>('/follows', { method: 'POST', body: JSON.stringify({ followerUid, followedUid }) });
export const unfollowUser = (followerUid: string, followedUid: string) => req<any>('/follows', { method: 'DELETE', body: JSON.stringify({ followerUid, followedUid }) });

// ─── Library ─────────────────────────────────────────────────────────────────
export const getLibrary = (uid: string) => req<any[]>(`/library?uid=${uid}`);
export const addToLibrary = (uid: string, novelId: string) => req<any>('/library', { method: 'POST', body: JSON.stringify({ uid, novelId }) });
export const removeFromLibrary = (uid: string, novelId: string) => req<any>('/library', { method: 'DELETE', body: JSON.stringify({ uid, novelId }) });

// ─── Progress ─────────────────────────────────────────────────────────────────
export const getProgress = (uid: string) => req<any[]>(`/progress?uid=${uid}`);
export const updateProgress = (uid: string, novelId: string, lastChapterId: string, lastChapterOrder: number) =>
  req<any>('/progress', { method: 'PUT', body: JSON.stringify({ uid, novelId, lastChapterId, lastChapterOrder }) });
export const upsertProgress = updateProgress;

// ─── Comments ─────────────────────────────────────────────────────────────────
export const getComments = (novelId: string, chapterId: string) => req<any[]>(`/novels/${novelId}/chapters/${chapterId}/comments`);
export const createComment = (novelId: string, chapterId: string, data: any) =>
  req<any>(`/novels/${novelId}/chapters/${chapterId}/comments`, { method: 'POST', body: JSON.stringify(data) });
export const deleteComment = (novelId: string, chapterId: string, commentId: string) =>
  req<any>(`/novels/${novelId}/chapters/${chapterId}/comments/${commentId}`, { method: 'DELETE' });

// ─── Sitemap ──────────────────────────────────────────────────────────────────
export const getSitemapData = () => req<any>('/sitemap-data');

// ─── Aliases & helpers ────────────────────────────────────────────────────────
export const follow = followUser;
export const unfollow = unfollowUser;
export const incrementStat = async (novelId: string, stat: string, uid?: string) => {
  if (stat === 'likesCount' && uid) return likeNovel(novelId, uid);
  if (stat === 'viewsCount') return viewNovel(novelId);
  if (stat === 'sharesCount') return shareNovel(novelId);
};

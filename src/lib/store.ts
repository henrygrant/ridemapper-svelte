import type { Activity, UserMeta } from '$lib/types/types';
import { writable } from 'svelte/store';

export const activities = writable<Activity[] | null>(null)
export const userMeta = writable<UserMeta | null>(null)
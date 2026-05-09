'use client';
export type ActivityLog={id:string;type:'cart'|'inventory'|'admin'|'profile'|'order';title:string;detail?:string;amount?:number;created_at:string};
const ACTIVITY_KEY='exousia-activity-logs-v1';const PROFILE_KEY='exousia-customer-profile-v1';
export function logActivity(entry:Omit<ActivityLog,'id'|'created_at'>){if(typeof window==='undefined')return;try{const current=JSON.parse(localStorage.getItem(ACTIVITY_KEY)||'[]') as ActivityLog[];const next=[{...entry,id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,created_at:new Date().toISOString()},...current].slice(0,100);localStorage.setItem(ACTIVITY_KEY,JSON.stringify(next));}catch{}}
export function getActivityLogs(){if(typeof window==='undefined')return [] as ActivityLog[];try{return JSON.parse(localStorage.getItem(ACTIVITY_KEY)||'[]') as ActivityLog[]}catch{return [] as ActivityLog[]}}
export type CustomerProfile={fullName:string;phone:string;address:string;city:string;province:string;notes:string};
export const emptyCustomerProfile:CustomerProfile={fullName:'',phone:'',address:'',city:'',province:'',notes:''};
export function getCustomerProfile(){if(typeof window==='undefined')return emptyCustomerProfile;try{return {...emptyCustomerProfile,...JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')} as CustomerProfile}catch{return emptyCustomerProfile}}
export function saveCustomerProfile(profile:CustomerProfile){if(typeof window==='undefined')return;localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));logActivity({type:'profile',title:'Customer profile updated',detail:profile.fullName||profile.phone||'Saved local shipping profile'});}

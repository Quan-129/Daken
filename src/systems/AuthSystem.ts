import { supabase } from '../utils/supabase';
import { EventBus } from '../utils/EventBus';

export interface UserProfile {
    id: string;
    email?: string;
    name: string;
    avatar?: string;
    agentId?: string; // numeric short ID
    total_score?: number;
    avg_wpm?: number;
    avg_acc?: number;
}

export class AuthSystem {
    private static instance: AuthSystem;
    private currentUser: UserProfile | null = null;

    private constructor() {
        this.initSession();
    }

    public static getInstance(): AuthSystem {
        if (!AuthSystem.instance) {
            AuthSystem.instance = new AuthSystem();
        }
        return AuthSystem.instance;
    }

    private async initSession() {
        // Kiểm tra session hiện tại từ Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.setProfileFromSupabase(session.user);
        }

        // Lắng nghe thay đổi trạng thái auth
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                this.setProfileFromSupabase(session.user);
                EventBus.getInstance().publish('AUTH_SUCCESS', this.currentUser);
            } else {
                this.currentUser = null;
                EventBus.getInstance().publish('AUTH_LOGOUT', null);
            }
        });
    }

    private setProfileFromSupabase(user: any) {
        const meta = user.user_metadata;
        this.currentUser = {
            id: user.id,
            email: user.email || '',
            name: meta?.display_name || meta?.full_name || localStorage.getItem('DAKEN_NAME') || 'GUEST_AGENT',
            avatar: meta?.avatar_url || localStorage.getItem('DAKEN_PLAYER_AVATAR') || '',
            agentId: meta?.agent_unique_id || localStorage.getItem('DAKEN_AGENT_ID') || '000000',
            total_score: meta?.total_score || 0,
            avg_wpm: meta?.avg_wpm || 0,
            avg_acc: meta?.avg_acc || 0
        };
        
        localStorage.setItem('DAKEN_ID', user.id);
        if (this.currentUser.name !== 'GUEST_AGENT') {
            localStorage.setItem('DAKEN_NAME', this.currentUser.name);
        }
        if (this.currentUser.agentId && this.currentUser.agentId !== '000000') {
            localStorage.setItem('DAKEN_AGENT_ID', this.currentUser.agentId);
        }
    }

    public async loginWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            console.error('Login Error:', error.message);
            throw error;
        }
    }

    public async logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('DAKEN_ID');
        localStorage.removeItem('DAKEN_NAME');
        localStorage.removeItem('DAKEN_PLAYER_AVATAR');
        localStorage.removeItem('DAKEN_AGENT_ID');
        
        // Trigger event thủ công nếu onAuthStateChange không nhận diện kịp
        this.currentUser = null;
        EventBus.getInstance().publish('AUTH_LOGOUT', null);
    }

    public getCurrentUser(): UserProfile | null {
        return this.currentUser;
    }

    public isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    public async register(email: string, pass: string, name: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { display_name: name }
            }
        });
        if (error) throw error;
        return data;
    }

    public async login(email: string, pass: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });
        if (error) throw error;
        return data;
    }

    public async updateProfile(updates: { name?: string; avatar?: string, agentId?: string, total_score?: number, avg_wpm?: number, avg_acc?: number }) {
        const { data, error } = await supabase.auth.updateUser({
            data: { 
                display_name: updates.name || (this.currentUser ? this.currentUser.name : undefined),
                avatar_url: updates.avatar || (this.currentUser ? this.currentUser.avatar : undefined),
                agent_unique_id: updates.agentId || (this.currentUser ? this.currentUser.agentId : undefined),
                total_score: updates.total_score !== undefined ? updates.total_score : (this.currentUser ? this.currentUser.total_score : undefined),
                avg_wpm: updates.avg_wpm !== undefined ? updates.avg_wpm : (this.currentUser ? this.currentUser.avg_wpm : undefined),
                avg_acc: updates.avg_acc !== undefined ? updates.avg_acc : (this.currentUser ? this.currentUser.avg_acc : undefined)
            }
        });
        if (error) throw error;
        
        // Cập nhật local state
        if (this.currentUser) {
            if (updates.name) {
                this.currentUser.name = updates.name;
                localStorage.setItem('DAKEN_NAME', updates.name);
            }
            if (updates.avatar) {
                this.currentUser.avatar = updates.avatar;
                localStorage.setItem('DAKEN_PLAYER_AVATAR', updates.avatar);
            }
            if (updates.agentId) {
                this.currentUser.agentId = updates.agentId;
                localStorage.setItem('DAKEN_AGENT_ID', updates.agentId);
            }
            if (updates.total_score !== undefined) this.currentUser.total_score = updates.total_score;
            if (updates.avg_wpm !== undefined) this.currentUser.avg_wpm = updates.avg_wpm;
            if (updates.avg_acc !== undefined) this.currentUser.avg_acc = updates.avg_acc;
        }

        // [Neural Hierarchy Sync] Cập nhật bảng profiles công khai
        try {
            const syncData: any = {
                id: this.currentUser?.id,
                name: this.currentUser?.name,
                agent_id: this.currentUser?.agentId,
                avatar: this.currentUser?.avatar,
                updated_at: new Date().toISOString()
            };
            if (this.currentUser?.total_score !== undefined) syncData.total_score = this.currentUser.total_score;
            if (this.currentUser?.avg_wpm !== undefined) syncData.avg_wpm = this.currentUser.avg_wpm;
            if (this.currentUser?.avg_acc !== undefined) syncData.avg_acc = this.currentUser.avg_acc;

            await supabase.from('profiles').upsert(syncData);
        } catch (err) {
            console.error("[Auth] Sync with Neural Hierarchy failed:", err);
        }
        
        EventBus.getInstance().publish('AUTH_SUCCESS', this.currentUser);
        return data;
    }
}

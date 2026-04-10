import { supabase } from '../utils/supabase';
import { EventBus } from '../utils/EventBus';

export interface UserProfile {
    id: string;
    email?: string;
    name: string;
    avatar?: string;
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
        this.currentUser = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            avatar: user.user_metadata?.avatar_url
        };
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
    }

    public getCurrentUser(): UserProfile | null {
        return this.currentUser;
    }

    public isLoggedIn(): boolean {
        return !!this.currentUser;
    }
}

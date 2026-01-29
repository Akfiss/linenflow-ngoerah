import { Config } from "ziggy-js";

export interface Room {
    id: number;
    name: string;
    type?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    room_id?: number | null;
    room?: Room | null;
}

export interface AuthProps {
    user: User;
    permissions: string[];
    roles: string[];
}

export type PageProps<T extends object = object> = T & {
    auth: AuthProps;
    ziggy: Config & { location: string };
    flash: {
        success?: string;
        error?: string;
    };
};

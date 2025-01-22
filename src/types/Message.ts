import { User } from "./User.ts";

export type Message = {
    timestamp: string,
    user?: User,
    text: string,
    attachments: any[],
}
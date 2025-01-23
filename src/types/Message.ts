import { Attachment } from "./Attachments.ts";
import { User } from "./User.ts";

export type Message = {
    timestamp: string,
    user?: User,
    text: string,
    attachments: Attachment[]
}

import { TabBank } from "../Model/Bank.model";
import { Agency } from "../Model/Agency.model";
export interface User {
    id?: string;
    username: string;
    password?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
    bank?:TabBank
    agency?:Agency
    adminId?: string;
    bankId?: number;
    agencyId?: string;
    sessionId?: string;
    active?: boolean; 
}

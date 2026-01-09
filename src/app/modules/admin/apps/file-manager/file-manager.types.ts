export interface Item {
    id: string;
    name: string;
    type: string;
    fileName?: string; // Optional if it might not exist for some items
    loadDate?: Date;
    createdCount?: number;
    updatedCount?: number;
    errorCardNumbers?: string[]; // Assuming it is an array of strings or any other appropriate type
    errorDetails: string;  
    createdBy?: string;
    createdAt?: Date;
    modifiedAt?: Date;
    size?: string;
}

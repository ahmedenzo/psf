export interface CardHolderLoadReport {
    id: number;                   // ID of the report
    fileName: string;             // The name of the file being loaded
    loadDate: Date;               // The date when the file was loaded
    createdCount: number;         // Number of cards created
    updatedCount: number;         // Number of cards updated
    errorCardNumbers: string[];   // List of card numbers that encountered errors
    errorDetails: string;         // Details of errors if any
}

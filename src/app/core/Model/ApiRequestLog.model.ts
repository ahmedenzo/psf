export interface ApiRequestLog {
    id?: number; // Unique identifier
    sessionId?: number; // Session ID
    requestPath?: string; // Path of the request
    method?: HttpMethodEnum; // HTTP method (can be an enum or string)
    statusCode?: number; // HTTP status code
    responseTimeMs?: number; // Response time in milliseconds
    timestamp?: string; // Timestamp when the request was made (ISO string)
    username?: string; // Optional: Username of the requester
    userAgent?: string; // Optional: User agent string
    requestBody?: string; // Optional: Request body (if any)
    responseBody?: string; // Optional: Response body (if any)
    exceptionMessage?: string; // Optional: Exception message (if any)
    requestSize?: number; // Optional: Size of the request in bytes
    responseSize?: number; // Optional: Size of the response in bytes
    ipAddress?: string; // Optional: IP address of the requester
    responseMessage?: string; // Optional: Additional response message
    createdAt?: string; // Optional: Creation timestamp (ISO string)
    updatedAt?: string; // Optional: Last update timestamp (ISO string)
  }
  
  // Define the HttpMethodEnum as a string enum
  export enum HttpMethodEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD',
  }
  
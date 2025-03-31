/**
 * Type for server response status
 */
export type TServerResponseStatus = "success" | "error" | "warning" | "info";

/**
 * Interface for base server response properties shared by all response types
 */
export interface IBaseServerResponse {
  status: TServerResponseStatus;
  message: string;
  timestamp: string; // ISO date string
  requestId?: string; // For request tracking/correlation
}

/**
 * Interface for successful server responses
 */
export interface ISuccessResponse extends IBaseServerResponse {
  status: "success";
  data?: Record<string, any> | any[] | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
    [key: string]: any;
  };
}

/**
 * Interface for error server responses
 */
export interface IErrorResponse extends IBaseServerResponse {
  status: "error" | "warning";
  statusCode: number;
  errorCode?: string;
  details?: Record<string, any> | any[];
  stack?: string; // Only included in development
}

/**
 * Union type for all server responses
 */
export type IServerResponse = ISuccessResponse | IErrorResponse;

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(response: IServerResponse): response is IErrorResponse {
  return response.status === "error" || response.status === "warning";
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse(response: IServerResponse): response is ISuccessResponse {
  return response.status === "success";
}

/**
 * Interface for pagination options
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Interface for paginated response metadata
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

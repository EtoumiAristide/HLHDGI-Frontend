export interface ApiPaginatedResponse<T> {
  "totalElements": number,
  "totalPages": number,
  "first": boolean,
  "size": number,
  "numberOfElements": number,
  content: T[];
}

export interface ApiOneResponse<T> {
  error_message: string;
  status: boolean;
  data: T;
}

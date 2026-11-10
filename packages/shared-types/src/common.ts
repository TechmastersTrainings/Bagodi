/**
 * Common API and Entity Types
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  phoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  postalCode?: string;
  isDefault: boolean;
  type?: "HOME" | "WORK" | "OTHER";
}

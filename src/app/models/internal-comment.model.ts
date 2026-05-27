export interface InternalComment {
  id: string;
  requestId: string;
  text: string;
  author: string;
  visibleToCustomer: boolean;
  createdAt: string;
}

export interface CreateComment {
  requestId?: string;
  text: string;
  visibleToCustomer: boolean;
}

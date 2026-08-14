export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export interface Metatag {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  noindex?: boolean;
  siteName?: string;
}

export interface HomeRouteData {
  currentPath?: string;
}

export interface TodoListRouteData {
  todos: Todo[];
  currentPath?: string;
}

export interface TodoDetailRouteData {
  todo: Todo;
  currentPath?: string;
}

export interface ErrorPageData {
  message: string;
  currentPath?: string;
}

export interface NotFoundData {
  path: string;
  currentPath?: string;
}

// GENERATE:TYPE

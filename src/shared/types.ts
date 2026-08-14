export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

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

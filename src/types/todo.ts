export interface Todo {
  readonly id: number
  readonly title: string
  readonly completed?: boolean
  readonly createdAt?: Date
}

export interface TodoFilters {
  readonly showCompleted: boolean
  readonly searchTerm: string
}

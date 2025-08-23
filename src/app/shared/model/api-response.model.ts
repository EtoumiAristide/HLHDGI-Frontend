export class ApiPaginatedResponse<T> {
  message: string = ''
  data: T[] = []
  total_pages: number = 0
  total_items: number = 0
  current_page: number = 0
  status: boolean = false
  page_size: number = 0
}

export class ApiAllResponse<T> {
  message: string = ''
  data: T[] = []
  total_items: number = 0
  status: boolean = false
}

export class ApiOneResponse<T> {
  message: string = ''
  status: boolean = false
  data!: T
}
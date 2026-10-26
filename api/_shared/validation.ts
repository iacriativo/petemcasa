import { z, ZodError } from 'zod'

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid('product_id deve ser um UUID válido'),
  quantity: z.number().int('quantidade deve ser um número inteiro').positive('quantidade deve ser maior que zero'),
})

export const CreateOrderInputSchema = z.object({
  client_order_token: z.string().uuid('client_order_token deve ser um UUID válido'),
  pet_name: z.string().min(1, 'Nome do pet é obrigatório').max(100, 'Nome do pet deve ter no máximo 100 caracteres'),
  block: z.string().min(1, 'Bloco é obrigatório').max(30, 'Bloco deve ter no máximo 30 caracteres'),
  unit_number: z.string().min(1, 'Número da unidade é obrigatório').max(30, 'Número da unidade deve ter no máximo 30 caracteres'),
  items: z.array(OrderItemInputSchema).min(1, 'Pelo menos um item é obrigatório'),
})

export const OrderStatusInputSchema = z.object({
  order_token: z.string().uuid('order_token deve ser um UUID válido'),
})

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>
export type OrderStatusInput = z.infer<typeof OrderStatusInputSchema>
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>

function zodErrors(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ')
}

export function validateCreateOrder(input: unknown): { success: true; data: CreateOrderInput } | { success: false; error: string } {
  const result = CreateOrderInputSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: zodErrors(result.error) }
  }
  return { success: true, data: result.data }
}

export function validateOrderStatus(input: unknown): { success: true; data: OrderStatusInput } | { success: false; error: string } {
  const result = OrderStatusInputSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: zodErrors(result.error) }
  }
  return { success: true, data: result.data }
}

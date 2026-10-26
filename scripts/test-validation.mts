import { validateCreateOrder, validateOrderStatus } from '../api/_shared/validation.ts'

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`PASS: ${name}`)
    passed++
  } catch (e: any) {
    console.log(`FAIL: ${name} - ${e.message}`)
    failed++
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

// Teste 1: Validação de pedido válido
test('Pedido válido é aceito', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: 'Rex',
    block: 'A',
    unit_number: '101',
    items: [{ product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 }],
  })
  assert(result.success, `Esperado sucesso, obteve erro: ${result.error}`)
  assert(result.data.pet_name === 'Rex', 'pet_name incorreto')
  assert(result.data.items.length === 1, 'items incorreto')
})

// Teste 2: Token UUID inválido
test('Token UUID inválido é rejeitado', () => {
  const result = validateCreateOrder({
    client_order_token: 'não-é-uuid',
    pet_name: 'Rex',
    block: 'A',
    unit_number: '101',
    items: [{ product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 }],
  })
  assert(!result.success, 'Esperado falha')
  assert(result.error.includes('UUID'), 'Erro deveria mencionar UUID')
})

// Teste 3: Pet name vazio
test('Pet name vazio é rejeitado', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: '',
    block: 'A',
    unit_number: '101',
    items: [{ product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 }],
  })
  assert(!result.success, 'Esperado falha')
})

// Teste 4: Items vazio
test('Items vazio é rejeitado', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: 'Rex',
    block: 'A',
    unit_number: '101',
    items: [],
  })
  assert(!result.success, 'Esperado falha')
})

// Teste 5: Quantidade zero ou negativa
test('Quantidade zero é rejeitada', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: 'Rex',
    block: 'A',
    unit_number: '101',
    items: [{ product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 0 }],
  })
  assert(!result.success, 'Esperado falha')
})

// Teste 6: Status de ordem válido
test('Status de ordem válido é aceito', () => {
  const result = validateOrderStatus({ order_token: '550e8400-e29b-41d4-a716-446655440000' })
  assert(result.success, `Esperado sucesso, obteve erro: ${result.error}`)
})

// Teste 7: Token de status inválido
test('Token de status inválido é rejeitado', () => {
  const result = validateOrderStatus({ order_token: 'invalido' })
  assert(!result.success, 'Esperado falha')
  assert(result.error.includes('UUID'), 'Erro deveria mencionar UUID')
})

// Teste 8: Bloco muito longo
test('Bloco com mais de 30 caracteres é rejeitado', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: 'Rex',
    block: 'A'.repeat(31),
    unit_number: '101',
    items: [{ product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 1 }],
  })
  assert(!result.success, 'Esperado falha')
})

// Teste 9: Múltiplos itens
test('Múltiplos itens são aceitos', () => {
  const result = validateCreateOrder({
    client_order_token: '550e8400-e29b-41d4-a716-446655440000',
    pet_name: 'Rex',
    block: 'A',
    unit_number: '101',
    items: [
      { product_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 1 },
      { product_id: '550e8400-e29b-41d4-a716-446655440002', quantity: 3 },
    ],
  })
  assert(result.success, `Esperado sucesso, obteve erro: ${result.error}`)
  assert(result.data.items.length === 2, 'Deveria ter 2 itens')
})

console.log(`\nResultados: ${passed} passou, ${failed} falhou`)
process.exit(failed > 0 ? 1 : 0)

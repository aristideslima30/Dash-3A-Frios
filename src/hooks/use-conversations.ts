'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface TempMessage {
  id: string
  cliente_id: string
  mensagem_cliente: string
  resposta_bot?: string
  tipo_mensagem: 'texto' | 'audio'
  agente_responsavel?: string
  acao_especial?: string
  timestamp: string
}

// Conversas mockadas para testes
const MOCK_CONVERSATIONS: Record<string, TempMessage[]> = {
  'mock-1': [
    {
      id: 'conv-1-1',
      cliente_id: 'mock-1',
      mensagem_cliente: 'Oi! Gostaria de saber sobre queijos artesanais',
      resposta_bot: 'Olá! Temos uma seleção especial de queijos artesanais. Posso te mostrar nosso catálogo?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Catálogo',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'conv-1-2',
      cliente_id: 'mock-1',
      mensagem_cliente: 'Sim, por favor!',
      resposta_bot: 'Perfeito! Aqui estão nossos queijos mais populares: Queijo Minas, Queijo Coalho, Queijo Prato...',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Catálogo',
      acao_especial: 'catálogo enviado',
      timestamp: new Date(Date.now() - 3300000).toISOString()
    },
    {
      id: 'conv-1-3',
      cliente_id: 'mock-1',
      mensagem_cliente: 'Quanto custa o queijo minas?',
      resposta_bot: 'O queijo minas artesanal custa R$ 28,00 o kg. Temos também promoções para compras acima de 2kg!',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Pedidos',
      timestamp: new Date(Date.now() - 3000000).toISOString()
    }
  ],
  'mock-2': [
    {
      id: 'conv-2-1',
      cliente_id: 'mock-2',
      mensagem_cliente: 'Preciso de carnes para um churrasco no fim de semana',
      resposta_bot: 'Ótima escolha! Temos carnes premium perfeitas para churrasco. Quantas pessoas?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Qualificação',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'conv-2-2',
      cliente_id: 'mock-2',
      mensagem_cliente: 'Será para umas 15 pessoas',
      resposta_bot: 'Perfeito! Para 15 pessoas recomendo: 3kg de picanha, 2kg de maminha, 2kg de linguiça... Total aproximado: R$ 450',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Pedidos',
      acao_especial: 'lead qualificado',
      timestamp: new Date(Date.now() - 6900000).toISOString()
    },
    {
      id: 'conv-2-3',
      cliente_id: 'mock-2',
      mensagem_cliente: 'Perfeito! Como faço o pedido?',
      resposta_bot: 'Vou te passar para nosso atendimento especializado para finalizar seu pedido!',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Atendimento',
      timestamp: new Date(Date.now() - 6600000).toISOString()
    }
  ],
  'mock-3': [
    {
      id: 'conv-3-1',
      cliente_id: 'mock-3',
      mensagem_cliente: 'Olá, preciso de frios para uma festa de aniversário',
      resposta_bot: 'Que legal! Festa de aniversário é sempre especial. Quantos convidados?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Qualificação',
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 'conv-3-2',
      cliente_id: 'mock-3',
      mensagem_cliente: 'Uns 30 convidados',
      resposta_bot: 'Ótimo! Para 30 pessoas sugiro nosso Kit Festa: presunto, queijo, salame, copa... R$ 180. Quer ver?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Catálogo',
      timestamp: new Date(Date.now() - 10500000).toISOString()
    }
  ],
  'mock-5': [
    {
      id: 'conv-5-1',
      cliente_id: 'mock-5',
      mensagem_cliente: 'Tenho um restaurante e preciso de fornecedor fixo',
      resposta_bot: 'Excelente! Trabalhamos com vários restaurantes. Que tipo de produtos você precisa?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Qualificação',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'conv-5-2',
      cliente_id: 'mock-5',
      mensagem_cliente: 'Preciso de tudo: carnes, queijos, frios, embutidos...',
      resposta_bot: 'Perfeito! Temos um kit completo para restaurantes. Posso agendar uma visita para apresentar nossa linha completa?',
      tipo_mensagem: 'texto',
      agente_responsavel: 'Atendimento',
      acao_especial: 'endereço atualizado',
      timestamp: new Date(Date.now() - 1500000).toISOString()
    }
  ]
}

export function useConversations(clienteId: string) {
  return useQuery({
    queryKey: ['conversations', clienteId],
    queryFn: async () => {
      // Se for um ID mockado, retorna conversas mockadas
      if (clienteId.startsWith('mock-')) {
        return MOCK_CONVERSATIONS[clienteId] || []
      }

      const { data, error } = await supabase
        .from('temp_messages')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Erro ao buscar conversas:', error)
        return []
      }

      return data || []
    },
    enabled: !!clienteId,
  })
}

export function useRecentConversations() {
  return useQuery({
    queryKey: ['conversations', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_messages')
        .select('*, clientes_delivery(*)')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Erro ao buscar conversas recentes:', error)
        // Retorna algumas conversas mockadas como exemplo
        return Object.entries(MOCK_CONVERSATIONS).flatMap(([clienteId, conversations]) => 
          conversations.map(conv => ({
            ...conv,
            clientes_delivery: {
              id: clienteId,
              nome: clienteId === 'mock-1' ? 'João Silva' : 
                    clienteId === 'mock-2' ? 'Maria Santos' : 
                    clienteId === 'mock-3' ? 'Pedro Oliveira' : 
                    clienteId === 'mock-5' ? 'Carlos Ferreira' : 'Cliente'
            }
          }))
        )
      }

      return data || []
    },
  })
}
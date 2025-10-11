'use client'

import { useState } from 'react'
import { useConversations } from '@/hooks/use-conversations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ClienteDelivery } from '@/lib/supabase'
import { Send, RotateCcw, Bot, User, Volume2, Clock } from 'lucide-react'

interface ConversationViewerProps {
  client: ClienteDelivery
}

export function ConversationViewer({ client }: ConversationViewerProps) {
  const [message, setMessage] = useState('')
  const { data: conversations, isLoading } = useConversations(client.id)

  const handleSendMessage = async () => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    const evoServer = process.env.NEXT_PUBLIC_EVOLUTION_SERVER_URL
    const evoInstance = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE
    const evoApiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY

    if (!message.trim() || !webhookUrl) {
      console.warn('Mensagem vazia ou webhook não configurado')
      return
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'enviar-mensagem',
          telefone: client.telefone,
          mensagem: message.trim(),
          whatsapp: {
            evo: {
              server_url: evoServer,
              nomeInstancia: evoInstance,
              apikey: evoApiKey,
            },
          },
        }),
      })
      if (!res.ok) throw new Error(`Falha no webhook: ${res.status}`)
      setMessage('')
    } catch (err) {
      console.error('Erro ao enviar ao n8n:', err)
    }
  }

  const handleReprocess = async () => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    const evoServer = process.env.NEXT_PUBLIC_EVOLUTION_SERVER_URL
    const evoInstance = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE
    const evoApiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY

    if (!webhookUrl) {
      console.warn('Webhook não configurado')
      return
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'reprocessar',
          telefoneCliente: client.telefone,
          nomeCliente: client.nome,
          mensagem: message.trim() || '',
          whatsapp: {
            evo: {
              server_url: evoServer,
              nomeInstancia: evoInstance,
              apikey: evoApiKey,
            },
          },
        }),
      })
      if (!res.ok) throw new Error(`Falha no webhook: ${res.status}`)
    } catch (err) {
      console.error('Erro ao reprocessar no n8n:', err)
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Carregando conversas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
              {client.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">{client.nome}</CardTitle>
              <p className="text-sm text-green-600">{client.telefone}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReprocess}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reprocessar
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area - WhatsApp Style */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv, index) => (
                <div key={index} className="space-y-2">
                  {/* Client Message */}
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-white rounded-lg px-3 py-2 shadow-sm border">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Cliente</span>
                        {conv.tipo_mensagem === 'audio' && (
                          <Volume2 className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{conv.mensagem_cliente}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(conv.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bot Response */}
                  {conv.resposta_bot && (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] bg-green-500 text-white rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3 w-3" />
                          <span className="text-xs font-medium opacity-90">
                            {conv.agente_responsavel || 'Bot'}
                          </span>
                          {conv.agente_responsavel && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-600">
                              {conv.agente_responsavel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{conv.resposta_bot}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {new Date(conv.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <div className="text-xs opacity-75">✓✓</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Actions Indicators */}
                  {conv.acao_especial && (
                    <div className="flex justify-center">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {conv.acao_especial}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhuma conversa encontrada</p>
                  <p className="text-xs">As mensagens aparecerão aqui quando o cliente interagir</p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input - WhatsApp Style */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="rounded-full w-10 h-10 p-0 bg-green-500 hover:bg-green-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
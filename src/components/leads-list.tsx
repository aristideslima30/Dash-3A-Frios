'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, MessageCircle, Filter } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { LeadScoreBadge } from './lead-score-badge'
import { LeadStatusBadge } from './lead-status-badge'
import { ClienteDelivery } from '@/lib/supabase'

interface LeadsListProps {
  onSelectClient: (client: ClienteDelivery) => void
  selectedClientId?: string
  showOnlyWithConversations?: boolean
}

export function LeadsList({ onSelectClient, selectedClientId, showOnlyWithConversations = false }: LeadsListProps) {
  const { data: leads, isLoading, error } = useLeads()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')

  const filteredLeads = leads?.filter(lead => {
    // Verificações de segurança para evitar erros
    const nome = lead.nome || ''
    const telefone = lead.telefone || ''
    
    const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         telefone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter
    
    const matchesScore = scoreFilter === 'all' || 
                        (scoreFilter === 'high' && (lead.lead_score || 0) >= 7) ||
                        (scoreFilter === 'medium' && (lead.lead_score || 0) >= 4 && (lead.lead_score || 0) < 7) ||
                        (scoreFilter === 'low' && (lead.lead_score || 0) < 4)
    
    // Filtro adicional para mostrar apenas leads com conversas
    const hasConversations = showOnlyWithConversations ? 
      // Por enquanto, vamos assumir que leads com score > 0 têm conversas
      // Isso pode ser melhorado com uma verificação real de conversas
      (lead.lead_score || 0) > 0 : true
    
    return matchesSearch && matchesStatus && matchesScore && hasConversations
  })

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Carregando leads...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Erro ao carregar leads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Não foi possível carregar os leads.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showOnlyWithConversations ? 'Conversas Recentes' : 'Leads'}
          </CardTitle>
          <Badge variant="secondary">
            {filteredLeads?.length || 0}
          </Badge>
        </div>
        
        {/* Filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="interessado">Interessado</SelectItem>
                <SelectItem value="pronto_para_comprar">Pronto</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="high">Alto (7+)</SelectItem>
                <SelectItem value="medium">Médio (4-6)</SelectItem>
                <SelectItem value="low">Baixo (&lt;4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLeads && filteredLeads.length > 0 ? (
            <div className="space-y-1">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectClient(lead)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedClientId === lead.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{lead.nome}</h3>
                      <p className="text-xs text-gray-600">{lead.telefone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <LeadScoreBadge score={lead.lead_score || 0} />
                      <LeadStatusBadge status={lead.lead_status} />
                    </div>
                  </div>
                  
                  {lead.interesse_declarado && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        <span className="font-medium">Interesse:</span> {lead.interesse_declarado}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {lead.frequencia_compra && (
                        <span>Freq: {lead.frequencia_compra}</span>
                      )}
                      {lead.valor_potencial && (
                        <span>R$ {lead.valor_potencial}</span>
                      )}
                    </div>
                    <span>
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {showOnlyWithConversations 
                  ? 'Nenhuma conversa encontrada' 
                  : 'Nenhum lead encontrado'
                }
              </p>
              {searchTerm && (
                <p className="text-xs mt-1">
                  Tente ajustar os filtros de busca
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
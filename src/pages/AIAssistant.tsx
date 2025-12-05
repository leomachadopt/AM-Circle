import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bot, Send, User, Sparkles } from 'lucide-react'
import { mockUser } from '@/lib/data'

type Message = {
  id: number
  role: 'user' | 'ai'
  content: string
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      content: `Olá, ${mockUser.name}! Sou a sua assistente Airlign Mastery Circle. Como posso ajudar a otimizar a sua clínica hoje?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    'Gerar guião de vendas para branqueamento',
    'Analisar os meus KPIs deste mês',
    'Criar plano de ação para a receção',
    'Resumo da última mentoria',
  ]

  const handleSend = (text: string = input) => {
    if (!text.trim()) return

    const newMessage: Message = { id: Date.now(), role: 'user', content: text }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content:
          'Entendi. Aqui está uma sugestão baseada nas melhores práticas do Airlign Mastery Circle:\n\nPara aumentar a conversão de branqueamento, foque-se nos benefícios emocionais e na rapidez do resultado. Gostaria que eu detalhasse um guião específico?',
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  useEffect(() => {
    // Scroll to bottom logic would go here if we had direct access to the scroll container ref
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shadow-lg">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">Assistente IA Airlign Mastery Circle</h1>
          <p className="text-xs text-muted-foreground">
            A sua consultora virtual 24/7
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 border">
                  {msg.role === 'ai' ? (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <AvatarImage src={mockUser.avatar} />
                  )}
                  <AvatarFallback>
                    {msg.role === 'ai' ? 'IA' : 'EU'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 max-w-[80%] text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3 flex items-center gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/30 border-t">
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
              {suggestions.map((sug) => (
                <Button
                  key={sug}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap text-xs rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                  onClick={() => handleSend(sug)}
                >
                  <Sparkles className="mr-1 h-3 w-3 text-secondary-foreground" />{' '}
                  {sug}
                </Button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva a sua pergunta..."
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

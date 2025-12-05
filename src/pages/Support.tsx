import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function Support() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Apoio Airlign Mastery Circle
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Estamos aqui para o ajudar.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <span className="font-medium">E-mail</span>
          </CardContent>
        </Card>
        <Card className="text-center hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <span className="font-medium">WhatsApp</span>
          </CardContent>
        </Card>
        <Card className="text-center hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Phone className="h-8 w-8 text-primary" />
            <span className="font-medium">Ligar</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envie uma mensagem</CardTitle>
          <CardDescription>
            Responderemos num prazo de 24 horas úteis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input placeholder="Ex: Dúvida sobre acesso" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Descreva o seu problema ou dúvida..."
                className="min-h-[150px]"
              />
            </div>
            <Button className="w-full">Enviar Mensagem</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

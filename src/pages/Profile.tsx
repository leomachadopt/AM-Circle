import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockUser } from '@/lib/data'
import { Award, Trophy, Star } from 'lucide-react'

export default function Profile() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-1/3">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-secondary">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{mockUser.name}</h2>
            <p className="text-muted-foreground mb-4">{mockUser.level}</p>
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full text-primary font-bold">
              <Trophy className="h-5 w-5 text-secondary-foreground" />
              {mockUser.points} Pontos
            </div>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas e Emblemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br ${i <= 3 ? 'from-yellow-100 to-yellow-300 border-2 border-yellow-400' : 'from-gray-100 to-gray-200 grayscale opacity-50'}`}
                    >
                      <Award
                        className={`h-8 w-8 ${i <= 3 ? 'text-yellow-700' : 'text-gray-500'}`}
                      />
                    </div>
                    <span className="text-xs text-center font-medium group-hover:text-primary">
                      Mestre em Gestão {i}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input defaultValue={mockUser.name} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input defaultValue={mockUser.email} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>CRO</Label>
                  <Input placeholder="00000/UF" />
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { mockPosts } from '@/lib/data'
import { Heart, MessageCircle, Share2, Users } from 'lucide-react'

export default function Community() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Comunidade HBM</h1>
        <p className="text-muted-foreground">
          Conecte-se com outros dentistas de alta performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=male" />
                  <AvatarFallback>EU</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Compartilhe uma experiência ou dúvida..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button>Publicar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar>
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{post.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {post.time}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{post.content}</p>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-0 hover:text-red-500"
                    >
                      <Heart className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-0 hover:text-primary"
                    >
                      <MessageCircle className="h-4 w-4" /> {post.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-0 ml-auto"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Grupos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Gestão de Clínica',
                'Marketing Odontológico',
                'Ortodontia',
                'Implantes',
              ].map((group) => (
                <Button
                  key={group}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  # {group}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

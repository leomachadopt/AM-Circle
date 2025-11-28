import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { mockPosts, mockUser } from '@/lib/data'
import { Heart, MessageCircle, Share2, Users, Tag } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Community() {
  const [posts, setPosts] = useState(mockPosts)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTopic, setNewPostTopic] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')

  const topics = ['Perguntas', 'Links Interessantes', 'Ficheiros']

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error('Por favor, escreva algo para publicar.')
      return
    }

    if (!newPostTopic) {
      toast.error('Por favor, selecione um tópico para a sua publicação.')
      return
    }

    const newPost = {
      id: Date.now(),
      author: mockUser.name,
      avatar: mockUser.avatar,
      content: newPostContent,
      likes: 0,
      comments: 0,
      time: 'Agora mesmo',
      topic: newPostTopic,
    }

    setPosts([newPost, ...posts])
    setNewPostContent('')
    setNewPostTopic('')
    toast.success('Publicação criada com sucesso!')
  }

  const filteredPosts =
    activeFilter === 'Todos'
      ? posts
      : posts.filter((post) => post.topic === activeFilter)

  const getTopicBadgeVariant = (topic: string) => {
    switch (topic) {
      case 'Perguntas':
        return 'default'
      case 'Links Interessantes':
        return 'secondary'
      case 'Ficheiros':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Comunidade HBM</h1>
        <p className="text-muted-foreground">
          Ligue-se a outros dentistas de alta performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback>EU</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Partilhe uma experiência, dúvida ou ficheiro..."
                    className="min-h-[100px]"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="w-full sm:w-[240px]">
                      <Select
                        value={newPostTopic}
                        onValueChange={setNewPostTopic}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tópico *" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic} value={topic}>
                              {topic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      className="w-full sm:w-auto"
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Tabs
            defaultValue="Todos"
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2">
              <TabsTrigger
                value="Todos"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4 py-2 border border-border bg-white"
              >
                Todos
              </TabsTrigger>
              {topics.map((topic) => (
                <TabsTrigger
                  key={topic}
                  value={topic}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4 py-2 border border-border bg-white"
                >
                  {topic}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeFilter} className="mt-6 space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="animate-fade-in">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {post.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {post.time}
                          </span>
                        </div>
                      </div>
                      {post.topic && (
                        <Badge variant={getTopicBadgeVariant(post.topic)}>
                          {post.topic}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4 whitespace-pre-wrap">
                        {post.content}
                      </p>
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
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma publicação encontrada neste tópico.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
                'Marketing Dentário',
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

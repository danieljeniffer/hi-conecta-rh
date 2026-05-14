from django.db import models
from apps.core.models import AuditedModel, BaseModel
from apps.accounts.models import Usuario


class Comunicado(AuditedModel):
    titulo      = models.CharField(max_length=200)
    conteudo    = models.TextField()
    urgente     = models.BooleanField(default=False)
    publicado   = models.BooleanField(default=False)
    publicado_em= models.DateTimeField(null=True, blank=True)
    expira_em   = models.DateTimeField(null=True, blank=True)
    segmentos   = models.JSONField(default=list)

    class Meta:
        db_table = 'comunicacao_comunicado'
        ordering = ['-publicado_em']

    def __str__(self):
        return self.titulo


class FeedPost(AuditedModel):
    autor    = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='posts')
    conteudo = models.TextField()
    midia    = models.FileField(upload_to='comunicacao/feed/', null=True, blank=True)
    tipo     = models.CharField(max_length=20, default='post')
    fixado   = models.BooleanField(default=False)

    class Meta:
        db_table = 'comunicacao_feed_post'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.autor.nome}: {self.conteudo[:50]}'


class Comentario(BaseModel):
    post     = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='comentarios')
    autor    = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    conteudo = models.TextField()

    class Meta:
        db_table = 'comunicacao_comentario'


class Reacao(BaseModel):
    TIPOS = [('like','Like'),('love','Love'),('haha','Haha'),('wow','Wow')]
    post     = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='reacoes')
    usuario  = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo     = models.CharField(max_length=10, choices=TIPOS, default='like')

    class Meta:
        db_table    = 'comunicacao_reacao'
        unique_together = [('post','usuario')]

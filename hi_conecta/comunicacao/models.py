"""comunicacao/models.py — Mural, comunicados, aniversariantes, reconhecimentos."""
from django.db import models
from core.models import BaseModel, BaseAuditModel


class Comunicado(BaseAuditModel):
    TIPOS = [
        ('noticia',      'Notícia'),
        ('aviso',        'Aviso Geral'),
        ('urgente',      'Urgente'),
        ('evento',       'Evento'),
        ('aniversario',  'Aniversário'),
        ('reconhecimento','Reconhecimento'),
        ('policy',       'Política/Norma'),
    ]
    SEGMENTOS = [
        ('todos',         'Todos'),
        ('departamento',  'Por Departamento'),
        ('cargo',         'Por Cargo'),
        ('perfil',        'Por Perfil'),
    ]

    titulo       = models.CharField(max_length=250)
    tipo         = models.CharField(max_length=20, choices=TIPOS, default='noticia')
    conteudo     = models.TextField()
    imagem       = models.ImageField(upload_to='comunicacao/imagens/', blank=True, null=True)
    segmento     = models.CharField(max_length=15, choices=SEGMENTOS, default='todos')
    departamentos_alvo = models.ManyToManyField('rh.Departamento', blank=True, related_name='comunicados')
    ativo        = models.BooleanField(default=True)
    fixado       = models.BooleanField(default=False)
    publicado_em = models.DateTimeField(null=True, blank=True)
    expira_em    = models.DateTimeField(null=True, blank=True)
    autor        = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                    on_delete=models.SET_NULL, related_name='comunicados_criados')
    visualizacoes = models.IntegerField(default=0)
    permite_comentarios = models.BooleanField(default=True)

    class Meta:
        db_table = 'comunicacao_comunicado'
        ordering = ['-fixado', '-publicado_em', '-created_at']
        verbose_name = 'Comunicado'
        verbose_name_plural = 'Comunicados'

    def __str__(self):
        return self.titulo


class ComentarioComunicado(BaseModel):
    comunicado = models.ForeignKey(Comunicado, on_delete=models.CASCADE, related_name='comentarios')
    autor      = models.ForeignKey('accounts.Usuario', on_delete=models.CASCADE, related_name='comentarios_comunicado')
    texto      = models.TextField()
    curtidas   = models.IntegerField(default=0)

    class Meta:
        db_table = 'comunicacao_comentario'
        ordering = ['created_at']
        verbose_name = 'Comentário'
        verbose_name_plural = 'Comentários'

    def __str__(self):
        return f'{self.autor} → {self.comunicado}'


class Reconhecimento(BaseModel):
    TIPOS = [
        ('destaque_mes',   'Destaque do Mês'),
        ('entrega',        'Entrega Excepcional'),
        ('inovacao',       'Inovação'),
        ('colaboracao',    'Colaboração'),
        ('cliente',        'Foco no Cliente'),
        ('superacao',      'Superação'),
        ('aniversario',    'Aniversário de Empresa'),
        ('personalizado',  'Personalizado'),
    ]

    remetente    = models.ForeignKey('accounts.Usuario', on_delete=models.CASCADE, related_name='reconhecimentos_enviados')
    destinatario = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='reconhecimentos_recebidos')
    tipo         = models.CharField(max_length=20, choices=TIPOS, default='destaque_mes')
    mensagem     = models.TextField()
    publico      = models.BooleanField(default=True)
    pontos       = models.IntegerField(default=50)  # pontos de gamificação

    class Meta:
        db_table = 'comunicacao_reconhecimento'
        ordering = ['-created_at']
        verbose_name = 'Reconhecimento'
        verbose_name_plural = 'Reconhecimentos'

    def __str__(self):
        return f'{self.remetente} → {self.destinatario}: {self.tipo}'

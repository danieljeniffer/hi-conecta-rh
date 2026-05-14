"""gestor/models.py — Modelos do Gestor de Equipes."""
from django.db import models
from core.models import BaseModel


class MetaEquipe(BaseModel):
    STATUS = [('ativa','Ativa'),('concluida','Concluída'),('cancelada','Cancelada')]

    gestor      = models.ForeignKey('accounts.Usuario', on_delete=models.CASCADE, related_name='metas_equipe')
    departamento= models.ForeignKey('rh.Departamento', null=True, blank=True,
                    on_delete=models.SET_NULL, related_name='metas')
    titulo      = models.CharField(max_length=200)
    descricao   = models.TextField(blank=True)
    status      = models.CharField(max_length=15, choices=STATUS, default='ativa')
    prazo       = models.DateField()
    progresso   = models.IntegerField(default=0)
    resultado   = models.TextField(blank=True)

    class Meta:
        db_table = 'gestor_meta_equipe'
        ordering = ['-created_at']
        verbose_name = 'Meta de Equipe'

    def __str__(self):
        return self.titulo


class FeedbackGestor(BaseModel):
    TIPOS = [
        ('positivo',   'Positivo'),
        ('construtivo','Construtivo'),
        ('neutro',     'Neutro'),
        ('360',        'Feedback 360°'),
    ]

    gestor      = models.ForeignKey('accounts.Usuario', on_delete=models.CASCADE, related_name='feedbacks_dados')
    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='feedbacks_recebidos')
    tipo        = models.CharField(max_length=15, choices=TIPOS, default='construtivo')
    assunto     = models.CharField(max_length=200)
    mensagem    = models.TextField()
    privado     = models.BooleanField(default=False)

    class Meta:
        db_table = 'gestor_feedback'
        ordering = ['-created_at']
        verbose_name = 'Feedback'

    def __str__(self):
        return f'{self.gestor} → {self.colaborador}: {self.assunto}'

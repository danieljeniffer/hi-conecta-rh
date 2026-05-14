"""
rh/exit_intelligence.py — Exit Intelligence: questionário pós-desligamento adaptativo.
"""
from django.db import models
import uuid
from core.models import BaseModel


class QuestionarioExit(BaseModel):
    STATUS = [('enviado','Enviado'),('respondido','Respondido'),('expirado','Expirado')]

    colaborador    = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='exit_questionarios')
    rescisao       = models.OneToOneField('dp.Rescisao', null=True, blank=True,
                       on_delete=models.SET_NULL, related_name='exit_questionario')
    status         = models.CharField(max_length=15, choices=STATUS, default='enviado')
    token          = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    respondido_em  = models.DateTimeField(null=True, blank=True)
    expira_em      = models.DateTimeField(null=True, blank=True)

    # Respostas estruturadas
    motivo_principal = models.CharField(max_length=50, blank=True, choices=[
        ('salario',         'Remuneração Abaixo do Mercado'),
        ('crescimento',     'Falta de Crescimento'),
        ('clima',           'Clima Organizacional'),
        ('liderança',       'Relacionamento com Liderança'),
        ('proposta_externa','Proposta Externa'),
        ('mudanca_carreira','Mudança de Área/Carreira'),
        ('pessoal',         'Motivo Pessoal'),
        ('outro',           'Outro'),
    ])
    nota_empresa          = models.IntegerField(null=True, blank=True)  # 1-10
    nota_lideranca        = models.IntegerField(null=True, blank=True)
    nota_cultura          = models.IntegerField(null=True, blank=True)
    nota_crescimento      = models.IntegerField(null=True, blank=True)
    nota_beneficios       = models.IntegerField(null=True, blank=True)
    indicaria_empresa     = models.BooleanField(null=True, blank=True)
    retornaria_empresa    = models.BooleanField(null=True, blank=True)
    comentario_livre      = models.TextField(blank=True)
    respostas_adicionais  = models.JSONField(default=dict, blank=True)  # perguntas adaptativas

    class Meta:
        db_table = 'rh_exit_questionario'
        ordering = ['-created_at']
        verbose_name = 'Questionário Exit'
        verbose_name_plural = 'Questionários Exit'

    def __str__(self):
        return f'Exit — {self.colaborador} — {self.status}'

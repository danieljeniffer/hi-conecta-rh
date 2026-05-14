from django.db import models
from apps.core.models import AuditedModel
from apps.rh.models import Colaborador


class Documento(AuditedModel):
    TIPOS = [
        ('contrato',      'Contrato'),
        ('aditivo',       'Aditivo'),
        ('advertencia',   'Advertência'),
        ('atestado',      'Atestado'),
        ('declaracao',    'Declaração'),
        ('certificado',   'Certificado'),
        ('exame_adm',     'Exame Admissional'),
        ('exame_dem',     'Exame Demissional'),
        ('politica',      'Política'),
        ('outro',         'Outro'),
    ]
    STATUS = [
        ('pendente',  'Pendente'),
        ('enviado',   'Enviado'),
        ('assinado',  'Assinado'),
        ('vencido',   'Vencido'),
        ('cancelado', 'Cancelado'),
    ]

    colaborador  = models.ForeignKey(Colaborador, null=True, blank=True, on_delete=models.SET_NULL, related_name='documentos')
    tipo         = models.CharField(max_length=20, choices=TIPOS)
    titulo       = models.CharField(max_length=200)
    descricao    = models.TextField(blank=True)
    arquivo      = models.FileField(upload_to='documentos/%Y/%m/')
    arquivo_nome = models.CharField(max_length=200)
    mime_type    = models.CharField(max_length=100, blank=True)
    arquivo_size = models.BigIntegerField(null=True, blank=True)
    versao       = models.IntegerField(default=1)
    status       = models.CharField(max_length=15, choices=STATUS, default='pendente')
    assinado_em  = models.DateTimeField(null=True, blank=True)
    assinado_por = models.CharField(max_length=200, blank=True)
    vence_em     = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'documentos_documento'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.titulo}'

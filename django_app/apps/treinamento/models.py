from django.db import models
from apps.core.models import AuditedModel, BaseModel
from apps.rh.models import Colaborador


class Treinamento(AuditedModel):
    titulo       = models.CharField(max_length=200)
    descricao    = models.TextField(blank=True)
    carga_horaria= models.IntegerField(null=True, blank=True)
    modalidade   = models.CharField(max_length=20, default='ead', choices=[('ead','EAD'),('presencial','Presencial'),('hibrido','Híbrido')])
    obrigatorio  = models.BooleanField(default=False)
    prazo_dias   = models.IntegerField(null=True, blank=True)
    conteudo_url = models.URLField(blank=True)

    class Meta:
        db_table = 'treinamento_treinamento'

    def __str__(self):
        return self.titulo


class TreinamentoColaborador(BaseModel):
    STATUS = [('pendente','Pendente'),('em_andamento','Em andamento'),('concluido','Concluído')]
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, related_name='colaboradores')
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='treinamentos')
    status      = models.CharField(max_length=15, choices=STATUS, default='pendente')
    progresso   = models.IntegerField(default=0)
    iniciado_em = models.DateTimeField(null=True, blank=True)
    concluido_em= models.DateTimeField(null=True, blank=True)
    nota        = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table        = 'treinamento_colaborador'
        unique_together = [('treinamento','colaborador')]

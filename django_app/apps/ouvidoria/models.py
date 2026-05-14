from django.db import models
from apps.core.models import AuditedModel


class Manifestacao(AuditedModel):
    TIPOS   = [('denuncia','Denúncia'),('reclamacao','Reclamação'),('sugestao','Sugestão'),('elogio','Elogio'),('solicitacao','Solicitação')]
    STATUS  = [('aberta','Aberta'),('em_analise','Em Análise'),('resolvida','Resolvida'),('arquivada','Arquivada')]
    PRIORS  = [('critica','Crítica'),('alta','Alta'),('media','Média'),('baixa','Baixa')]

    protocolo   = models.CharField(max_length=20, unique=True)
    tipo        = models.CharField(max_length=15, choices=TIPOS)
    descricao   = models.TextField()
    anonima     = models.BooleanField(default=True)
    solicitante = models.CharField(max_length=200, blank=True)
    email_retorno = models.EmailField(blank=True)
    status      = models.CharField(max_length=15, choices=STATUS, default='aberta')
    prioridade  = models.CharField(max_length=10, choices=PRIORS, default='media')
    responsavel = models.CharField(max_length=200, blank=True)
    resposta    = models.TextField(blank=True)
    resolvida_em= models.DateTimeField(null=True, blank=True)
    sla_horas   = models.IntegerField(default=72)

    class Meta:
        db_table = 'ouvidoria_manifestacao'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.protocolo} — {self.get_tipo_display()}'

    def save(self, *args, **kwargs):
        if not self.protocolo:
            from django.utils import timezone
            self.protocolo = f'OUV-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        super().save(*args, **kwargs)

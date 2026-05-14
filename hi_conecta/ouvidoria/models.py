"""ouvidoria/models.py — Canal anônimo de denúncias com fluxo de investigação."""
import uuid
import secrets
from django.db import models
from django.utils import timezone
from core.models import BaseModel


class Denuncia(BaseModel):
    CATEGORIAS = [
        ('assedio_moral',    'Assédio Moral'),
        ('assedio_sexual',   'Assédio Sexual'),
        ('discriminacao',    'Discriminação'),
        ('corrupcao',        'Corrupção/Irregularidade'),
        ('seguranca',        'Segurança do Trabalho'),
        ('fraude',           'Fraude'),
        ('sugestao',         'Sugestão de Melhoria'),
        ('outro',            'Outro'),
    ]
    STATUS = [
        ('recebida',     'Recebida'),
        ('em_analise',   'Em Análise'),
        ('investigando', 'Investigando'),
        ('concluida',    'Concluída'),
        ('arquivada',    'Arquivada'),
    ]
    PRIORIDADES = [
        ('critica', 'Crítica'),
        ('alta',    'Alta'),
        ('media',   'Média'),
        ('baixa',   'Baixa'),
    ]

    # Identificador anônimo para acompanhamento
    protocolo       = models.CharField(max_length=20, unique=True, editable=False)
    categoria       = models.CharField(max_length=25, choices=CATEGORIAS)
    descricao       = models.TextField()
    data_ocorrencia = models.DateField(null=True, blank=True)
    local           = models.CharField(max_length=200, blank=True)
    envolvidos      = models.TextField(blank=True, help_text='Descreva sem identificar plenamente')
    evidencias      = models.FileField(upload_to='ouvidoria/evidencias/', blank=True, null=True)
    status          = models.CharField(max_length=15, choices=STATUS, default='recebida')
    prioridade      = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    # Dados opcionais do denunciante
    anonima         = models.BooleanField(default=True)
    contato_opcional = models.EmailField(blank=True, help_text='Opcional — para receber atualizações')
    # Investigação (acesso restrito)
    investigador    = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='denuncias_investigadas')
    prazo_resposta  = models.DateField(null=True, blank=True)
    conclusao_interna = models.TextField(blank=True)  # visível apenas ao RH/Admin
    resposta_publica  = models.TextField(blank=True)  # visível ao denunciante
    concluida_em    = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ouvidoria_denuncia'
        ordering = ['-created_at']
        verbose_name = 'Denúncia'
        verbose_name_plural = 'Denúncias'

    def __str__(self):
        return f'#{self.protocolo} — {self.get_categoria_display()}'

    def save(self, *args, **kwargs):
        if not self.protocolo:
            self.protocolo = f'OUV-{secrets.token_hex(4).upper()}'
        super().save(*args, **kwargs)


class LogAcessoOuvidoria(models.Model):
    """Audit log ultra-restrito de quem acessou registros de ouvidoria."""
    denuncia    = models.ForeignKey(Denuncia, on_delete=models.PROTECT, related_name='logs_acesso')
    usuario     = models.ForeignKey('accounts.Usuario', on_delete=models.PROTECT, related_name='+')
    acao        = models.CharField(max_length=50)  # visualizou, editou, concluiu
    ip          = models.GenericIPAddressField(null=True, blank=True)
    timestamp   = models.DateTimeField(auto_now_add=True)
    detalhes    = models.TextField(blank=True)

    class Meta:
        db_table = 'ouvidoria_log_acesso'
        ordering = ['-timestamp']
        verbose_name = 'Log de Acesso — Ouvidoria'

    def __str__(self):
        return f'{self.usuario} → #{self.denuncia.protocolo} @ {self.timestamp:%d/%m/%Y %H:%M}'

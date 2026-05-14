"""
rh/models.py — Gestão de Pessoas completa.
Colaborador, Cargo, Departamento, Avaliações, Histórico, Advertências, Políticas.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords
from core.models import BaseModel, BaseAuditModel


# ── Departamento ──────────────────────────────────────────────
class Departamento(BaseAuditModel):
    nome         = models.CharField(max_length=150, verbose_name='Nome')
    codigo       = models.CharField(max_length=20, blank=True)
    centro_custo = models.CharField(max_length=30, blank=True, verbose_name='Centro de Custo')
    gestor       = models.ForeignKey(
        'Colaborador', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='departamentos_geridos',
    )
    pai = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='subdepartamentos',
        verbose_name='Departamento Pai'
    )
    descricao = models.TextField(blank=True)
    ativo     = models.BooleanField(default=True)
    history   = HistoricalRecords()

    class Meta:
        db_table = 'rh_departamento'
        ordering = ['nome']
        verbose_name        = 'Departamento'
        verbose_name_plural = 'Departamentos'

    def __str__(self):
        return self.nome

    @property
    def headcount(self):
        return self.colaboradores.filter(status='ativo', deleted_at__isnull=True).count()

    def para_arvore(self):
        return {
            'id':       str(self.id),
            'nome':     self.nome,
            'gestor':   self.gestor.nome if self.gestor else None,
            'headcount':self.headcount,
            'filhos':   [f.para_arvore() for f in self.subdepartamentos.filter(ativo=True, deleted_at__isnull=True)],
        }


# ── Cargo ─────────────────────────────────────────────────────
class Cargo(BaseAuditModel):
    NIVEIS = [
        ('operacional',    'Operacional'),
        ('administrativo', 'Administrativo'),
        ('tecnico',        'Técnico'),
        ('supervisao',     'Supervisão'),
        ('gerencia',       'Gerência'),
        ('direcao',        'Direção'),
        ('c_level',        'C-Level'),
    ]

    nome         = models.CharField(max_length=150, verbose_name='Nome do Cargo')
    departamento = models.ForeignKey(Departamento, null=True, blank=True, on_delete=models.SET_NULL, related_name='cargos')
    nivel        = models.CharField(max_length=20, choices=NIVEIS, default='administrativo')
    codigo_cbo   = models.CharField(max_length=10, blank=True, verbose_name='CBO')
    salario_min  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salario_max  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    descricao    = models.TextField(blank=True)
    requisitos   = models.TextField(blank=True)
    ativo        = models.BooleanField(default=True)
    history      = HistoricalRecords()

    class Meta:
        db_table = 'rh_cargo'
        ordering = ['nome']
        verbose_name        = 'Cargo'
        verbose_name_plural = 'Cargos'

    def __str__(self):
        return f'{self.nome} ({self.get_nivel_display()})'

    @property
    def headcount(self):
        return self.colaboradores.filter(status='ativo', deleted_at__isnull=True).count()


# ── Colaborador ───────────────────────────────────────────────
class Colaborador(BaseAuditModel):
    STATUS = [
        ('ativo',             'Ativo'),
        ('ferias',            'Em Férias'),
        ('afastado',          'Afastado'),
        ('desligado',         'Desligado'),
        ('admissao_pendente', 'Admissão Pendente'),
    ]
    REGIMES = [
        ('clt',        'CLT'),
        ('pj',         'PJ'),
        ('estagio',    'Estágio'),
        ('temporario', 'Temporário'),
        ('autonomo',   'Autônomo'),
    ]
    SEXOS = [('M','Masculino'),('F','Feminino'),('O','Outro')]
    ESTADOS_CIVIS = [
        ('solteiro','Solteiro(a)'),('casado','Casado(a)'),
        ('divorc','Divorciado(a)'),('viuvo','Viúvo(a)'),('uniao','União Estável'),
    ]

    # Vínculo
    departamento = models.ForeignKey(Departamento, null=True, blank=True, on_delete=models.SET_NULL, related_name='colaboradores')
    cargo        = models.ForeignKey(Cargo, null=True, blank=True, on_delete=models.SET_NULL, related_name='colaboradores')
    gestor       = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='subordinados')

    # Dados pessoais
    nome            = models.CharField(max_length=200)
    cpf             = models.CharField(max_length=11, unique=True)
    rg              = models.CharField(max_length=20, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo            = models.CharField(max_length=1, choices=SEXOS, blank=True)
    estado_civil    = models.CharField(max_length=10, choices=ESTADOS_CIVIS, blank=True)
    nacionalidade   = models.CharField(max_length=60, default='Brasileiro(a)')
    naturalidade    = models.CharField(max_length=100, blank=True)
    foto            = models.ImageField(upload_to='colaboradores/fotos/%Y/', null=True, blank=True)

    # Documentos
    pis_pasep     = models.CharField(max_length=14, blank=True)
    ctps_numero   = models.CharField(max_length=20, blank=True)
    ctps_serie    = models.CharField(max_length=10, blank=True)
    ctps_uf       = models.CharField(max_length=2,  blank=True)
    titulo_eleitor = models.CharField(max_length=14, blank=True)
    cnh_numero    = models.CharField(max_length=11, blank=True)
    cnh_categoria = models.CharField(max_length=5,  blank=True)
    cnh_validade  = models.DateField(null=True, blank=True)

    # Contato
    email             = models.EmailField(blank=True)
    email_corporativo = models.EmailField(blank=True, null=True, unique=True)
    telefone          = models.CharField(max_length=20, blank=True)
    celular           = models.CharField(max_length=20, blank=True)

    # Endereço
    cep         = models.CharField(max_length=9,   blank=True)
    logradouro  = models.CharField(max_length=200,  blank=True)
    numero      = models.CharField(max_length=10,   blank=True)
    complemento = models.CharField(max_length=100,  blank=True)
    bairro      = models.CharField(max_length=100,  blank=True)
    cidade      = models.CharField(max_length=100,  blank=True)
    estado      = models.CharField(max_length=2,    blank=True)

    # Dados bancários
    banco      = models.CharField(max_length=100, blank=True)
    agencia    = models.CharField(max_length=10,  blank=True)
    conta      = models.CharField(max_length=20,  blank=True)
    tipo_conta = models.CharField(max_length=10,  blank=True)
    pix_tipo   = models.CharField(max_length=10,  blank=True)
    pix_chave  = models.CharField(max_length=100, blank=True)

    # Contrato
    regime        = models.CharField(max_length=15, choices=REGIMES, default='clt')
    data_admissao = models.DateField()
    data_demissao = models.DateField(null=True, blank=True)
    status        = models.CharField(max_length=25, choices=STATUS, default='ativo', db_index=True)
    salario_base  = models.DecimalField(max_digits=12, decimal_places=2)
    carga_horaria = models.IntegerField(default=220)

    # Onboarding
    onboarding_completo = models.BooleanField(default=False)
    onboarding_pct      = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    observacoes = models.TextField(blank=True)
    history     = HistoricalRecords()

    class Meta:
        db_table = 'rh_colaborador'
        ordering = ['nome']
        verbose_name        = 'Colaborador'
        verbose_name_plural = 'Colaboradores'
        indexes = [
            models.Index(fields=['cpf']),
            models.Index(fields=['status']),
            models.Index(fields=['departamento']),
            models.Index(fields=['data_admissao']),
        ]

    def __str__(self):
        return self.nome

    @property
    def iniciais(self):
        partes = self.nome.strip().split()
        return ''.join(p[0] for p in partes[:2]).upper() if partes else '?'

    @property
    def primeiro_nome(self):
        return self.nome.split()[0] if self.nome else ''

    @property
    def tempo_empresa_meses(self):
        import math
        ref = self.data_demissao or timezone.now().date()
        return math.floor((ref - self.data_admissao).days / 30)

    @property
    def tempo_empresa_str(self):
        m = self.tempo_empresa_meses
        a = m // 12
        r = m % 12
        return f'{a}a {r}m' if a > 0 else f'{m}m'

    @property
    def cpf_formatado(self):
        c = self.cpf
        return f'{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}' if len(c) == 11 else c

    def pode_visualizar(self, usuario):
        if usuario.perfil in ('admin', 'rh', 'analista'):
            return True
        if usuario.perfil == 'gestor':
            colab_id = str(getattr(usuario, 'colaborador_id', ''))
            return (self.departamento and
                    str(getattr(self.departamento.gestor, 'id', '')) == colab_id)
        return str(self.id) == str(getattr(usuario, 'colaborador_id', ''))

    def timeline(self):
        """Retorna eventos ordenados por data para a timeline."""
        eventos = []
        eventos.append({'tipo':'admissao','data':self.data_admissao,'titulo':'Admissão','icon':'🎉','cor':'#16a34a'})
        for h in self.historico_salarial.all():
            eventos.append({'tipo':'reajuste','data':h.vigencia,'titulo':f'Reajuste salarial ({h.percentual:.1f}%)','icon':'💰','cor':'#2563eb'})
        for av in self.avaliacoes.filter(status='concluida'):
            eventos.append({'tipo':'avaliacao','data':av.realizada_em or av.prazo,'titulo':av.get_tipo_display(),'icon':'📋','cor':'#7c3aed'})
        for ad in self.advertencias.all():
            eventos.append({'tipo':'advertencia','data':ad.data_advertencia,'titulo':ad.get_tipo_display(),'icon':'⚠️','cor':'#dc2626'})
        if self.data_demissao:
            eventos.append({'tipo':'desligamento','data':self.data_demissao,'titulo':'Desligamento','icon':'👋','cor':'#94a3b8'})
        return sorted(eventos, key=lambda x: x['data'], reverse=True)


# ── Dependente ────────────────────────────────────────────────
class Dependente(BaseModel):
    colaborador     = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='dependentes')
    nome            = models.CharField(max_length=200)
    parentesco      = models.CharField(max_length=50)
    cpf             = models.CharField(max_length=11, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    ir              = models.BooleanField(default=False, verbose_name='Dependente IRRF')
    plano_saude     = models.BooleanField(default=False)
    deficiente      = models.BooleanField(default=False, verbose_name='PcD')

    class Meta:
        db_table = 'rh_dependente'
        ordering = ['nome']
        verbose_name        = 'Dependente'
        verbose_name_plural = 'Dependentes'

    def __str__(self):
        return f'{self.nome} ({self.parentesco})'


# ── Histórico Salarial ────────────────────────────────────────
class HistoricoSalarial(BaseModel):
    MOTIVOS = [
        ('admissao',  'Admissão'), ('reajuste',  'Reajuste'),
        ('promocao',  'Promoção'), ('acordo',    'Acordo Coletivo'),
        ('merito',    'Mérito'),   ('correcao',  'Correção'),('outro','Outro'),
    ]

    colaborador      = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='historico_salarial')
    salario_anterior = models.DecimalField(max_digits=12, decimal_places=2)
    salario_novo     = models.DecimalField(max_digits=12, decimal_places=2)
    percentual       = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    motivo           = models.CharField(max_length=10, choices=MOTIVOS, default='reajuste')
    descricao        = models.TextField(blank=True)
    vigencia         = models.DateField()
    aprovado_por     = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'rh_historico_salarial'
        ordering = ['-vigencia']
        verbose_name        = 'Histórico Salarial'
        verbose_name_plural = 'Histórico Salarial'

    def __str__(self):
        return f'{self.colaborador.nome}: {self.salario_anterior} → {self.salario_novo}'

    def save(self, *args, **kwargs):
        if self.salario_anterior and self.salario_anterior > 0:
            from decimal import Decimal
            self.percentual = ((self.salario_novo - self.salario_anterior) / self.salario_anterior) * 100
        super().save(*args, **kwargs)


# ── Avaliação de Desempenho ───────────────────────────────────
class AvaliacaoDesempenho(BaseAuditModel):
    TIPOS = [
        ('experiencia_15','Avaliação 15 dias'),
        ('experiencia_45','Avaliação 45 dias'),
        ('semestral',     'Semestral'),
        ('anual',         'Anual'),
        ('pdi',           'PDI'),
        ('especifica',    'Específica'),
    ]
    STATUS = [
        ('pendente','Pendente'),('em_andamento','Em Andamento'),
        ('concluida','Concluída'),('cancelada','Cancelada'),
    ]

    colaborador  = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='avaliacoes')
    avaliador    = models.ForeignKey(Colaborador, null=True, blank=True, on_delete=models.SET_NULL, related_name='avaliacoes_realizadas')
    tipo         = models.CharField(max_length=20, choices=TIPOS)
    status       = models.CharField(max_length=15, choices=STATUS, default='pendente')
    prazo        = models.DateField()
    realizada_em = models.DateTimeField(null=True, blank=True)
    nota_geral   = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True,
                                        validators=[MinValueValidator(0), MaxValueValidator(5)])
    recomenda_efetivacao = models.BooleanField(null=True, blank=True)
    pontos_fortes    = models.TextField(blank=True)
    pontos_melhoria  = models.TextField(blank=True)
    metas_periodo    = models.TextField(blank=True)
    comentarios      = models.TextField(blank=True)
    respostas_json   = models.JSONField(default=dict, blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table = 'rh_avaliacao_desempenho'
        ordering = ['-prazo']
        verbose_name        = 'Avaliação de Desempenho'
        verbose_name_plural = 'Avaliações de Desempenho'

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.colaborador.nome}'


# ── Advertência ───────────────────────────────────────────────
class Advertencia(BaseAuditModel):
    TIPOS   = [('verbal','Verbal'),('escrita','Escrita'),('suspensao','Suspensão')]
    MOTIVOS = [
        ('falta_injustificada','Falta Injustificada'),('atraso_reincidente','Atraso Reincidente'),
        ('conduta','Conduta Inadequada'),('descumprimento','Descumprimento de Normas'),
        ('negligencia','Negligência'),('outro','Outro'),
    ]

    colaborador      = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='advertencias')
    tipo             = models.CharField(max_length=10, choices=TIPOS)
    motivo           = models.CharField(max_length=25, choices=MOTIVOS)
    descricao        = models.TextField()
    data_ocorrencia  = models.DateField()
    data_advertencia = models.DateField(default=timezone.now)
    dias_suspensao   = models.IntegerField(default=0)
    responsavel      = models.CharField(max_length=200, blank=True)
    assinado         = models.BooleanField(default=False)
    assinado_em      = models.DateTimeField(null=True, blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table = 'rh_advertencia'
        ordering = ['-data_advertencia']
        verbose_name        = 'Advertência'
        verbose_name_plural = 'Advertências'

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.colaborador.nome}'


# ── Política ──────────────────────────────────────────────────
class Politica(BaseAuditModel):
    TIPOS = [
        ('codigo_conduta','Código de Conduta'),('home_office','Home Office'),
        ('seguranca','Segurança'),('privacidade','Privacidade/LGPD'),
        ('beneficios','Benefícios'),('remuneracao','Remuneração'),('outro','Outro'),
    ]

    titulo             = models.CharField(max_length=200)
    tipo               = models.CharField(max_length=20, choices=TIPOS)
    versao             = models.CharField(max_length=10, default='1.0')
    conteudo           = models.TextField()
    vigente            = models.BooleanField(default=True)
    publicado_em       = models.DateField(null=True, blank=True)
    valido_ate         = models.DateField(null=True, blank=True)
    aceite_obrigatorio = models.BooleanField(default=False)
    history            = HistoricalRecords()

    class Meta:
        db_table = 'rh_politica'
        ordering = ['-publicado_em']
        verbose_name        = 'Política'
        verbose_name_plural = 'Políticas'

    def __str__(self):
        return f'{self.titulo} v{self.versao}'


class AceitePolitica(BaseModel):
    politica    = models.ForeignKey(Politica, on_delete=models.CASCADE, related_name='aceites')
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='aceites_politicas')
    ip          = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table        = 'rh_aceite_politica'
        unique_together = ('politica', 'colaborador')


# ── Pesquisa de Clima ─────────────────────────────────────────
class PesquisaClima(BaseAuditModel):
    TIPOS  = [('clima','Clima'),('nps','NPS'),('avaliacao','Avaliação'),('custom','Personalizada')]
    STATUS = [('rascunho','Rascunho'),('ativo','Ativa'),('encerrado','Encerrada')]

    titulo    = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    tipo      = models.CharField(max_length=10, choices=TIPOS, default='clima')
    anonima   = models.BooleanField(default=True)
    status    = models.CharField(max_length=10, choices=STATUS, default='rascunho')
    inicio    = models.DateField(null=True, blank=True)
    fim       = models.DateField(null=True, blank=True)
    campos    = models.JSONField(default=list, blank=True)
    history   = HistoricalRecords()

    class Meta:
        db_table = 'rh_pesquisa_clima'
        ordering = ['-created_at']

    def __str__(self):
        return self.titulo

    @property
    def total_respostas(self):
        return self.respostas.count()


class RespostaPesquisa(BaseModel):
    pesquisa    = models.ForeignKey(PesquisaClima, on_delete=models.CASCADE, related_name='respostas')
    colaborador = models.ForeignKey(Colaborador, null=True, blank=True, on_delete=models.SET_NULL)
    respostas   = models.JSONField(default=dict)

    class Meta:
        db_table = 'rh_resposta_pesquisa'

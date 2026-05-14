"""
apps/rh/models.py — Gestão de Pessoas completa.
Colaboradores, Departamentos, Cargos, Avaliações, Clima.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import AuditedModel, BaseModel
from simple_history.models import HistoricalRecords


class Departamento(AuditedModel):
    nome      = models.CharField(max_length=150, verbose_name='Nome')
    codigo    = models.CharField(max_length=20, blank=True)
    gestor    = models.ForeignKey('Colaborador', null=True, blank=True, on_delete=models.SET_NULL, related_name='departamentos_geridos')
    pai       = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='filhos')
    ativo     = models.BooleanField(default=True)
    history   = HistoricalRecords()

    class Meta:
        db_table            = 'rh_departamento'
        unique_together     = [('nome',)]
        verbose_name        = 'Departamento'
        verbose_name_plural = 'Departamentos'

    def __str__(self):
        return self.nome

    @property
    def headcount(self):
        return self.colaboradores.filter(status='ativo').count()


class Cargo(AuditedModel):
    NIVEIS = [
        ('operacional',    'Operacional'),
        ('administrativo', 'Administrativo'),
        ('tecnico',        'Técnico'),
        ('lideranca',      'Liderança'),
        ('direcao',        'Direção'),
    ]

    nome        = models.CharField(max_length=150)
    codigo_cbo  = models.CharField(max_length=10, blank=True)
    nivel       = models.CharField(max_length=20, choices=NIVEIS, default='administrativo')
    salario_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salario_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    descricao   = models.TextField(blank=True)
    ativo       = models.BooleanField(default=True)
    history     = HistoricalRecords()

    class Meta:
        db_table            = 'rh_cargo'
        verbose_name        = 'Cargo'
        verbose_name_plural = 'Cargos'

    def __str__(self):
        return f'{self.nome} ({self.get_nivel_display()})'


class Colaborador(AuditedModel):
    STATUS = [
        ('ativo',              'Ativo'),
        ('ferias',             'Em Férias'),
        ('afastado',           'Afastado'),
        ('desligado',          'Desligado'),
        ('admissao_pendente',  'Admissão Pendente'),
    ]

    REGIMES = [
        ('clt',        'CLT'),
        ('pj',         'PJ'),
        ('estagio',    'Estágio'),
        ('temporario', 'Temporário'),
        ('autonomo',   'Autônomo'),
    ]

    SEXOS = [('M', 'Masculino'), ('F', 'Feminino'), ('O', 'Outro')]
    ESTADOS_CIVIS = [
        ('solteiro', 'Solteiro(a)'),
        ('casado',   'Casado(a)'),
        ('divorc',   'Divorciado(a)'),
        ('viuvo',    'Viúvo(a)'),
        ('uniao',    'União Estável'),
    ]

    # Vinculo
    departamento = models.ForeignKey(Departamento, null=True, blank=True, on_delete=models.SET_NULL, related_name='colaboradores')
    cargo        = models.ForeignKey(Cargo, null=True, blank=True, on_delete=models.SET_NULL, related_name='colaboradores')
    gestor       = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='subordinados')

    # Dados pessoais
    nome             = models.CharField(max_length=200)
    cpf              = models.CharField(max_length=14, unique=True)
    rg               = models.CharField(max_length=20, blank=True)
    data_nascimento  = models.DateField(null=True, blank=True)
    sexo             = models.CharField(max_length=1, choices=SEXOS, blank=True)
    estado_civil     = models.CharField(max_length=10, choices=ESTADOS_CIVIS, blank=True)
    nacionalidade    = models.CharField(max_length=50, default='Brasileiro')
    foto             = models.ImageField(upload_to='colaboradores/fotos/', null=True, blank=True)

    # Documentos
    pis_pasep     = models.CharField(max_length=14, blank=True)
    ctps_numero   = models.CharField(max_length=20, blank=True)
    ctps_serie    = models.CharField(max_length=10, blank=True)
    titulo_eleitor= models.CharField(max_length=14, blank=True)
    cnh_numero    = models.CharField(max_length=11, blank=True)
    cnh_validade  = models.DateField(null=True, blank=True)

    # Contato
    email             = models.EmailField(blank=True)
    email_corporativo = models.EmailField(blank=True)
    telefone          = models.CharField(max_length=20, blank=True)
    celular           = models.CharField(max_length=20, blank=True)

    # Endereço
    cep         = models.CharField(max_length=9, blank=True)
    logradouro  = models.CharField(max_length=200, blank=True)
    numero      = models.CharField(max_length=10, blank=True)
    complemento = models.CharField(max_length=100, blank=True)
    bairro      = models.CharField(max_length=100, blank=True)
    cidade      = models.CharField(max_length=100, blank=True)
    estado      = models.CharField(max_length=2, blank=True)

    # Dados bancários
    banco      = models.CharField(max_length=100, blank=True)
    agencia    = models.CharField(max_length=10, blank=True)
    conta      = models.CharField(max_length=20, blank=True)
    tipo_conta = models.CharField(max_length=20, blank=True)
    pix_tipo   = models.CharField(max_length=20, blank=True)
    pix_chave  = models.CharField(max_length=100, blank=True)

    # Contrato
    regime        = models.CharField(max_length=15, choices=REGIMES, default='clt')
    data_admissao = models.DateField()
    data_demissao = models.DateField(null=True, blank=True)
    status        = models.CharField(max_length=25, choices=STATUS, default='ativo')
    salario_base  = models.DecimalField(max_digits=12, decimal_places=2)
    carga_horaria = models.IntegerField(default=220)

    # Onboarding
    onboarding_completo = models.BooleanField(default=False)
    onboarding_pct      = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    observacoes = models.TextField(blank=True)
    history     = HistoricalRecords()

    class Meta:
        db_table            = 'rh_colaborador'
        verbose_name        = 'Colaborador'
        verbose_name_plural = 'Colaboradores'
        indexes = [
            models.Index(fields=['cpf']),
            models.Index(fields=['status']),
            models.Index(fields=['departamento']),
            models.Index(fields=['data_admissao']),
        ]

    def __str__(self):
        return f'{self.nome} — {self.cargo}'

    @property
    def iniciais(self):
        partes = self.nome.split()
        return ''.join(p[0] for p in partes[:2]).upper()

    @property
    def tempo_empresa_meses(self):
        from django.utils import timezone
        import math
        hoje  = timezone.now().date()
        delta = hoje - self.data_admissao
        return math.floor(delta.days / 30)

    @property
    def tempo_empresa_str(self):
        meses = self.tempo_empresa_meses
        anos  = meses // 12
        resto = meses % 12
        return f'{anos}a {resto}m' if anos > 0 else f'{meses}m'


class Dependente(BaseModel):
    colaborador     = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='dependentes')
    nome            = models.CharField(max_length=200)
    parentesco      = models.CharField(max_length=50)
    cpf             = models.CharField(max_length=14, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    ir              = models.BooleanField(default=False, verbose_name='Dependente IRRF')
    plano_saude     = models.BooleanField(default=False)

    class Meta:
        db_table = 'rh_dependente'
        verbose_name = 'Dependente'

    def __str__(self):
        return f'{self.nome} ({self.parentesco}) — {self.colaborador.nome}'


class HistoricoSalarial(BaseModel):
    colaborador      = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='historico_salarial')
    salario_anterior = models.DecimalField(max_digits=12, decimal_places=2)
    salario_novo     = models.DecimalField(max_digits=12, decimal_places=2)
    percentual       = models.DecimalField(max_digits=5, decimal_places=2)
    motivo           = models.CharField(max_length=200, blank=True)
    vigencia         = models.DateField()
    aprovado_por     = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'rh_historico_salarial'
        ordering = ['-vigencia']

    def __str__(self):
        return f'{self.colaborador.nome}: {self.salario_anterior} → {self.salario_novo}'


class AvaliacaoDesempenho(AuditedModel):
    STATUS = [('pendente','Pendente'),('concluida','Concluída'),('cancelada','Cancelada')]
    TIPOS  = [('experiencia_15','15 dias'),('experiencia_45','45 dias'),('semestral','Semestral'),('anual','Anual'),('pdi','PDI')]

    colaborador  = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='avaliacoes')
    avaliador    = models.ForeignKey(Colaborador, null=True, on_delete=models.SET_NULL, related_name='avaliacoes_realizadas')
    tipo         = models.CharField(max_length=20, choices=TIPOS)
    status       = models.CharField(max_length=15, choices=STATUS, default='pendente')
    prazo        = models.DateField()
    nota_geral   = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    recomenda    = models.BooleanField(null=True, blank=True)
    pontos_fortes    = models.TextField(blank=True)
    pontos_melhoria  = models.TextField(blank=True)
    comentarios_gerais = models.TextField(blank=True)
    respostas    = models.JSONField(default=dict)
    history      = HistoricalRecords()

    class Meta:
        db_table = 'rh_avaliacao_desempenho'
        ordering = ['-prazo']

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.colaborador.nome}'


class PesquisaClima(AuditedModel):
    titulo       = models.CharField(max_length=200)
    descricao    = models.TextField(blank=True)
    tipo         = models.CharField(max_length=20, choices=[('clima','Clima'),('nps','NPS'),('avaliacao','Avaliação'),('custom','Personalizado')], default='clima')
    modo         = models.CharField(max_length=20, choices=[('anonimo','Anônimo'),('identificado','Identificado')], default='anonimo')
    status       = models.CharField(max_length=20, choices=[('ativo','Ativo'),('encerrado','Encerrado'),('rascunho','Rascunho')], default='rascunho')
    inicio       = models.DateField(null=True, blank=True)
    fim          = models.DateField(null=True, blank=True)
    campos       = models.JSONField(default=list)
    history      = HistoricalRecords()

    class Meta:
        db_table = 'rh_pesquisa_clima'

    def __str__(self):
        return self.titulo


class RespostaPesquisa(BaseModel):
    pesquisa     = models.ForeignKey(PesquisaClima, on_delete=models.CASCADE, related_name='respostas')
    colaborador  = models.ForeignKey(Colaborador, null=True, on_delete=models.SET_NULL)
    respostas    = models.JSONField(default=dict)

    class Meta:
        db_table = 'rh_resposta_pesquisa'


class Vaga(AuditedModel):
    STATUS = [('rascunho','Rascunho'),('aberta','Aberta'),('em_triagem','Em Triagem'),('entrevistas','Entrevistas'),('proposta','Proposta'),('fechada','Fechada'),('cancelada','Cancelada')]

    titulo       = models.CharField(max_length=200)
    departamento = models.ForeignKey(Departamento, null=True, on_delete=models.SET_NULL)
    cargo        = models.ForeignKey(Cargo, null=True, on_delete=models.SET_NULL)
    descricao    = models.TextField(blank=True)
    requisitos   = models.TextField(blank=True)
    salario_min  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salario_max  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    remoto       = models.BooleanField(default=False)
    vagas_qtd    = models.IntegerField(default=1)
    status       = models.CharField(max_length=20, choices=STATUS, default='rascunho')
    publicada_em = models.DateTimeField(null=True, blank=True)
    encerra_em   = models.DateField(null=True, blank=True)
    history      = HistoricalRecords()

    class Meta:
        db_table = 'rh_vaga'

    def __str__(self):
        return f'{self.titulo} ({self.get_status_display()})'

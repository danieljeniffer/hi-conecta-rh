"""rh/admin.py — Admin premium com filtros e inline."""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from .models import (
    Colaborador, Departamento, Cargo, Dependente,
    HistoricoSalarial, AvaliacaoDesempenho, Advertencia, Politica,
    PesquisaClima, RespostaPesquisa,
)


class DependenteInline(admin.TabularInline):
    model  = Dependente
    extra  = 0
    fields = ('nome','parentesco','cpf','data_nascimento','ir','plano_saude')


class HistoricoSalarialInline(admin.TabularInline):
    model       = HistoricoSalarial
    extra       = 0
    fields      = ('vigencia','salario_anterior','salario_novo','percentual','motivo')
    readonly_fields = ('percentual',)
    ordering    = ('-vigencia',)


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'codigo', 'centro_custo', 'gestor', 'headcount_col', 'ativo')
    list_filter   = ('ativo',)
    search_fields = ('nome', 'codigo', 'centro_custo')
    ordering      = ('nome',)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _hc=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))
        )

    def headcount_col(self, obj):
        return obj._hc
    headcount_col.short_description = 'HC'
    headcount_col.admin_order_field = '_hc'


@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'nivel_display', 'codigo_cbo', 'salario_min', 'salario_max', 'headcount_col', 'ativo')
    list_filter   = ('nivel', 'ativo')
    search_fields = ('nome', 'codigo_cbo')

    def nivel_display(self, obj):
        return obj.get_nivel_display()
    nivel_display.short_description = 'Nível'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _hc=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))
        )

    def headcount_col(self, obj):
        return obj._hc
    headcount_col.short_description = 'HC'


@admin.register(Colaborador)
class ColaboradorAdmin(admin.ModelAdmin):
    list_display   = ('avatar_col', 'nome', 'cargo', 'departamento', 'status_col', 'data_admissao', 'tempo_col')
    list_filter    = ('status', 'regime', 'departamento')
    search_fields  = ('nome', 'cpf', 'email', 'email_corporativo')
    date_hierarchy = 'data_admissao'
    ordering       = ('nome',)
    readonly_fields = ('id', 'criado_por', 'atualizado_por', 'created_at', 'updated_at', 'cpf_formatado', 'tempo_empresa_str')

    inlines = [DependenteInline, HistoricoSalarialInline]

    fieldsets = (
        ('Identificação',    {'fields': ('nome', 'cpf_formatado', 'rg', 'data_nascimento', 'sexo', 'estado_civil', 'foto')}),
        ('Contrato',         {'fields': ('departamento', 'cargo', 'gestor', 'regime', 'data_admissao', 'status', 'salario_base', 'carga_horaria')}),
        ('Contato',          {'fields': ('email', 'email_corporativo', 'telefone', 'celular'), 'classes': ('collapse',)}),
        ('Endereço',         {'fields': ('cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'), 'classes': ('collapse',)}),
        ('Dados Bancários',  {'fields': ('banco', 'agencia', 'conta', 'tipo_conta', 'pix_tipo', 'pix_chave'), 'classes': ('collapse',)}),
        ('Documentos',       {'fields': ('pis_pasep', 'ctps_numero', 'ctps_serie', 'ctps_uf', 'titulo_eleitor', 'cnh_numero', 'cnh_categoria', 'cnh_validade'), 'classes': ('collapse',)}),
        ('Onboarding',       {'fields': ('onboarding_completo', 'onboarding_pct'), 'classes': ('collapse',)}),
        ('Sistema',          {'fields': ('id', 'criado_por', 'atualizado_por', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def avatar_col(self, obj):
        return format_html(
            '<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;'
            'font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center">{}</div>',
            obj.iniciais
        )
    avatar_col.short_description = ''

    def status_col(self, obj):
        cores = {'ativo':'#dcfce7|#15803d','ferias':'#fef3c7|#92400e','afastado':'#fee2e2|#b91c1c','desligado':'#f1f5f9|#64748b','admissao_pendente':'#dbeafe|#1d4ed8'}
        bg, cor = cores.get(obj.status, '#f1f5f9|#334155').split('|')
        return format_html(
            '<span style="background:{bg};color:{cor};padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700">{label}</span>',
            bg=bg, cor=cor, label=obj.get_status_display()
        )
    status_col.short_description = 'Status'

    def tempo_col(self, obj):
        return obj.tempo_empresa_str
    tempo_col.short_description = 'Tempo'


@admin.register(AvaliacaoDesempenho)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display  = ('colaborador', 'tipo_display', 'status', 'nota_geral', 'prazo', 'avaliador')
    list_filter   = ('tipo', 'status')
    search_fields = ('colaborador__nome',)
    date_hierarchy = 'prazo'

    def tipo_display(self, obj):
        return obj.get_tipo_display()
    tipo_display.short_description = 'Tipo'


@admin.register(Advertencia)
class AdvertenciaAdmin(admin.ModelAdmin):
    list_display  = ('colaborador', 'tipo', 'motivo', 'data_advertencia', 'assinado')
    list_filter   = ('tipo', 'motivo', 'assinado')
    search_fields = ('colaborador__nome',)


@admin.register(Politica)
class PoliticaAdmin(admin.ModelAdmin):
    list_display  = ('titulo', 'tipo', 'versao', 'vigente', 'aceite_obrigatorio', 'publicado_em')
    list_filter   = ('tipo', 'vigente', 'aceite_obrigatorio')
    search_fields = ('titulo',)


@admin.register(PesquisaClima)
class PesquisaClimaAdmin(admin.ModelAdmin):
    list_display  = ('titulo', 'tipo', 'status', 'anonima', 'total_respostas', 'inicio', 'fim')
    list_filter   = ('tipo', 'status', 'anonima')
    search_fields = ('titulo',)

"""Admin customizado do módulo RH — nível enterprise."""
from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import Colaborador, Departamento, Cargo, AvaliacaoDesempenho, PesquisaClima, Vaga


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'codigo', 'headcount_col', 'ativo')
    list_filter   = ('ativo',)
    search_fields = ('nome', 'codigo')

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(hc=Count('colaboradores'))

    def headcount_col(self, obj):
        return obj.headcount
    headcount_col.short_description = 'Headcount'


@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'nivel', 'codigo_cbo', 'salario_min', 'salario_max', 'ativo')
    list_filter   = ('nivel', 'ativo')
    search_fields = ('nome', 'codigo_cbo')


@admin.register(Colaborador)
class ColaboradorAdmin(admin.ModelAdmin):
    list_display  = ('nome_col', 'cargo', 'departamento', 'status_col', 'data_admissao', 'salario_base')
    list_filter   = ('status', 'regime', 'departamento')
    search_fields = ('nome', 'cpf', 'email', 'email_corporativo')
    readonly_fields = ('created_at', 'updated_at', 'tempo_empresa_str')
    date_hierarchy = 'data_admissao'
    ordering       = ('nome',)

    fieldsets = (
        ('Identificação', {'fields': ('nome', 'cpf', 'rg', 'data_nascimento', 'sexo', 'estado_civil', 'foto')}),
        ('Contrato',      {'fields': ('departamento', 'cargo', 'gestor', 'regime', 'data_admissao', 'status', 'salario_base', 'carga_horaria')}),
        ('Contato',       {'fields': ('email', 'email_corporativo', 'telefone', 'celular'), 'classes': ('collapse',)}),
        ('Endereço',      {'fields': ('cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'), 'classes': ('collapse',)}),
        ('Bancário',      {'fields': ('banco', 'agencia', 'conta', 'tipo_conta', 'pix_tipo', 'pix_chave'), 'classes': ('collapse',)}),
        ('Documentos',    {'fields': ('pis_pasep', 'ctps_numero', 'ctps_serie', 'titulo_eleitor'), 'classes': ('collapse',)}),
        ('Sistema',       {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def nome_col(self, obj):
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px">'
            '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center">{}</div>'
            '<strong>{}</strong></div>',
            obj.iniciais, obj.nome
        )
    nome_col.short_description = 'Colaborador'

    def status_col(self, obj):
        cores = {
            'ativo': '#dcfce7',
            'ferias': '#fef3c7',
            'afastado': '#fee2e2',
            'desligado': '#f1f5f9',
        }
        return format_html(
            '<span style="background:{};padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700">{}</span>',
            cores.get(obj.status, '#f1f5f9'),
            obj.get_status_display()
        )
    status_col.short_description = 'Status'


@admin.register(AvaliacaoDesempenho)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ('colaborador', 'tipo', 'status', 'nota_geral', 'prazo')
    list_filter  = ('tipo', 'status')
    search_fields= ('colaborador__nome',)


@admin.register(Vaga)
class VagaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'departamento', 'status', 'vagas_qtd', 'publicada_em')
    list_filter  = ('status',)
    search_fields= ('titulo',)

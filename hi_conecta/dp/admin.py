"""dp/admin.py — Admin premium do Departamento Pessoal."""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from .models import (
    FolhaPagamento, FolhaItem, Ferias, DecimoTerceiro,
    Rescisao, Beneficio, ColaboradorBeneficio,
    AdmissaoDP, NotificacaoDP, EventoFolha,
)


class FolhaItemInline(admin.TabularInline):
    model   = FolhaItem
    extra   = 0
    fields  = ('colaborador','salario_base','inss','irrf','fgts','total_bruto','total_liquido')
    readonly_fields = fields
    can_delete = False


@admin.register(FolhaPagamento)
class FolhaAdmin(admin.ModelAdmin):
    list_display  = ('competencia','status_col','total_bruto','total_liquido','total_fgts','total_colabs','fechado_em')
    list_filter   = ('status',)
    search_fields = ('competencia',)
    readonly_fields = ('total_bruto','total_liquido','total_descontos','total_fgts','total_inss','total_irrf','total_colabs','criado_por','atualizado_por')
    inlines       = [FolhaItemInline]

    def status_col(self, obj):
        cores = {'aberta':'#dbeafe|#1d4ed8','calculada':'#fef3c7|#92400e','aprovada':'#dcfce7|#15803d','paga':'#dcfce7|#15803d','cancelada':'#fee2e2|#b91c1c'}
        bg, cor = cores.get(obj.status, '#f1f5f9|#334155').split('|')
        return format_html('<span style="background:{};color:{};padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700">{}</span>', bg, cor, obj.get_status_display())
    status_col.short_description = 'Status'


@admin.register(Ferias)
class FeriasAdmin(admin.ModelAdmin):
    list_display  = ('colaborador','dias_solicitados','status','gozo_inicio','valor_liquido')
    list_filter   = ('status',)
    search_fields = ('colaborador__nome',)
    readonly_fields = ('valor_ferias','valor_terco','valor_abono','valor_inss','valor_irrf','valor_liquido','criado_por')
    date_hierarchy = 'gozo_inicio'


@admin.register(Rescisao)
class RescisaoAdmin(admin.ModelAdmin):
    list_display   = ('colaborador','tipo_display','data_demissao','total_liquido','status')
    list_filter    = ('tipo','status')
    search_fields  = ('colaborador__nome',)
    readonly_fields = ('total_bruto','total_liquido','saldo_salario','ferias_vencidas','ferias_proporc',
                       'decimo_proporc','aviso_previo_val','multa_fgts','inss','irrf','criado_por')

    def tipo_display(self, obj):
        return obj.get_tipo_display()
    tipo_display.short_description = 'Tipo'


@admin.register(DecimoTerceiro)
class DecimoAdmin(admin.ModelAdmin):
    list_display  = ('colaborador','ano','get_parcela_display','valor_bruto','valor_liquido','status')
    list_filter   = ('status','parcela','ano')
    search_fields = ('colaborador__nome',)


@admin.register(Beneficio)
class BeneficioAdmin(admin.ModelAdmin):
    list_display = ('nome','tipo_display','fornecedor','valor_empresa','valor_colab','ativo')
    list_filter  = ('tipo','ativo')
    search_fields= ('nome','fornecedor')

    def tipo_display(self, obj):
        return obj.get_tipo_display()
    tipo_display.short_description = 'Tipo'


@admin.register(ColaboradorBeneficio)
class ColaboradorBeneficioAdmin(admin.ModelAdmin):
    list_display  = ('colaborador','beneficio','status','data_inicio')
    list_filter   = ('status','beneficio__tipo')
    search_fields = ('colaborador__nome','beneficio__nome')


@admin.register(NotificacaoDP)
class NotificacaoDPAdmin(admin.ModelAdmin):
    list_display  = ('titulo','tipo','prioridade_col','lida','created_at')
    list_filter   = ('tipo','prioridade','lida')
    search_fields = ('titulo','colaborador__nome')
    readonly_fields = ('created_at',)

    def prioridade_col(self, obj):
        cores = {'critica':'#fee2e2|#b91c1c','alta':'#fef3c7|#92400e','normal':'#dbeafe|#1d4ed8','baixa':'#f1f5f9|#64748b'}
        bg, cor = cores.get(obj.prioridade,'#f1f5f9|#334155').split('|')
        return format_html('<span style="background:{};color:{};padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700">{}</span>', bg, cor, obj.get_prioridade_display())
    prioridade_col.short_description = 'Prioridade'


@admin.register(AdmissaoDP)
class AdmissaoDPAdmin(admin.ModelAdmin):
    list_display  = ('colaborador','status','pct_checklist','contratos_gerados','esocial_enviado')
    list_filter   = ('status','esocial_enviado')
    search_fields = ('colaborador__nome',)

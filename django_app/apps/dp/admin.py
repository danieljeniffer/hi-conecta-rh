from django.contrib import admin
from .models import FolhaPagamento, FolhaItem, Ferias, Rescisao, BeneficioCategoria, NotificacaoDP


@admin.register(FolhaPagamento)
class FolhaPagamentoAdmin(admin.ModelAdmin):
    list_display  = ('competencia', 'status', 'total_bruto', 'total_liquido', 'fechado_em')
    list_filter   = ('status',)
    readonly_fields = ('created_at', 'updated_at')


class FolhaItemInline(admin.TabularInline):
    model  = FolhaItem
    extra  = 0
    readonly_fields = ('total_bruto', 'total_liquido')


@admin.register(Ferias)
class FeriasAdmin(admin.ModelAdmin):
    list_display  = ('colaborador', 'status', 'dias_solicitados', 'gozo_inicio', 'valor_liquido')
    list_filter   = ('status',)
    search_fields = ('colaborador__nome',)


@admin.register(Rescisao)
class RescisaoAdmin(admin.ModelAdmin):
    list_display  = ('colaborador', 'tipo', 'data_demissao', 'total_liquido', 'status')
    list_filter   = ('tipo', 'status')
    search_fields = ('colaborador__nome',)


@admin.register(BeneficioCategoria)
class BeneficioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'fornecedor', 'valor_empresa', 'valor_colab', 'ativo')
    list_filter  = ('ativo',)


@admin.register(NotificacaoDP)
class NotificacaoDPAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'titulo', 'prioridade', 'lida', 'created_at')
    list_filter  = ('tipo', 'prioridade', 'lida')

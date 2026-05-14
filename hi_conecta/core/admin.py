from django.contrib import admin
from .models import LogAuditoria, Configuracao


@admin.register(LogAuditoria)
class LogAuditoriaAdmin(admin.ModelAdmin):
    list_display  = ('acao', 'recurso', 'usuario', 'ip', 'created_at')
    list_filter   = ('acao', 'recurso')
    search_fields = ('usuario__email', 'recurso', 'descricao', 'ip')
    readonly_fields = ('usuario', 'acao', 'recurso', 'recurso_id', 'descricao',
                       'dados_antes', 'dados_depois', 'ip', 'user_agent', 'created_at')
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Configuracao)
class ConfiguracaoAdmin(admin.ModelAdmin):
    list_display  = ('chave', 'valor_resumido', 'updated_at')
    search_fields = ('chave',)

    def valor_resumido(self, obj):
        return obj.valor[:80] + '...' if len(obj.valor) > 80 else obj.valor
    valor_resumido.short_description = 'Valor'

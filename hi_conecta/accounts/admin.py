from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import Usuario, PermissaoModulo, SessaoUsuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model           = Usuario
    list_display    = ('avatar_col', 'email', 'nome', 'perfil_col', 'is_active', 'ultimo_acesso_col')
    list_filter     = ('perfil', 'is_active', 'is_staff', 'trocar_senha')
    search_fields   = ('email', 'nome')
    ordering        = ('nome',)
    readonly_fields = ('id', 'ultimo_acesso', 'ultimo_ip', 'tentativas_login', 'created_at', 'updated_at')

    fieldsets = (
        ('Acesso',       {'fields': ('email', 'password')}),
        ('Dados',        {'fields': ('nome', 'foto', 'colaborador_id')}),
        ('Perfil',       {'fields': ('perfil', 'trocar_senha')}),
        ('Permissões',   {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Rastreio',     {'fields': ('ultimo_acesso', 'ultimo_ip', 'tentativas_login', 'bloqueado_ate', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'nome', 'perfil', 'password1', 'password2')}),
    )

    def avatar_col(self, obj):
        return format_html(
            '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);'
            'color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center">{}</div>',
            obj.iniciais
        )
    avatar_col.short_description = ''

    def perfil_col(self, obj):
        cores = {
            'admin':       '#7c3aed', 'rh': '#2563eb', 'analista': '#0891b2',
            'gestor':      '#16a34a', 'colaborador': '#64748b', 'juridico': '#b45309',
        }
        cor = cores.get(obj.perfil, '#64748b')
        return format_html(
            '<span style="background:{cor}20;color:{cor};padding:3px 10px;border-radius:20px;'
            'font-size:11px;font-weight:700">{label}</span>',
            cor=cor, label=obj.get_perfil_display()
        )
    perfil_col.short_description = 'Perfil'

    def ultimo_acesso_col(self, obj):
        if not obj.ultimo_acesso:
            return '—'
        return obj.ultimo_acesso.strftime('%d/%m/%Y %H:%M')
    ultimo_acesso_col.short_description = 'Último acesso'


@admin.register(PermissaoModulo)
class PermissaoModuloAdmin(admin.ModelAdmin):
    list_display  = ('perfil', 'modulo', 'acao', 'ativo')
    list_filter   = ('perfil', 'modulo', 'ativo')
    search_fields = ('modulo',)


@admin.register(SessaoUsuario)
class SessaoUsuarioAdmin(admin.ModelAdmin):
    list_display  = ('usuario', 'ip', 'ativa', 'criada_em', 'expira_em')
    list_filter   = ('ativa',)
    search_fields = ('usuario__email', 'ip')
    readonly_fields = ('token_jti', 'criada_em')

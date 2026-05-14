from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model            = Usuario
    list_display     = ('email', 'nome', 'perfil', 'is_active', 'ultimo_acesso')
    list_filter      = ('perfil', 'is_active', 'is_staff')
    search_fields    = ('email', 'nome')
    ordering         = ('nome',)
    readonly_fields  = ('ultimo_acesso', 'ultimo_ip', 'created_at', 'updated_at')

    fieldsets = (
        ('Acesso',      {'fields': ('email', 'password')}),
        ('Dados',       {'fields': ('nome', 'foto', 'colaborador')}),
        ('Perfil',      {'fields': ('perfil', 'trocar_senha')}),
        ('Permissões',  {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Auditoria',   {'fields': ('ultimo_acesso', 'ultimo_ip', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'nome', 'perfil', 'password1', 'password2'),
        }),
    )

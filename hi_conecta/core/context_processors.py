"""
core/context_processors.py
Dados globais injetados em todos os templates Django.
"""
from django.conf import settings


def empresa_context(request):
    """Dados da empresa disponíveis em todos os templates."""
    return {'EMPRESA': settings.EMPRESA}


def menu_context(request):
    """
    Constrói o menu lateral baseado no perfil do usuário.
    Cada item: { icon, label, url_name, grupo, badge_count }
    """
    if not request.user.is_authenticated:
        return {'MENU_ITEMS': [], 'MENU_GRUPOS': {}}

    perfil = getattr(request.user, 'perfil', 'colaborador')

    # Definição completa por perfil
    menus_por_perfil = {
        'admin': [
            # Principal
            {'icon': '⊞',  'label': 'Dashboard',          'url': 'core:dashboard',          'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador',  'url': 'colaborador:portal',       'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestão de Pessoas',   'url': 'rh:pessoas',               'grupo': 'principal'},
            {'icon': '📊',  'label': 'Indicadores',         'url': 'rh:indicadores',           'grupo': 'principal'},
            # DP
            {'icon': '📋',  'label': 'Depto. Pessoal',      'url': 'dp:hub',                   'grupo': 'dp'},
            {'icon': '⚡',  'label': 'Central Trabalhista', 'url': 'dp:central',               'grupo': 'dp'},
            # Gestão
            {'icon': '👥',  'label': 'Gestor de Equipes',   'url': 'gestor:hub',               'grupo': 'gestao'},
            {'icon': '🔍',  'label': 'Recrutamento',        'url': 'recrutamento:vagas',        'grupo': 'gestao'},
            {'icon': '🏗',  'label': 'Cargos',              'url': 'rh:cargos',                'grupo': 'gestao'},
            {'icon': '🎓',  'label': 'T&D',                 'url': 'treinamento:lista',         'grupo': 'gestao'},
            # Operações
            {'icon': '😊',  'label': 'Clima',               'url': 'rh:clima',                 'grupo': 'operacoes'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'documentos:lista',          'grupo': 'operacoes'},
            {'icon': '📢',  'label': 'Ouvidoria',           'url': 'ouvidoria:lista',           'grupo': 'operacoes'},
            {'icon': '📣',  'label': 'Comunicação',         'url': 'comunicacao:feed',          'grupo': 'operacoes'},
            {'icon': '🔌',  'label': 'Integrações',         'url': 'integracoes:painel',        'grupo': 'operacoes'},
            {'icon': '📺',  'label': 'Endomarketing.tv',    'url': 'endomarketing:hub',         'grupo': 'operacoes'},
            # Inteligência
            {'icon': '📊',  'label': 'People Analytics',    'url': 'analytics:dashboard',       'grupo': 'inteligencia'},
            {'icon': '🤖',  'label': 'IA Organizacional',   'url': 'inteligencia:hub',          'grupo': 'inteligencia'},
            {'icon': '⭐',  'label': 'Gamificação',         'url': 'gamificacao:ranking',        'grupo': 'inteligencia'},
            # Sistema
            {'icon': '🔐',  'label': 'Usuários',            'url': 'accounts:perfil',           'grupo': 'sistema'},
        ],
        'rh': [
            {'icon': '⊞',  'label': 'Dashboard',          'url': 'core:dashboard',           'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador',  'url': 'colaborador:portal',       'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestão de Pessoas',   'url': 'rh:pessoas',               'grupo': 'principal'},
            {'icon': '📋',  'label': 'Depto. Pessoal',      'url': 'dp:hub',                   'grupo': 'dp'},
            {'icon': '⚡',  'label': 'Central Trabalhista', 'url': 'dp:central',               'grupo': 'dp'},
            {'icon': '🔍',  'label': 'Recrutamento',        'url': 'recrutamento:vagas',        'grupo': 'gestao'},
            {'icon': '👥',  'label': 'Gestor de Equipes',   'url': 'gestor:hub',               'grupo': 'gestao'},
            {'icon': '🎓',  'label': 'T&D',                 'url': 'treinamento:lista',         'grupo': 'gestao'},
            {'icon': '😊',  'label': 'Clima',               'url': 'rh:clima',                 'grupo': 'operacoes'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'documentos:lista',          'grupo': 'operacoes'},
            {'icon': '📢',  'label': 'Ouvidoria',           'url': 'ouvidoria:lista',           'grupo': 'operacoes'},
            {'icon': '📣',  'label': 'Comunicação',         'url': 'comunicacao:feed',          'grupo': 'operacoes'},
            {'icon': '📊',  'label': 'People Analytics',    'url': 'analytics:dashboard',       'grupo': 'inteligencia'},
            {'icon': '🤖',  'label': 'IA Organizacional',   'url': 'inteligencia:hub',          'grupo': 'inteligencia'},
        ],
        'analista': [
            {'icon': '⊞',  'label': 'Dashboard',          'url': 'core:dashboard',           'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestão de Pessoas',   'url': 'rh:pessoas',               'grupo': 'principal'},
            {'icon': '📋',  'label': 'Depto. Pessoal',      'url': 'dp:hub',                   'grupo': 'dp'},
            {'icon': '🔍',  'label': 'Recrutamento',        'url': 'recrutamento:vagas',        'grupo': 'gestao'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'documentos:lista',          'grupo': 'operacoes'},
            {'icon': '📢',  'label': 'Ouvidoria',           'url': 'ouvidoria:lista',           'grupo': 'operacoes'},
            {'icon': '📊',  'label': 'People Analytics',    'url': 'analytics:dashboard',       'grupo': 'inteligencia'},
            {'icon': '🤖',  'label': 'IA Organizacional',   'url': 'inteligencia:hub',          'grupo': 'inteligencia'},
        ],
        'gestor': [
            {'icon': '⊞',  'label': 'Dashboard',          'url': 'core:dashboard',           'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador',  'url': 'colaborador:portal',       'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestor de Equipes',   'url': 'gestor:hub',               'grupo': 'gestao'},
            {'icon': '📊',  'label': 'Analytics',           'url': 'analytics:dashboard',       'grupo': 'inteligencia'},
            {'icon': '😊',  'label': 'Clima',               'url': 'rh:clima',                 'grupo': 'operacoes'},
        ],
        'colaborador': [
            {'icon': '🏠',  'label': 'Meu Portal',         'url': 'colaborador:portal',        'grupo': 'pessoal'},
            {'icon': '💰',  'label': 'Holerite',            'url': 'colaborador:holerite',      'grupo': 'pessoal'},
            {'icon': '🏖️', 'label': 'Férias',              'url': 'colaborador:ferias',        'grupo': 'pessoal'},
            {'icon': '💳',  'label': 'Benefícios',          'url': 'colaborador:beneficios',    'grupo': 'pessoal'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'colaborador:documentos',    'grupo': 'pessoal'},
            {'icon': '📣',  'label': 'Comunicação',         'url': 'comunicacao:feed',          'grupo': 'empresa'},
            {'icon': '🎓',  'label': 'Treinamentos',        'url': 'treinamento:lista',         'grupo': 'empresa'},
        ],
        'juridico': [
            {'icon': '⊞',  'label': 'Dashboard',          'url': 'core:dashboard',            'grupo': 'principal'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'documentos:lista',          'grupo': 'principal'},
            {'icon': '📢',  'label': 'Ouvidoria',           'url': 'ouvidoria:lista',           'grupo': 'principal'},
            {'icon': '📋',  'label': 'Depto. Pessoal',      'url': 'dp:hub',                   'grupo': 'dp'},
        ],
    }

    grupos = {
        'principal':    'Principal',
        'dp':           'Departamento Pessoal',
        'gestao':       'Gestão de Pessoas',
        'operacoes':    'Operações',
        'inteligencia': 'Inteligência',
        'pessoal':      'Meus Dados',
        'empresa':      'Empresa',
        'sistema':      'Sistema',
    }

    return {
        'MENU_ITEMS':  menus_por_perfil.get(perfil, menus_por_perfil['colaborador']),
        'MENU_GRUPOS': grupos,
    }


def notificacoes_context(request):
    """Contagem de notificações não lidas para o badge no topo."""
    if not request.user.is_authenticated:
        return {'notif_count': 0}
    # Implementar após criar model de notificação
    return {'notif_count': 0}

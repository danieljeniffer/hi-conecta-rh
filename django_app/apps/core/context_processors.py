"""Context processors globais injetados em todos os templates."""
from django.conf import settings


def empresa_context(request):
    return {'EMPRESA': settings.EMPRESA}


def menu_context(request):
    if not request.user.is_authenticated:
        return {}

    perfil = getattr(request.user, 'perfil', 'colaborador')

    menus = {
        'admin': [
            {'icon': '⊞',  'label': 'Dashboard',         'url': 'core:dashboard',         'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador', 'url': 'colaborador:portal',      'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestão de Pessoas',  'url': 'rh:pessoas',              'grupo': 'principal'},
            {'icon': '📊',  'label': 'Indicadores',        'url': 'rh:indicadores',          'grupo': 'principal'},
            {'icon': '📋',  'label': 'Depto. Pessoal',     'url': 'dp:hub',                  'grupo': 'dp'},
            {'icon': '⚡',  'label': 'Central Trabalhista','url': 'dp:central',              'grupo': 'dp'},
            {'icon': '🔍',  'label': 'Recrutamento',       'url': 'recrutamento:vagas',      'grupo': 'gestao'},
            {'icon': '👥',  'label': 'Gestor de Equipes',  'url': 'gestor:hub',              'grupo': 'gestao'},
            {'icon': '🎯',  'label': 'Bonificações',       'url': 'rh:bonificacoes',         'grupo': 'gestao'},
            {'icon': '📊',  'label': 'People Analytics',   'url': 'analytics:dashboard',     'grupo': 'inteligencia'},
            {'icon': '🤖',  'label': 'IA Organizacional',  'url': 'inteligencia:dashboard',  'grupo': 'inteligencia'},
            {'icon': '😊',  'label': 'Clima',              'url': 'rh:clima',                'grupo': 'operacoes'},
            {'icon': '📄',  'label': 'Documentos',         'url': 'documentos:lista',        'grupo': 'operacoes'},
            {'icon': '📢',  'label': 'Ouvidoria',          'url': 'ouvidoria:lista',         'grupo': 'operacoes'},
            {'icon': '🔐',  'label': 'Usuários',           'url': 'accounts:usuarios',       'grupo': 'sistema'},
        ],
        'rh': [
            {'icon': '⊞',  'label': 'Dashboard',         'url': 'core:dashboard',          'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador', 'url': 'colaborador:portal',      'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestão de Pessoas',  'url': 'rh:pessoas',              'grupo': 'principal'},
            {'icon': '📋',  'label': 'Depto. Pessoal',     'url': 'dp:hub',                  'grupo': 'dp'},
            {'icon': '⚡',  'label': 'Central Trabalhista','url': 'dp:central',              'grupo': 'dp'},
            {'icon': '🔍',  'label': 'Recrutamento',       'url': 'recrutamento:vagas',      'grupo': 'gestao'},
            {'icon': '📊',  'label': 'People Analytics',   'url': 'analytics:dashboard',     'grupo': 'inteligencia'},
            {'icon': '😊',  'label': 'Clima',              'url': 'rh:clima',                'grupo': 'operacoes'},
            {'icon': '📄',  'label': 'Documentos',         'url': 'documentos:lista',        'grupo': 'operacoes'},
            {'icon': '📢',  'label': 'Ouvidoria',          'url': 'ouvidoria:lista',         'grupo': 'operacoes'},
        ],
        'gestor': [
            {'icon': '⊞',  'label': 'Dashboard',         'url': 'core:dashboard',          'grupo': 'principal'},
            {'icon': '🏠',  'label': 'Portal Colaborador', 'url': 'colaborador:portal',      'grupo': 'principal'},
            {'icon': '👥',  'label': 'Gestor de Equipes',  'url': 'gestor:hub',              'grupo': 'gestao'},
            {'icon': '📊',  'label': 'Analytics',          'url': 'analytics:dashboard',     'grupo': 'inteligencia'},
            {'icon': '😊',  'label': 'Clima',              'url': 'rh:clima',                'grupo': 'operacoes'},
        ],
        'colaborador': [
            {'icon': '🏠',  'label': 'Meu Portal',         'url': 'colaborador:portal',      'grupo': 'pessoal'},
            {'icon': '💰',  'label': 'Holerite',            'url': 'colaborador:holerite',    'grupo': 'pessoal'},
            {'icon': '🏖️',  'label': 'Férias',              'url': 'colaborador:ferias',      'grupo': 'pessoal'},
            {'icon': '💳',  'label': 'Benefícios',          'url': 'colaborador:beneficios',  'grupo': 'pessoal'},
            {'icon': '📄',  'label': 'Documentos',          'url': 'colaborador:documentos',  'grupo': 'pessoal'},
            {'icon': '📢',  'label': 'Comunicação',         'url': 'comunicacao:feed',        'grupo': 'empresa'},
        ],
    }

    grupos = {
        'principal':    'Principal',
        'dp':           'Departamento Pessoal',
        'gestao':       'Gestão de Pessoas',
        'inteligencia': 'Inteligência',
        'operacoes':    'Operações',
        'pessoal':      'Meus Dados',
        'empresa':      'Empresa',
        'sistema':      'Sistema',
    }

    return {
        'MENUS':  menus.get(perfil, menus['colaborador']),
        'GRUPOS': grupos,
        'PERFIL': perfil,
    }

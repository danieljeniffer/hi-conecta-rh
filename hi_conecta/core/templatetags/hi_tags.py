"""
core/templatetags/hi_tags.py
Template tags customizadas do hi Conecta RH.
"""
from django import template
from django.utils.safestring import mark_safe
from accounts.permissions import tem_permissao

register = template.Library()


@register.filter
def moeda(value):
    """Formata como moeda BRL: R$ 1.234,56"""
    try:
        v = float(value or 0)
        return f'R$ {v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    except (ValueError, TypeError):
        return 'R$ 0,00'


@register.filter
def cpf(value):
    """Formata CPF: 000.000.000-00"""
    v = str(value or '').replace('.', '').replace('-', '')
    if len(v) == 11:
        return f'{v[:3]}.{v[3:6]}.{v[6:9]}-{v[9:]}'
    return value or '—'


@register.filter
def telefone(value):
    """Formata telefone: (00) 00000-0000"""
    v = ''.join(c for c in str(value or '') if c.isdigit())
    if len(v) == 11:
        return f'({v[:2]}) {v[2:7]}-{v[7:]}'
    if len(v) == 10:
        return f'({v[:2]}) {v[2:6]}-{v[6:]}'
    return value or '—'


@register.filter
def iniciais(nome):
    """Retorna iniciais do nome: João Silva → JS"""
    if not nome:
        return '?'
    partes = str(nome).strip().split()
    return ''.join(p[0] for p in partes[:2]).upper()


@register.filter
def tempo_empresa(data_admissao):
    """Retorna tempo de empresa formatado: 2a 3m"""
    if not data_admissao:
        return '—'
    from django.utils import timezone
    import math
    delta = timezone.now().date() - data_admissao
    meses = math.floor(delta.days / 30)
    anos  = meses // 12
    resto = meses % 12
    if anos > 0:
        return f'{anos}a {resto}m'
    return f'{meses}m'


@register.filter
def badge_status(status):
    """Retorna classe CSS para badge de status."""
    mapa = {
        'ativo':              'badge-ativo',
        'ferias':             'badge-ferias',
        'afastado':           'badge-afastado',
        'desligado':          'badge-desligado',
        'admissao_pendente':  'badge-pendente',
        'pendente':           'badge-pendente',
        'aprovada':           'badge-aprovado',
        'aprovado':           'badge-aprovado',
        'recusada':           'badge-danger',
        'em_andamento':       'badge-info',
        'concluida':          'badge-aprovado',
        'paga':               'badge-aprovado',
        'calculada':          'badge-info',
        'aberta':             'badge-primary',
        'encerrada':          'badge-desligado',
    }
    return mapa.get(str(status).lower(), 'badge-secondary')


@register.simple_tag(takes_context=True)
def tem_perm(context, modulo, acao='visualizar'):
    """
    Verifica permissão no template.
    Uso: {% tem_perm 'dp' 'editar' as pode_editar %}
    """
    request = context.get('request')
    if not request:
        return False
    return tem_permissao(request.user, modulo, acao)


@register.inclusion_tag('components/kpi_card.html')
def kpi_card(icon, label, valor, sub='', cor='blue', url=''):
    return {'icon': icon, 'label': label, 'valor': valor, 'sub': sub, 'cor': cor, 'url': url}


@register.inclusion_tag('components/alert.html')
def alert(mensagem, tipo='info'):
    return {'mensagem': mensagem, 'tipo': tipo}


@register.filter
def get_item(dictionary, key):
    """Acessa item de dict em template: {{ dict|get_item:key }}"""
    if isinstance(dictionary, dict):
        return dictionary.get(key)
    return None

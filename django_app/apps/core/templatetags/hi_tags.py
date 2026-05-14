"""Template tags customizadas do hi Conecta RH."""
from django import template
from django.utils.formats import number_format
from apps.core.permissions import tem_permissao

register = template.Library()


@register.filter
def moeda(value):
    """Formata número como moeda brasileira."""
    try:
        return f"R$ {float(value):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    except (ValueError, TypeError):
        return "R$ 0,00"


@register.filter
def cpf(value):
    """Formata CPF."""
    v = str(value or '').replace('.', '').replace('-', '')
    if len(v) == 11:
        return f'{v[:3]}.{v[3:6]}.{v[6:9]}-{v[9:]}'
    return value


@register.filter
def iniciais(nome):
    """Retorna iniciais do nome."""
    partes = str(nome or '').split()
    return ''.join(p[0] for p in partes[:2]).upper()


@register.filter
def tempo_empresa(data_admissao):
    """Retorna tempo de empresa formatado."""
    from django.utils import timezone
    import math
    if not data_admissao:
        return '—'
    hoje  = timezone.now().date()
    delta = hoje - data_admissao
    meses = math.floor(delta.days / 30)
    anos  = meses // 12
    rest  = meses % 12
    if anos > 0:
        return f'{anos}a {rest}m'
    return f'{meses}m'


@register.simple_tag(takes_context=True)
def tem_perm(context, modulo, acao='view'):
    """Verifica permissão no template."""
    request = context.get('request')
    if not request:
        return False
    return tem_permissao(request.user, modulo, acao)


@register.filter
def badge_status(status):
    """Retorna classe CSS para badge de status."""
    mapa = {
        'ativo':              'badge-success',
        'ferias':             'badge-warning',
        'afastado':           'badge-danger',
        'desligado':          'badge-secondary',
        'admissao_pendente':  'badge-info',
        'pendente':           'badge-warning',
        'aprovada':           'badge-success',
        'recusada':           'badge-danger',
        'paga':               'badge-success',
        'calculada':          'badge-info',
        'aberta':             'badge-primary',
    }
    return mapa.get(str(status).lower(), 'badge-secondary')


@register.inclusion_tag('core/components/kpi_card.html')
def kpi_card(icon, label, valor, sub='', cor='blue', onclick=''):
    return {'icon': icon, 'label': label, 'valor': valor, 'sub': sub, 'cor': cor, 'onclick': onclick}


@register.inclusion_tag('core/components/alert.html')
def alert(mensagem, tipo='info', descartavel=True):
    return {'mensagem': mensagem, 'tipo': tipo, 'descartavel': descartavel}

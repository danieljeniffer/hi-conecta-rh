"""
core/exceptions.py
Handler centralizado de exceções para a API REST e views Django.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('core')


def handler_excecao(exc, context):
    """
    Handler customizado para DRF.
    Retorna respostas padronizadas:
    { sucesso: false, mensagem: "...", erros: {...} }
    """
    response = exception_handler(exc, context)

    if response is not None:
        dados = {
            'sucesso':  False,
            'mensagem': _extrair_mensagem(response.data),
            'status':   response.status_code,
        }
        if isinstance(response.data, dict) and len(response.data) > 1:
            dados['erros'] = response.data
        response.data = dados
        return response

    # Exceções não tratadas pelo DRF
    logger.exception(
        'Exceção não tratada: %s | View: %s',
        exc, context.get('view')
    )
    return Response(
        {'sucesso': False, 'mensagem': 'Erro interno do servidor.', 'status': 500},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extrair_mensagem(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        msgs = []
        for campo, erros in data.items():
            if isinstance(erros, list):
                msgs.append(f'{campo}: {"; ".join(str(e) for e in erros)}')
            else:
                msgs.append(str(erros))
        return ' | '.join(msgs) or 'Dados inválidos.'
    if isinstance(data, list):
        return ' | '.join(str(e) for e in data)
    return str(data)


# ── Exceções customizadas da aplicação ────────────────────────

class HiConectaError(Exception):
    """Exceção base do sistema."""
    status_code = 400

    def __init__(self, mensagem='Erro no sistema.', status_code=None):
        self.mensagem = mensagem
        if status_code:
            self.status_code = status_code
        super().__init__(mensagem)


class PermissaoNegada(HiConectaError):
    status_code = 403

    def __init__(self, mensagem='Você não tem permissão para esta ação.'):
        super().__init__(mensagem, 403)


class RecursoNaoEncontrado(HiConectaError):
    status_code = 404

    def __init__(self, recurso='Recurso'):
        super().__init__(f'{recurso} não encontrado.', 404)


class DadosInvalidos(HiConectaError):
    status_code = 422

    def __init__(self, mensagem='Dados inválidos.', erros=None):
        self.erros = erros or {}
        super().__init__(mensagem, 422)


class LimitePlanoAtingido(HiConectaError):
    status_code = 403

    def __init__(self, recurso='Recurso'):
        super().__init__(f'Limite atingido para: {recurso}.', 403)

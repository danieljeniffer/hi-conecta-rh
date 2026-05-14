"""Tratamento centralizado de exceções para a API REST."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'success': False,
            'message': _extract_message(response.data),
            'status':  response.status_code,
        }
        return response

    logger.exception('Exceção não tratada na API: %s', exc)
    return Response(
        {'success': False, 'message': 'Erro interno do servidor.', 'status': 500},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        messages = []
        for field, erros in data.items():
            if isinstance(erros, list):
                messages.append(f'{field}: {"; ".join(str(e) for e in erros)}')
        return ' | '.join(messages) or 'Dados inválidos.'
    if isinstance(data, list):
        return ' | '.join(str(e) for e in data)
    return str(data)

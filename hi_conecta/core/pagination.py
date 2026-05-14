"""core/pagination.py — Paginação padronizada para toda a API."""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PaginacaoPadrao(PageNumberPagination):
    page_size             = 20
    page_size_query_param = 'por_pagina'
    max_page_size         = 200

    def get_paginated_response(self, data):
        return Response({
            'sucesso': True,
            'dados':   data,
            'meta': {
                'total':         self.page.paginator.count,
                'pagina':        self.page.number,
                'por_pagina':    self.get_page_size(self.request),
                'ultima_pagina': self.page.paginator.num_pages,
                'tem_proxima':   self.page.has_next(),
                'tem_anterior':  self.page.has_previous(),
            }
        })


class PaginacaoGrande(PageNumberPagination):
    page_size     = 100
    max_page_size = 500

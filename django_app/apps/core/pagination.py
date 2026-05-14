from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'per_page'
    max_page_size = 200

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'data': data,
            'meta': {
                'total':     self.page.paginator.count,
                'page':      self.page.number,
                'per_page':  self.get_page_size(self.request),
                'last_page': self.page.paginator.num_pages,
            }
        })


class LargePagination(PageNumberPagination):
    page_size = 100
    max_page_size = 500

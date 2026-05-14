from django.db import models
from apps.core.models import BaseModel
from apps.rh.models import Colaborador


class PontosColaborador(BaseModel):
    TIPOS = [('presenca','Presença'),('treinamento','Treinamento'),('ideia','Ideia'),('pesquisa','Pesquisa'),('avaliacao','Avaliação'),('outro','Outro')]
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='pontos')
    tipo        = models.CharField(max_length=20, choices=TIPOS)
    pontos      = models.IntegerField()
    descricao   = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'gamificacao_pontos'

    @classmethod
    def total(cls, colaborador):
        from django.db.models import Sum
        return cls.objects.filter(colaborador=colaborador).aggregate(t=Sum('pontos'))['t'] or 0

    @classmethod
    def nivel(cls, colaborador):
        total = cls.total(colaborador)
        if total >= 500: return 'Ouro'
        if total >= 200: return 'Prata'
        return 'Bronze'

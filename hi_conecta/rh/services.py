"""
rh/services.py — Regras de negócio do módulo RH.
"""
from django.db.models import Count, Avg, Q
from django.utils import timezone
from core.models import LogAuditoria
import logging

logger = logging.getLogger('core')


class ColaboradorService:

    @staticmethod
    def admitir(dados: dict, usuario=None) -> 'Colaborador':
        """Cria colaborador + histórico salarial inicial + dispara onboarding."""
        from .models import Colaborador, HistoricoSalarial
        from django.db import transaction

        with transaction.atomic():
            colab = Colaborador.objects.create(
                criado_por=usuario,
                **{k: v for k, v in dados.items() if k not in ('senha_usuario',)}
            )

            # Histórico salarial inicial
            HistoricoSalarial.objects.create(
                colaborador=colab,
                salario_anterior=0,
                salario_novo=colab.salario_base,
                motivo='admissao',
                descricao='Salário na admissão',
                vigencia=colab.data_admissao,
                aprovado_por=usuario.nome if usuario else '',
            )

            # Log auditoria
            LogAuditoria.registrar(
                usuario=usuario, acao='CRIAR', recurso='colaboradores',
                recurso_id=str(colab.id),
                descricao=f'Colaborador admitido: {colab.nome}',
                dados_depois={'nome': colab.nome, 'cpf': colab.cpf},
            )

        logger.info('Colaborador admitido: %s (ID: %s)', colab.nome, colab.id)
        return colab

    @staticmethod
    def aplicar_reajuste(colaborador, novo_salario, motivo='reajuste', descricao='', vigencia=None, usuario=None):
        """Aplica reajuste salarial com histórico."""
        from .models import HistoricoSalarial
        from django.db import transaction

        anterior = colaborador.salario_base

        with transaction.atomic():
            HistoricoSalarial.objects.create(
                colaborador=colaborador,
                salario_anterior=anterior,
                salario_novo=novo_salario,
                motivo=motivo,
                descricao=descricao,
                vigencia=vigencia or timezone.now().date(),
                aprovado_por=usuario.nome if usuario else '',
            )
            colaborador.salario_base = novo_salario
            colaborador.atualizado_por = usuario
            colaborador.save(update_fields=['salario_base', 'atualizado_por', 'updated_at'])

            LogAuditoria.registrar(
                usuario=usuario, acao='EDITAR', recurso='colaboradores',
                recurso_id=str(colaborador.id),
                descricao=f'Reajuste salarial: {anterior} → {novo_salario}',
                dados_antes={'salario_base': float(anterior)},
                dados_depois={'salario_base': float(novo_salario)},
            )

    @staticmethod
    def desligar(colaborador, data_demissao, motivo='', usuario=None):
        """Desliga colaborador e registra no log."""
        from django.db import transaction

        with transaction.atomic():
            colaborador.status        = 'desligado'
            colaborador.data_demissao = data_demissao
            colaborador.atualizado_por = usuario
            colaborador.save(update_fields=['status', 'data_demissao', 'atualizado_por', 'updated_at'])

            LogAuditoria.registrar(
                usuario=usuario, acao='EDITAR', recurso='colaboradores',
                recurso_id=str(colaborador.id),
                descricao=f'Colaborador desligado. Motivo: {motivo}',
            )


class DashboardRHService:

    @staticmethod
    def kpis(usuario=None):
        """KPIs principais do RH."""
        from .models import Colaborador, AvaliacaoDesempenho

        hoje       = timezone.now().date()
        inicio_mes = hoje.replace(day=1)

        qs = Colaborador.objects.filter(deleted_at__isnull=True)

        # Filtro por perfil
        if usuario and usuario.perfil == 'gestor' and hasattr(usuario, 'colaborador_id'):
            colab_id = usuario.colaborador_id
            qs = qs.filter(
                Q(departamento__gestor_id=colab_id) |
                Q(gestor_id=colab_id)
            )

        total       = qs.filter(status='ativo').count()
        em_ferias   = qs.filter(status='ferias').count()
        afastados   = qs.filter(status='afastado').count()
        adm_mes     = qs.filter(data_admissao__gte=inicio_mes).count()
        deslig_mes  = qs.filter(status='desligado', updated_at__date__gte=inicio_mes).count()
        turnover    = round(deslig_mes / total * 100, 2) if total else 0

        aval_pend   = AvaliacaoDesempenho.objects.filter(
            status='pendente', prazo__lte=hoje + timezone.timedelta(days=15)
        ).count()

        return {
            'total':       total,
            'em_ferias':   em_ferias,
            'afastados':   afastados,
            'adm_mes':     adm_mes,
            'deslig_mes':  deslig_mes,
            'turnover':    turnover,
            'aval_pend':   aval_pend,
        }

    @staticmethod
    def headcount_por_depto():
        from .models import Departamento
        return list(
            Departamento.objects.filter(ativo=True, deleted_at__isnull=True)
            .annotate(hc=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True)))
            .order_by('-hc')
            .values('id', 'nome', 'hc')[:10]
        )

    @staticmethod
    def aniversariantes_semana():
        from .models import Colaborador
        import datetime
        hoje   = timezone.now().date()
        result = []
        for i in range(7):
            dia = hoje + datetime.timedelta(days=i)
            anivs = Colaborador.objects.filter(
                data_nascimento__month=dia.month,
                data_nascimento__day=dia.day,
                status='ativo',
                deleted_at__isnull=True,
            )
            result.extend(anivs)
        return result[:10]

    @staticmethod
    def indicadores(usuario=None):
        """Indicadores avançados para a tela de analytics."""
        from .models import Colaborador, AvaliacaoDesempenho

        hoje       = timezone.now().date()
        inicio_mes = hoje.replace(day=1)
        inicio_ano = hoje.replace(month=1, day=1)

        qs = Colaborador.objects.filter(deleted_at__isnull=True)
        total      = qs.filter(status='ativo').count()
        adm_ano    = qs.filter(data_admissao__gte=inicio_ano).count()
        deslig_ano = qs.filter(status='desligado', updated_at__date__gte=inicio_ano).count()
        turnover_ano = round(deslig_ano / max(total, 1) * 100, 2)

        nota_media = AvaliacaoDesempenho.objects.filter(
            status='concluida', nota_geral__isnull=False
        ).aggregate(avg=Avg('nota_geral'))['avg'] or 0

        return {
            'total':         total,
            'adm_ano':       adm_ano,
            'deslig_ano':    deslig_ano,
            'turnover_ano':  turnover_ano,
            'nota_media':    round(float(nota_media), 2),
            'headcount_depto': DashboardRHService.headcount_por_depto(),
        }

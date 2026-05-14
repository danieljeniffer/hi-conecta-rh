"""
integracoes/adapters.py — Adaptadores para sistemas externos.
Estrutura pronta para o time de TI conectar as APIs reais.
"""
import time
import json
import logging
from django.utils import timezone
from .models import IntegracaoConfig, LogIntegracao, FilaSincronizacao

logger = logging.getLogger('integracoes')


class BaseAdapter:
    """Classe base para todos os adaptadores."""
    SISTEMA = 'generico'

    def __init__(self):
        try:
            self.config = IntegracaoConfig.objects.get(sistema=self.SISTEMA)
        except IntegracaoConfig.DoesNotExist:
            self.config = None

    @property
    def ativa(self):
        return self.config and self.config.status == 'ativa'

    def _registrar_log(self, acao: str, status: str, payload: dict = None,
                       resposta: dict = None, erro: str = '', duracao_ms: int = 0):
        if not self.config:
            return
        LogIntegracao.objects.create(
            integracao=self.config,
            acao=acao,
            status=status,
            payload=payload or {},
            resposta=resposta or {},
            erro=erro,
            duracao_ms=duracao_ms,
        )

    def _enfileirar(self, tipo_objeto: str, objeto_id: str, acao: str, dados: dict = None):
        if not self.config:
            return
        FilaSincronizacao.objects.get_or_create(
            integracao=self.config,
            tipo_objeto=tipo_objeto,
            objeto_id=str(objeto_id),
            acao=acao,
            status='pendente',
            defaults={'dados': dados or {}},
        )


class BitrixAdapter(BaseAdapter):
    """
    Adaptador Bitrix24.
    TODO para TI: configurar url_base e api_key em IntegracaoConfig(sistema='bitrix24').
    """
    SISTEMA = 'bitrix24'

    def sync_employee(self, colaborador) -> dict:
        """Sincroniza um colaborador com o Bitrix24."""
        if not self.ativa:
            logger.warning('Bitrix24 não está ativo. Enfileirando...')
            self._enfileirar('colaborador', colaborador.id, 'sync', {
                'nome': colaborador.nome, 'email': colaborador.email
            })
            return {'status': 'enfileirado'}

        inicio = time.time()
        payload = {
            'NAME':        colaborador.nome.split()[0] if colaborador.nome else '',
            'LAST_NAME':   ' '.join(colaborador.nome.split()[1:]) if colaborador.nome else '',
            'EMAIL':       [{'VALUE': colaborador.email, 'VALUE_TYPE': 'WORK'}] if colaborador.email else [],
            'WORK_PHONE':  [{'VALUE': colaborador.telefone, 'VALUE_TYPE': 'WORK'}] if colaborador.telefone else [],
            'UF_DEPARTMENT': colaborador.departamento.nome if colaborador.departamento else '',
            'WORK_POSITION': colaborador.cargo.nome if colaborador.cargo else '',
        }
        # TODO: implementar chamada HTTP real
        # resp = requests.post(f'{self.config.url_base}/user.add', json={'fields': payload, 'auth': self.config.api_key})
        duracao = int((time.time() - inicio) * 1000)
        self._registrar_log('sync_employee', 'pendente', payload, {}, duracao_ms=duracao)
        return {'status': 'pendente', 'mensagem': 'Implementar chamada HTTP real'}

    def sync_department(self, departamento) -> dict:
        """Sincroniza um departamento com o Bitrix24."""
        payload = {'NAME': departamento.nome, 'SORT': 100}
        self._enfileirar('departamento', departamento.id, 'sync', payload)
        return {'status': 'enfileirado'}

    def push_event(self, evento: str, dados: dict) -> dict:
        """Envia um evento ao Bitrix24 (ex: admissão, rescisão)."""
        self._registrar_log('push_event', 'pendente', {'evento': evento, **dados})
        return {'status': 'pendente'}

    def handle_webhook(self, payload: dict) -> dict:
        """Processa webhook recebido do Bitrix24."""
        self._registrar_log('webhook_received', 'sucesso', payload)
        evento = payload.get('event', '')
        logger.info('Webhook Bitrix24 recebido: %s', evento)
        return {'processado': True, 'evento': evento}


class ESocialAdapter(BaseAdapter):
    """
    Adaptador eSocial — Gera XMLs dos eventos e enfileira para envio.
    TODO para TI: implementar envio via webservice do gov.br.
    """
    SISTEMA = 'esocial'

    LEIAUTE = 'S-1.2'
    EVENTOS_SUPORTADOS = ['S-2200', 'S-2205', 'S-2206', 'S-2299', 'S-2300', 'S-1200']

    def gerar_s2200(self, colaborador) -> str:
        """S-2200 — Cadastramento Inicial do Vínculo."""
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdmissao/v03_00_00">
  <evtAdmissao Id="ID{str(colaborador.id).replace('-', '')[:32]}">
    <ideEvento>
      <indRetif>1</indRetif>
      <nrRec/>
      <tpEvento>EVT_ADMISSAO</tpEvento>
      <verProc>{self.LEIAUTE}</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc><!-- CNPJ EMPRESA --></nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>{colaborador.cpf or ''}</cpfTrab>
      <nmTrab>{colaborador.nome}</nmTrab>
      <dtNascto>{colaborador.data_nascimento.strftime('%Y-%m-%d') if colaborador.data_nascimento else ''}</dtNascto>
    </trabalhador>
    <vinculo>
      <matricula>{colaborador.matricula or ''}</matricula>
      <dtAdm>{colaborador.data_admissao.strftime('%Y-%m-%d') if colaborador.data_admissao else ''}</dtAdm>
    </vinculo>
  </evtAdmissao>
</eSocial>"""
        self._enfileirar('esocial_s2200', colaborador.id, 'enviar', {'xml': xml})
        return xml

    def gerar_s2299(self, rescisao) -> str:
        """S-2299 — Desligamento."""
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtDeslig/v03_00_00">
  <evtDeslig>
    <ideEvento><tpEvento>EVT_DESLIGAMENTO</tpEvento></ideEvento>
    <ideEmpregador><nrInsc><!-- CNPJ --></nrInsc></ideEmpregador>
    <vinculo>
      <matricula>{rescisao.colaborador.matricula or ''}</matricula>
      <dtDeslig>{rescisao.data_demissao.strftime('%Y-%m-%d')}</dtDeslig>
      <mtvDeslig>{rescisao.tipo}</mtvDeslig>
    </vinculo>
  </evtDeslig>
</eSocial>"""
        self._enfileirar('esocial_s2299', rescisao.id, 'enviar', {'xml': xml})
        return xml

    def status_fila(self) -> dict:
        if not self.config:
            return {'erro': 'eSocial não configurado'}
        pendentes = FilaSincronizacao.objects.filter(
            integracao=self.config, status='pendente'
        ).count()
        erros = FilaSincronizacao.objects.filter(
            integracao=self.config, status='erro'
        ).count()
        return {'pendentes': pendentes, 'erros': erros}


class CajuAdapter(BaseAdapter):
    """Adaptador Caju — Benefícios Flexíveis."""
    SISTEMA = 'caju'

    def sync_beneficio(self, colaborador, valor: float) -> dict:
        payload = {'employee_id': str(colaborador.id), 'amount': valor}
        self._enfileirar('beneficio_caju', colaborador.id, 'sync', payload)
        return {'status': 'enfileirado', 'payload': payload}


class WellhubAdapter(BaseAdapter):
    """Adaptador Wellhub (Gympass)."""
    SISTEMA = 'wellhub'

    def ativar_colaborador(self, colaborador) -> dict:
        payload = {
            'cpf':   colaborador.cpf or '',
            'nome':  colaborador.nome,
            'email': colaborador.email or '',
        }
        self._enfileirar('wellhub_ativacao', colaborador.id, 'criar', payload)
        return {'status': 'enfileirado'}

    def desativar_colaborador(self, colaborador) -> dict:
        self._enfileirar('wellhub_ativacao', colaborador.id, 'deletar', {'cpf': colaborador.cpf})
        return {'status': 'enfileirado'}

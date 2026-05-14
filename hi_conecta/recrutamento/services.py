"""recrutamento/services.py — IA para recrutamento: descrição de vagas e perguntas de entrevista."""
import json
from django.conf import settings


class RecrutamentoIAService:

    SYSTEM_VAGA = """Você é especialista em Recursos Humanos e redação de vagas de emprego no Brasil.
Escreva descrições claras, inclusivas e atrativas. Use linguagem direta e evite jargões.
Sempre inclua: objetivo da vaga, responsabilidades, requisitos obrigatórios, diferenciais e benefícios.
Responda sempre em JSON com as chaves: descricao, requisitos, beneficios."""

    SYSTEM_ENTREVISTA = """Você é um especialista em seleção de talentos no Brasil.
Gere perguntas de entrevista comportamentais e técnicas relevantes para o cargo informado.
Inclua perguntas sobre: competências técnicas, fit cultural, resolução de problemas, situações passadas.
Responda em JSON: {"perguntas": [{"categoria": "...", "pergunta": "...", "objetivo": "..."}]}
Gere entre 8 e 12 perguntas."""

    @staticmethod
    def gerar_descricao_vaga(titulo: str, cargo: str = '', departamento: str = '',
                              tipo_contrato: str = 'CLT', modalidade: str = 'presencial') -> dict:
        prompt = (
            f"Crie uma descrição completa para a vaga: {titulo}\n"
            f"Cargo: {cargo or titulo} | Departamento: {departamento}\n"
            f"Tipo: {tipo_contrato} | Modalidade: {modalidade}\n"
            "Contexto: empresa brasileira de médio porte, ambiente dinâmico."
        )
        try:
            return RecrutamentoIAService._chamar_ia(prompt, RecrutamentoIAService.SYSTEM_VAGA)
        except Exception:
            return {
                'descricao': f'Estamos buscando um profissional para a posição de {titulo}.',
                'requisitos': 'Experiência na área, boa comunicação e proatividade.',
                'beneficios': 'Salário compatível com o mercado, benefícios CLT.',
            }

    @staticmethod
    def gerar_perguntas_entrevista(titulo: str, cargo: str = '', nivel: str = '') -> list:
        prompt = (
            f"Gere perguntas de entrevista para o cargo: {titulo}\n"
            f"Nível: {nivel or 'pleno'} | Cargo oficial: {cargo or titulo}"
        )
        try:
            resultado = RecrutamentoIAService._chamar_ia(prompt, RecrutamentoIAService.SYSTEM_ENTREVISTA)
            return resultado.get('perguntas', [])
        except Exception:
            return [
                {'categoria': 'Experiência', 'pergunta': f'Fale sobre sua experiência como {titulo}.', 'objetivo': 'Avaliar trajetória'},
                {'categoria': 'Comportamental', 'pergunta': 'Descreva um desafio profissional que você superou.', 'objetivo': 'Avaliar resiliência'},
                {'categoria': 'Técnico', 'pergunta': 'Quais ferramentas você domina na sua área?', 'objetivo': 'Mapear hard skills'},
                {'categoria': 'Motivação', 'pergunta': 'Por que você quer trabalhar nesta empresa?', 'objetivo': 'Avaliar fit cultural'},
            ]

    @staticmethod
    def _chamar_ia(prompt: str, system: str) -> dict:
        provedor = getattr(settings, 'IA_PROVEDOR', 'anthropic').lower()
        if provedor == 'openai':
            import openai
            openai.api_key = getattr(settings, 'OPENAI_API_KEY', '')
            resp = openai.chat.completions.create(
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o'),
                messages=[{'role': 'system', 'content': system}, {'role': 'user', 'content': prompt}],
                response_format={'type': 'json_object'},
            )
            return json.loads(resp.choices[0].message.content)
        else:
            import anthropic
            client = anthropic.Anthropic(api_key=getattr(settings, 'ANTHROPIC_API_KEY', ''))
            msg = client.messages.create(
                model=getattr(settings, 'ANTHROPIC_MODEL', 'claude-opus-4-7'),
                max_tokens=1500,
                system=system + '\nResponda APENAS com JSON válido.',
                messages=[{'role': 'user', 'content': prompt}],
            )
            texto = msg.content[0].text.strip()
            if texto.startswith('```'):
                texto = texto.split('```')[1]
                if texto.startswith('json'):
                    texto = texto[4:]
            return json.loads(texto)

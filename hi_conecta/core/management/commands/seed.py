"""
Comando: python manage.py seed
Cria usuários, perfis e dados iniciais de demonstração.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import Usuario, PermissaoModulo
from core.models import Configuracao


class Command(BaseCommand):
    help = 'Popula o banco com dados iniciais do hi Conecta RH'

    # ── Usuários de demonstração ──────────────────────────────
    USUARIOS = [
        {
            'email':  'admin.sistema@empresa.com.br',
            'senha':  'Admin@2025',
            'nome':   'Admin Sistema',
            'perfil': 'admin',
        },
        {
            'email':  'admin@empresa.com.br',
            'senha':  'admin123',
            'nome':   'Mariana Rodrigues',
            'perfil': 'rh',
        },
        {
            'email':  'analista@empresa.com.br',
            'senha':  'analista123',
            'nome':   'Beatriz Analista',
            'perfil': 'analista',
        },
        {
            'email':  'gestor@empresa.com.br',
            'senha':  'gestor123',
            'nome':   'Carlos Eduardo Souza',
            'perfil': 'gestor',
        },
        {
            'email':  'colab@empresa.com.br',
            'senha':  'colab123',
            'nome':   'João Paulo Silva',
            'perfil': 'colaborador',
        },
        {
            'email':  'juridico@empresa.com.br',
            'senha':  'juridico123',
            'nome':   'Dra. Ana Fonseca',
            'perfil': 'juridico',
        },
    ]

    # ── Configurações iniciais ────────────────────────────────
    CONFIGS = [
        ('SISTEMA_VERSAO',        '1.0.0',       'Versão atual do sistema'),
        ('SISTEMA_NOME',          'hi Conecta RH','Nome do sistema'),
        ('DP_SALARIO_MINIMO',     '1412.00',      'Salário mínimo vigente'),
        ('DP_TETO_INSS',          '908.85',       'Teto INSS 2024'),
        ('DP_DEDUCAO_DEPENDENTE', '189.59',       'Dedução por dependente IRRF'),
        ('RH_LIMITE_FALTAS_MES',  '3',            'Faltas injustificadas antes de alerta'),
        ('FERIAS_PRAZO_AVISO',    '30',           'Dias de antecedência para aviso de férias'),
        ('ONBOARDING_DIAS',       '30',           'Dias para completar onboarding'),
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpar', action='store_true',
            help='Remove todos os usuários antes de criar os padrão',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n╔══════════════════════════════════╗'))
        self.stdout.write(self.style.SUCCESS('║   hi Conecta RH — Seed Inicial   ║'))
        self.stdout.write(self.style.SUCCESS('╚══════════════════════════════════╝\n'))

        if options['limpar']:
            Usuario.all_objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.WARNING('⚠  Usuários existentes removidos.\n'))

        # Cria usuários
        self.stdout.write('👤 Criando usuários...')
        criados = 0
        for dados in self.USUARIOS:
            user, novo = Usuario.objects.get_or_create(
                email=dados['email'],
                defaults={
                    'nome':        dados['nome'],
                    'perfil':      dados['perfil'],
                    'is_active':   True,
                    'trocar_senha': False,
                }
            )
            if novo:
                user.set_password(dados['senha'])
                user.save()
                criados += 1
                self.stdout.write(f'   ✅ {dados["perfil"]:12} → {dados["email"]}  senha: {dados["senha"]}')
            else:
                self.stdout.write(f'   ⏭  {dados["email"]} já existe.')

        # Cria configurações
        self.stdout.write('\n⚙️  Criando configurações...')
        for chave, valor, desc in self.CONFIGS:
            Configuracao.set(chave, valor, desc)
        self.stdout.write(f'   ✅ {len(self.CONFIGS)} configurações definidas.')

        # Resumo
        self.stdout.write(self.style.SUCCESS(f'\n✨ Seed concluído! {criados} usuário(s) criado(s).\n'))
        self.stdout.write('─' * 50)
        self.stdout.write(self.style.SUCCESS('CREDENCIAIS DE ACESSO:'))
        self.stdout.write('─' * 50)
        for u in self.USUARIOS:
            self.stdout.write(f'  {u["perfil"]:12} {u["email"]:42} → {u["senha"]}')
        self.stdout.write('─' * 50)
        self.stdout.write('')

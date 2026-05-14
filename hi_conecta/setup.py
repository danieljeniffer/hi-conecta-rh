"""
setup.py — Script de configuração inicial do hi Conecta RH.
Execute APENAS UMA VEZ após clonar e configurar o .env.

Uso:
    python setup.py              # Setup completo
    python setup.py --no-seed   # Sem dados de demonstração
    python setup.py --only-seed # Apenas seed (após migrations já feitas)
"""
import os
import sys
import subprocess
import argparse


def cmd(command: str, desc: str = ''):
    print(f'\n⏳ {desc or command}')
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f'❌ Erro:\n{result.stderr}')
        return False
    if result.stdout.strip():
        print(result.stdout.strip())
    print('✅ OK')
    return True


def check_env():
    if not os.path.exists('.env'):
        print('⚠️  Arquivo .env não encontrado!')
        print('   Copie .env.example para .env e configure as variáveis.')
        print('   cp .env.example .env')
        sys.exit(1)
    print('✅ .env encontrado')


def main():
    parser = argparse.ArgumentParser(description='Setup do hi Conecta RH')
    parser.add_argument('--no-seed',   action='store_true', help='Pular seed de dados')
    parser.add_argument('--only-seed', action='store_true', help='Apenas seed')
    args = parser.parse_args()

    print('=' * 60)
    print('  hi Conecta RH — Setup Inicial')
    print('=' * 60)

    check_env()

    if not args.only_seed:
        cmd('pip install -r requirements/base.txt', 'Instalando dependências...')
        cmd('python manage.py migrate', 'Executando migrations...')
        cmd('python manage.py collectstatic --noinput', 'Coletando arquivos estáticos...')

    if not args.no_seed:
        print('\n⏳ Carregando dados de demonstração...')
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hi_conecta.settings')
        try:
            import django
            django.setup()
            from fixtures.seed_demo import run
            run()
        except Exception as e:
            print(f'⚠️  Seed falhou: {e}')
            print('   Execute manualmente: python manage.py shell < fixtures/seed_demo.py')

    print('\n' + '=' * 60)
    print('  🚀 Setup concluído!')
    print('=' * 60)
    print('\nPara iniciar o servidor:')
    print('  python manage.py runserver')
    print('\nAcesse: http://localhost:8000')
    print('Admin:  http://localhost:8000/admin')


if __name__ == '__main__':
    main()

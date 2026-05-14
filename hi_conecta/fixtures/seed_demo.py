"""
fixtures/seed_demo.py — Seed de dados de demonstração realistas.
Execute: python manage.py shell < fixtures/seed_demo.py
Ou:      python fixtures/seed_demo.py (com django configurado)
"""
import os
import sys
import django
from datetime import date, timedelta
from decimal import Decimal

# Configurar Django se executado diretamente
if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hi_conecta.settings')
    django.setup()


def run():
    from accounts.models import Usuario
    from rh.models import Departamento, Cargo, Colaborador

    print('🌱 Iniciando seed de dados de demonstração...')

    # ── Superusuário admin ──────────────────────────────────────
    if not Usuario.objects.filter(email='admin@empresa.com.br').exists():
        admin = Usuario.objects.create_superuser(
            email='admin@empresa.com.br',
            password='Admin@2026',
            nome='Administrador do Sistema',
            perfil='admin',
        )
        print('✅ Admin criado: admin@empresa.com.br / Admin@2026')

    # ── Usuários por perfil ─────────────────────────────────────
    usuarios_demo = [
        ('rh@empresa.com.br',        'Ana Lima',        'rh',          'RH@2026'),
        ('analista@empresa.com.br',  'Carlos Silva',    'analista',    'Analista@2026'),
        ('gestor@empresa.com.br',    'Fernanda Costa',  'gestor',      'Gestor@2026'),
        ('colab@empresa.com.br',     'João Santos',     'colaborador', 'Colab@2026'),
        ('juridico@empresa.com.br',  'Dra. Maria Alves','juridico',    'Juridico@2026'),
    ]
    for email, nome, perfil, senha in usuarios_demo:
        if not Usuario.objects.filter(email=email).exists():
            Usuario.objects.create_user(email=email, password=senha, nome=nome, perfil=perfil)
            print(f'  ✅ {perfil}: {email} / {senha}')

    # ── Departamentos ───────────────────────────────────────────
    depts_data = [
        ('Recursos Humanos',    'RH',  '001'),
        ('Tecnologia',          'TI',  '002'),
        ('Comercial',           'COM', '003'),
        ('Financeiro',          'FIN', '004'),
        ('Operações',           'OPR', '005'),
        ('Marketing',           'MKT', '006'),
        ('Jurídico',            'JUR', '007'),
    ]
    depts = {}
    for nome, cod, cc in depts_data:
        d, _ = Departamento.objects.get_or_create(
            nome=nome,
            defaults={'codigo': cod, 'centro_custo': cc, 'ativo': True},
        )
        depts[nome] = d
    print(f'  ✅ {len(depts)} departamentos')

    # ── Cargos ──────────────────────────────────────────────────
    cargos_data = [
        ('Analista de RH',           'administrativo', 'analista',   Decimal('4500')),
        ('Gerente de RH',            'gerencia',       'gerente',    Decimal('9000')),
        ('Desenvolvedor Backend',    'tecnico',        'pleno',      Decimal('7500')),
        ('Tech Lead',                'gerencia',       'senior',     Decimal('12000')),
        ('Analista Financeiro',      'administrativo', 'pleno',      Decimal('5500')),
        ('Gerente Financeiro',       'gerencia',       'gerente',    Decimal('11000')),
        ('Vendedor',                 'operacional',    'junior',     Decimal('3500')),
        ('Gerente Comercial',        'gerencia',       'gerente',    Decimal('10500')),
        ('Analista de Marketing',    'administrativo', 'pleno',      Decimal('5000')),
        ('Auxiliar Administrativo',  'administrativo', 'junior',     Decimal('2800')),
    ]
    cargos = {}
    for nome, nivel, senioridade, sal in cargos_data:
        c, _ = Cargo.objects.get_or_create(
            nome=nome,
            defaults={
                'nivel': nivel,
                'senioridade': senioridade,
                'salario_base': sal,
                'ativo': True,
            }
        )
        cargos[nome] = c
    print(f'  ✅ {len(cargos)} cargos')

    # ── Colaboradores ────────────────────────────────────────────
    colaboradores_data = [
        ('Maria Oliveira',    'maria@empresa.com.br',   '111.111.111-11', date(1988,3,15),  date(2020,1,10),  'Analista de RH',           'Recursos Humanos', 'F', Decimal('4500')),
        ('Pedro Almeida',     'pedro@empresa.com.br',   '222.222.222-22', date(1990,7,22),  date(2019,5,3),   'Desenvolvedor Backend',    'Tecnologia',       'M', Decimal('7500')),
        ('Lucas Ferreira',    'lucas@empresa.com.br',   '333.333.333-33', date(1995,11,8),  date(2022,3,14),  'Vendedor',                 'Comercial',        'M', Decimal('3500')),
        ('Juliana Rodrigues', 'juliana@empresa.com.br', '444.444.444-44', date(1987,5,30),  date(2018,8,20),  'Analista Financeiro',      'Financeiro',       'F', Decimal('5500')),
        ('Rafael Souza',      'rafael@empresa.com.br',  '555.555.555-55', date(1993,9,12),  date(2021,11,1),  'Analista de Marketing',   'Marketing',        'M', Decimal('5000')),
        ('Amanda Lima',       'amanda@empresa.com.br',  '666.666.666-66', date(1991,4,18),  date(2020,6,15),  'Auxiliar Administrativo', 'Operações',        'F', Decimal('2800')),
        ('Bruno Costa',       'bruno@empresa.com.br',   '777.777.777-77', date(1986,12,3),  date(2016,2,8),   'Tech Lead',               'Tecnologia',       'M', Decimal('12000')),
        ('Carla Mendes',      'carla@empresa.com.br',   '888.888.888-88', date(1989,8,25),  date(2017,9,12),  'Gerente de RH',            'Recursos Humanos', 'F', Decimal('9000')),
        ('Diego Nunes',       'diego@empresa.com.br',   '999.999.999-99', date(1994,1,14),  date(2023,4,3),   'Desenvolvedor Backend',   'Tecnologia',       'M', Decimal('7000')),
        ('Elisa Barros',      'elisa@empresa.com.br',   '000.000.000-00', date(1992,6,20),  date(2022,7,18),  'Vendedor',                'Comercial',        'F', Decimal('3500')),
    ]
    colab_objs = []
    for nome, email, cpf, nasc, admissao, cargo_nome, dept_nome, genero, salario in colaboradores_data:
        c, _ = Colaborador.objects.get_or_create(
            cpf=cpf,
            defaults={
                'nome':              nome,
                'email':             email,
                'data_nascimento':   nasc,
                'data_admissao':     admissao,
                'cargo':             cargos.get(cargo_nome),
                'departamento':      depts.get(dept_nome),
                'genero':            genero,
                'salario_base':      salario,
                'status':            'ativo',
                'regime_contratacao':'clt',
                'matricula':         f'EMP{len(colab_objs)+1001:04d}',
            }
        )
        colab_objs.append(c)
    print(f'  ✅ {len(colab_objs)} colaboradores')

    # ── Treinamentos demo ────────────────────────────────────────
    try:
        from treinamento.models import Treinamento
        treinamentos_data = [
            ('Integração e Cultura Organizacional', 'onboarding',     'ead',        8),
            ('LGPD na Prática',                    'compliance',     'ead',        4),
            ('Excel Avançado para RH',             'tecnico',        'ead',       16),
            ('Liderança Situacional',              'lideranca',      'presencial', 16),
            ('Segurança do Trabalho — NR35',       'seguranca',      'presencial',  8),
            ('Comunicação Assertiva',              'comportamental', 'ead',         6),
        ]
        for titulo, tipo, mod, ch in treinamentos_data:
            Treinamento.objects.get_or_create(
                titulo=titulo,
                defaults={'tipo': tipo, 'modalidade': mod, 'carga_horaria': ch, 'ativo': True, 'obrigatorio': tipo in ('onboarding','compliance','seguranca')},
            )
        print(f'  ✅ {len(treinamentos_data)} treinamentos')
    except Exception as e:
        print(f'  ⚠️  Treinamentos: {e}')

    # ── Comunicado de boas-vindas ───────────────────────────────
    try:
        from comunicacao.models import Comunicado
        from django.utils import timezone
        admin_user = Usuario.objects.filter(perfil='admin').first()
        if admin_user and not Comunicado.objects.filter(titulo__startswith='Bem-vindos').exists():
            Comunicado.objects.create(
                titulo='Bem-vindos ao hi Conecta RH!',
                tipo='noticia',
                conteudo='Este é o sistema corporativo de gestão de pessoas da empresa. Aqui você encontra holerites, férias, treinamentos, comunicados e muito mais.',
                fixado=True,
                ativo=True,
                publicado_em=timezone.now(),
                autor=admin_user,
            )
            print('  ✅ Comunicado de boas-vindas criado')
    except Exception as e:
        print(f'  ⚠️  Comunicado: {e}')

    # ── Medalhas padrão ─────────────────────────────────────────
    try:
        from gamificacao.models import Medalha
        medalhas_data = [
            ('Primeiro Acesso',    '🎯', 'especial',    10, 'Acessou o sistema pela primeira vez'),
            ('Aprendiz',           '📚', 'treinamento', 50, 'Concluiu o primeiro treinamento'),
            ('Mestre dos Cursos',  '🏆', 'treinamento', 200,'Concluiu 10 treinamentos'),
            ('Pontual',            '⏰', 'pontualidade',100,'Zero faltas em 6 meses'),
            ('Colaborador do Mês', '⭐', 'desempenho',  300,'Destaque mensal de desempenho'),
            ('Veterano',           '🏅', 'tempo',       500,'5 anos na empresa'),
        ]
        for nome, icone, cat, pts, criterio in medalhas_data:
            Medalha.objects.get_or_create(
                nome=nome,
                defaults={'icone': icone, 'categoria': cat, 'pontos': pts, 'criterio': criterio},
            )
        print(f'  ✅ {len(medalhas_data)} medalhas')
    except Exception as e:
        print(f'  ⚠️  Medalhas: {e}')

    print('\n🎉 Seed concluído com sucesso!')
    print('\nCredenciais de acesso:')
    print('  Admin:     admin@empresa.com.br     / Admin@2026')
    print('  RH:        rh@empresa.com.br        / RH@2026')
    print('  Analista:  analista@empresa.com.br  / Analista@2026')
    print('  Gestor:    gestor@empresa.com.br    / Gestor@2026')
    print('  Colaborador: colab@empresa.com.br   / Colab@2026')
    print('  Jurídico:  juridico@empresa.com.br  / Juridico@2026')


if __name__ == '__main__':
    run()

from django.urls import path
from . import views

app_name = 'dp'

urlpatterns = [
    # Hub e Central
    path('',                           views.hub,                    name='hub'),
    path('central/',                   views.central,                name='central'),
    path('central/calcular/',          views.central_calcular,       name='central_calcular'),
    path('calculo-massa/',             views.calculo_massa,          name='calculo_massa'),
    path('calculo-massa/executar/',    views.calculo_massa_executar,  name='calculo_massa_executar'),

    # Folha
    path('folha/',                     views.folha_lista,            name='folha_lista'),
    path('folha/abrir/',               views.folha_abrir,            name='folha_abrir'),
    path('folha/<uuid:pk>/',           views.folha_detalhe,          name='folha_detalhe'),
    path('folha/<uuid:pk>/calcular/',  views.folha_calcular,         name='folha_calcular'),
    path('folha/<uuid:pk>/aprovar/',   views.folha_aprovar,          name='folha_aprovar'),
    path('folha/item/<uuid:item_pk>/pdf/', views.holerite_pdf,       name='holerite_pdf'),

    # Férias
    path('ferias/',                    views.ferias_lista,           name='ferias_lista'),
    path('ferias/solicitar/',          views.ferias_solicitar,       name='ferias_solicitar'),
    path('ferias/simulacao/',          views.ferias_simulacao,       name='ferias_simulacao'),
    path('ferias/<uuid:pk>/aprovar/',  views.ferias_aprovar,         name='ferias_aprovar'),
    path('ferias/<uuid:pk>/recusar/',  views.ferias_recusar,         name='ferias_recusar'),
    path('ferias/<uuid:pk>/recibo/',   views.ferias_recibo_pdf,      name='ferias_recibo'),

    # Rescisão (Wizard)
    path('rescisao/',                  views.rescisao_lista,         name='rescisao_lista'),
    path('rescisao/novo/',             views.rescisao_wizard,        name='rescisao_wizard'),
    path('rescisao/<uuid:pk>/wizard/', views.rescisao_wizard,        name='rescisao_wizard_pk'),

    # 13º Salário
    path('decimo/',                    views.decimo_lista,           name='decimo_lista'),
    path('decimo/simular/',            views.decimo_simular,         name='decimo_simular'),

    # Benefícios
    path('beneficios/',                views.beneficios,             name='beneficios'),

    # Notificações
    path('notificacoes/',              views.notificacoes,           name='notificacoes'),
    path('notificacoes/<uuid:pk>/lida/', views.notificacao_marcar_lida, name='notif_lida'),
    path('notificacoes/gerar-alertas/', views.gerar_alertas,         name='gerar_alertas'),
]

def perfil_context(request):
    if not request.user.is_authenticated:
        return {}
    return {
        'usuario_perfil':      request.user.perfil,
        'usuario_iniciais':    request.user.iniciais,
        'usuario_nome':        request.user.nome,
        'usuario_colaborador': getattr(request.user, 'colaborador', None),
    }

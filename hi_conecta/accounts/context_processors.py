"""Injeta dados do usuário logado em todos os templates."""


def usuario_context(request):
    if not request.user.is_authenticated:
        return {}

    u = request.user
    return {
        'usuario':          u,
        'usuario_nome':     u.nome,
        'usuario_email':    u.email,
        'usuario_perfil':   u.perfil,
        'usuario_iniciais': u.iniciais,
        'usuario_foto':     u.foto,
        'usuario_is_admin': u.is_admin,
        'usuario_is_rh':    u.is_rh,
    }

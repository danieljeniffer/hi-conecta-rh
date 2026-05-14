"""accounts/serializers.py — Serializers DRF."""
from rest_framework import serializers
from .models import Usuario


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        return value.lower().strip()


class UsuarioResumoSerializer(serializers.ModelSerializer):
    perfil_display = serializers.CharField(source='get_perfil_display', read_only=True)
    iniciais       = serializers.CharField(read_only=True)

    class Meta:
        model  = Usuario
        fields = [
            'id', 'email', 'nome', 'perfil', 'perfil_display',
            'iniciais', 'foto', 'colaborador_id', 'ultimo_acesso',
        ]
        read_only_fields = fields


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer completo para CRUD de usuários (admin only)."""
    perfil_display = serializers.CharField(source='get_perfil_display', read_only=True)

    class Meta:
        model  = Usuario
        fields = [
            'id', 'email', 'nome', 'perfil', 'perfil_display',
            'foto', 'colaborador_id', 'is_active', 'trocar_senha',
            'ultimo_acesso', 'ultimo_ip', 'created_at',
        ]
        read_only_fields = ['id', 'ultimo_acesso', 'ultimo_ip', 'created_at']

    def create(self, validated_data):
        senha = validated_data.pop('password', None)
        user  = Usuario(**validated_data)
        if senha:
            user.set_password(senha)
        user.save()
        return user


class TrocarSenhaSerializer(serializers.Serializer):
    senha_atual  = serializers.CharField(write_only=True)
    nova_senha   = serializers.CharField(min_length=8, write_only=True)
    confirmar    = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['nova_senha'] != data['confirmar']:
            raise serializers.ValidationError({'confirmar': 'As senhas não conferem.'})
        return data

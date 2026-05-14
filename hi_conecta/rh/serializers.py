"""rh/serializers.py — Serializers DRF."""
from rest_framework import serializers
from .models import (
    Colaborador, Departamento, Cargo,
    HistoricoSalarial, AvaliacaoDesempenho, Advertencia,
)


class DepartamentoSerializer(serializers.ModelSerializer):
    headcount = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Departamento
        fields = ['id','nome','codigo','centro_custo','gestor','headcount','ativo']


class CargoSerializer(serializers.ModelSerializer):
    nivel_display = serializers.CharField(source='get_nivel_display', read_only=True)
    headcount     = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Cargo
        fields = ['id','nome','nivel','nivel_display','codigo_cbo','salario_min','salario_max','headcount','ativo']


class ColaboradorListSerializer(serializers.ModelSerializer):
    cargo_nome       = serializers.CharField(source='cargo.nome', read_only=True)
    departamento_nome = serializers.CharField(source='departamento.nome', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)
    iniciais         = serializers.CharField(read_only=True)
    tempo_empresa    = serializers.CharField(source='tempo_empresa_str', read_only=True)

    class Meta:
        model  = Colaborador
        fields = [
            'id','nome','cpf','iniciais','foto','email_corporativo',
            'status','status_display','regime',
            'cargo_nome','departamento_nome',
            'data_admissao','salario_base','tempo_empresa',
        ]


class ColaboradorDetalheSerializer(ColaboradorListSerializer):
    historico_salarial = serializers.SerializerMethodField()
    dependentes        = serializers.SerializerMethodField()

    class Meta(ColaboradorListSerializer.Meta):
        fields = ColaboradorListSerializer.Meta.fields + [
            'rg','data_nascimento','sexo','estado_civil','nacionalidade',
            'email','telefone','celular',
            'cep','logradouro','numero','complemento','bairro','cidade','estado',
            'banco','agencia','conta','tipo_conta','pix_tipo','pix_chave',
            'pis_pasep','ctps_numero','ctps_serie',
            'onboarding_completo','onboarding_pct',
            'observacoes','created_at','updated_at',
            'historico_salarial','dependentes',
        ]

    def get_historico_salarial(self, obj):
        return list(obj.historico_salarial.values(
            'id','salario_anterior','salario_novo','percentual','motivo','vigencia'
        )[:10])

    def get_dependentes(self, obj):
        return list(obj.dependentes.values('id','nome','parentesco','cpf','data_nascimento','ir'))


class ColaboradorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Colaborador
        exclude = ['deleted_at', 'criado_por', 'atualizado_por']
        extra_kwargs = {'cpf': {'required': True}, 'salario_base': {'required': True}}

    def validate_cpf(self, value):
        cpf = value.replace('.','').replace('-','').strip()
        if len(cpf) != 11:
            raise serializers.ValidationError('CPF deve ter 11 dígitos.')
        return cpf

    def validate_salario_base(self, value):
        if value < 1412:
            raise serializers.ValidationError('Salário abaixo do mínimo vigente.')
        return value


class HistoricoSalarialSerializer(serializers.ModelSerializer):
    motivo_display = serializers.CharField(source='get_motivo_display', read_only=True)

    class Meta:
        model  = HistoricoSalarial
        fields = ['id','salario_anterior','salario_novo','percentual','motivo','motivo_display','descricao','vigencia','aprovado_por','created_at']


class AvaliacaoSerializer(serializers.ModelSerializer):
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)
    tipo_display     = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = AvaliacaoDesempenho
        fields = ['id','colaborador','colaborador_nome','avaliador','tipo','tipo_display',
                  'status','status_display','prazo','nota_geral','recomenda_efetivacao',
                  'pontos_fortes','pontos_melhoria','realizada_em']

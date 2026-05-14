"""rh/forms.py — Formulários do módulo RH."""
from django import forms
from django.core.exceptions import ValidationError
from .models import (
    Colaborador, Departamento, Cargo,
    Dependente, AvaliacaoDesempenho, Advertencia, PesquisaClima,
)


class ColaboradorBasicoForm(forms.ModelForm):
    """Etapa 1 do wizard — dados básicos."""
    class Meta:
        model = Colaborador
        fields = [
            'nome', 'cpf', 'rg', 'data_nascimento', 'sexo',
            'estado_civil', 'email', 'celular', 'telefone', 'foto',
        ]
        widgets = {
            'data_nascimento': forms.DateInput(attrs={'type': 'date'}),
            'foto': forms.FileInput(attrs={'accept': 'image/*'}),
        }

    def clean_cpf(self):
        cpf = self.cleaned_data['cpf'].replace('.', '').replace('-', '').strip()
        if len(cpf) != 11 or not cpf.isdigit():
            raise ValidationError('CPF inválido — informe 11 dígitos numéricos.')
        if not self._validar_cpf(cpf):
            raise ValidationError('CPF inválido (dígitos verificadores incorretos).')
        qs = Colaborador.objects.filter(cpf=cpf, deleted_at__isnull=True)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError('Já existe um colaborador com este CPF.')
        return cpf

    @staticmethod
    def _validar_cpf(cpf):
        if cpf == cpf[0] * 11:
            return False
        for i in range(9, 11):
            soma = sum(int(cpf[j]) * (i + 1 - j) for j in range(i))
            dig  = 11 - (soma % 11)
            if dig >= 10:
                dig = 0
            if int(cpf[i]) != dig:
                return False
        return True


class ColaboradorContratualForm(forms.ModelForm):
    """Etapa 2 — dados contratuais."""
    class Meta:
        model = Colaborador
        fields = [
            'departamento', 'cargo', 'gestor', 'regime',
            'data_admissao', 'salario_base', 'carga_horaria',
            'email_corporativo',
        ]
        widgets = {
            'data_admissao': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean_salario_base(self):
        sal = self.cleaned_data.get('salario_base')
        if sal and sal < 1412:
            raise ValidationError('Salário abaixo do mínimo vigente (R$ 1.412,00).')
        return sal


class ColaboradorEnderecoForm(forms.ModelForm):
    """Etapa 3 — endereço."""
    class Meta:
        model  = Colaborador
        fields = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado']


class ColaboradorBancarioForm(forms.ModelForm):
    """Etapa 4 — dados bancários."""
    class Meta:
        model  = Colaborador
        fields = ['banco', 'agencia', 'conta', 'tipo_conta', 'pix_tipo', 'pix_chave']


class ColaboradorDocumentosForm(forms.ModelForm):
    """Etapa 5 — documentos."""
    class Meta:
        model  = Colaborador
        fields = ['pis_pasep', 'ctps_numero', 'ctps_serie', 'ctps_uf',
                  'titulo_eleitor', 'cnh_numero', 'cnh_categoria', 'cnh_validade']
        widgets = {
            'cnh_validade': forms.DateInput(attrs={'type': 'date'}),
        }


class ColaboradorFiltroForm(forms.Form):
    """Formulário de filtro da listagem de colaboradores."""
    busca        = forms.CharField(required=False, label='Buscar')
    departamento = forms.ModelChoiceField(
        queryset=Departamento.objects.filter(ativo=True, deleted_at__isnull=True),
        required=False, empty_label='Todos os departamentos'
    )
    cargo        = forms.ModelChoiceField(
        queryset=Cargo.objects.filter(ativo=True, deleted_at__isnull=True),
        required=False, empty_label='Todos os cargos'
    )
    status = forms.ChoiceField(
        choices=[('', 'Todos os status')] + Colaborador.STATUS,
        required=False
    )
    regime = forms.ChoiceField(
        choices=[('', 'Todos os regimes')] + Colaborador.REGIMES,
        required=False
    )
    ordenar = forms.ChoiceField(
        choices=[
            ('nome',          'Nome A–Z'),
            ('-nome',         'Nome Z–A'),
            ('-data_admissao','Mais Recentes'),
            ('data_admissao', 'Mais Antigos'),
            ('-salario_base', 'Maior Salário'),
        ],
        required=False, initial='nome'
    )


class AvaliacaoDesempenhoForm(forms.ModelForm):
    class Meta:
        model  = AvaliacaoDesempenho
        fields = [
            'colaborador', 'avaliador', 'tipo', 'prazo',
            'nota_geral', 'recomenda_efetivacao',
            'pontos_fortes', 'pontos_melhoria', 'metas_periodo', 'comentarios',
        ]
        widgets = {
            'prazo':            forms.DateInput(attrs={'type': 'date'}),
            'pontos_fortes':    forms.Textarea(attrs={'rows': 3}),
            'pontos_melhoria':  forms.Textarea(attrs={'rows': 3}),
            'metas_periodo':    forms.Textarea(attrs={'rows': 3}),
            'comentarios':      forms.Textarea(attrs={'rows': 3}),
        }


class AdvertenciaForm(forms.ModelForm):
    class Meta:
        model  = Advertencia
        fields = [
            'colaborador', 'tipo', 'motivo', 'descricao',
            'data_ocorrencia', 'data_advertencia', 'dias_suspensao', 'responsavel',
        ]
        widgets = {
            'data_ocorrencia':  forms.DateInput(attrs={'type': 'date'}),
            'data_advertencia': forms.DateInput(attrs={'type': 'date'}),
            'descricao':        forms.Textarea(attrs={'rows': 4}),
        }


class DepartamentoForm(forms.ModelForm):
    class Meta:
        model  = Departamento
        fields = ['nome', 'codigo', 'centro_custo', 'gestor', 'pai', 'descricao', 'ativo']
        widgets = {'descricao': forms.Textarea(attrs={'rows': 3})}


class CargoForm(forms.ModelForm):
    class Meta:
        model  = Cargo
        fields = ['nome', 'departamento', 'nivel', 'codigo_cbo',
                  'salario_min', 'salario_max', 'descricao', 'requisitos', 'ativo']
        widgets = {
            'descricao':  forms.Textarea(attrs={'rows': 3}),
            'requisitos': forms.Textarea(attrs={'rows': 3}),
        }

    def clean(self):
        cleaned = super().clean()
        smin    = cleaned.get('salario_min')
        smax    = cleaned.get('salario_max')
        if smin and smax and smin > smax:
            raise ValidationError('Salário mínimo não pode ser maior que o máximo.')
        return cleaned


class PesquisaClimaForm(forms.ModelForm):
    class Meta:
        model  = PesquisaClima
        fields = ['titulo', 'descricao', 'tipo', 'anonima', 'status', 'inicio', 'fim']
        widgets = {
            'descricao': forms.Textarea(attrs={'rows': 3}),
            'inicio':    forms.DateInput(attrs={'type': 'date'}),
            'fim':       forms.DateInput(attrs={'type': 'date'}),
        }

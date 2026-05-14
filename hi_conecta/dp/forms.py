"""dp/forms.py — Formulários do Departamento Pessoal."""
from django import forms
from datetime import date
from .models import FolhaPagamento, Ferias, Rescisao, Beneficio, ColaboradorBeneficio, DecimoTerceiro
from rh.models import Colaborador


class FolhaAbrirForm(forms.Form):
    competencia = forms.CharField(
        max_length=7,
        widget=forms.TextInput(attrs={'type': 'month', 'class': 'hi-input'}),
        label='Competência (YYYY-MM)',
    )

    def clean_competencia(self):
        comp = self.cleaned_data['competencia'].strip()
        if not comp or len(comp) != 7:
            raise forms.ValidationError('Formato inválido. Use YYYY-MM.')
        if FolhaPagamento.objects.filter(competencia=comp, deleted_at__isnull=True).exists():
            raise forms.ValidationError(f'Folha {comp} já existe.')
        return comp


class FeriasForm(forms.ModelForm):
    class Meta:
        model  = Ferias
        fields = ['colaborador','periodo_inicio','periodo_fim','gozo_inicio',
                  'dias_solicitados','dias_abono','observacoes']
        widgets = {
            'periodo_inicio':   forms.DateInput(attrs={'type':'date'}),
            'periodo_fim':      forms.DateInput(attrs={'type':'date'}),
            'gozo_inicio':      forms.DateInput(attrs={'type':'date'}),
            'observacoes':      forms.Textarea(attrs={'rows':2}),
        }

    def clean(self):
        cleaned = super().clean()
        dias = cleaned.get('dias_solicitados', 30)
        abono= cleaned.get('dias_abono', 0)
        if dias + abono > 30:
            raise forms.ValidationError('Dias de gozo + abono não podem ultrapassar 30 dias.')
        if abono > 10:
            raise forms.ValidationError('Abono pecuniário limitado a 10 dias.')
        return cleaned


class FeriasSimulacaoForm(forms.Form):
    colaborador  = forms.ModelChoiceField(
        queryset=Colaborador.objects.filter(status__in=['ativo','ferias'], deleted_at__isnull=True).order_by('nome'),
        empty_label='Selecione o colaborador'
    )
    dias         = forms.IntegerField(min_value=5, max_value=30, initial=30, label='Dias de Gozo')
    abono        = forms.IntegerField(min_value=0, max_value=10, initial=0, label='Dias de Abono')
    dependentes  = forms.IntegerField(min_value=0, max_value=20, initial=0, label='Dependentes IRRF')


class RescisaoIniciarForm(forms.Form):
    colaborador   = forms.ModelChoiceField(
        queryset=Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).order_by('nome'),
        empty_label='Selecione o colaborador'
    )
    tipo          = forms.ChoiceField(choices=Rescisao.TIPOS)
    data_demissao = forms.DateField(widget=forms.DateInput(attrs={'type':'date'}), initial=date.today)

    def clean_data_demissao(self):
        d = self.cleaned_data['data_demissao']
        if d < date(2000, 1, 1):
            raise forms.ValidationError('Data inválida.')
        return d


class BeneficioForm(forms.ModelForm):
    class Meta:
        model  = Beneficio
        fields = ['nome','tipo','descricao','fornecedor','valor_empresa',
                  'valor_colab','recorrencia','elegibilidade','ativo']
        widgets = {
            'descricao':   forms.Textarea(attrs={'rows':2}),
            'elegibilidade':forms.Textarea(attrs={'rows':2}),
        }


class ColaboradorBeneficioForm(forms.ModelForm):
    class Meta:
        model  = ColaboradorBeneficio
        fields = ['colaborador','beneficio','status','data_inicio','data_fim',
                  'valor_empresa','valor_colab','observacoes']
        widgets = {
            'data_inicio': forms.DateInput(attrs={'type':'date'}),
            'data_fim':    forms.DateInput(attrs={'type':'date'}),
            'observacoes': forms.Textarea(attrs={'rows':2}),
        }


class DecimoSimulacaoForm(forms.Form):
    colaborador  = forms.ModelChoiceField(
        queryset=Colaborador.objects.filter(status__in=['ativo','ferias'], deleted_at__isnull=True).order_by('nome'),
        empty_label='Selecione'
    )
    meses   = forms.IntegerField(min_value=1, max_value=12, initial=date.today().month, label='Meses Trabalhados')
    parcela = forms.ChoiceField(choices=[('1','1ª Parcela'),('2','2ª Parcela'),('total','Total')], initial='2')


class CalculoMassaForm(forms.Form):
    TIPOS = [('ferias','Férias Coletivas'),('decimo','13º Salário'),('reajuste','Reajuste Salarial')]
    tipo       = forms.ChoiceField(choices=TIPOS, label='Tipo de Cálculo')
    percentual = forms.DecimalField(min_value=0, max_value=100, initial=5, decimal_places=2,
                                    required=False, label='Percentual (apenas para reajuste)')
    departamento = forms.CharField(required=False, label='Filtrar por Departamento (ID)')

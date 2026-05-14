"""analytics — Migration inicial."""
import uuid
import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = [
        ('rh', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MetricaOrganizacional',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('nome', models.CharField(max_length=150)),
                ('categoria', models.CharField(max_length=30, choices=[
                    ('turnover','Turnover'),('absenteismo','Absenteísmo'),
                    ('engajamento','Engajamento'),('produtividade','Produtividade'),
                    ('clima','Clima Organizacional'),('treinamento','Treinamento & Desenvolvimento'),
                    ('recrutamento','Recrutamento'),('folha','Folha de Pagamento'),
                    ('diversidade','Diversidade & Inclusão'),('saude','Saúde & Bem-estar'),
                ])),
                ('periodicidade', models.CharField(max_length=15, default='mensal')),
                ('valor', models.DecimalField(decimal_places=4, max_digits=15)),
                ('valor_meta', models.DecimalField(blank=True, decimal_places=4, max_digits=15, null=True)),
                ('valor_anterior', models.DecimalField(blank=True, decimal_places=4, max_digits=15, null=True)),
                ('unidade', models.CharField(default='%', max_length=20)),
                ('departamento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='metricas', to='rh.departamento')),
                ('referencia', models.CharField(max_length=7)),
                ('descricao', models.TextField(blank=True)),
                ('dados_json', models.JSONField(blank=True, default=dict)),
            ],
            options={'db_table': 'analytics_metrica_organizacional', 'ordering': ['-referencia', 'categoria', 'nome']},
        ),
        migrations.CreateModel(
            name='ScoreColaborador',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('colaborador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='rh.colaborador')),
                ('dimensao', models.CharField(max_length=20)),
                ('score', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('score_anterior', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('referencia', models.CharField(max_length=7)),
                ('fatores', models.JSONField(blank=True, default=dict)),
                ('observacoes', models.TextField(blank=True)),
                ('calculado_por_ia', models.BooleanField(default=True)),
            ],
            options={'db_table': 'analytics_score_colaborador', 'ordering': ['-referencia', 'colaborador']},
        ),
        migrations.AlterUniqueTogether(
            name='scorecolaborador',
            unique_together={('colaborador', 'dimensao', 'referencia')},
        ),
        migrations.CreateModel(
            name='ScoreSetor',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('departamento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='rh.departamento')),
                ('referencia', models.CharField(max_length=7)),
                ('score_geral', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('score_engajamento', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('score_desempenho', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('score_bem_estar', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('score_retencao', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('headcount', models.IntegerField(default=0)),
                ('turnover_periodo', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('absenteismo_periodo', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('dados_extras', models.JSONField(blank=True, default=dict)),
            ],
            options={'db_table': 'analytics_score_setor', 'ordering': ['-referencia', '-score_geral']},
        ),
        migrations.AlterUniqueTogether(
            name='scoresetor',
            unique_together={('departamento', 'referencia')},
        ),
        migrations.CreateModel(
            name='AlertaInteligente',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('tipo', models.CharField(max_length=30)),
                ('prioridade', models.CharField(default='media', max_length=10)),
                ('status', models.CharField(default='ativo', max_length=10)),
                ('colaborador', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alertas_ia', to='rh.colaborador')),
                ('departamento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='alertas', to='rh.departamento')),
                ('titulo', models.CharField(max_length=200)),
                ('descricao', models.TextField()),
                ('recomendacao', models.TextField(blank=True)),
                ('confianca', models.DecimalField(decimal_places=2, default=80, max_digits=5)),
                ('dados_contexto', models.JSONField(blank=True, default=dict)),
                ('lido_por', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='alertas_lidos', to='accounts.usuario')),
                ('lido_em', models.DateTimeField(blank=True, null=True)),
                ('resolvido_em', models.DateTimeField(blank=True, null=True)),
            ],
            options={'db_table': 'analytics_alerta_inteligente', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='PrevisaoTurnover',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('colaborador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='previsoes_turnover', to='rh.colaborador')),
                ('horizonte', models.CharField(default='90d', max_length=5)),
                ('probabilidade', models.DecimalField(decimal_places=2, max_digits=5)),
                ('nivel_risco', models.CharField(default='medio', max_length=10)),
                ('fatores_risco', models.JSONField(blank=True, default=list)),
                ('acoes_retencao', models.JSONField(blank=True, default=list)),
                ('referencia', models.CharField(max_length=7)),
                ('modelo_versao', models.CharField(default='v1.0', max_length=20)),
                ('confirmado', models.BooleanField(blank=True, null=True)),
            ],
            options={'db_table': 'analytics_previsao_turnover', 'ordering': ['-probabilidade']},
        ),
        migrations.AlterUniqueTogether(
            name='previsaoturnover',
            unique_together={('colaborador', 'horizonte', 'referencia')},
        ),
        migrations.CreateModel(
            name='SnapshotAbsenteismo',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('colaborador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='snapshots_absenteismo', to='rh.colaborador')),
                ('referencia', models.CharField(max_length=7)),
                ('dias_falta', models.IntegerField(default=0)),
                ('dias_uteis', models.IntegerField(default=22)),
                ('taxa', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('justificados', models.IntegerField(default=0)),
                ('nao_justificados', models.IntegerField(default=0)),
                ('motivos', models.JSONField(blank=True, default=dict)),
            ],
            options={'db_table': 'analytics_snapshot_absenteismo', 'ordering': ['-referencia']},
        ),
        migrations.AlterUniqueTogether(
            name='snapshotabsenteismo',
            unique_together={('colaborador', 'referencia')},
        ),
        migrations.AddIndex(
            model_name='alertainteligente',
            index=models.Index(fields=['tipo', 'status'], name='analytics_alerta_tipo_status_idx'),
        ),
        migrations.AddIndex(
            model_name='alertainteligente',
            index=models.Index(fields=['prioridade', 'status'], name='analytics_alerta_prio_status_idx'),
        ),
    ]

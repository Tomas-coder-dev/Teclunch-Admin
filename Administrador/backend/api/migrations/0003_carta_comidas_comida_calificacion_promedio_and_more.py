# Generated by Django 5.1 on 2024-10-18 04:46

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_retroalimentacion_comentario_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='carta',
            name='comidas',
            field=models.ManyToManyField(through='api.CartaComida', to='api.comida'),
        ),
        migrations.AddField(
            model_name='comida',
            name='calificacion_promedio',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='comida',
            name='imagen',
            field=models.ImageField(blank=True, null=True, upload_to='comidas/'),
        ),
        migrations.AddField(
            model_name='comida',
            name='votos',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='usuario',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
        migrations.AddField(
            model_name='usuario',
            name='password',
            field=models.CharField(default=django.utils.timezone.now, max_length=128, verbose_name='password'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='usuario',
            name='contraseña',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
# Generated by Django 5.1 on 2024-10-29 05:28

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_remove_reserva_carta_reserva_comida'),
    ]

    operations = [
        migrations.AddField(
            model_name='reserva',
            name='codigo_reserva',
            field=models.CharField(blank=True, max_length=15, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='reserva',
            name='fecha_hora_creacion',
            field=models.DateTimeField(auto_now_add=True, default=datetime.datetime(2024, 10, 29, 0, 28, 17)),
            preserve_default=False,
        ),
    ]

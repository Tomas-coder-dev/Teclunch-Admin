# Generated by Django 5.1 on 2024-10-27 05:28

import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_pedido_estado_alter_pedido_fecha_pedido_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reserva',
            name='carta',
        ),
        migrations.AddField(
            model_name='reserva',
            name='comida',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.comida'),
        ),
    ]

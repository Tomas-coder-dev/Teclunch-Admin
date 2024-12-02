# Generated by Django 5.1 on 2024-11-01 22:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_remove_carta_comidas'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cartacomida',
            name='carta',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cartacomida_set', to='api.carta'),
        ),
        migrations.AlterField(
            model_name='cartacomida',
            name='comida',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cartacomida_set', to='api.comida'),
        ),
    ]

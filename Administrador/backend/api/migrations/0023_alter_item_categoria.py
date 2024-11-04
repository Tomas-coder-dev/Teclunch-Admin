# Generated by Django 5.1 on 2024-11-03 17:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_alter_reservaitem_item'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='categoria',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.categoria'),
        ),
    ]

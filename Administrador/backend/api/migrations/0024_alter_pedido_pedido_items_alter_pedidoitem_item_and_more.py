# Generated by Django 5.1 on 2024-11-03 17:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_alter_item_categoria'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pedido',
            name='pedido_items',
            field=models.ManyToManyField(related_name='items_pedido', through='api.PedidoItem', to='api.item'),
        ),
        migrations.AlterField(
            model_name='pedidoitem',
            name='item',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items_en_pedido', to='api.item'),
        ),
        migrations.AlterField(
            model_name='reserva',
            name='reserva_items',
            field=models.ManyToManyField(related_name='reserva_items_relations', through='api.ReservaItem', to='api.item'),
        ),
    ]
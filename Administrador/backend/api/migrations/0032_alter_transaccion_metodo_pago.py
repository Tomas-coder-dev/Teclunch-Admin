# Generated by Django 5.1 on 2024-12-02 05:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_item_ingredientes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaccion',
            name='metodo_pago',
            field=models.CharField(choices=[('Banca Movil', 'Banca Movil'), ('Tarjeta', 'Tarjeta'), ('Efectivo', 'Efectivo')], max_length=20),
        ),
    ]

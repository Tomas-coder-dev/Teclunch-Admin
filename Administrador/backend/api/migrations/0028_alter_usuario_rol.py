# Generated by Django 5.1 on 2024-11-03 23:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_usuario_id_institucional_alter_pedido_usuario_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='rol',
            field=models.CharField(choices=[('Estudiante', 'Estudiante'), ('Docente', 'Docente'), ('Administrador', 'Administrador')], max_length=15),
        ),
    ]

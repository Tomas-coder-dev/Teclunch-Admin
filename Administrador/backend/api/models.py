# api/models.py

import re
import random
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import MinLengthValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from math import log
from django.db.models import Avg  # Añadido para Aggregate functions


# ---------------------------
# Validadores
# ---------------------------
def validate_admin_email(value):
    email_regex = r'^[a-zA-Z0-9_.+-]+@tecsup\.edu\.pe$'
    if not re.match(email_regex, value):
        raise ValidationError('El correo debe ser del dominio @tecsup.edu.pe.')

# Alias para compatibilidad con migraciones existentes
validate_email = validate_admin_email

# ---------------------------
# Manager Personalizado para Usuario Administrador
# ---------------------------
class AdminUserManager(BaseUserManager):
    def create_user(self, id_institucional, correo, nombre, password=None):
        if not correo:
            raise ValueError("El usuario debe tener un correo electrónico")
        usuario = self.model(
            id_institucional=id_institucional,
            correo=self.normalize_email(correo),
            nombre=nombre,
            role='administrador'  # Forzamos el rol a 'administrador'
        )
        if password:
            usuario.set_password(password)
        else:
            usuario.set_unusable_password()
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, id_institucional, correo, nombre, password=None):
        usuario = self.create_user(
            id_institucional=id_institucional,
            correo=correo,
            nombre=nombre,
            password=password
        )
        usuario.is_admin = True
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save(using=self._db)
        return usuario

# ---------------------------
# Modelo Usuario Administrador
# ---------------------------
class AdminUsuario(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('administrador', 'Administrador'),
    ]

    id_institucional = models.CharField(
        max_length=6,
        unique=True,
        validators=[MinLengthValidator(6)]
    )
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(
        unique=True,
        validators=[validate_admin_email]
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='administrador'
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = AdminUserManager()

    USERNAME_FIELD = 'id_institucional'
    REQUIRED_FIELDS = ['nombre', 'correo']

    def __str__(self):
        return f"{self.nombre} ({self.id_institucional}) - {self.get_role_display()}"

# ---------------------------
# Modelo Categoria
# ---------------------------
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

# ---------------------------
# Modelo Item (Comida)
# ---------------------------
class Item(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=6, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='items')
    disponible = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to='items/', null=True, blank=True)
    ingredientes = models.TextField(null=True, blank=True)

    # Campos adicionales de Comida
    calorias = models.IntegerField(null=True, blank=True)
    proteinas = models.FloatField(null=True, blank=True)
    grasas = models.FloatField(null=True, blank=True)
    carbohidratos = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.disponible:
            self.update_carta()
        else:
            self.remove_from_carta()

    def update_carta(self):
        fecha_hoy = timezone.now().date()
        carta, created = Carta.objects.get_or_create(
            fecha=fecha_hoy, defaults={'nombre': f'Carta del {fecha_hoy}'}
        )
        if not carta.carta_items.filter(item=self).exists():
            CartaItem.objects.create(carta=carta, item=self)

    def remove_from_carta(self):
        fecha_hoy = timezone.now().date()
        CartaItem.objects.filter(carta__fecha=fecha_hoy, item=self).delete()

    # Métodos para calificaciones y puntuaciones
    def get_calificacion_promedio(self):
        promedio = self.retroalimentacion_set.aggregate(Avg('calificacion'))['calificacion__avg']
        return round(promedio, 1) if promedio else 0.0

    def get_total_votos(self):
        return self.retroalimentacion_set.count()

    def get_puntaje_compuesto(self):
        promedio = self.get_calificacion_promedio()
        votos = self.get_total_votos()
        return round(promedio * log(votos + 1), 2) if votos > 0 else 0.0

# ---------------------------
# Modelo Carta
# ---------------------------
class Carta(models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateField(unique=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.fecha})"

# ---------------------------
# Modelo CartaItem
# ---------------------------
class CartaItem(models.Model):
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE, related_name='carta_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='item_in_cartas')

    def __str__(self):
        return f"{self.carta.nombre} - {self.item.nombre}"

# ---------------------------
# Modelo Pedido
# ---------------------------
class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('Reservado', 'Reservado'),
        ('Pagado', 'Pagado'),
        ('Entregado', 'Entregado'),
        ('Cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(AdminUsuario, to_field='id_institucional', on_delete=models.CASCADE)
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE, null=True, blank=True)
    fecha_pedido = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='Reservado')
    pedido_items = models.ManyToManyField(Item, through='PedidoItem', related_name='pedidos')
    codigo_pedido = models.CharField(max_length=20, unique=True, blank=True, null=True)  # Campo agregado

    def __str__(self):
        return f"Pedido de {self.usuario.nombre} - {self.estado} - {self.codigo_pedido}"

    def calcular_total(self):
        total = sum([
            (pi.item.precio or 0) * pi.cantidad for pi in self.pedido_item_relations.all()
        ])
        return round(total, 2) or 0.0

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # 'codigo_pedido' se generará mediante la señal post_save

# ---------------------------
# Señal para Generar `codigo_pedido`
# ---------------------------
@receiver(post_save, sender=Pedido)
def generar_codigo_pedido(sender, instance, created, **kwargs):
    if created and not instance.codigo_pedido:
        # Obtener las iniciales del nombre del usuario
        nombres = instance.usuario.nombre.split()
        initials = ''.join([n[0] for n in nombres[:2]]).upper()  # Tomar las primeras dos iniciales
        # Generar cuatro dígitos aleatorios
        random_digits = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        # Formatear el código de pedido
        instance.codigo_pedido = f"TEC{initials}-{random_digits}"
        # Guardar nuevamente para almacenar el codigo_pedido sin volver a llamar la señal
        instance.save(update_fields=['codigo_pedido'])

# ---------------------------
# Modelo PedidoItem
# ---------------------------
class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='pedido_item_relations')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='items_en_pedido')
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.item.nombre} x {self.cantidad}"

# ---------------------------
# Modelo Retroalimentacion
# ---------------------------
class Retroalimentacion(models.Model):
    usuario = models.ForeignKey(AdminUsuario, to_field='id_institucional', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, null=True, blank=True)
    comentario = models.TextField(blank=True)
    calificacion = models.IntegerField()

    def __str__(self):
        return f"Retroalimentación de {self.usuario.nombre} para {self.item.nombre if self.item else 'Sin Item'}"

    def clean(self):
        if self.calificacion < 1 or self.calificacion > 5:
            raise ValidationError("La calificación debe estar entre 1 y 5.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

# ---------------------------
# Modelo Transaccion
# ---------------------------
class Transaccion(models.Model):
    METODO_PAGO_CHOICES = [
        ('Banca Movil', 'Banca Movil'),
        ('Tarjeta', 'Tarjeta'),
        ('Efectivo', 'Efectivo'),
    ]
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Completado', 'Completado'),
        ('Fallido', 'Fallido'),
    ]

    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='transacciones', null=True, blank=True)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES)
    fecha = models.DateTimeField(auto_now_add=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    realizador = models.ForeignKey(AdminUsuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='transacciones_realizadas')
    user_id_institucional = models.CharField(max_length=6, null=True, blank=True)
    user_nombre = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        if self.realizador:
            return f"Transacción realizada por {self.realizador.nombre} - {self.estado}"
        elif self.user_nombre:
            return f"Transacción realizada por {self.user_nombre} - {self.estado}"
        else:
            return f"Transacción de {self.pedido.usuario.nombre if self.pedido else 'Desconocido'} - {self.estado}"

    def clean(self):
        # Evitar cambios en el estado si ya está en 'Completado' o 'Fallido'
        if self.pk:
            original = Transaccion.objects.get(pk=self.pk)
            if original.estado in ['Completado', 'Fallido'] and self.estado != original.estado:
                raise ValidationError("El estado de esta transacción ya no puede ser modificado.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

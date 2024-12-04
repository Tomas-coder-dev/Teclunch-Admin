import random
import string
import re
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.validators import MinLengthValidator
from django.db.models import Avg
from math import log

# ---------------------------
# Validadores
# ---------------------------
def validate_email(value):
    email_regex = r'^[a-zA-Z0-9_.+-]+@tecsup\.edu\.pe$'
    if not re.match(email_regex, value):
        raise ValidationError('El correo debe ser del dominio @tecsup.edu.pe.')

# ---------------------------
# Manager Personalizado para Usuario
# ---------------------------
class UsuarioManager(BaseUserManager):
    def create_user(self, id_institucional, correo, nombre, rol, contraseña=None):
        if not correo:
            raise ValueError("El usuario debe tener un correo electrónico")
        usuario = self.model(
            id_institucional=id_institucional,
            correo=self.normalize_email(correo),
            nombre=nombre,
            rol=rol,
        )
        if contraseña:
            usuario.set_password(contraseña)
        else:
            usuario.set_unusable_password()
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, id_institucional, correo, nombre, rol='Administrador', contraseña=None):
        usuario = self.create_user(
            id_institucional=id_institucional,
            correo=correo,
            nombre=nombre,
            rol=rol,
            contraseña=contraseña
        )
        usuario.is_admin = True
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save(using=self._db)
        return usuario

# ---------------------------
# Modelo Usuario
# ---------------------------
class Usuario(AbstractBaseUser, PermissionsMixin):
    ROL_CHOICES = [
        ('Estudiante', 'Estudiante'),
        ('Docente', 'Docente'),
        ('Administrador', 'Administrador'),
    ]

    id_institucional = models.CharField(max_length=6, unique=True, validators=[MinLengthValidator(6)])
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True, validators=[validate_email])
    rol = models.CharField(max_length=15, choices=ROL_CHOICES)
    preferencias_alimenticias = models.TextField(blank=True)
    restricciones_dieteticas = models.TextField(blank=True)
    habitos_consumo = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'id_institucional'
    REQUIRED_FIELDS = ['nombre', 'correo', 'rol']

    def __str__(self):
        return f"{self.nombre} ({self.id_institucional})"

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
        return promedio or 0

    def get_total_votos(self):
        return self.retroalimentacion_set.count()

    def get_puntaje_compuesto(self):
        promedio = self.get_calificacion_promedio()
        votos = self.get_total_votos()
        return promedio * log(votos + 1) if votos > 0 else 0

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
# Modelo Reserva
# ---------------------------
class Reserva(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Confirmada', 'Confirmada'),
        ('Cancelada', 'Cancelada'),
    ]

    usuario = models.ForeignKey(Usuario, to_field='id_institucional', on_delete=models.CASCADE)
    fecha_reserva = models.DateField()
    fecha_hora_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='Pendiente')
    codigo_reserva = models.CharField(max_length=15, unique=True, blank=True, null=True)
    reserva_items = models.ManyToManyField(Item, through='ReservaItem', related_name='reservas')

    def __str__(self):
        return f"Reserva {self.codigo_reserva} - {self.estado}"

    def save(self, *args, **kwargs):
        estado_anterior = None
        if self.pk:
            estado_anterior = Reserva.objects.get(pk=self.pk).estado
        else:
            estado_anterior = None

        # Generar código de reserva si no existe
        if not self.codigo_reserva:
            while True:
                nombres = self.usuario.nombre.split()
                if len(nombres) >= 2:
                    user_initials = ''.join([word[0] for word in nombres[:2]]).upper()
                else:
                    user_initials = (nombres[0][0]*2).upper()
                random_number = ''.join(random.choices(string.digits, k=4))
                codigo = f"TEC-{user_initials}{random_number}"
                if not Reserva.objects.filter(codigo_reserva=codigo).exists():
                    self.codigo_reserva = codigo
                    break

        super().save(*args, **kwargs)

        # Verificar si el estado cambió a 'Confirmada' y crear el Pedido
        if estado_anterior != 'Confirmada' and self.estado == 'Confirmada':
            if not Pedido.objects.filter(reserva=self).exists():
                pedido = Pedido.objects.create(
                    usuario=self.usuario,
                    fecha_pedido=self.fecha_reserva,
                    estado='Reservado',  # Puedes ajustar el estado inicial si lo deseas
                    reserva=self
                )
                # Crear los PedidoItem correspondientes
                reserva_items = self.reserva_items_relations.all()
                for reserva_item in reserva_items:
                    PedidoItem.objects.create(
                        pedido=pedido,
                        item=reserva_item.item,
                        cantidad=reserva_item.cantidad
                    )
                # Crear la transacción inicial
                total_monto = pedido.calcular_total()
                Transaccion.objects.create(
                    pedido=pedido,
                    metodo_pago='Otro',  # Ajusta según tu lógica
                    estado='Pendiente',
                    monto=total_monto
                )

    def calcular_total(self):
        total = sum([
            ri.item.precio * ri.cantidad for ri in self.reserva_items_relations.all()
        ])
        return total

# ---------------------------
# Modelo ReservaItem
# ---------------------------
class ReservaItem(models.Model):
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='reserva_items_relations')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='item_reservas')
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.item.nombre} x {self.cantidad}"

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

    usuario = models.ForeignKey(Usuario, to_field='id_institucional', on_delete=models.CASCADE)
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE, null=True, blank=True)
    fecha_pedido = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='Reservado')
    reserva = models.ForeignKey(Reserva, on_delete=models.SET_NULL, null=True, blank=True, related_name='pedidos')
    pedido_items = models.ManyToManyField(Item, through='PedidoItem', related_name='pedidos')

    def __str__(self):
        return f"Pedido de {self.usuario.nombre} - {self.estado}"

    @property
    def codigo_reserva(self):
        return self.reserva.codigo_reserva if self.reserva else None

    def calcular_total(self):
        total = sum([
            (pi.item.precio or 0) * pi.cantidad for pi in self.pedido_item_relations.all()
        ])
        return total or 0.0

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
    usuario = models.ForeignKey(Usuario, to_field='id_institucional', on_delete=models.CASCADE)
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
        # Ya no es necesario actualizar campos en Item

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

    def __str__(self):
        return f"Transacción de {self.pedido.usuario.nombre if self.pedido else 'Desconocido'} - {self.estado}"

# ---------------------------
# Modelo Carrito
# ---------------------------
class Carrito(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='carrito')

    def __str__(self):
        return f"Carrito de {self.usuario.nombre}"

# ---------------------------
# Modelo CarritoItem
# ---------------------------
class CarritoItem(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.item.nombre} x {self.cantidad} en {self.carrito}"

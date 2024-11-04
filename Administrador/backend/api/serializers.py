from rest_framework import serializers
from .models import (
    Usuario, Item, Carta, CartaItem, Pedido, Reserva,
    Retroalimentacion, Transaccion, Categoria, PedidoItem, ReservaItem, Carrito, CarritoItem
)
from django.utils import timezone
from django.db import transaction

# ---------------------------
# Serializador para Categoria
# ---------------------------
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

# ---------------------------
# Serializador para Usuario (Lectura)
# ---------------------------
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id_institucional', 'nombre', 'correo', 'rol',
            'preferencias_alimenticias', 'restricciones_dieteticas',
            'habitos_consumo'
        ]

    def validate_correo(self, value):
        if not value.endswith('@tecsup.edu.pe'):
            raise serializers.ValidationError("El correo debe ser del dominio @tecsup.edu.pe")
        return value

# ---------------------------
# Serializador para Usuario (Creación)
# ---------------------------
class UsuarioCreateSerializer(serializers.ModelSerializer):
    contraseña = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id_institucional', 'nombre', 'correo', 'rol',
            'preferencias_alimenticias', 'restricciones_dieteticas',
            'habitos_consumo', 'contraseña'
        ]

    def validate_correo(self, value):
        if not value.endswith('@tecsup.edu.pe'):
            raise serializers.ValidationError("El correo debe ser del dominio @tecsup.edu.pe")
        return value

    def create(self, validated_data):
        contraseña = validated_data.pop('contraseña')
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(contraseña)
        usuario.save()
        return usuario

# ---------------------------
# Serializador para CarritoItem
# ---------------------------
class CarritoItemSerializer(serializers.ModelSerializer):
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    item_categoria = serializers.ReadOnlyField(source='item.categoria.nombre')

    class Meta:
        model = CarritoItem
        fields = ['id', 'item', 'item_nombre', 'item_categoria', 'cantidad']

    def validate_item(self, value):
        if not value.disponible:
            raise serializers.ValidationError("El ítem seleccionado no está disponible.")
        return value

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value

# ---------------------------
# Serializador para Carrito
# ---------------------------
class CarritoSerializer(serializers.ModelSerializer):
    items = CarritoItemSerializer(many=True, read_only=True)

    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'items']

# ---------------------------
# Serializador para Retroalimentacion
# ---------------------------
class RetroalimentacionSerializer(serializers.ModelSerializer):
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')

    class Meta:
        model = Retroalimentacion
        fields = [
            'id', 'usuario', 'usuario_nombre', 'item', 'item_nombre',
            'comentario', 'calificacion'
        ]

    def validate_calificacion(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
        return value

    def validate(self, attrs):
        usuario = attrs.get('usuario')
        item = attrs.get('item')
        if Retroalimentacion.objects.filter(usuario=usuario, item=item).exists():
            raise serializers.ValidationError("El usuario ya ha dejado una retroalimentación para este ítem.")
        return attrs

# ---------------------------
# Serializador para Item (Comida y Producto)
# ---------------------------
class ItemSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    retroalimentaciones = RetroalimentacionSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = '__all__'

# ---------------------------
# Serializador para Transaccion
# ---------------------------
class TransaccionSerializer(serializers.ModelSerializer):
    pedido_usuario = serializers.ReadOnlyField(source='pedido.usuario.nombre')

    class Meta:
        model = Transaccion
        fields = [
            'id', 'pedido', 'pedido_usuario', 'metodo_pago', 'estado',
            'fecha', 'monto'
        ]

# ---------------------------
# Serializador para PedidoItem
# ---------------------------
class PedidoItemSerializer(serializers.ModelSerializer):
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    item_categoria = serializers.ReadOnlyField(source='item.categoria.nombre')
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())

    class Meta:
        model = PedidoItem
        fields = ['id', 'item', 'item_nombre', 'item_categoria', 'cantidad']

    def validate_item(self, value):
        if not value.disponible:
            raise serializers.ValidationError("El ítem seleccionado no está disponible.")
        return value

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value

# ---------------------------
# Serializador para Pedido (Representación)
# ---------------------------
class PedidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')
    codigo_reserva = serializers.ReadOnlyField()
    pedido_items = PedidoItemSerializer(many=True, read_only=True, source='pedido_item_relations')
    total_pedido = serializers.SerializerMethodField()
    transacciones = TransaccionSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'usuario', 'usuario_nombre', 'carta',
            'fecha_pedido', 'estado', 'reserva', 'codigo_reserva',
            'pedido_items', 'total_pedido', 'transacciones'
        ]

    def get_total_pedido(self, obj):
        return obj.calcular_total() or 0.0

# ---------------------------
# Serializador para ReservaItem
# ---------------------------
class ReservaItemSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    item_categoria = serializers.ReadOnlyField(source='item.categoria.nombre')

    class Meta:
        model = ReservaItem
        fields = ['id', 'item', 'item_nombre', 'item_categoria', 'cantidad']

    def validate_item(self, value):
        if not value.disponible:
            raise serializers.ValidationError("El ítem seleccionado no está disponible.")
        return value

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value

# ---------------------------
# Serializador para Reserva (Representación)
# ---------------------------
class ReservaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')
    codigo_reserva = serializers.ReadOnlyField()
    reserva_items = ReservaItemSerializer(many=True, read_only=True, source='reserva_items_relations')
    total_reserva = serializers.SerializerMethodField()
    pedido = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            'id', 'usuario', 'usuario_nombre', 'fecha_reserva',
            'fecha_hora_creacion', 'estado', 'codigo_reserva',
            'reserva_items', 'total_reserva', 'pedido'
        ]

    def get_total_reserva(self, obj):
        return obj.calcular_total() or 0.0

    def get_pedido(self, obj):
        pedido = obj.pedidos.first()  # Accede al primer pedido asociado
        if pedido:
            return PedidoSerializer(pedido).data
        return None

# ---------------------------
# Serializador para la Creación y Actualización de Reserva
# ---------------------------
class ReservaCreateSerializer(serializers.ModelSerializer):
    reserva_items = ReservaItemSerializer(many=True, source='reserva_items_relations')
    usuario = serializers.SlugRelatedField(queryset=Usuario.objects.all(), slug_field='id_institucional')

    class Meta:
        model = Reserva
        fields = [
            'id', 'usuario', 'fecha_reserva',
            'estado', 'reserva_items'
        ]

    # Eliminamos la validación de fecha_reserva
    # def validate_fecha_reserva(self, value):
    #     if value != timezone.now().date():
    #         raise serializers.ValidationError("Las reservas solo se pueden realizar para el mismo día.")
    #     return value

    def create(self, validated_data):
        reserva_items_data = validated_data.pop('reserva_items_relations')
        try:
            with transaction.atomic():
                reserva = Reserva.objects.create(**validated_data)
                for ri_data in reserva_items_data:
                    ReservaItem.objects.create(reserva=reserva, **ri_data)
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear la reserva: {str(e)}")
        return reserva

    def update(self, instance, validated_data):
        reserva_items_data = validated_data.pop('reserva_items_relations', None)
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()

                if reserva_items_data is not None:
                    instance.reserva_items_relations.all().delete()
                    for ri_data in reserva_items_data:
                        ReservaItem.objects.create(reserva=instance, **ri_data)
        except Exception as e:
            raise serializers.ValidationError(f"Error al actualizar la reserva: {str(e)}")
        return instance

# ---------------------------
# Serializador para CartaItem
# ---------------------------
class CartaItemSerializer(serializers.ModelSerializer):
    carta_nombre = serializers.ReadOnlyField(source='carta.nombre')
    item_nombre = serializers.ReadOnlyField(source='item.nombre')

    class Meta:
        model = CartaItem
        fields = ['id', 'carta', 'carta_nombre', 'item', 'item_nombre']

    def validate(self, attrs):
        carta = attrs.get('carta')
        item = attrs.get('item')
        if CartaItem.objects.filter(carta=carta, item=item).exists():
            raise serializers.ValidationError("El ítem ya está asociado a esta carta.")
        return attrs

# ---------------------------
# Serializador para Carta
# ---------------------------
class CartaSerializer(serializers.ModelSerializer):
    carta_items = CartaItemSerializer(many=True, read_only=True)
    comidas_productos = ItemSerializer(source='item_in_cartas', many=True, read_only=True)

    class Meta:
        model = Carta
        fields = ['id', 'nombre', 'fecha', 'disponible', 'carta_items', 'comidas_productos']

# ---------------------------
# Serializador para la Creación y Actualización de Pedido
# ---------------------------
class PedidoCreateSerializer(serializers.ModelSerializer):
    pedido_items = PedidoItemSerializer(many=True, source='pedido_item_relations')
    metodo_pago = serializers.ChoiceField(choices=Transaccion.METODO_PAGO_CHOICES, write_only=True)
    fecha_pedido = serializers.DateField(read_only=True)
    carta = serializers.PrimaryKeyRelatedField(queryset=Carta.objects.all(), required=False, allow_null=True)
    reserva = serializers.PrimaryKeyRelatedField(queryset=Reserva.objects.all(), required=False, allow_null=True)
    usuario = serializers.SlugRelatedField(queryset=Usuario.objects.all(), slug_field='id_institucional')

    class Meta:
        model = Pedido
        fields = [
            'id', 'usuario', 'carta',
            'fecha_pedido', 'estado', 'reserva',
            'pedido_items', 'metodo_pago'
        ]

    # No es necesario validar fecha_pedido ya que es read_only y se establece automáticamente
    # def validate_fecha_pedido(self, value):
    #     if value != timezone.now().date():
    #         raise serializers.ValidationError("Los pedidos solo pueden realizarse para el mismo día.")
    #     return value

    def create(self, validated_data):
        pedido_items_data = validated_data.pop('pedido_item_relations')
        metodo_pago = validated_data.pop('metodo_pago')
        try:
            with transaction.atomic():
                pedido = Pedido.objects.create(**validated_data)
                total_monto = 0
                for pi_data in pedido_items_data:
                    cantidad = pi_data.get('cantidad', 1)
                    item = pi_data.get('item')
                    pedido_item = PedidoItem.objects.create(pedido=pedido, item=item, cantidad=cantidad)
                    total_monto += (pedido_item.item.precio or 0) * cantidad
                Transaccion.objects.create(
                    pedido=pedido,
                    metodo_pago=metodo_pago,
                    estado='Pendiente',
                    monto=total_monto
                )
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear el pedido: {str(e)}")
        return pedido

    def update(self, instance, validated_data):
        pedido_items_data = validated_data.pop('pedido_item_relations', None)
        metodo_pago = validated_data.pop('metodo_pago', None)
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()

                if pedido_items_data is not None:
                    instance.pedido_item_relations.all().delete()
                    total_monto = 0
                    for pi_data in pedido_items_data:
                        cantidad = pi_data.get('cantidad', 1)
                        item = pi_data.get('item')
                        pedido_item = PedidoItem.objects.create(pedido=instance, item=item, cantidad=cantidad)
                        total_monto += (pedido_item.item.precio or 0) * cantidad
                    transaccion = instance.transacciones.first()
                    if transaccion:
                        transaccion.monto = total_monto
                        if metodo_pago:
                            transaccion.metodo_pago = metodo_pago
                        transaccion.save()
                    else:
                        Transaccion.objects.create(
                            pedido=instance,
                            metodo_pago=metodo_pago if metodo_pago else 'Otro',
                            estado='Pendiente',
                            monto=total_monto
                        )
        except Exception as e:
            raise serializers.ValidationError(f"Error al actualizar el pedido: {str(e)}")
        return instance

# ---------------------------
# Serializador para Múltiples Reservas (Opcional)
# ---------------------------
class MultipleReservaCreateSerializer(serializers.Serializer):
    reservas = ReservaCreateSerializer(many=True)

    def create(self, validated_data):
        reservas_data = validated_data.pop('reservas')
        reservas = []
        for reserva_data in reservas_data:
            reserva_serializer = ReservaCreateSerializer(data=reserva_data)
            reserva_serializer.is_valid(raise_exception=True)
            reserva = reserva_serializer.save()
            reservas.append(reserva)
        return reservas

# ---------------------------
# Serializador para Múltiples Pedidos (Opcional)
# ---------------------------
class MultiplePedidoCreateSerializer(serializers.Serializer):
    pedidos = PedidoCreateSerializer(many=True)

    def create(self, validated_data):
        pedidos_data = validated_data.pop('pedidos')
        pedidos = []
        for pedido_data in pedidos_data:
            pedido_serializer = PedidoCreateSerializer(data=pedido_data)
            pedido_serializer.is_valid(raise_exception=True)
            pedido = pedido_serializer.save()
            pedidos.append(pedido)
        return pedidos

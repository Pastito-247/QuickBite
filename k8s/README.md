# Kubernetes Deployment - QuickBite

## Descripción
Esta carpeta contiene los manifiestos de Kubernetes para desplegar el sistema QuickBite en un cluster de Kubernetes.

## Archivos

- `namespace.yaml` - Namespace de QuickBite
- `configmap.yaml` - Configuración común para todos los servicios
- `secret.yaml` - Secretos para MySQL
- `eureka-server.yaml` - Deployment y Service para Eureka Server
- `api-gateway.yaml` - Deployment y Service para API Gateway
- `backend-services.yaml` - Deployments y Services para todos los servicios backend
- `mysql.yaml` - Deployment, Service y PVC para MySQL
- `frontend.yaml` - Deployment y Service para el frontend React

## Despliegue

### Prerrequisitos
- Cluster de Kubernetes funcionando
- kubectl configurado
- Imágenes Docker construidas y disponibles en un registry

### Pasos de Despliegue

1. Crear namespace:
```bash
kubectl apply -f namespace.yaml
```

2. Crear ConfigMap:
```bash
kubectl apply -f configmap.yaml
```

3. Crear Secret:
```bash
kubectl apply -f secret.yaml
```

4. Desplegar MySQL:
```bash
kubectl apply -f mysql.yaml
```

5. Desplegar Eureka Server:
```bash
kubectl apply -f eureka-server.yaml
```

6. Desplegar servicios backend:
```bash
kubectl apply -f backend-services.yaml
```

7. Desplegar API Gateway:
```bash
kubectl apply -f api-gateway.yaml
```

8. Desplegar frontend:
```bash
kubectl apply -f frontend.yaml
```

### Despliegue Completo

Para desplegar todo el sistema en orden:
```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f mysql.yaml
kubectl apply -f eureka-server.yaml
kubectl apply -f backend-services.yaml
kubectl apply -f api-gateway.yaml
kubectl apply -f frontend.yaml
```

## Verificación

### Verificar pods:
```bash
kubectl get pods -n quickbite
```

### Verificar servicios:
```bash
kubectl get svc -n quickbite
```

### Verificar logs:
```bash
kubectl logs -n quickbite deployment/eureka-server
kubectl logs -n quickbite deployment/api-gateway
kubectl logs -n quickbite deployment/auth-service
```

### Escalar servicios:
```bash
kubectl scale deployment auth-service -n quickbite --replicas=3
kubectl scale deployment api-gateway -n quickbite --replicas=3
```

## Acceso a Servicios

### Frontend
```bash
kubectl port-forward -n quickbite svc/frontend 8080:80
```
Luego acceder a http://localhost:8080

### API Gateway
```bash
kubectl port-forward -n quickbite svc/api-gateway 8080:8080
```
Luego acceder a http://localhost:8080

### Eureka Server
```bash
kubectl port-forward -n quickbite svc/eureka-server 8761:8761
```
Luego acceder a http://localhost:8761

## Limpieza

Para eliminar todos los recursos:
```bash
kubectl delete -f frontend.yaml
kubectl delete -f api-gateway.yaml
kubectl delete -f backend-services.yaml
kubectl delete -f eureka-server.yaml
kubectl delete -f mysql.yaml
kubectl delete -f secret.yaml
kubectl delete -f configmap.yaml
kubectl delete -f namespace.yaml
```

## Configuración de Recursos

Cada servicio tiene configuración de recursos:
- **Requests**: Mínimo de recursos garantizados
- **Limits**: Máximo de recursos permitidos

### Servicios Backend
- Memory: 512Mi - 1Gi
- CPU: 500m - 1000m

### Frontend
- Memory: 256Mi - 512Mi
- CPU: 250m - 500m

### MySQL
- Memory: 1Gi - 2Gi
- CPU: 500m - 1000m
- Storage: 10Gi

## Troubleshooting

### Pods no se inician
```bash
kubectl describe pod <pod-name> -n quickbite
kubectl logs <pod-name> -n quickbite
```

### Servicios no accesibles
```bash
kubectl get endpoints -n quickbite
kubectl describe service <service-name> -n quickbite
```

### Problemas de almacenamiento
```bash
kubectl get pvc -n quickbite
kubectl describe pvc mysql-pvc -n quickbite
```

## Actualización de Imágenes

Para actualizar a una nueva versión de imagen:
```bash
kubectl set image deployment/auth-service -n quickbite auth-service=quickbite/auth-service:v2.0.0
kubectl rollout status deployment/auth-service -n quickbite
```

## Monitoreo

Para monitorear el estado del sistema:
```bash
kubectl top pods -n quickbite
kubectl top nodes
```

---
**Última actualización**: 17 de junio de 2026
**Versión**: 1.0

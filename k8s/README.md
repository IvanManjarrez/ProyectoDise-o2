Kubernetes manifests for ProyectoDise-o2
=====================================

This folder contains basic Kubernetes manifests for the auth-service and the API Gateway.

Files
- `auth-deployment.yaml` - Deployment for auth-service (containerPort: 3001)
- `auth-service-svc.yaml` - ClusterIP Service for auth-service
- `gateway-deployment.yaml` - Deployment for api-gateway (containerPort: 3000)
- `gateway-service.yaml` - ClusterIP Service for api-gateway
- `ingress.yaml` - Ingress rule exposing the API Gateway at host `local.artgallery` (requires an Ingress controller)

Notes and next steps
- Replace `your-docker-repo/...:latest` image references with the images you build and push (or load into your local cluster).
- The manifests are minimal and intended for local testing. Adjust replicas, resource requests/limits and probes for production.

Quick local deploy (minikube)

1. Start minikube:

```bash
minikube start --driver=docker
```

2. Build and load images into minikube (example for auth-service and api-gateway):

```bash
# from repo root
cd backend/auth-service
docker build -t local/auth-service:latest .
minikube image load local/auth-service:latest

cd ../api-gateway
docker build -t local/api-gateway:latest .
minikube image load local/api-gateway:latest
```

3. Apply manifests:

```bash
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/auth-service-svc.yaml
kubectl apply -f k8s/gateway-deployment.yaml
kubectl apply -f k8s/gateway-service.yaml
kubectl apply -f k8s/ingress.yaml
```

4. Test (if using minikube ingress addon):

```bash
minikube addons enable ingress
# add host entry to /etc/hosts mapping local.artgallery to minikube ip
printf "$(minikube ip) local.artgallery\n" | sudo tee -a /etc/hosts
curl http://local.artgallery/auth/health
```

Quick local deploy (kind)

1. Create a kind cluster and load images:

```bash
kind create cluster --name pd2
# build images locally and load into kind
docker build -t local/auth-service:latest ./backend/auth-service
kind load docker-image local/auth-service:latest --name pd2

docker build -t local/api-gateway:latest ./backend/api-gateway
kind load docker-image local/api-gateway:latest --name pd2
```

2. Apply manifests (same kubectl apply commands as above).

Replace and customize
- If you already built and pushed Docker images as part of your work, replace `local/...` with your repository image names in the YAML files.
- If you want secrets management for `MONGO_URI` or `JWT_SECRET`, consider creating `Secret` manifests and mounting them as env vars instead of hardcoding.

Secrets
-------
This repository includes a `k8s/secrets.yaml` file with base64 placeholders. Do NOT apply it as-is.

To create secrets from plaintext locally (example):

```bash
# Generate base64 values (Linux/macOS). On Windows (PowerShell) use:
# [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('your-value'))
echo -n "myjwtsecret" | base64
echo -n "mongoUser" | base64
echo -n "mongoPassword" | base64

# Edit k8s/secrets.yaml and replace the placeholder values with the base64 outputs.
kubectl apply -f k8s/secrets.yaml
```

Alternatively, you can create the secret directly without editing the file:

```bash
kubectl create secret generic project-secrets \
	--from-literal=JWT_SECRET="myjwtsecret" \
	--from-literal=MONGO_USER="mongoUser" \
	--from-literal=MONGO_PASSWORD="mongoPassword"
```

MongoDB persistence
-------------------
`k8s/mongo-statefulset.yaml` contains a `StatefulSet` and a `volumeClaimTemplates` entry that requests 5Gi. You may need to adjust `storageClassName` to match your cluster's storage class. For production, consider a multi-replica setup and a properly provisioned storage class.

Probes & resources
-------------------
Deployments now include conservative `livenessProbe` and `readinessProbe` settings and `resources.requests/limits`. Tune these values to match your environment and load.


param(
  [ValidateSet('kind','minikube')]
  [string]$Cluster = 'kind',
  [string]$AuthImage = 'proyectodise-o2-auth-service:latest',
  [string]$GatewayImage = 'proyectodise-o2-api-gateway:latest',
  [string]$JwtSecret = 'dev_jwt_secret',
  [string]$MongoUser = 'artgallery',
  [string]$MongoPassword = 'secure123',
  [string]$MongoUri = ''
)

# Build images
Write-Host "Building Docker images..."
docker build -t $AuthImage ./backend/auth-service
docker build -t $GatewayImage ./backend/api-gateway

if ($Cluster -eq 'kind') {
  Write-Host "Loading images into kind cluster..."
  kind load docker-image $AuthImage --name kind
  kind load docker-image $GatewayImage --name kind
} else {
  Write-Host "Configuring Docker to use minikube daemon..."
  & minikube -p minikube docker-env --shell powershell | Invoke-Expression
  # Rebuild in minikube docker daemon
  docker build -t $AuthImage ./backend/auth-service
  docker build -t $GatewayImage ./backend/api-gateway
}

# Create secret if not exists
if (-not (kubectl get secret project-secrets -o name --ignore-not-found)) {
  Write-Host "Creating Kubernetes secret 'project-secrets' with provided values (dev defaults)..."
  if ([string]::IsNullOrEmpty($MongoUri)) {
    $mongoUriValue = "mongodb://$MongoUser:$MongoPassword@mongo-0.mongo-headless.default.svc.cluster.local:27017/artgallery?authSource=admin"
  } else {
    $mongoUriValue = $MongoUri
  }
  kubectl create secret generic project-secrets --from-literal=JWT_SECRET=$JwtSecret --from-literal=MONGO_USER=$MongoUser --from-literal=MONGO_PASSWORD=$MongoPassword --from-literal=MONGO_URI=$mongoUriValue
} else {
  Write-Host "Secret 'project-secrets' already exists; skipping creation."
}

# Apply manifests
Write-Host "Applying k8s manifests..."
kubectl apply -f k8s/

Write-Host "Done. Use 'kubectl get pods -w' to follow startup."

#!/bin/bash

echo "=== Gradify - Minikube Deploy ==="
echo ""

# 1. Start minikube if not running
echo "[1/6] Starting minikube..."
minikube status || minikube start

# 2. Use minikube's Docker daemon (so images are available inside minikube)
echo "[2/6] Switching to minikube Docker..."
eval $(minikube docker-env)

# 3. Build Docker images inside minikube
echo "[3/6] Building Docker images..."
cd ..
docker build -t gradify/frontend ./frontend
docker build -t gradify/gateway ./backend/gateway
docker build -t gradify/auth-admin-service ./backend/auth-admin-service
docker build -t gradify/offer-service ./backend/offer-service
docker build -t gradify/student-service ./backend/student-service
docker build -t gradify/matching-service ./backend/matching-service
docker build -t gradify/sparql-explorer-service ./backend/sparql-explorer-service
cd k8s

# 4. Deploy to Kubernetes
echo "[4/6] Deploying to Kubernetes..."
kubectl apply -f namespace.yml
kubectl apply -f configmap.yml
kubectl apply -f fuseki.yml
sleep 15
kubectl apply -f auth-admin-service.yml
kubectl apply -f offer-service.yml
kubectl apply -f student-service.yml
kubectl apply -f matching-service.yml
kubectl apply -f sparql-explorer-service.yml
kubectl apply -f gateway.yml
kubectl apply -f frontend.yml

# 5. Wait for pods
echo "[5/6] Waiting for pods..."
kubectl wait --for=condition=ready pod --all -n gradify --timeout=180s

# 6. Get access URL
echo "[6/6] Getting access URL..."
echo ""
echo "=== Done ==="
echo ""
kubectl get pods -n gradify
echo ""
echo "Access frontend:  minikube service frontend -n gradify --url"
echo "Access gateway:   minikube service gateway -n gradify --url"
echo ""
echo "Or use: minikube service frontend -n gradify"

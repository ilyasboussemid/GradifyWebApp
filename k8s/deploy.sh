#!/bin/bash

echo "=== Gradify - Build & Deploy ==="
echo ""

cd ..

# 1. Build JARs locally with Maven (uses cached deps)
echo "[1/4] Building JARs with Maven..."
cd backend/auth-admin-service && mvn clean package -DskipTests -q && cd ../..
cd backend/offer-service && mvn clean package -DskipTests -q && cd ../..
cd backend/student-service && mvn clean package -DskipTests -q && cd ../..
cd backend/matching-service && mvn clean package -DskipTests -q && cd ../..
cd backend/sparql-explorer-service && mvn clean package -DskipTests -q && cd ../..
cd backend/gateway && mvn clean package -DskipTests -q && cd ../..

# 2. Build Docker images (just copies the JAR, no network needed)
echo "[2/4] Building Docker images..."
docker build -t gradify/frontend ./frontend
docker build -t gradify/gateway ./backend/gateway
docker build -t gradify/auth-admin-service ./backend/auth-admin-service
docker build -t gradify/offer-service ./backend/offer-service
docker build -t gradify/student-service ./backend/student-service
docker build -t gradify/matching-service ./backend/matching-service
docker build -t gradify/sparql-explorer-service ./backend/sparql-explorer-service

# 3. Deploy to Kubernetes
echo "[3/4] Deploying to Kubernetes..."
cd k8s
kubectl apply -f namespace.yml
kubectl apply -f configmap.yml
kubectl apply -f fuseki.yml
kubectl wait --for=condition=ready pod -l app=fuseki -n gradify --timeout=120s
kubectl apply -f auth-admin-service.yml
kubectl apply -f offer-service.yml
kubectl apply -f student-service.yml
kubectl apply -f matching-service.yml
kubectl apply -f sparql-explorer-service.yml
kubectl apply -f gateway.yml
kubectl apply -f frontend.yml
kubectl apply -f ingress.yml

# 4. Status
echo "[4/4] Checking status..."
kubectl get pods -n gradify
echo ""
echo "=== Done ==="
echo "Add to /etc/hosts: 127.0.0.1 gradify.local"
echo "Access: http://gradify.local"

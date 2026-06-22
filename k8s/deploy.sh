#!/bin/bash

echo "=== Deploying Gradify to Kubernetes ==="

echo "[1/9] Creating namespace..."
kubectl apply -f namespace.yml

echo "[2/9] Creating configmap..."
kubectl apply -f configmap.yml

echo "[3/9] Deploying Fuseki..."
kubectl apply -f fuseki.yml

echo "[4/9] Waiting for Fuseki to be ready..."
kubectl wait --for=condition=ready pod -l app=fuseki -n gradify --timeout=120s

echo "[5/9] Deploying backend services..."
kubectl apply -f auth-admin-service.yml
kubectl apply -f offer-service.yml
kubectl apply -f student-service.yml
kubectl apply -f matching-service.yml
kubectl apply -f sparql-explorer-service.yml

echo "[6/9] Waiting for backend services..."
kubectl wait --for=condition=ready pod -l app=auth-admin-service -n gradify --timeout=120s
kubectl wait --for=condition=ready pod -l app=offer-service -n gradify --timeout=120s

echo "[7/9] Deploying gateway..."
kubectl apply -f gateway.yml

echo "[8/9] Deploying frontend..."
kubectl apply -f frontend.yml

echo "[9/9] Deploying ingress..."
kubectl apply -f ingress.yml

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Services:"
kubectl get pods -n gradify
echo ""
echo "Access: http://gradify.local (add to /etc/hosts: 127.0.0.1 gradify.local)"

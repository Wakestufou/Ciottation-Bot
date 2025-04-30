#!/bin/bash

# Définir le nom du conteneur et de l'image dans des variables
CONTAINER_NAME="ciottation-bot-prod"
IMAGE_NAME="ciottation-bot-prod"

# Demander si l'on veut rebuild l'image
read -p "Voulez-vous reconstruire l'image de production ? (y/n): " rebuild

if [ "$rebuild" == "y" ]; then
    echo "Reconstruction de l'image..."
    podman build -f Dockerfile -t $IMAGE_NAME .
else
    echo "Utilisation de l'image existante..."
fi

# Supprimer un conteneur existant
echo "Suppression du conteneur existant (s'il existe)..."
podman rm -f $CONTAINER_NAME

# Lancer le conteneur en mode production
echo "Lancement du conteneur $CONTAINER_NAME en mode production..."
podman run -d --name $CONTAINER_NAME \
    --env TZ=Europe/Paris \
    $IMAGE_NAME

# Suivre les logs
echo "Suivi des logs du conteneur $CONTAINER_NAME en production..."
podman logs -f $CONTAINER_NAME

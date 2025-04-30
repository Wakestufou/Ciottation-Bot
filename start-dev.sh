#!/bin/bash

# Définir le nom du conteneur et de l'image dans des variables
CONTAINER_NAME="ciottation-bot-dev"
IMAGE_NAME="ciottation-bot-dev"

# Demander si tu veux rebuild l'image
read -p "Voulez-vous reconstruire l'image de développement ? (y/n): " rebuild

if [ "$rebuild" == "y" ]; then
  echo "Reconstruction de l'image..."
  podman build -f Dockerfile.dev -t $IMAGE_NAME .
else
  echo "Utilisation de l'image existante..."
fi

# Lancer le conteneur en mode développement
echo "Lancement du conteneur $CONTAINER_NAME..."
podman run -d --name $CONTAINER_NAME \
  -v $(pwd):/bot \
  --env TZ=Europe/Paris \
  -w /bot \
  $IMAGE_NAME npm run dev

# Suivre les logs
echo "Suivi des logs du conteneur $CONTAINER_NAME..."
podman logs -f $CONTAINER_NAME

# TC_Projekt

**Pola Witkowska, gr. 3**\
Projekt z Technologii Chmurowych oraz Bezpieczeństwa Aplikacji Webowych

### Odpalanie projektu Docker:

- docker-compose up --build
- frontend powinien być dostępny na http://localhost:3000/

### Odpalanie projektu Kubernetes:

- W docker desktop: _ustawienia -> kubernetes -> enable kubernetes_
- docker build -t - backend-image ./backend
- docker build -t frontend-image ./frontend
- kubectl apply -f ./k8s
- kubectl get pods
- kubectl get services
- frontend powinien być dostępny na http://localhost:30001/

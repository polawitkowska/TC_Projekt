import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:30080",
  realm: "TCApp",
  clientId: "frontend",
});

export default keycloak;

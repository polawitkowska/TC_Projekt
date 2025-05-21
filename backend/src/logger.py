import logging

#Konfiguracja logera
logger = logging.getLogger('cosmetics_app')
logger.setLevel(logging.DEBUG)

#Konfiguracja pliku do którego będą zapisywane logi
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.DEBUG)

#Formatowanie logów
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

#Dodanie pliku do logera
logger.addHandler(file_handler)

def get_logger():
    return logger
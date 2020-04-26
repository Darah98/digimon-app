DROP TABLE IF EXISTS digimons;

CREATE TABLE digimons(
    id SERIAL PRIMARY KEY,
    diginame VARCHAR(255),
    digimg VARCHAR(255),
    digilevel VARCHAR(255)
)

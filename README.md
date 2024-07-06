# HARJOITUSTYÖN DOKUMENTAATIO

## Suunnitelma

Tarkoituksena on kehittää sovellus luonnonvaraisten eläinten pelastusringiksi. Ajatus tällaisesta sovelluksesta on pyörinyt mielessäni jo jonkin aikaa. Luonnonvaraisten eläinten auttaminen on yleensä yksityishenkilöiden varassa. Kuka tahansa voi löytää esimerkiksi emostaan eroon joutuneen poikasen, mutta eläimestä huolehtiminen ei ole mahdollista kenelle tahansa. On tärkeää tavoittaa ne henkilöt, joilla on resursseja auttaa. Sovelluksen avulla eläimen löytäjä voi ilmoittaa löydöstään ja pyytää apua.

## Toteutus

Sovelluksen keskeiset toiminnot:

- käyttäjätunnuksen luominen ja kirjautuminen
- CRUD-toimenpiteet
- sijaintitieto (mahdollisesti suodatus sijainnin perusteella)
- mahdollisuus reagoida ilmoituksiin
- ilmoitusten valvonta

Kaikkia toimintoja ei välttämättä implementoida ensimmäiseen versioon, mutta sovellusta voidaan jatkokehittää.

## Teknologiat

- backend: Node.js, Express
- frontend: JavaScript
- tietokanta: MongoDB
- autentikointi: JWT (JSON Web Token)
- sijaintitieto: OpenStreetMap ja Leaflet.js
- julkaisu: alustavasti Render

## Rakenne

Koodin selkeyttämiseksi sovellus on jaettu moduuleihin. Backendin puolella CRUD-operaatiot suoritetaan controllers-moduuleissa. Skeemat määritellään models-moduuleissa. Konfiguraatio on eriytetty utils-moduuliin.

## Tietokanta

Tietokannassa on kaksi kokoelmaa: käyttäjät ja ilmoitukset.

Käyttäjään tallennetaan nimi, sähköpostiosoite, salasana, ilmoitukset ja sijainti.

Ilmoitukseen tallennetaan otsikko, kuvaus, ilmoituksen julkaisija, sijainti ja aikaleima.

## Autentikointi

Kun käyttäjä luo tunnuksen, hänen salasanansa tallennetaan tietokantaan hashattuna. Tässä käytetään bcrypt-kirjastoa.

Kirjautumista varten on luotu login-reitti. Kun käyttäjä kirjautuu lomakkeella sisään, frontend lähettää kirjautumistiedot POST-pyynnöllä login-reitille. Jos kirjautumistiedot ovat oikein, palvelin generoi yksilöivän tokenin. Selain tallentaa tokenin. Kun käyttäjä tekee kirjautumista edellyttäviä toimenpiteitä, token lähetetään mukana pyynnössä. Tokenin avulla palvelin tunnistaa käyttäjän.

Ympäristömuuttujiin on tallennettu merkkijonona digitaalinen allekirjoitus _SECRET_. Sillä varmistetaan, että vain salaisuuden tietävät voivat generoida validin tokenin.

## Sijaintitieto

Sijaintitieto tuotetaan avoimen lähdekoodin Leaflet.js-kirjaston avulla. Leaflet hyödyntää OpenStreetMapin karttatietoja. Käyttäjä voi lisätä ilmoitukseen sijainnin klikkaamalla karttaa. Sijainti tallennetaan tietokantaan koordinaatteina.

Kartan popup-ikkunaan haetaan sijainti OpenStreetMapin Nominatim-rajapinnasta _reverse geocoding_ -menetelmällä. Rajapinnalle annetaan koordinaatit, ja se palauttaa paikan nimen tai lähimmän osoitteen.
